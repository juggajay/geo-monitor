import { NextRequest, NextResponse } from "next/server";
import { sql, ensureTable } from "@/lib/db";

let tableReady = false;

export async function GET(request: NextRequest) {
  try {
    if (!tableReady) {
      await ensureTable();
      tableReady = true;
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const campaign = searchParams.get("campaign");
    const stage = searchParams.get("stage");
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 500);
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query with optional filters
    let rows;
    if (status && source && campaign) {
      rows = await sql`
        SELECT * FROM applications
        WHERE qualified_status = ${status}
          AND utm_source = ${source}
          AND utm_campaign = ${campaign}
        ORDER BY submitted_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (status && source) {
      rows = await sql`
        SELECT * FROM applications
        WHERE qualified_status = ${status}
          AND utm_source = ${source}
        ORDER BY submitted_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (status && campaign) {
      rows = await sql`
        SELECT * FROM applications
        WHERE qualified_status = ${status}
          AND utm_campaign = ${campaign}
        ORDER BY submitted_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (source && campaign) {
      rows = await sql`
        SELECT * FROM applications
        WHERE utm_source = ${source}
          AND utm_campaign = ${campaign}
        ORDER BY submitted_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (status) {
      rows = await sql`
        SELECT * FROM applications
        WHERE qualified_status = ${status}
        ORDER BY submitted_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (source) {
      rows = await sql`
        SELECT * FROM applications
        WHERE utm_source = ${source}
        ORDER BY submitted_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (campaign) {
      rows = await sql`
        SELECT * FROM applications
        WHERE utm_campaign = ${campaign}
        ORDER BY submitted_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (stage) {
      rows = await sql`
        SELECT * FROM applications
        WHERE pipeline_stage = ${stage}
        ORDER BY submitted_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      rows = await sql`
        SELECT * FROM applications
        ORDER BY submitted_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    // Get total count
    const countResult = await sql`SELECT COUNT(*) as total FROM applications`;
    const total = countResult[0].total;

    // Get summary stats
    const stats = await sql`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE qualified_status = 'qualified') as qualified,
        COUNT(*) FILTER (WHERE qualified_status = 'disqualified') as disqualified,
        COUNT(*) FILTER (WHERE qualified_status = 'review') as review
      FROM applications
    `;

    return NextResponse.json({
      ok: true,
      total,
      stats: stats[0],
      applications: rows,
    });
  } catch (err) {
    console.error("[/api/beta/submissions] Error:", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
