import { NextRequest, NextResponse } from "next/server";
import { sql, ensureAuditTable } from "@/lib/db";

// ---------- Types ----------

interface AuditRequestBody {
  full_name?: string;
  work_email?: string;
  company_name?: string;
  website?: string;
  message?: string;
  // Honeypot — hidden field, bots fill it, humans don't
  company_url?: string;
}

// ---------- Rate limiter (in-memory, per-IP) ----------

const RATE_WINDOW_MS = 60_000; // 1 minute
const RATE_MAX = 5; // 5 requests per window

const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (timestamps.length >= RATE_MAX) {
    hits.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  hits.set(ip, timestamps);
  return false;
}

// ---------- Helpers ----------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PAYLOAD_BYTES = 10_240; // 10 KB

function strip(s: string): string {
  return s.replace(/<[^>]*>/g, "").trim();
}

function hashIp(ip: string): string {
  // Simple non-reversible hash for privacy — no crypto needed for this use case
  let h = 0;
  for (let i = 0; i < ip.length; i++) {
    h = (Math.imul(31, h) + ip.charCodeAt(i)) | 0;
  }
  return "ip_" + Math.abs(h).toString(36);
}

// ---------- Table init ----------

let tableReady = false;

// ---------- POST handler ----------

export async function POST(request: NextRequest) {
  try {
    // --- IP extraction ---
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";

    // --- Rate limit ---
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    // --- Payload size ---
    const contentLength = parseInt(request.headers.get("content-length") || "0", 10);
    if (contentLength > MAX_PAYLOAD_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Payload too large" },
        { status: 413 }
      );
    }

    // --- Parse body ---
    let body: AuditRequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // --- Honeypot check ---
    // If the hidden field is filled, a bot submitted this. Return fake 201.
    if (body.company_url) {
      return NextResponse.json({ ok: true, id: 0 }, { status: 201 });
    }

    // --- Validate required fields ---
    const missing: string[] = [];
    if (!body.full_name?.trim()) missing.push("full_name");
    if (!body.work_email?.trim()) missing.push("work_email");
    if (!body.company_name?.trim()) missing.push("company_name");
    if (missing.length > 0) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields", fields: missing },
        { status: 400 }
      );
    }

    // --- Validate email format ---
    const email = body.work_email!.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Invalid email format", fields: ["work_email"] },
        { status: 422 }
      );
    }

    // --- Sanitize ---
    const fullName = strip(body.full_name!);
    const companyName = strip(body.company_name!);
    const website = body.website?.trim() || null;
    const message = body.message ? strip(body.message).slice(0, 2000) : null;

    // --- UTM from query params ---
    const url = request.nextUrl;
    const utmSource = url.searchParams.get("utm_source");
    const utmMedium = url.searchParams.get("utm_medium");
    const utmCampaign = url.searchParams.get("utm_campaign");
    const utmContent = url.searchParams.get("utm_content");
    const utmTerm = url.searchParams.get("utm_term");

    // --- Ensure table ---
    if (!tableReady) {
      await ensureAuditTable();
      tableReady = true;
    }

    // --- Duplicate detection (same email in last 24h) ---
    const dupes = await sql`
      SELECT id FROM audit_requests
      WHERE work_email = ${email}
        AND submitted_at > NOW() - INTERVAL '24 hours'
      LIMIT 1
    `;
    if (dupes.length > 0) {
      return NextResponse.json(
        { ok: false, error: "A request with this email was already submitted in the last 24 hours" },
        { status: 409 }
      );
    }

    // --- Insert ---
    const rows = await sql`
      INSERT INTO audit_requests (
        full_name, work_email, company_name, website, message,
        utm_source, utm_medium, utm_campaign, utm_content, utm_term,
        ip_hash, status, submitted_at
      ) VALUES (
        ${fullName}, ${email}, ${companyName}, ${website}, ${message},
        ${utmSource}, ${utmMedium}, ${utmCampaign}, ${utmContent}, ${utmTerm},
        ${hashIp(ip)}, ${"new"}, NOW()
      )
      RETURNING id
    `;

    return NextResponse.json({ ok: true, id: rows[0].id }, { status: 201 });
  } catch (err) {
    console.error("[/api/v1/intake/audit-request] Error:", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
