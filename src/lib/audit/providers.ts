/**
 * Phase 2 — Real provider calls
 * Env vars required: OPENAI_API_KEY, ANTHROPIC_API_KEY
 * Perplexity: no key — stubbed with null result (degraded badge in UI)
 */

import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { buildUserPrompt, SYSTEM_PROMPT } from "./prompts";
import { parseProviderResponse } from "./parser";
import type { PromptResult } from "./types";

const PROVIDER_TIMEOUT_MS = 25000;

export interface PromptInput {
  index: number;
  text: string;
}

// ── OpenAI ────────────────────────────────────────────────────────────────────

async function callOpenAI(
  prompt: PromptInput,
  brandName: string,
  industry: string,
  auditJobId: string
): Promise<Omit<PromptResult, "id">> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

  try {
    const response = await client.chat.completions.create(
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(brandName, industry, prompt.text) },
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: "json_object" },
      },
      { signal: controller.signal }
    );

    const raw = response.choices[0]?.message?.content ?? "{}";
    const { competitors, ...parsed } = parseProviderResponse(raw, brandName);

    return {
      audit_job_id: auditJobId,
      prompt_index: prompt.index,
      prompt_text: prompt.text,
      platform: "chatgpt",
      raw_response: raw,
      competitors_json: competitors,
      ...parsed,
    };
  } finally {
    clearTimeout(timeout);
  }
}

// ── Anthropic ─────────────────────────────────────────────────────────────────

async function callAnthropic(
  prompt: PromptInput,
  brandName: string,
  industry: string,
  auditJobId: string
): Promise<Omit<PromptResult, "id">> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

  try {
    const response = await client.messages.create(
      {
        model: "claude-haiku-4-5-20251001",
        max_tokens: 800,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildUserPrompt(brandName, industry, prompt.text) }],
      },
      { signal: controller.signal }
    );

    const raw = response.content[0]?.type === "text" ? response.content[0].text : "{}";
    const { competitors, ...parsed } = parseProviderResponse(raw, brandName);

    return {
      audit_job_id: auditJobId,
      prompt_index: prompt.index,
      prompt_text: prompt.text,
      platform: "claude",
      raw_response: raw,
      competitors_json: competitors,
      ...parsed,
    };
  } finally {
    clearTimeout(timeout);
  }
}

// ── Perplexity (stub — no key) ─────────────────────────────────────────────────

function stubPerplexity(
  prompt: PromptInput,
  auditJobId: string
): Omit<PromptResult, "id"> {
  return {
    audit_job_id: auditJobId,
    prompt_index: prompt.index,
    prompt_text: prompt.text,
    platform: "perplexity",
    raw_response: null,
    brand_mentioned: null,
    position_bucket: null,
    sentiment: null,
    competitors_json: null,
    confidence: null,
  };
}

// ── Batch runner ───────────────────────────────────────────────────────────────

async function runPrompt(
  prompt: PromptInput,
  brandName: string,
  industry: string,
  auditJobId: string
): Promise<Array<Omit<PromptResult, "id">>> {
  const [openaiResult, anthropicResult] = await Promise.allSettled([
    callOpenAI(prompt, brandName, industry, auditJobId),
    callAnthropic(prompt, brandName, industry, auditJobId),
  ]);

  const results: Array<Omit<PromptResult, "id">> = [];

  if (openaiResult.status === "fulfilled") results.push(openaiResult.value);
  else console.error(`[OpenAI] prompt ${prompt.index} failed:`, openaiResult.reason);

  if (anthropicResult.status === "fulfilled") results.push(anthropicResult.value);
  else console.error(`[Anthropic] prompt ${prompt.index} failed:`, anthropicResult.reason);

  // Always include Perplexity stub
  results.push(stubPerplexity(prompt, auditJobId));

  return results;
}

/**
 * Run all prompts across all providers.
 * Processes in batches of 3 to stay within rate limits.
 * onProgress(pct) is called after each batch.
 */
export async function runAllProviders(
  prompts: PromptInput[],
  brandName: string,
  industry: string,
  auditJobId: string,
  onProgress: (progress: number) => Promise<void>
): Promise<Array<Omit<PromptResult, "id">>> {
  const allResults: Array<Omit<PromptResult, "id">> = [];
  const BATCH_SIZE = 3;

  for (let i = 0; i < prompts.length; i += BATCH_SIZE) {
    const batch = prompts.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.all(
      batch.map((prompt) => runPrompt(prompt, brandName, industry, auditJobId))
    );

    for (const promptResults of batchResults) {
      allResults.push(...promptResults);
    }

    const progress = Math.round(5 + ((i + batch.length) / prompts.length) * 90);
    await onProgress(progress);
  }

  return allResults;
}
