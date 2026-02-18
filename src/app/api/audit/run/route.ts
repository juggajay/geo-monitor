import { NextRequest, NextResponse } from "next/server";
import { sql, ensureAuditJobTables } from "@/lib/db";
import { buildPrompts } from "@/lib/audit/prompts";
import { computeScores, generateQuickWins } from "@/lib/audit/scorer";
import { runAllProviders } from "@/lib/audit/providers";

let tablesReady = false;

/** Mark jobs stuck running for >5 min as failed */
async function cleanupStuckJobs() {
  await sql`
    UPDATE audit_jobs
    SET status = 'failed', error_message = 'Timed out — took longer than 5 minutes.'
    WHERE status = 'running'
      AND started_at < NOW() - INTERVAL '5 minutes'
  `;
}

export async function POST(request: NextRequest) {
  let auditId: string | null = null;

  try {
    if (!tablesReady) {
      await ensureAuditJobTables();
      tablesReady = true;
    }

    // Guard with internal secret
    const secret = process.env.AUDIT_INTERNAL_SECRET || "dev-secret";
    if (request.headers.get("x-audit-secret") !== secret) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    await cleanupStuckJobs();

    let body: { auditId?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
    }

    auditId = body.auditId ?? null;
    if (!auditId) return NextResponse.json({ ok: false, error: "auditId required" }, { status: 400 });

    // Fetch job
    const jobs = await sql`
      SELECT id, brand_name, industry, status FROM audit_jobs WHERE id = ${auditId} LIMIT 1
    `;
    if (jobs.length === 0) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

    const job = jobs[0];
    if (job.status !== "queued") {
      return NextResponse.json({ ok: false, error: `Job is ${job.status}, not queued` }, { status: 409 });
    }

    // Mark running
    await sql`
      UPDATE audit_jobs SET status = 'running', progress = 5, started_at = NOW() WHERE id = ${auditId}
    `;

    const brandName = job.brand_name as string;
    const industry = job.industry as string;
    const prompts = buildPrompts(brandName, industry);

    // ── Phase 2: Real provider calls ──────────────────────────────────────────
    const results = await runAllProviders(
      prompts,
      brandName,
      industry,
      auditId,
      async (progress: number) => {
        await sql`UPDATE audit_jobs SET progress = ${progress} WHERE id = ${auditId}`;
      }
    );

    // Insert all results
    for (const r of results) {
      await sql`
        INSERT INTO audit_prompt_results (
          audit_job_id, prompt_index, prompt_text, platform, raw_response,
          brand_mentioned, position_bucket, sentiment, competitors_json, confidence
        ) VALUES (
          ${r.audit_job_id}, ${r.prompt_index}, ${r.prompt_text}, ${r.platform},
          ${r.raw_response ?? null}, ${r.brand_mentioned ?? null}, ${r.position_bucket ?? null},
          ${r.sentiment ?? null},
          ${r.competitors_json ? JSON.stringify(r.competitors_json) : null}::jsonb,
          ${r.confidence ?? null}
        )
      `;
    }

    // Compute score
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scoreData = computeScores(results as any);
    const quickWins = generateQuickWins(results as any, brandName, industry);
    console.log(`[audit/run] ${auditId} complete — score: ${scoreData.visibility}, quick wins: ${quickWins.length}`);

    // Mark completed
    await sql`
      UPDATE audit_jobs
      SET status = 'completed', progress = 100, visibility_score = ${scoreData.visibility}, completed_at = NOW()
      WHERE id = ${auditId}
    `;

    return NextResponse.json({ ok: true, auditId, score: scoreData.visibility });

  } catch (err) {
    console.error("[/api/audit/run]", err);
    if (auditId) {
      try {
        await sql`
          UPDATE audit_jobs SET status = 'failed', error_message = ${String(err)}
          WHERE id = ${auditId}
        `;
      } catch { /* ignore */ }
    }
    return NextResponse.json({ ok: false, error: "Run failed" }, { status: 500 });
  }
}
