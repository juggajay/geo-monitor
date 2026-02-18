import { notFound } from "next/navigation";
import type { AuditResultsResponse } from "@/lib/audit/types";
import { AuditResultsContainer } from "../_components/AuditResultsContainer";
import Link from "next/link";

interface Props {
  params: Promise<{ auditId: string }>;
}

async function fetchAuditResults(auditId: string): Promise<AuditResultsResponse | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/audit/${auditId}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function AuditResultPage({ params }: Props) {
  const { auditId } = await params;

  if (!auditId || !/^[0-9a-f-]{36}$/.test(auditId)) {
    notFound();
  }

  const data = await fetchAuditResults(auditId);

  if (!data || !data.ok) {
    notFound();
  }

  if (data.status !== "completed") {
    // Redirect to main audit page — it will handle polling
    return (
      <main className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="card p-8 text-center max-w-sm">
          <p className="text-[var(--color-text-secondary)] mb-4">
            {data.status === "failed"
              ? (data.error || "This audit failed.")
              : "This audit is still running. Please wait a moment and refresh."}
          </p>
          <Link href="/audit" className="btn-primary inline-block">
            {data.status === "failed" ? "Try again" : "Back to audit"}
          </Link>
        </div>
      </main>
    );
  }

  // Extract brandName from score summary or default
  const brandName = "Your brand";
  const industry = "";

  return (
    <main className="min-h-screen bg-[var(--color-bg)] pt-8 pb-20">
      <div className="container max-w-2xl">
        <div className="mb-6">
          <Link
            href="/audit"
            className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors flex items-center gap-1"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Run a new audit
          </Link>
        </div>

        <AuditResultsContainer
          auditId={auditId}
          brandName={brandName}
          industry={industry}
          data={data}
        />
      </div>
    </main>
  );
}
