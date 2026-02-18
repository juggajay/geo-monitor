"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AuditInputForm } from "./_components/AuditInputForm";
import { AuditProgress } from "./_components/AuditProgress";
import { AuditResultsContainer } from "./_components/AuditResultsContainer";
import type { AuditResultsResponse } from "@/lib/audit/types";

type Phase = "idle" | "creating" | "polling" | "completed" | "failed";

interface AuditState {
  phase: Phase;
  auditId: string | null;
  brandName: string;
  industry: string;
  progress: number;
  status: "queued" | "running";
  error: string | null;
  results: AuditResultsResponse | null;
}

const POLL_INTERVAL_MS = 3000;

const SOCIAL_PROOF = [
  { value: "3", label: "AI platforms checked" },
  { value: "30", label: "Queries per audit" },
  { value: "90s", label: "Average runtime" },
];

const SCORE_EXAMPLES = [
  { brand: "HubSpot", score: 84, color: "#00e68a" },
  { brand: "Notion", score: 71, color: "#00e68a" },
  { brand: "Monday.com", score: 52, color: "#f59e0b" },
  { brand: "Basecamp", score: 28, color: "#ef4444" },
];

function SocialProofPanel() {
  return (
    <div className="flex flex-col gap-6 justify-center">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {SOCIAL_PROOF.map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <div className="font-mono font-black text-2xl text-[var(--color-emerald)] mb-1">{s.value}</div>
            <div className="text-xs text-[var(--color-text-tertiary)] leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Score preview */}
      <div className="card p-5">
        <p className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-widest mb-4">Sample scores</p>
        <div className="space-y-3">
          {SCORE_EXAMPLES.map((ex) => (
            <div key={ex.brand} className="flex items-center gap-3">
              <span className="text-sm text-[var(--color-text-secondary)] w-28 flex-shrink-0">{ex.brand}</span>
              <div className="flex-1 h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${ex.score}%`, background: ex.color }}
                />
              </div>
              <span className="font-mono text-sm font-bold w-8 text-right" style={{ color: ex.color }}>
                {ex.score}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Trust note */}
      <div className="flex items-start gap-3 px-1">
        <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-emerald)" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">
          No credit card required. Your data is never shared. Results are private to you.
        </p>
      </div>
    </div>
  );
}

export default function AuditPage() {
  const [state, setState] = useState<AuditState>({
    phase: "idle",
    auditId: null,
    brandName: "",
    industry: "",
    progress: 0,
    status: "queued",
    error: null,
    results: null,
  });

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const startPolling = useCallback((auditId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/audit/${auditId}`);
        const data: AuditResultsResponse = await res.json();

        if (!isMounted.current) return;

        if (data.status === "completed") {
          clearInterval(pollRef.current!);
          setState((prev) => ({ ...prev, phase: "completed", progress: 100, results: data }));
        } else if (data.status === "failed") {
          clearInterval(pollRef.current!);
          setState((prev) => ({ ...prev, phase: "failed", error: data.error || "Audit failed." }));
        } else {
          setState((prev) => ({
            ...prev,
            phase: "polling",
            progress: data.progress ?? prev.progress,
            status: data.status as "queued" | "running",
          }));
        }
      } catch {
        // transient network error — keep polling
      }
    }, POLL_INTERVAL_MS);
  }, []);

  async function handleSubmit({ brandName, industry }: { brandName: string; industry: string }) {
    setState((prev) => ({ ...prev, phase: "creating", brandName, industry, error: null }));

    try {
      const res = await fetch("/api/audit/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName, industry }),
      });
      const data = await res.json();

      if (!data.ok || !data.auditId) {
        setState((prev) => ({ ...prev, phase: "failed", error: data.error || "Could not start audit." }));
        return;
      }

      setState((prev) => ({ ...prev, phase: "polling", auditId: data.auditId, progress: 0, status: "queued" }));
      startPolling(data.auditId);
    } catch {
      setState((prev) => ({ ...prev, phase: "failed", error: "Network error. Please try again." }));
    }
  }

  function handleReset() {
    if (pollRef.current) clearInterval(pollRef.current);
    setState({ phase: "idle", auditId: null, brandName: "", industry: "", progress: 0, status: "queued", error: null, results: null });
  }

  const { phase, auditId, brandName, industry, progress, status, error, results } = state;
  const isIdle = phase === "idle" || phase === "creating";

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <div className="border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-emerald)]" />
            <span className="font-heading font-bold text-sm text-[var(--color-text-primary)]">GEO Monitor</span>
          </div>
          <span className="text-xs text-[var(--color-text-tertiary)]">Free AI Visibility Audit</span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* IDLE / CREATING — two-column layout */}
        {isIdle && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left: hero + form */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-xs text-[var(--color-text-secondary)] mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-emerald)] animate-pulse inline-block" />
                Live across ChatGPT · Claude · Perplexity
              </div>

              <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-[var(--color-text-primary)] mb-4">
                How visible is<br />
                your brand{" "}
                <span className="gradient-text">to AI?</span>
              </h1>

              <p className="text-lg text-[var(--color-text-secondary)] mb-8 leading-relaxed max-w-md">
                Get your AI Visibility Score in 90 seconds — see exactly where you rank across the platforms your buyers are using.
              </p>

              <AuditInputForm onSubmit={handleSubmit} loading={phase === "creating"} />
            </div>

            {/* Right: social proof */}
            <div className="lg:pt-8">
              <SocialProofPanel />
            </div>
          </div>
        )}

        {/* POLLING — centered progress */}
        {phase === "polling" && (
          <div className="max-w-lg mx-auto">
            <AuditProgress
              progress={progress}
              status={status}
            />
          </div>
        )}

        {/* ERROR */}
        {phase === "failed" && (
          <div className="max-w-md mx-auto card p-8 text-center space-y-4">
            <p className="text-[var(--color-text-secondary)]">{error || "Something went wrong."}</p>
            <button className="btn-primary" onClick={handleReset}>Try again</button>
          </div>
        )}

        {/* RESULTS */}
        {phase === "completed" && results && auditId && (
          <div className="max-w-2xl mx-auto space-y-6">
            <AuditResultsContainer
              auditId={auditId}
              brandName={brandName}
              industry={industry}
              data={results}
            />
            <div className="text-center">
              <button
                className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors underline underline-offset-2"
                onClick={handleReset}
              >
                Run another audit
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
