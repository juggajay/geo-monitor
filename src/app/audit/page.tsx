"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AuditHero } from "./_components/AuditHero";
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
          setState((prev) => ({
            ...prev,
            phase: "completed",
            progress: 100,
            results: data,
          }));
        } else if (data.status === "failed") {
          clearInterval(pollRef.current!);
          setState((prev) => ({
            ...prev,
            phase: "failed",
            error: data.error || "Audit failed. Please try again.",
          }));
        } else {
          // queued or running — update progress
          setState((prev) => ({
            ...prev,
            phase: "polling",
            progress: data.progress ?? prev.progress,
            status: data.status as "queued" | "running",
          }));
        }
      } catch {
        // Network error — keep polling, don't surface transient errors
      }
    }, POLL_INTERVAL_MS);
  }, []);

  async function handleSubmit({ brandName, industry }: { brandName: string; industry: string }) {
    setState((prev) => ({
      ...prev,
      phase: "creating",
      brandName,
      industry,
      error: null,
    }));

    try {
      const res = await fetch("/api/audit/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName, industry }),
      });
      const data = await res.json();

      if (!data.ok || !data.auditId) {
        setState((prev) => ({
          ...prev,
          phase: "failed",
          error: data.error || "Could not start audit. Please try again.",
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        phase: "polling",
        auditId: data.auditId,
        progress: 0,
        status: "queued",
      }));

      startPolling(data.auditId);
    } catch {
      setState((prev) => ({
        ...prev,
        phase: "failed",
        error: "Network error. Please check your connection and try again.",
      }));
    }
  }

  function handleReset() {
    if (pollRef.current) clearInterval(pollRef.current);
    setState({
      phase: "idle",
      auditId: null,
      brandName: "",
      industry: "",
      progress: 0,
      status: "queued",
      error: null,
      results: null,
    });
  }

  const { phase, auditId, brandName, industry, progress, status, error, results } = state;

  return (
    <main className="min-h-screen bg-[var(--color-bg)] pt-8 pb-20">
      <div className="container max-w-2xl">
        <AuditHero />

        <div className="mt-8 space-y-6">
          {/* Input form — always visible when idle, hidden during run */}
          {(phase === "idle" || phase === "creating") && (
            <AuditInputForm
              onSubmit={handleSubmit}
              loading={phase === "creating"}
            />
          )}

          {/* Progress indicator */}
          {(phase === "polling" || phase === "creating") && (
            <AuditProgress
              progress={phase === "creating" ? 2 : progress}
              status={phase === "creating" ? "queued" : status}
            />
          )}

          {/* Error state */}
          {phase === "failed" && (
            <div className="card p-6 text-center space-y-4">
              <p className="text-[var(--color-text-secondary)]">
                {error || "Something went wrong."}
              </p>
              <button className="btn-primary" onClick={handleReset}>
                Try again
              </button>
            </div>
          )}

          {/* Results */}
          {phase === "completed" && results && auditId && (
            <>
              <AuditResultsContainer
                auditId={auditId}
                brandName={brandName}
                industry={industry}
                data={results}
              />
              <div className="text-center pt-2">
                <button
                  className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors underline underline-offset-2"
                  onClick={handleReset}
                >
                  Run another audit
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
