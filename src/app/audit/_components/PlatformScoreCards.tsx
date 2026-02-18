"use client";

import type { PlatformScore } from "@/lib/audit/types";

interface Props {
  platformScores: PlatformScore[];
}

const PLATFORM_META: Record<string, { label: string; color: string; icon: string }> = {
  chatgpt: { label: "ChatGPT", color: "#10a37f", icon: "⬡" },
  claude: { label: "Claude", color: "#d97706", icon: "◈" },
  perplexity: { label: "Perplexity", color: "#818cf8", icon: "◎" },
};

export function PlatformScoreCards({ platformScores }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-up delay-1">
      {platformScores.map((ps) => {
        const meta = PLATFORM_META[ps.platform] ?? { label: ps.platform, color: "#888", icon: "○" };
        return (
          <div
            key={ps.platform}
            className="card p-4"
            style={{ borderLeft: `2px solid ${meta.color}40` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span style={{ color: meta.color, fontSize: "1.1rem" }}>{meta.icon}</span>
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                {meta.label}
              </span>
            </div>
            <div
              className="font-mono font-black text-3xl leading-none mb-1"
              style={{ color: meta.color }}
            >
              {ps.score}
            </div>
            <div className="text-xs text-[var(--color-text-tertiary)] font-mono mb-3">/ 100</div>

            {/* Mention rate bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-[var(--color-text-tertiary)]">
                <span>Mention rate</span>
                <span className="font-mono">{Math.round(ps.mention_rate * 100)}%</span>
              </div>
              <div className="h-1 bg-[var(--color-border)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${ps.mention_rate * 100}%`,
                    background: meta.color,
                    transition: "width 1s cubic-bezier(0.4,0,0.2,1) 0.3s",
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
