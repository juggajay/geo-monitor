"use client";

import type { PromptResult } from "@/lib/audit/types";

interface Props {
  rows: PromptResult[];
  allRows?: PromptResult[];
  unlocked: boolean;
  lockedRowsCount: number;
  freeRows?: number;
}

const PLATFORM_COLORS: Record<string, string> = {
  chatgpt: "#10a37f",
  claude: "#d97706",
  perplexity: "#818cf8",
};

const BUCKET_LABELS: Record<string, { label: string; color: string }> = {
  top_1: { label: "#1", color: "#00e68a" },
  top_3: { label: "Top 3", color: "#86efac" },
  top_5: { label: "Top 5", color: "#fbbf24" },
  mentioned_late: { label: "Late", color: "#94a3b8" },
  not_mentioned: { label: "—", color: "#374151" },
};

const SENTIMENT_META: Record<string, { emoji: string; color: string }> = {
  positive: { emoji: "↑", color: "#00e68a" },
  neutral: { emoji: "→", color: "#94a3b8" },
  negative: { emoji: "↓", color: "#ef4444" },
};

type RowData = {
  promptIndex: number;
  promptText: string;
  platforms: Record<string, PromptResult>;
};

function groupByPrompt(rows: PromptResult[]): RowData[] {
  const map = new Map<number, RowData>();
  for (const r of rows) {
    if (!map.has(r.prompt_index)) {
      map.set(r.prompt_index, { promptIndex: r.prompt_index, promptText: r.prompt_text, platforms: {} });
    }
    map.get(r.prompt_index)!.platforms[r.platform] = r;
  }
  return Array.from(map.values()).sort((a, b) => a.promptIndex - b.promptIndex);
}

export function ResultsTable({ rows, allRows, unlocked, lockedRowsCount }: Props) {
  const displayRows = unlocked && allRows ? allRows : rows;
  const grouped = groupByPrompt(displayRows);

  return (
    <div className="animate-fade-up delay-2">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-heading font-semibold text-[var(--color-text-primary)]">
          Query Results
        </h2>
        {!unlocked && lockedRowsCount > 0 && (
          <span className="text-xs text-[var(--color-text-tertiary)]">
            {grouped.length} of {grouped.length + lockedRowsCount} queries visible
          </span>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="text-left p-4 text-xs text-[var(--color-text-tertiary)] font-medium uppercase tracking-wider w-8">#</th>
              <th className="text-left p-4 text-xs text-[var(--color-text-tertiary)] font-medium uppercase tracking-wider">Query</th>
              <th className="text-center p-4 text-xs font-medium uppercase tracking-wider" style={{ color: PLATFORM_COLORS.chatgpt }}>ChatGPT</th>
              <th className="text-center p-4 text-xs font-medium uppercase tracking-wider" style={{ color: PLATFORM_COLORS.claude }}>Claude</th>
              <th className="text-center p-4 text-xs font-medium uppercase tracking-wider" style={{ color: PLATFORM_COLORS.perplexity }}>Perplexity</th>
            </tr>
          </thead>
          <tbody>
            {grouped.map((row) => (
              <tr key={row.promptIndex} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-elevated)] transition-colors">
                <td className="p-4 font-mono text-xs text-[var(--color-text-tertiary)]">{row.promptIndex}</td>
                <td className="p-4 text-[var(--color-text-secondary)] max-w-xs">{row.promptText}</td>
                {(["chatgpt", "claude", "perplexity"] as const).map((platform) => {
                  const r = row.platforms[platform];
                  if (!r) return <td key={platform} className="p-4 text-center text-[var(--color-text-tertiary)]">—</td>;
                  const bucket = BUCKET_LABELS[r.position_bucket ?? "not_mentioned"];
                  const sentiment = r.brand_mentioned ? SENTIMENT_META[r.sentiment ?? "neutral"] : null;
                  return (
                    <td key={platform} className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className="font-mono text-xs font-bold px-2 py-0.5 rounded"
                          style={{ color: bucket.color, background: `${bucket.color}18` }}
                        >
                          {bucket.label}
                        </span>
                        {sentiment && (
                          <span className="text-xs font-mono" style={{ color: sentiment.color }}>
                            {sentiment.emoji}
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: accordion per prompt */}
      <div className="md:hidden space-y-2">
        {grouped.map((row) => (
          <details key={row.promptIndex} className="card overflow-hidden">
            <summary className="p-4 cursor-pointer flex items-center gap-3">
              <span className="font-mono text-xs text-[var(--color-text-tertiary)] w-5 flex-shrink-0">{row.promptIndex}</span>
              <span className="text-sm text-[var(--color-text-secondary)] flex-1">{row.promptText}</span>
            </summary>
            <div className="px-4 pb-4 grid grid-cols-3 gap-2">
              {(["chatgpt", "claude", "perplexity"] as const).map((platform) => {
                const r = row.platforms[platform];
                const bucket = BUCKET_LABELS[r?.position_bucket ?? "not_mentioned"];
                return (
                  <div key={platform} className="text-center">
                    <p className="text-xs mb-1" style={{ color: PLATFORM_COLORS[platform] }}>
                      {platform === "chatgpt" ? "ChatGPT" : platform === "claude" ? "Claude" : "Perplexity"}
                    </p>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded" style={{ color: bucket.color, background: `${bucket.color}18` }}>
                      {bucket.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </details>
        ))}
      </div>

      {/* Locked rows overlay */}
      {!unlocked && lockedRowsCount > 0 && (
        <div className="relative mt-2">
          {/* Ghost locked rows */}
          <div className="card overflow-hidden">
            {Array.from({ length: Math.min(lockedRowsCount, 4) }).map((_, i) => (
              <div
                key={i}
                className="border-b border-[var(--color-border)] last:border-0 p-4 flex items-center gap-4"
                style={{ opacity: 1 - i * 0.18, filter: `blur(${3 + i * 1.5}px)` }}
              >
                <span className="font-mono text-xs text-[var(--color-text-tertiary)] w-5">{grouped.length + i + 1}</span>
                <div className="h-3 bg-[var(--color-border)] rounded flex-1 max-w-xs" />
                <div className="h-6 w-12 bg-[var(--color-border)] rounded mx-auto" />
                <div className="h-6 w-12 bg-[var(--color-border)] rounded mx-auto" />
                <div className="h-6 w-12 bg-[var(--color-border)] rounded mx-auto" />
              </div>
            ))}
          </div>
          {/* Gradient + lock */}
          <div
            className="absolute inset-x-0 bottom-0 h-full rounded-[20px] flex flex-col items-center justify-end pb-6"
            style={{
              background: "linear-gradient(to bottom, transparent 0%, var(--color-bg) 60%)",
            }}
          >
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              {lockedRowsCount} more {lockedRowsCount === 1 ? "query" : "queries"} locked
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
