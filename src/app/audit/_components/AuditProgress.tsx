"use client";

interface Props {
  progress: number;
  status: "queued" | "running";
}

const MESSAGES = [
  "Initialising audit engine…",
  "Querying ChatGPT across 10 scenarios…",
  "Running Claude visibility checks…",
  "Probing Perplexity recommendations…",
  "Analysing competitor mentions…",
  "Computing position scores…",
  "Calculating sentiment signals…",
  "Compiling visibility scorecard…",
  "Almost done…",
];

export function AuditProgress({ progress, status }: Props) {
  const msgIndex = Math.min(
    Math.floor((progress / 100) * MESSAGES.length),
    MESSAGES.length - 1
  );

  return (
    <div className="max-w-md mx-auto text-center py-10 animate-fade-up">
      {/* Spinner ring */}
      <div className="relative w-20 h-20 mx-auto mb-6">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40" cy="40" r="34"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="4"
          />
          <circle
            cx="40" cy="40" r="34"
            fill="none"
            stroke="var(--color-emerald)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 34}`}
            strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
            style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold text-[var(--color-emerald)]">
          {progress}%
        </span>
      </div>

      <p className="font-heading font-semibold text-[var(--color-text-primary)] text-lg mb-2">
        Running 30 checks across 3 AI platforms
      </p>
      <p className="text-sm text-[var(--color-text-secondary)] h-5 transition-all duration-300">
        {MESSAGES[msgIndex]}
      </p>

      {/* Progress bar */}
      <div className="mt-6 h-1 bg-[var(--color-border)] rounded-full overflow-hidden max-w-xs mx-auto">
        <div
          className="h-full bg-[var(--color-emerald)] rounded-full"
          style={{
            width: `${progress}%`,
            transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
    </div>
  );
}
