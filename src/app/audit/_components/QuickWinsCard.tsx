"use client";

interface Props {
  wins: string[];
}

export function QuickWinsCard({ wins }: Props) {
  if (!wins || wins.length === 0) return null;

  return (
    <div className="card p-6 animate-fade-up delay-3">
      <h2 className="font-heading font-semibold text-[var(--color-text-primary)] mb-4">
        Quick Wins
      </h2>
      <ul className="space-y-3">
        {wins.map((win, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold mt-0.5"
              style={{
                background: "var(--color-emerald-dim, rgba(0,230,138,0.12))",
                color: "var(--color-emerald)",
                border: "1px solid var(--color-emerald-border, rgba(0,230,138,0.2))",
              }}
            >
              {i + 1}
            </span>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed flex-1">
              {win}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
