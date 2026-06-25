import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rankProducts } from "@/lib/utils/recommend";
import type { BodyShape, Category, DbProduct } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const bodyShape = searchParams.get("bodyShape") as BodyShape | null;
    const category = searchParams.get("category") as Category | null;
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);
    const offset = parseInt(searchParams.get("offset") ?? "0");

    let query = supabase.from("products").select("*", { count: "exact" });
    if (category) query = query.eq("category", category);

    const { data: products, error, count } = await query
      .order("name")
      .range(offset, offset + limit - 1)
      .returns<DbProduct[]>();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const ranked = bodyShape
      ? rankProducts(products ?? [], bodyShape, limit)
      : (products ?? []);

    return NextResponse.json({ products: ranked, total: count ?? 0 });
  } catch (err) {
    console.error("[products]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
