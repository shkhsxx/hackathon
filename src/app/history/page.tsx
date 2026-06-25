import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import { BODY_SHAPE_META } from "@/types";
import type { DbAnalysis, DbRecommendation } from "@/types";

interface AnalysisWithRec extends DbAnalysis {
  recommendations: DbRecommendation[];
}

export default async function HistoryPage() {
  const supabase = await createClient();

  const { data: analyses } = await supabase
    .from("analyses")
    .select(`*, recommendations(id, explanation, created_at)`)
    .order("created_at", { ascending: false })
    .limit(20)
    .returns<AnalysisWithRec[]>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">분석 히스토리</h1>
            <p className="mt-1 text-muted-foreground">총 {analyses?.length ?? 0}회 분석</p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            새 분석하기
          </Link>
        </div>

        {!analyses || analyses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white p-16 text-center">
            <p className="text-4xl mb-4">📊</p>
            <h2 className="text-xl font-bold mb-2">아직 분석 기록이 없습니다</h2>
            <p className="text-muted-foreground mb-6">첫 번째 체형 분석을 시작해보세요!</p>
            <Link
              href="/dashboard"
              className="inline-block rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              지금 시작하기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {analyses.map((analysis) => {
              const shapeMeta = BODY_SHAPE_META[analysis.body_shape];
              const explanation = analysis.recommendations?.[0]?.explanation;

              return (
                <Link
                  key={analysis.id}
                  href={`/result/${analysis.id}`}
                  className="group flex gap-5 rounded-2xl border border-border bg-white p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <div className="relative h-24 w-20 flex-shrink-0 rounded-xl overflow-hidden bg-muted">
                    <Image
                      src={analysis.image_url}
                      alt="분석 사진"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${shapeMeta.color}`}>
                          {shapeMeta.emoji} {shapeMeta.label}
                        </span>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {explanation ?? "추천 결과를 확인하려면 클릭하세요."}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-muted-foreground">
                          {new Date(analysis.created_at).toLocaleDateString("ko-KR")}
                        </p>
                        <p className="text-xs font-medium text-primary mt-1">
                          신뢰도 {Math.round(analysis.confidence * 100)}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      {[
                        { label: "어깨", value: analysis.shoulder_width },
                        { label: "허리", value: analysis.waist_line },
                        { label: "밸런스", value: analysis.body_balance },
                      ].map((item) => (
                        <span key={item.label} className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                          {item.label}: {item.value}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center text-muted-foreground group-hover:text-primary transition-colors">→</div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
