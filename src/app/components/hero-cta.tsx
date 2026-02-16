"use client";

import { track } from "../lib/analytics";

export default function HeroCTA() {
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
      <a
        href="#apply"
        onClick={() => track("hero_cta_click")}
        className="btn-primary btn-primary-lg"
      >
        Apply for Beta Access
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
          />
        </svg>
      </a>
      <a href="#solution" className="btn-ghost">
        See how it works
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
          />
        </svg>
      </a>
    </div>
  );
}
