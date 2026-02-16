"use client";

import { track } from "../lib/analytics";

export default function MidpageCTA() {
  return (
    <section className="relative overflow-hidden py-28 md:py-36">
      {/* Background glow */}
      <div
        className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(ellipse, rgba(0, 230, 138, 0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
          AI search is moving fast.
          <br />
          <span className="text-text-secondary">Your reporting should too.</span>
        </h2>
        <div className="mt-10">
          <a
            href="#apply"
            onClick={() => track("midpage_cta_click", { source: "midpage_section" })}
            className="btn-primary btn-primary-lg"
          >
            Apply for Beta
          </a>
        </div>
      </div>
    </section>
  );
}
