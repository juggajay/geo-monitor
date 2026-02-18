import type { PromptResult, PlatformScore, AuditScore, Platform } from "./types";

const POSITION_WEIGHTS: Record<string, number> = {
  top_1: 1.0,
  top_3: 0.8,
  top_5: 0.5,
  mentioned_late: 0.25,
  not_mentioned: 0,
};

const SENTIMENT_WEIGHTS: Record<string, number> = {
  positive: 1.0,
  neutral: 0.6,
  negative: 0.2,
};

function scoreSubset(results: PromptResult[]): number {
  if (results.length === 0) return 0;

  const total = results.length;
  const mentions = results.filter((r) => r.brand_mentioned).length;
  const mentionRate = mentions / total;

  const avgPositionWeight =
    results.reduce((sum, r) => sum + (POSITION_WEIGHTS[r.position_bucket ?? "not_mentioned"] ?? 0), 0) / total;

  const mentionedResults = results.filter((r) => r.brand_mentioned);
  const avgSentimentWeight =
    mentionedResults.length > 0
      ? mentionedResults.reduce(
          (sum, r) => sum + (SENTIMENT_WEIGHTS[r.sentiment ?? "neutral"] ?? 0.6),
          0
        ) / mentionedResults.length
      : 0;

  const score =
    40 * mentionRate +
    35 * avgPositionWeight +
    25 * avgSentimentWeight;

  return Math.round(Math.min(100, Math.max(0, score)));
}

export function computeScores(results: PromptResult[]): AuditScore {
  const platforms: Platform[] = ["chatgpt", "claude", "perplexity"];

  const platformScores: PlatformScore[] = platforms.map((platform) => {
    const subset = results.filter((r) => r.platform === platform);
    const score = scoreSubset(subset);
    const mentions = subset.filter((r) => r.brand_mentioned).length;
    return {
      platform,
      score,
      mention_rate: subset.length > 0 ? mentions / subset.length : 0,
      prompt_count: subset.length,
    };
  });

  const overall = scoreSubset(results);
  const totalMentions = results.filter((r) => r.brand_mentioned).length;
  const mentionRate = results.length > 0 ? totalMentions / results.length : 0;

  let summary: string;
  if (overall >= 70) {
    summary = "Strong AI visibility — your brand is consistently recommended across platforms.";
  } else if (overall >= 40) {
    summary = "Moderate AI visibility — your brand appears in some queries but has significant gaps.";
  } else {
    summary = "Low AI visibility — your brand is rarely recommended by AI platforms. Immediate action recommended.";
  }

  return { visibility: overall, platforms: platformScores, mention_rate: mentionRate, summary };
}

/** Generate 3 quick wins from results */
export function generateQuickWins(
  results: PromptResult[],
  brandName: string,
  industry: string
): string[] {
  const wins: string[] = [];

  const platforms: Platform[] = ["chatgpt", "claude", "perplexity"];
  for (const platform of platforms) {
    const subset = results.filter((r) => r.platform === platform && !r.brand_mentioned);
    if (subset.length >= 7) {
      const label = platform === "chatgpt" ? "ChatGPT" : platform === "claude" ? "Claude" : "Perplexity";
      wins.push(`Not appearing in ${subset.length}/10 ${label} queries — add ${brandName} to ${label}'s training context by publishing structured comparison content.`);
    }
  }

  const agencyPrompts = results.filter(
    (r) => r.prompt_text.toLowerCase().includes("agenc") && !r.brand_mentioned
  );
  if (agencyPrompts.length > 0) {
    wins.push(`Missing from agency-specific queries — create dedicated landing pages targeting "${industry} for agencies" to improve AI citation chances.`);
  }

  const negativeResults = results.filter((r) => r.sentiment === "negative");
  if (negativeResults.length > 0) {
    wins.push(`Negative sentiment detected in ${negativeResults.length} result(s) — address common objections in your public content and review responses.`);
  }

  // Fill to 3 with generic wins if needed
  if (wins.length < 3) {
    wins.push(`Publish a dedicated "${brandName} vs competitors" comparison page targeting "${industry}" to increase AI recommendation frequency.`);
  }
  if (wins.length < 3) {
    wins.push(`Submit ${brandName} to G2, Capterra, and Trustpilot — AI platforms heavily cite these sources in ${industry} recommendations.`);
  }

  return wins.slice(0, 3);
}
