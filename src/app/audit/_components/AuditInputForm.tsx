"use client";

import { useState, useRef } from "react";

interface Props {
  onSubmit: (data: { brandName: string; industry: string }) => void;
  loading?: boolean;
}

export function AuditInputForm({ onSubmit, loading }: Props) {
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("");
  const [errors, setErrors] = useState<{ brand?: string; industry?: string }>({});
  const startedAt = useRef(Date.now());

  function validate() {
    const e: typeof errors = {};
    if (brandName.trim().length < 2) e.brand = "Enter your brand name (min 2 chars)";
    if (industry.trim().length < 2) e.industry = "Enter your industry or category";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    // Bot heuristic: must be >2s since page loaded
    if (Date.now() - startedAt.current < 2000) return;
    setErrors({});
    onSubmit({ brandName: brandName.trim(), industry: industry.trim() });
  }

  return (
    <div className="max-w-md mx-auto animate-fade-up delay-3">
      <div className="card p-6 md:p-8">
        <form onSubmit={handleSubmit} noValidate>
          {/* Honeypot */}
          <input
            type="text"
            name="website_url"
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Brand name
            </label>
            <input
              type="text"
              className="field-input"
              placeholder="e.g. HubSpot"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              maxLength={80}
              disabled={loading}
            />
            {errors.brand && (
              <p className="text-xs text-red-400 mt-1.5">{errors.brand}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Industry / category
            </label>
            <input
              type="text"
              className="field-input"
              placeholder="e.g. CRM, SEO software, HR platform"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              maxLength={80}
              disabled={loading}
            />
            {errors.industry && (
              <p className="text-xs text-red-400 mt-1.5">{errors.industry}</p>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                Starting audit…
              </>
            ) : (
              "Run Free Audit →"
            )}
          </button>

          <p className="text-center text-xs text-[var(--color-text-tertiary)] mt-3">
            30 checks · 3 platforms · ~90 seconds · No signup required
          </p>
        </form>
      </div>
    </div>
  );
}
