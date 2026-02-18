"use client";

import { useEffect, useState } from "react";

interface Props {
  score: number;
  mentionRate: number;
  summary: string;
  brandName: string;
}

function scoreColor(score: number): string {
  if (score >= 70) return "var(--color-emerald)";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

function scoreLabel(score: number): string {
  if (score >= 70) return "Strong";
  if (score >= 40) return "Moderate";
  return "Low";
}

export function ScoreSummaryCard({ score, mentionRate, summary, brandName }: Props) {
  const [displayed, setDisplayed] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // Animate score counting up
  useEffect(() => {
    setRevealed(false);
    const duration = 1800;
    const start = performance.now();
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(eased * score));
      if (t < 1) requestAnimationFrame(tick);
      else setRevealed(true);
    }
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const color = scoreColor(score);

  return (
    <div className="card p-6 md:p-8 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        {/* Score */}
        <div className="flex-shrink-0 text-center md:text-left">
          <div
            className="font-mono font-black leading-none transition-all duration-300"
            style={{
              fontSize: "clamp(5rem, 12vw, 8rem)",
              color,
              textShadow: revealed ? `0 0 60px ${color}40` : "none",
            }}
          >
            {displayed}
          </div>
          <div className="text-[var(--color-text-tertiary)] text-sm font-medium -mt-1 font-mono">
            / 100
          </div>
          <div
            className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              background: `${color}18`,
              color,
              border: `1px solid ${color}30`,
            }}
          >
            {scoreLabel(score)} Visibility
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 space-y-4">
          <div>
            <p className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-widest mb-1">
              AI Visibility Score
            </p>
            <p className="font-heading font-semibold text-xl text-[var(--color-text-primary)]">
              {brandName}
            </p>
          </div>

          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {summary}
          </p>

          <div className="flex gap-4 pt-1">
            <div>
              <p className="text-xs text-[var(--color-text-tertiary)] mb-0.5">Mention rate</p>
              <p className="font-mono font-bold text-[var(--color-text-primary)]">
                {Math.round(mentionRate * 100)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-tertiary)] mb-0.5">Platforms checked</p>
              <p className="font-mono font-bold text-[var(--color-text-primary)]">3</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-tertiary)] mb-0.5">Total queries</p>
              <p className="font-mono font-bold text-[var(--color-text-primary)]">30</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
