import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateRecommendation } from "@/lib/openai/analyze";
import { rankProducts } from "@/lib/utils/recommend";
import type { DbAnalysis, DbProduct } from "@/types";
import { z } from "zod";

const schema = z.object({
  analysisId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { analysisId } = parsed.data;
    const supabase = await createClient();

    const { data: analysis, error: fetchErr } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", analysisId)
      .single<DbAnalysis>();

    if (fetchErr || !analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    const { recommendation, explanation } = await generateRecommendation({
      bodyShape: analysis.body_shape,
      shoulderWidth: analysis.shoulder_width,
      waistLine: analysis.waist_line,
      bodyBalance: analysis.body_balance,
      confidence: analysis.confidence,
    });

    const { data: rec, error: recErr } = await supabase
      .from("recommendations")
      .insert({ analysis_id: analysisId, recommendation_json: recommendation, explanation })
      .select("id")
      .single();

    if (recErr) {
      return NextResponse.json(
        { error: `DB insert failed: ${recErr.message}` },
        { status: 500 }
      );
    }

    const { data: allProducts } = await supabase
      .from("products")
      .select("*")
      .returns<DbProduct[]>();

    const rankedProducts = rankProducts(allProducts ?? [], analysis.body_shape);

    return NextResponse.json(
      { recommendationId: rec.id, recommendation, explanation, products: rankedProducts },
      { status: 201 }
    );
  } catch (err) {
    console.error("[recommend]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
