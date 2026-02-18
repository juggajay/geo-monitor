import { NextRequest, NextResponse } from "next/server";
import { sql, ensureAuditJobTables } from "@/lib/db";

let tablesReady = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function hashIp(ip: string): string {
  let h = 0;
  for (let i = 0; i < ip.length; i++) {
    h = (Math.imul(31, h) + ip.charCodeAt(i)) | 0;
  }
  return "ip_" + Math.abs(h).toString(36);
}

function strip(s: string): string {
  return s.replace(/<[^>]*>/g, "").trim();
}

async function isKillSwitchOn(): Promise<boolean> {
  const env = process.env.AUDIT_KILL_SWITCH;
  if (env === "true" || env === "1") return true;
  try {
    const rows = await sql`SELECT value FROM audit_config WHERE key = 'paused' LIMIT 1`;
    return rows[0]?.value === "true";
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!tablesReady) {
      await ensureAuditJobTables();
      tablesReady = true;
    }

    // Kill switch
    if (await isKillSwitchOn()) {
      return NextResponse.json(
        { ok: false, error: "Audit service is temporarily paused. Please try again later." },
        { status: 503 }
      );
    }

    // IP extraction
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";
    const ipHash = hashIp(ip);

    // DB-backed rate limit: max 3 audits per IP per day
    const ipCount = await sql`
      SELECT COUNT(*) as cnt FROM audit_jobs
      WHERE ip_hash = ${ipHash}
        AND created_at > NOW() - INTERVAL '24 hours'
        AND status != 'failed'
    `;
    if (Number(ipCount[0]?.cnt ?? 0) >= 3) {
      return NextResponse.json(
        { ok: false, error: "Daily audit limit reached for this IP. Try again tomorrow." },
        { status: 429 }
      );
    }

    // Global concurrent job cap: max 5 running at once
    const runningCount = await sql`
      SELECT COUNT(*) as cnt FROM audit_jobs WHERE status = 'running'
    `;
    if (Number(runningCount[0]?.cnt ?? 0) >= 5) {
      return NextResponse.json(
        { ok: false, error: "Audit service is busy. Please try again in a minute." },
        { status: 503 }
      );
    }

    // Parse body
    let body: { brandName?: string; industry?: string; idempotencyKey?: string; honeypot?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
    }

    // Honeypot
    if (body.honeypot) {
      return NextResponse.json({ ok: true, auditId: "00000000-0000-0000-0000-000000000000", status: "queued" });
    }

    // Bot heuristic: reject if request came too fast (checked client-side timestamp)
    // Validation
    const brandName = strip(body.brandName || "").slice(0, 80);
    const industry = strip(body.industry || "").slice(0, 80);
    if (brandName.length < 2) {
      return NextResponse.json({ ok: false, error: "Brand name must be at least 2 characters." }, { status: 400 });
    }
    if (industry.length < 2) {
      return NextResponse.json({ ok: false, error: "Industry must be at least 2 characters." }, { status: 400 });
    }

    // Idempotency: if key provided and job already exists, return it
    if (body.idempotencyKey) {
      const existing = await sql`
        SELECT id, status FROM audit_jobs WHERE idempotency_key = ${body.idempotencyKey} LIMIT 1
      `;
      if (existing.length > 0) {
        return NextResponse.json({ ok: true, auditId: existing[0].id, status: existing[0].status });
      }
    }

    // Create job
    const rows = await sql`
      INSERT INTO audit_jobs (brand_name, industry, ip_hash, idempotency_key, status, progress)
      VALUES (${brandName}, ${industry}, ${ipHash}, ${body.idempotencyKey || null}, 'queued', 0)
      RETURNING id
    `;
    const auditId = rows[0].id as string;

    // Fire-and-forget: trigger the run endpoint
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
      (request.headers.get("x-forwarded-host")
        ? `https://${request.headers.get("x-forwarded-host")}`
        : `http://localhost:${process.env.PORT || 3000}`);

    const secret = process.env.AUDIT_INTERNAL_SECRET || "dev-secret";

    // Don't await — fire and forget
    fetch(`${baseUrl}/api/audit/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-audit-secret": secret,
      },
      body: JSON.stringify({ auditId }),
    }).catch((err) => {
      console.error("[audit/create] Failed to trigger run:", err);
    });

    return NextResponse.json({ ok: true, auditId, status: "queued" }, { status: 201 });
  } catch (err) {
    console.error("[/api/audit/create]", err);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
