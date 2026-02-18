"use client";

import { useState, useRef } from "react";

interface Props {
  auditId: string;
  onUnlockSuccess: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailGateCard({ auditId, onUnlockSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const mountedAt = useRef(Date.now());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (!consent) {
      setError("Please tick the consent box to unlock your report.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/audit/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditId,
          email: email.trim().toLowerCase(),
          consent: true,
          submittedAt: mountedAt.current,
          utm: {
            source: new URLSearchParams(window.location.search).get("utm_source"),
            medium: new URLSearchParams(window.location.search).get("utm_medium"),
            campaign: new URLSearchParams(window.location.search).get("utm_campaign"),
          },
        }),
      });
      const data = await res.json();
      if (data.ok && data.unlocked) {
        onUnlockSuccess();
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-6 md:p-8 animate-fade-up" style={{ borderColor: "var(--color-emerald)", borderWidth: "1px", background: "rgba(0,230,138,0.03)" }}>
      {/* Honeypot */}
      <input type="text" name="phone_number" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[var(--color-emerald)]/10 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-emerald)" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-heading font-bold text-[var(--color-text-primary)] text-lg mb-1">
            Unlock your full AI visibility report
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-5">
            Get all 10 query results, competitor breakdowns, and recommended next steps.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="flex gap-2 mb-3">
              <input
                type="email"
                className="field-input flex-1"
                placeholder="your@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <button type="submit" className="btn-primary flex-shrink-0" disabled={loading}>
                {loading ? (
                  <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                ) : "Unlock full report"}
              </button>
            </div>

            <label className="flex items-start gap-2 cursor-pointer mb-3">
              <input
                type="checkbox"
                className="mt-0.5 flex-shrink-0 accent-[var(--color-emerald)]"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                disabled={loading}
              />
              <span className="text-xs text-[var(--color-text-tertiary)]">
                I agree to be contacted about this audit and GEO Monitor updates.
              </span>
            </label>

            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}
          </form>

          <p className="text-xs text-[var(--color-text-tertiary)] mt-2">
            No credit card required. Instant unlock.
          </p>
        </div>
      </div>
    </div>
  );
}
