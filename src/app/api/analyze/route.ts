import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeBodyShape } from "@/lib/openai/analyze";
import { z } from "zod";

const schema = z.object({
  imageUrl: z.string().url(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { imageUrl } = parsed.data;
    const result = await analyzeBodyShape(imageUrl);

    const supabase = await createClient();
    const { data: analysis, error: dbError } = await supabase
      .from("analyses")
      .insert({
        image_url: imageUrl,
        body_shape: result.bodyShape,
        shoulder_width: result.shoulderWidth,
        waist_line: result.waistLine,
        body_balance: result.bodyBalance,
        confidence: result.confidence,
      })
      .select("id")
      .single();

    if (dbError) {
      return NextResponse.json(
        { error: `DB insert failed: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ analysisId: analysis.id, ...result }, { status: 201 });
  } catch (err) {
    console.error("[analyze]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
