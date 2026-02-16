import { NextRequest, NextResponse } from "next/server";
import { sql, ensureTable } from "@/lib/db";

interface ApplyBody {
  form: {
    name: string;
    email: string;
    agencyName: string;
    website?: string;
    clientCount: string;
    role?: string;
    serviceFocus: string;
    biggestPain: string;
  };
  attribution: {
    first_touch: TouchData;
    last_touch: TouchData;
  };
  qualified: boolean;
  heroVariant?: string;
}

interface TouchData {
  utm: {
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    utm_content: string | null;
    utm_term: string | null;
  };
  landing_page_url: string;
  page_path: string;
  document_referrer: string;
  captured_at: string;
  session_id: string;
}

const REQUIRED_FORM_FIELDS = [
  "name",
  "email",
  "agencyName",
  "clientCount",
  "serviceFocus",
  "biggestPain",
] as const;

function qualificationStatus(clientCount: string): string {
  if (clientCount === "1-4") return "disqualified";
  if (!clientCount) return "review";
  return "qualified";
}

let tableReady = false;

export async function POST(request: NextRequest) {
  try {
    if (!tableReady) {
      await ensureTable();
      tableReady = true;
    }

    const body: ApplyBody = await request.json();

    // Validate required fields
    const missing: string[] = [];
    for (const field of REQUIRED_FORM_FIELDS) {
      if (!body.form?.[field]?.trim()) {
        missing.push(field);
      }
    }
    if (missing.length > 0) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields", fields: missing },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.form.email)) {
      return NextResponse.json(
        { ok: false, error: "Invalid email format", fields: ["email"] },
        { status: 400 }
      );
    }

    const status = qualificationStatus(body.form.clientCount);
    const lastUtm = body.attribution?.last_touch?.utm;

    const rows = await sql`
      INSERT INTO applications (
        full_name, work_email, agency_name, website,
        active_clients_range, role, primary_services, biggest_challenge,
        qualified_status, pipeline_stage,
        utm_source, utm_medium, utm_campaign, utm_content, utm_term,
        first_touch_json, last_touch_json,
        hero_variant,
        submitted_at
      ) VALUES (
        ${body.form.name.trim()},
        ${body.form.email.trim().toLowerCase()},
        ${body.form.agencyName.trim()},
        ${body.form.website?.trim() || null},
        ${body.form.clientCount},
        ${body.form.role?.trim() || null},
        ${body.form.serviceFocus},
        ${body.form.biggestPain.trim()},
        ${status},
        ${"NEW"},
        ${lastUtm?.utm_source || null},
        ${lastUtm?.utm_medium || null},
        ${lastUtm?.utm_campaign || null},
        ${lastUtm?.utm_content || null},
        ${lastUtm?.utm_term || null},
        ${JSON.stringify(body.attribution?.first_touch || null)},
        ${JSON.stringify(body.attribution?.last_touch || null)},
        ${body.heroVariant || "a"},
        NOW()
      )
      RETURNING id
    `;

    return NextResponse.json({
      ok: true,
      id: rows[0].id,
    });
  } catch (err) {
    console.error("[/api/beta/apply] Error:", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
