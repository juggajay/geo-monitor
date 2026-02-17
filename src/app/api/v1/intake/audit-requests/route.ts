import { NextRequest, NextResponse } from "next/server";
import { sql, ensureAuditTable } from "@/lib/db";

let tableReady = false;

export async function GET(request: NextRequest) {
  try {
    if (!tableReady) {
      await ensureAuditTable();
      tableReady = true;
    }

    const url = request.nextUrl;
    const status = url.searchParams.get("status");
    const source = url.searchParams.get("source");
    const campaign = url.searchParams.get("campaign");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "100", 10), 500);
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);

    // Build conditions
    const conditions: string[] = [];
    const values: (string | number)[] = [];

    if (status) {
      conditions.push(`status = $${values.length + 1}`);
      values.push(status);
    }
    if (source) {
      conditions.push(`utm_source ILIKE $${values.length + 1}`);
      values.push(`%${source}%`);
    }
    if (campaign) {
      conditions.push(`utm_campaign ILIKE $${values.length + 1}`);
      values.push(`%${campaign}%`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Use raw query with parameterized values via tagged template
    // Since neon's sql tagged template doesn't support dynamic WHERE easily,
    // we build separate queries for filtered vs unfiltered
    let requests;
    let total;

    if (!status && !source && !campaign) {
      requests = await sql`
        SELECT * FROM audit_requests
        ORDER BY submitted_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      total = await sql`SELECT count(*)::int AS count FROM audit_requests`;
    } else {
      // Use optional chaining for filters
      requests = await sql`
        SELECT * FROM audit_requests
        WHERE
          (${status}::text IS NULL OR status = ${status})
          AND (${source}::text IS NULL OR utm_source ILIKE ${"%" + (source || "") + "%"})
          AND (${campaign}::text IS NULL OR utm_campaign ILIKE ${"%" + (campaign || "") + "%"})
        ORDER BY submitted_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      total = await sql`
        SELECT count(*)::int AS count FROM audit_requests
        WHERE
          (${status}::text IS NULL OR status = ${status})
          AND (${source}::text IS NULL OR utm_source ILIKE ${"%" + (source || "") + "%"})
          AND (${campaign}::text IS NULL OR utm_campaign ILIKE ${"%" + (campaign || "") + "%"})
      `;
    }

    // Stats
    const stats = await sql`
      SELECT
        count(*)::int AS total,
        count(*) FILTER (WHERE status = 'new')::int AS new,
        count(*) FILTER (WHERE status = 'contacted')::int AS contacted,
        count(*) FILTER (WHERE status = 'completed')::int AS completed
      FROM audit_requests
    `;

    return NextResponse.json({
      ok: true,
      total: total[0]?.count || 0,
      stats: stats[0],
      requests,
    });
  } catch (err) {
    console.error("[/api/v1/intake/audit-requests] Error:", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
