import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  throw new Error("POSTGRES_URL environment variable is not set");
}

export const sql = neon(DATABASE_URL);

// ---------- Audit tables ----------

let auditTablesReady = false;

export async function ensureAuditJobTables() {
  if (auditTablesReady) return;

  // audit_jobs — one row per audit run
  await sql`
    CREATE TABLE IF NOT EXISTS audit_jobs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      idempotency_key TEXT,
      brand_name TEXT NOT NULL,
      industry TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued',
      progress INT NOT NULL DEFAULT 0,
      visibility_score INT,
      free_unlocked BOOLEAN NOT NULL DEFAULT true,
      full_unlocked BOOLEAN NOT NULL DEFAULT false,
      error_message TEXT,
      ip_hash TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ,
      started_at TIMESTAMPTZ
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_audit_jobs_status ON audit_jobs(status, created_at)
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_audit_jobs_idempotency ON audit_jobs(idempotency_key)
    WHERE idempotency_key IS NOT NULL
  `;

  // audit_prompt_results — 30 rows per audit (10 prompts × 3 providers)
  await sql`
    CREATE TABLE IF NOT EXISTS audit_prompt_results (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      audit_job_id UUID NOT NULL REFERENCES audit_jobs(id) ON DELETE CASCADE,
      prompt_index INT NOT NULL,
      prompt_text TEXT NOT NULL,
      platform TEXT NOT NULL,
      raw_response TEXT,
      brand_mentioned BOOLEAN,
      position_bucket TEXT,
      sentiment TEXT,
      competitors_json JSONB,
      confidence NUMERIC(4,3),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_audit_prompt_results_job ON audit_prompt_results(audit_job_id, prompt_index, platform)
  `;

  // audit_leads — email gate captures
  await sql`
    CREATE TABLE IF NOT EXISTS audit_leads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      audit_job_id UUID NOT NULL REFERENCES audit_jobs(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      name TEXT,
      consent BOOLEAN NOT NULL DEFAULT false,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      referrer_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_audit_leads_email_job ON audit_leads(email, audit_job_id)
  `;

  // audit_config — kill switch + settings
  await sql`
    CREATE TABLE IF NOT EXISTS audit_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  // Seed default kill switch = off
  await sql`
    INSERT INTO audit_config (key, value) VALUES ('paused', 'false')
    ON CONFLICT (key) DO NOTHING
  `;

  auditTablesReady = true;
}

/** Run once to create audit_requests table. */
export async function ensureAuditTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS audit_requests (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      work_email TEXT NOT NULL,
      company_name TEXT NOT NULL,
      website TEXT,
      message TEXT,
      honeypot_value TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      utm_content TEXT,
      utm_term TEXT,
      ip_hash TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

/** Run once on first deploy to create the table. */
export async function ensureTable() {
  // Add hero_variant column if missing (safe to run repeatedly)
  await sql`
    ALTER TABLE applications ADD COLUMN IF NOT EXISTS hero_variant TEXT
  `.catch(() => {
    // Table doesn't exist yet — will be created below
  });

  await sql`
    CREATE TABLE IF NOT EXISTS applications (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      work_email TEXT NOT NULL,
      agency_name TEXT NOT NULL,
      website TEXT,
      active_clients_range TEXT NOT NULL,
      role TEXT,
      primary_services TEXT NOT NULL,
      biggest_challenge TEXT NOT NULL,
      qualified_status TEXT NOT NULL DEFAULT 'review',
      pipeline_stage TEXT NOT NULL DEFAULT 'NEW',
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      utm_content TEXT,
      utm_term TEXT,
      first_touch_json JSONB,
      last_touch_json JSONB,
      hero_variant TEXT,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}
