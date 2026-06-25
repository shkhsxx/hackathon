import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: analyses, error } = await supabase
      .from("analyses")
      .select(`
        *,
        recommendations (
          id,
          recommendation_json,
          explanation,
          created_at
        )
      `)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const items = (analyses ?? []).map((a) => ({
      analysis: {
        id: a.id,
        image_url: a.image_url,
        body_shape: a.body_shape,
        shoulder_width: a.shoulder_width,
        waist_line: a.waist_line,
        body_balance: a.body_balance,
        confidence: a.confidence,
        created_at: a.created_at,
      },
      recommendation: a.recommendations?.[0] ?? null,
    }));

    return NextResponse.json({ items });
  } catch (err) {
    console.error("[history]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
