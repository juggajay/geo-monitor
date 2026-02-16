import { NextRequest, NextResponse } from "next/server";
import { sql, ensureTable } from "@/lib/db";

const VALID_STAGES = ["NEW", "CONTACTED", "ONBOARDING", "ACTIVE", "DECLINED"];

let tableReady = false;

export async function PATCH(request: NextRequest) {
  try {
    if (!tableReady) {
      await ensureTable();
      tableReady = true;
    }

    const body = await request.json();
    const { id, pipeline_stage } = body;

    if (!id || !pipeline_stage) {
      return NextResponse.json(
        { ok: false, error: "Missing id or pipeline_stage" },
        { status: 400 }
      );
    }

    if (!VALID_STAGES.includes(pipeline_stage)) {
      return NextResponse.json(
        { ok: false, error: `Invalid stage. Must be one of: ${VALID_STAGES.join(", ")}` },
        { status: 400 }
      );
    }

    await sql`
      UPDATE applications
      SET pipeline_stage = ${pipeline_stage}
      WHERE id = ${id}
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/beta/submissions/update] Error:", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
