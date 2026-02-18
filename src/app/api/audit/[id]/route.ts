import { NextRequest, NextResponse } from "next/server";
import { sql, ensureAuditJobTables } from "@/lib/db";
import type { AuditResultsResponse } from "@/lib/audit/types";
import { computeScores, generateQuickWins } from "@/lib/audit/scorer";

let tablesReady = false;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!tablesReady) {
      await ensureAuditJobTables();
      tablesReady = true;
    }

    const { id } = await params;

    if (!id || !/^[0-9a-f-]{36}$/.test(id)) {
      return NextResponse.json({ ok: false, error: "Invalid audit ID" }, { status: 400 });
    }

    const jobs = await sql`
      SELECT id, brand_name, industry, status, progress, visibility_score,
             free_unlocked, full_unlocked, error_message, created_at, completed_at
      FROM audit_jobs WHERE id = ${id} LIMIT 1
    `;

    if (jobs.length === 0) {
      return NextResponse.json({ ok: false, error: "Audit not found" }, { status: 404 });
    }

    const job = jobs[0];

    if (job.status === "queued" || job.status === "running") {
      const response: AuditResultsResponse = {
        ok: true,
        status: job.status,
        progress: job.progress,
      };
      return NextResponse.json(response);
    }

    if (job.status === "failed") {
      return NextResponse.json({
        ok: true,
        status: "failed",
        progress: 0,
        error: job.error_message || "Audit failed. Please try again.",
      } satisfies AuditResultsResponse);
    }

    // Completed — fetch results
    const allResults = await sql`
      SELECT id, audit_job_id, prompt_index, prompt_text, platform,
             brand_mentioned, position_bucket, sentiment, competitors_json, confidence
      FROM audit_prompt_results
      WHERE audit_job_id = ${id}
      ORDER BY prompt_index ASC, platform ASC
    `;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = allResults as any[];

    const score = {
      ...computeScores(results),
      quick_wins: generateQuickWins(results, job.brand_name as string, job.industry as string),
    };
    const FREE_ROWS = 3;

    // Group by prompt_index, return free rows (1-3) and count locked
    const byPrompt = new Map<number, typeof results>();
    for (const r of results) {
      const idx = r.prompt_index as number;
      if (!byPrompt.has(idx)) byPrompt.set(idx, []);
      byPrompt.get(idx)!.push(r);
    }

    const promptIndexes = Array.from(byPrompt.keys()).sort((a, b) => a - b);
    const freeIndexes = promptIndexes.slice(0, FREE_ROWS);
    const lockedIndexes = promptIndexes.slice(FREE_ROWS);

    const freeRows = freeIndexes.flatMap((idx) => byPrompt.get(idx) || []);
    const lockedRowsCount = lockedIndexes.length;

    const response: AuditResultsResponse = {
      ok: true,
      status: "completed",
      progress: 100,
      score,
      results: {
        freeRows,
        lockedRowsCount,
        ...(job.full_unlocked ? { allRows: results } : {}),
      },
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[/api/audit/[id]]", err);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
