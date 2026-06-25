export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import ProductCard from "@/components/products/ProductCard";
import { rankProducts } from "@/lib/utils/recommend";
import { BODY_SHAPE_META } from "@/types";
import type { DbAnalysis, DbProduct, DbRecommendation, RecommendationPayload } from "@/types";

interface Props {
  params: Promise<{ analysisId: string }>;
}

export default async function ResultPage({ params }: Props) {
  const { analysisId } = await params;
  const supabase = await createClient();

  const { data: analysis } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", analysisId)
    .single<DbAnalysis>();

  if (!analysis) notFound();

  const { data: recommendation } = await supabase
    .from("recommendations")
    .select("*")
    .eq("analysis_id", analysisId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single<DbRecommendation>();

  const { data: allProducts } = await supabase
    .from("products")
    .select("*")
    .returns<DbProduct[]>();

  const rankedProducts = rankProducts(allProducts ?? [], analysis.body_shape);
  const shapeMeta = BODY_SHAPE_META[analysis.body_shape];
  const rec = recommendation?.recommendation_json as RecommendationPayload | undefined;
  const explanation = recommendation?.explanation;
  const confidencePercent = Math.round(analysis.confidence * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">분석 완료</p>
            <h1 className="text-3xl font-bold">나의 스타일 분석 결과</h1>
          </div>
          <Link
            href="/dashboard"
            className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            새 분석하기
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
              <div className="relative h-72">
                <Image src={analysis.image_url} alt="분석 사진" fill className="object-cover" />
              </div>
              <div className="p-4">
                <p className="text-xs text-muted-foreground">
                  {new Date(analysis.created_at).toLocaleDateString("ko-KR", {
                    year: "numeric", month: "long", day: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className="font-bold mb-4">체형 분석</h2>

              <div className={`rounded-xl p-4 mb-4 ${shapeMeta.color}`}>
                <div className="text-3xl font-bold mb-1">{shapeMeta.emoji}</div>
                <div className="text-lg font-bold">{shapeMeta.label}</div>
                <div className="text-sm mt-1 opacity-80">{shapeMeta.description}</div>
              </div>

              <div className="space-y-3">
                {[
                  { label: "어깨 너비", value: analysis.shoulder_width, map: { narrow: "좁음", medium: "보통", wide: "넓음" } },
                  { label: "허리 라인", value: analysis.waist_line,     map: { narrow: "좁음", medium: "보통", wide: "넓음" } },
                  { label: "체형 밸런스", value: analysis.body_balance,  map: { "upper-heavy": "상체 중심", balanced: "균형", "lower-heavy": "하체 중심" } },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-medium">
                      {item.map[item.value as keyof typeof item.map] ?? item.value}
                    </span>
                  </div>
                ))}

                <div className="pt-2 border-t border-border">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm text-muted-foreground">분석 신뢰도</span>
                    <span className="text-sm font-semibold text-primary">{confidencePercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${confidencePercent}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-6">
            {explanation && (
              <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🎯</span>
                  <h2 className="font-bold">AI 스타일 코치의 한마디</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">{explanation}</p>
              </div>
            )}

            {rec && (
              <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <h2 className="font-bold mb-5">맞춤 스타일 추천</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-green-700 mb-2">✅ 추천 핏</h3>
                    <div className="flex flex-wrap gap-2">
                      {rec.recommendedFits.map((fit) => (
                        <span key={fit} className="rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-medium text-green-700">{fit}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-red-600 mb-2">❌ 피해야 할 스타일</h3>
                    <div className="flex flex-wrap gap-2">
                      {rec.avoid.map((item) => (
                        <span key={item} className="rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-medium text-red-600">{item}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-blue-700 mb-2">👕 추천 상의</h3>
                    <ul className="space-y-1">
                      {rec.tops.map((top) => (
                        <li key={top} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 flex-shrink-0" />{top}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-purple-700 mb-2">👖 추천 하의</h3>
                    <ul className="space-y-1">
                      {rec.bottoms.map((bottom) => (
                        <li key={bottom} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-purple-400 flex-shrink-0" />{bottom}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {rec.outers && rec.outers.length > 0 && (
                    <div className="sm:col-span-2">
                      <h3 className="text-sm font-semibold text-orange-700 mb-2">🧥 추천 아우터</h3>
                      <div className="flex flex-wrap gap-2">
                        {rec.outers.map((outer) => (
                          <span key={outer} className="rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-xs font-medium text-orange-700">{outer}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <h2 className="font-bold text-lg mb-4">
                추천 상품 <span className="text-muted-foreground font-normal text-sm">({rankedProducts.length}개)</span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {rankedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
