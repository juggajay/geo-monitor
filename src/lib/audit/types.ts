export type AuditStatus = "queued" | "running" | "completed" | "failed";
export type Platform = "chatgpt" | "claude" | "perplexity";
export type PositionBucket =
  | "top_1"
  | "top_3"
  | "top_5"
  | "mentioned_late"
  | "not_mentioned";
export type Sentiment = "positive" | "neutral" | "negative";

export interface AuditJob {
  id: string;
  brand_name: string;
  industry: string;
  status: AuditStatus;
  progress: number;
  visibility_score: number | null;
  free_unlocked: boolean;
  full_unlocked: boolean;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface PromptResult {
  id: string;
  audit_job_id: string;
  prompt_index: number;
  prompt_text: string;
  platform: Platform;
  raw_response: string | null;
  brand_mentioned: boolean | null;
  position_bucket: PositionBucket | null;
  sentiment: Sentiment | null;
  competitors_json: string[] | null;
  confidence: number | null;
}

export interface PlatformScore {
  platform: Platform;
  score: number;
  mention_rate: number;
  prompt_count: number;
}

export interface AuditScore {
  visibility: number;
  platforms: PlatformScore[];
  mention_rate: number;
  summary: string;
  quick_wins?: string[];
}

export interface AuditResultsResponse {
  ok: boolean;
  status: AuditStatus;
  progress: number;
  error?: string;
  score?: AuditScore;
  results?: {
    freeRows: PromptResult[];
    lockedRowsCount: number;
    allRows?: PromptResult[]; // only when full_unlocked
  };
}
