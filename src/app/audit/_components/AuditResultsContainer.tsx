"use client";

import { useState } from "react";
import type { AuditResultsResponse } from "@/lib/audit/types";
import { ScoreSummaryCard } from "./ScoreSummaryCard";
import { PlatformScoreCards } from "./PlatformScoreCards";
import { ResultsTable } from "./ResultsTable";
import { EmailGateCard } from "./EmailGateCard";
import { QuickWinsCard } from "./QuickWinsCard";

interface Props {
  auditId: string;
  brandName: string;
  industry: string;
  data: AuditResultsResponse;
}

export function AuditResultsContainer({ auditId, brandName, industry, data }: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [allRows, setAllRows] = useState(data.results?.allRows);

  async function handleUnlockSuccess() {
    setUnlocked(true);
    // Fetch full results now that unlocked
    try {
      const res = await fetch(`/api/audit/${auditId}`);
      const fresh: AuditResultsResponse = await res.json();
      if (fresh.results?.allRows) {
        setAllRows(fresh.results.allRows);
      }
    } catch {
      // allRows already set from initial load if full_unlocked was true
    }
  }

  if (!data.score || !data.results) return null;

  const { score, results } = data;
  const showGate = !unlocked && results.lockedRowsCount > 0;

  return (
    <div className="space-y-5">
      <ScoreSummaryCard
        score={score.visibility}
        mentionRate={score.mention_rate}
        summary={score.summary}
        brandName={brandName}
      />

      <PlatformScoreCards platformScores={score.platforms} />

      <ResultsTable
        rows={results.freeRows}
        allRows={allRows ?? results.allRows}
        unlocked={unlocked || !!results.allRows}
        lockedRowsCount={unlocked ? 0 : results.lockedRowsCount}
      />

      {showGate && (
        <EmailGateCard auditId={auditId} onUnlockSuccess={handleUnlockSuccess} />
      )}

      {score.quick_wins && score.quick_wins.length > 0 && (unlocked || !showGate) && (
        <QuickWinsCard wins={score.quick_wins} />
      )}
    </div>
  );
}
