import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  throw new Error("POSTGRES_URL environment variable is not set");
}

export const sql = neon(DATABASE_URL);

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
