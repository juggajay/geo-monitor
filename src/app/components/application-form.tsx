"use client";

import { useState, useRef } from "react";
import { track } from "../lib/analytics";

interface FormData {
  name: string;
  email: string;
  agencyName: string;
  website: string;
  clientCount: string;
  role: string;
  serviceFocus: string;
  biggestPain: string;
}

const INITIAL: FormData = {
  name: "",
  email: "",
  agencyName: "",
  website: "",
  clientCount: "",
  role: "",
  serviceFocus: "",
  biggestPain: "",
};

const CLIENT_OPTIONS = [
  { value: "1-4", label: "1 – 4 clients" },
  { value: "5-10", label: "5 – 10 clients" },
  { value: "11-25", label: "11 – 25 clients" },
  { value: "26-50", label: "26 – 50 clients" },
  { value: "50+", label: "50+ clients" },
];

const SERVICE_OPTIONS = [
  "SEO",
  "Content",
  "Digital PR",
  "Other",
];

function isQualified(clientCount: string): boolean {
  return clientCount !== "1-4" && clientCount !== "";
}

export default function ApplicationForm() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "qualified" | "waitlist"
  >("idle");
  const hasTrackedStart = useRef(false);

  function onChange(field: keyof FormData, value: string) {
    if (!hasTrackedStart.current) {
      track("form_start");
      hasTrackedStart.current = true;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    track("form_submit", { clientCount: form.clientCount });

    const qualified = isQualified(form.clientCount);
    if (qualified) {
      track("qualified_submit", {
        clientCount: form.clientCount,
        agency: form.agencyName,
      });
    } else {
      track("disqualified_submit", {
        clientCount: form.clientCount,
        agency: form.agencyName,
      });
    }

    // Replace with real API endpoint
    await new Promise((r) => setTimeout(r, 1500));
    setStatus(qualified ? "qualified" : "waitlist");
  }

  if (status === "qualified") {
    return (
      <div className="mx-auto max-w-xl animate-fade-up">
        <div className="card overflow-hidden" style={{ borderColor: "rgba(0, 230, 138, 0.2)" }}>
          {/* Green gradient top strip */}
          <div className="h-1 bg-gradient-to-r from-emerald-dark via-emerald to-emerald-light" />
          <div className="px-8 py-12 text-center md:px-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald/10">
              <svg
                className="h-8 w-8 text-emerald"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-heading text-2xl font-bold text-text-primary md:text-3xl">
              Application received.
            </h3>
            <p className="mt-4 text-text-secondary leading-relaxed">
              If accepted, we&apos;ll send onboarding details within 3 business days.
              <br />
              Check{" "}
              <span className="font-medium text-text-primary">{form.email}</span>{" "}
              for updates.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "waitlist") {
    return (
      <div className="mx-auto max-w-xl animate-fade-up">
        <div className="card overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-border via-border-hover to-border" />
          <div className="px-8 py-12 text-center md:px-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-text-tertiary/10">
              <svg
                className="h-8 w-8 text-text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-heading text-2xl font-bold text-text-primary md:text-3xl">
              You&apos;re on the waitlist.
            </h3>
            <p className="mt-4 text-text-secondary leading-relaxed">
              GEO Monitor beta is optimized for agencies managing 5+ clients.
              <br />
              We&apos;ll notify{" "}
              <span className="font-medium text-text-primary">{form.email}</span>{" "}
              when we open more spots.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card overflow-hidden">
        {/* Emerald top accent */}
        <div className="h-px bg-gradient-to-r from-transparent via-emerald/50 to-transparent" />

        <form onSubmit={handleSubmit} className="space-y-7 p-8 md:p-10">
          {/* Row 1 */}
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Full name" required>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => onChange("name", e.target.value)}
                placeholder="Jane Smith"
                className="field-input"
              />
            </Field>
            <Field label="Work email" required>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => onChange("email", e.target.value)}
                placeholder="jane@agency.com"
                className="field-input"
              />
            </Field>
          </div>

          {/* Row 2 */}
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Agency name" required>
              <input
                type="text"
                required
                value={form.agencyName}
                onChange={(e) => onChange("agencyName", e.target.value)}
                placeholder="Acme Digital"
                className="field-input"
              />
            </Field>
            <Field label="Website">
              <input
                type="url"
                value={form.website}
                onChange={(e) => onChange("website", e.target.value)}
                placeholder="https://agency.com"
                className="field-input"
              />
            </Field>
          </div>

          {/* Row 3 */}
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Number of active clients" required>
              <select
                required
                value={form.clientCount}
                onChange={(e) => onChange("clientCount", e.target.value)}
                className="field-input"
              >
                <option value="" disabled>
                  Select range
                </option>
                {CLIENT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Your role" required>
              <input
                type="text"
                required
                value={form.role}
                onChange={(e) => onChange("role", e.target.value)}
                placeholder="Head of SEO, Founder, etc."
                className="field-input"
              />
            </Field>
          </div>

          {/* Service focus pills */}
          <Field label="Primary services" required>
            <div className="flex flex-wrap gap-2.5">
              {SERVICE_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onChange("serviceFocus", s)}
                  className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                    form.serviceFocus === s
                      ? "border-emerald/40 bg-emerald/10 text-emerald shadow-[0_0_12px_rgba(0,230,138,0.1)]"
                      : "border-border text-text-tertiary hover:border-border-hover hover:text-text-secondary"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>

          {/* Pain point */}
          <Field label="Biggest challenge with AI visibility reporting" required>
            <textarea
              required
              rows={4}
              value={form.biggestPain}
              onChange={(e) => onChange("biggestPain", e.target.value)}
              placeholder="e.g. We have no idea how our clients appear in ChatGPT or AI Overviews, and clients are starting to ask..."
              className="field-input resize-none"
            />
          </Field>

          {/* Disqualification notice */}
          {form.clientCount === "1-4" && (
            <div className="flex gap-3 rounded-xl border border-yellow-500/15 bg-yellow-500/5 p-4">
              <svg
                className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              <p className="text-sm text-yellow-200/70 leading-relaxed">
                This beta is designed for agencies managing 5+ clients. You can
                still apply — we&apos;ll add you to our waitlist and reach out
                when we expand.
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={status === "submitting"}
            className="btn-primary w-full !rounded-xl !py-5 !text-base disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === "submitting" ? (
              <span className="flex items-center gap-3">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Reviewing your application...
              </span>
            ) : (
              "Apply for Beta"
            )}
          </button>

          <p className="text-center text-xs leading-relaxed text-text-tertiary">
            By applying, you agree to be contacted about beta onboarding and product updates.
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2.5">
      <span className="text-sm font-medium text-text-primary">
        {label}
        {required && <span className="ml-1 text-emerald">*</span>}
      </span>
      {children}
    </label>
  );
}
