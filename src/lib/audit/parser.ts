import type { PositionBucket, Sentiment } from "./types";

interface LLMRecommendation {
  name: string;
  rank: number;
  sentiment: string;
  reason: string;
}

interface LLMResponse {
  recommendations: LLMRecommendation[];
  summary: string;
}

/** Normalize brand name for comparison */
function normalizeName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Simple brand alias check — matches if brand is contained in name or vice versa */
function brandMatches(candidateName: string, brandName: string): boolean {
  const c = normalizeName(candidateName);
  const b = normalizeName(brandName);
  return c === b || c.includes(b) || b.includes(c);
}

export interface ParsedResult {
  brand_mentioned: boolean;
  position_bucket: PositionBucket;
  sentiment: Sentiment;
  competitors: string[];
  confidence: number;
}

/** Escape/sanitize LLM text before rendering to prevent XSS/injection */
export function sanitizeText(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .slice(0, 500); // hard cap
}

export function parseProviderResponse(
  raw: string,
  brandName: string
): ParsedResult {
  const fallback: ParsedResult = {
    brand_mentioned: false,
    position_bucket: "not_mentioned",
    sentiment: "neutral",
    competitors: [],
    confidence: 0,
  };

  let parsed: LLMResponse;
  try {
    // Strip potential markdown fences
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    return fallback;
  }

  if (!Array.isArray(parsed?.recommendations)) return fallback;

  const recs = parsed.recommendations;
  const brandRec = recs.find((r) => brandMatches(r.name, brandName));
  const competitors = recs
    .filter((r) => !brandMatches(r.name, brandName))
    .map((r) => sanitizeText(r.name));

  if (!brandRec) {
    return { ...fallback, competitors };
  }

  // Position bucket
  let position_bucket: PositionBucket;
  const rank = brandRec.rank;
  if (rank === 1) position_bucket = "top_1";
  else if (rank <= 3) position_bucket = "top_3";
  else if (rank <= 5) position_bucket = "top_5";
  else position_bucket = "mentioned_late";

  // Sentiment
  const raw_sentiment = brandRec.sentiment?.toLowerCase() || "";
  let sentiment: Sentiment = "neutral";
  if (raw_sentiment === "positive") sentiment = "positive";
  else if (raw_sentiment === "negative") sentiment = "negative";

  return {
    brand_mentioned: true,
    position_bucket,
    sentiment,
    competitors,
    confidence: 0.85,
  };
}
