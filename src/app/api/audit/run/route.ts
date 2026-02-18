import { NextRequest, NextResponse } from "next/server";
import { sql, ensureAuditJobTables } from "@/lib/db";
import { buildPrompts } from "@/lib/audit/prompts";
import { computeScores } from "@/lib/audit/scorer";

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

    // Cleanup stuck jobs
    await cleanupStuckJobs();

    let body: { auditId?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
    }

    const auditId = body.auditId;
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
    const platforms = ["chatgpt", "claude", "perplexity"] as const;

    // ── STUB DATA FOR PHASE 1 ──
    // Replace this section in Phase 2 with real provider calls
    const stubResults = [];
    for (const prompt of prompts) {
      for (const platform of platforms) {
        // Deterministic stub: brand is "mentioned" 60% of the time
        const seed = (prompt.index * 7 + platforms.indexOf(platform) * 3) % 10;
        const mentioned = seed < 6;
        const rank = mentioned ? (seed % 3) + 1 : 0;

        stubResults.push({
          audit_job_id: auditId,
          prompt_index: prompt.index,
          prompt_text: prompt.text,
          platform,
          raw_response: JSON.stringify({
            recommendations: mentioned
              ? [{ name: brandName, rank, sentiment: seed > 3 ? "positive" : "neutral", reason: "Strong market presence" }]
              : [{ name: "Competitor A", rank: 1, sentiment: "positive", reason: "Market leader" }],
            summary: "Top platforms evaluated.",
          }),
          brand_mentioned: mentioned,
          position_bucket: !mentioned ? "not_mentioned" : rank === 1 ? "top_1" : rank <= 3 ? "top_3" : "top_5",
          sentiment: mentioned ? (seed > 3 ? "positive" : "neutral") : null,
          competitors_json: JSON.stringify(mentioned ? ["Competitor A", "Competitor B"] : ["Competitor A", "Competitor B", "Competitor C"]),
          confidence: mentioned ? 0.85 : 0.9,
        });
      }

      // Update progress as each prompt completes
      const progress = Math.round(5 + (prompt.index / prompts.length) * 90);
      await sql`UPDATE audit_jobs SET progress = ${progress} WHERE id = ${auditId}`;
    }

    // Insert all results
    for (const r of stubResults) {
      await sql`
        INSERT INTO audit_prompt_results (
          audit_job_id, prompt_index, prompt_text, platform, raw_response,
          brand_mentioned, position_bucket, sentiment, competitors_json, confidence
        ) VALUES (
          ${r.audit_job_id}, ${r.prompt_index}, ${r.prompt_text}, ${r.platform}, ${r.raw_response},
          ${r.brand_mentioned}, ${r.position_bucket}, ${r.sentiment ?? null},
          ${r.competitors_json}::jsonb, ${r.confidence}
        )
      `;
    }

    // Compute score
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scoreData = computeScores(stubResults as any);

    // Mark completed
    await sql`
      UPDATE audit_jobs
      SET status = 'completed', progress = 100, visibility_score = ${scoreData.visibility}, completed_at = NOW()
      WHERE id = ${auditId}
    `;

    return NextResponse.json({ ok: true, auditId, score: scoreData.visibility });
  } catch (err) {
    console.error("[/api/audit/run]", err);
    // Mark job failed
    try {
      const body = await request.json().catch(() => ({}));
      if (body.auditId) {
        await sql`
          UPDATE audit_jobs SET status = 'failed', error_message = ${String(err)}
          WHERE id = ${body.auditId}
        `;
      }
    } catch { /* ignore */ }
    return NextResponse.json({ ok: false, error: "Run failed" }, { status: 500 });
  }
}
