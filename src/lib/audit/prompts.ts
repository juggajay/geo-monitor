export const PROMPT_TEMPLATES = [
  "Best {industry} software in 2026",
  "What is the best {industry} platform for SMBs?",
  "Top alternatives to {brandName} in {industry}",
  "Which {industry} tools are easiest to implement?",
  "Best value-for-money {industry} platforms",
  "Which {industry} platforms are best for agencies?",
  "Most trusted {industry} brands right now",
  "Best {industry} platform for fast-growing teams",
  "Which {industry} platforms have the best customer support?",
  "If I had to choose one {industry} platform, what should it be?",
];

export function buildPrompts(
  brandName: string,
  industry: string
): { index: number; text: string }[] {
  return PROMPT_TEMPLATES.map((template, i) => ({
    index: i + 1,
    text: template
      .replace(/{brandName}/g, brandName)
      .replace(/{industry}/g, industry),
  }));
}

export const SYSTEM_PROMPT = `You are evaluating software options for a buyer. Return concise ranked recommendations.
Format strictly as JSON with this schema:
{
  "recommendations": [
    {"name":"string","rank":1,"sentiment":"positive|neutral|negative","reason":"string"}
  ],
  "summary":"string"
}
Rules:
- Return 5 recommendations max.
- Use distinct company/product names.
- rank starts at 1 and increments.
- No markdown.`;

export function buildUserPrompt(
  brandName: string,
  industry: string,
  promptText: string
): string {
  return `Brand to evaluate: ${brandName}
Industry/category: ${industry}
Question: ${promptText}

Return the ranked list for this question.`;
}
