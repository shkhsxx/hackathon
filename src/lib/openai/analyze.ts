import OpenAI from "openai";
import type {
  BodyAnalysisResult,
  RecommendationPayload,
  BodyShape,
} from "@/types";

// 빌드 타임이 아닌 런타임에만 초기화 (Vercel env var 접근 보장)
function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// ─── Body Shape Analysis ─────────────────────────────────────────────────────

const ANALYSIS_SYSTEM_PROMPT = `You are a professional fashion stylist and body shape analyst.
Analyze the provided image and determine the person's body shape characteristics.
Focus on structural proportions — shoulder width, waist definition, hip width — NOT weight or BMI.
Always respond ONLY with valid JSON matching the exact schema provided. No markdown fences.`;

const ANALYSIS_USER_PROMPT = `Analyze the body shape in this image and respond with JSON only:

{
  "bodyShape": "one of: triangle | inverted_triangle | rectangle | hourglass | oval",
  "shoulderWidth": "one of: narrow | medium | wide",
  "waistLine": "one of: narrow | medium | wide",
  "bodyBalance": "one of: upper-heavy | balanced | lower-heavy",
  "confidence": <float 0.0–1.0>
}

Rules:
- triangle: shoulders narrower than hips
- inverted_triangle: shoulders wider than hips
- rectangle: shoulders ≈ waist ≈ hips (little definition)
- hourglass: shoulders ≈ hips, waist noticeably narrower
- oval: midsection widest, rounded silhouette
- confidence reflects image clarity and landmark visibility`;

export async function analyzeBodyShape(
  imageUrl: string
): Promise<BodyAnalysisResult> {
  const openai = getClient();

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 256,
    messages: [
      { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: ANALYSIS_USER_PROMPT },
          { type: "image_url", image_url: { url: imageUrl, detail: "high" } },
        ],
      },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "";

  try {
    return JSON.parse(raw) as BodyAnalysisResult;
  } catch {
    throw new Error(`GPT returned unparseable JSON: ${raw}`);
  }
}

// ─── Style Recommendation Generation ─────────────────────────────────────────

const RECOMMEND_SYSTEM_PROMPT = `You are an expert fashion stylist specializing in body-type dressing.
Given body shape analysis data, recommend specific clothing styles.
Always respond ONLY with valid JSON matching the exact schema. No markdown fences.`;

function buildRecommendPrompt(analysis: BodyAnalysisResult): string {
  return `Body analysis:
- Body shape: ${analysis.bodyShape}
- Shoulder width: ${analysis.shoulderWidth}
- Waist line: ${analysis.waistLine}
- Body balance: ${analysis.bodyBalance}
- Confidence: ${analysis.confidence}

Respond with JSON only:
{
  "recommendedFits": ["2–4 fit types e.g. regular fit, semi oversized"],
  "tops": ["3–5 specific top styles"],
  "bottoms": ["3–5 specific bottom styles"],
  "outers": ["2–3 outer styles"],
  "avoid": ["2–4 styles to avoid"]
}

Focus on creating visual balance for this specific body shape.`;
}

const EXPLANATION_SYSTEM_PROMPT = `You are a friendly Korean-speaking fashion stylist coach.
Write a 3-sentence explanation of why these recommendations suit the person's body shape.
Use warm, encouraging language. Focus on "balance" and "proportion" not on flaws.
Output plain text, no JSON, no markdown.`;

function buildExplanationPrompt(
  analysis: BodyAnalysisResult,
  recommendation: RecommendationPayload
): string {
  const shapeLabels: Record<BodyShape, string> = {
    triangle: "삼각형",
    inverted_triangle: "역삼각형",
    rectangle: "직사각형",
    hourglass: "모래시계",
    oval: "타원형",
  };

  return `체형: ${shapeLabels[analysis.bodyShape]}
어깨: ${analysis.shoulderWidth}, 허리: ${analysis.waistLine}, 밸런스: ${analysis.bodyBalance}

추천 핏: ${recommendation.recommendedFits.join(", ")}
추천 상의: ${recommendation.tops.join(", ")}
추천 하의: ${recommendation.bottoms.join(", ")}
피해야 할 스타일: ${recommendation.avoid.join(", ")}

위 체형과 추천을 바탕으로 스타일 코치처럼 3문장으로 설명해주세요.`;
}

export async function generateRecommendation(
  analysis: BodyAnalysisResult
): Promise<{ recommendation: RecommendationPayload; explanation: string }> {
  const openai = getClient();

  const recResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 512,
    messages: [
      { role: "system", content: RECOMMEND_SYSTEM_PROMPT },
      { role: "user", content: buildRecommendPrompt(analysis) },
    ],
  });

  const recRaw = recResponse.choices[0]?.message?.content ?? "";
  let recommendation: RecommendationPayload;
  try {
    recommendation = JSON.parse(recRaw) as RecommendationPayload;
  } catch {
    throw new Error(`GPT returned unparseable recommendation JSON: ${recRaw}`);
  }

  const explainResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 256,
    messages: [
      { role: "system", content: EXPLANATION_SYSTEM_PROMPT },
      { role: "user", content: buildExplanationPrompt(analysis, recommendation) },
    ],
  });

  const explanation =
    explainResponse.choices[0]?.message?.content?.trim() ??
    "체형에 맞는 스타일을 추천했습니다.";

  return { recommendation, explanation };
}
