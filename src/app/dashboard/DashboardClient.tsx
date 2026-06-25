"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ImageUploader from "@/components/analysis/ImageUploader";
import AnalysisProgress from "@/components/analysis/AnalysisProgress";
import type { AnalysisState } from "@/types";

const TIPS = [
  "💡 밝은 조명 아래 전신이 잘 보이는 사진을 사용하세요",
  "💡 타이트하지 않은 평상복을 입고 촬영하면 더 정확합니다",
  "💡 배경이 단순할수록 분석 정확도가 높아집니다",
  "💡 카메라와의 거리는 1.5~2m 정도가 적당합니다",
];

export default function DashboardClient() {
  const router = useRouter();
  const [state, setState] = useState<AnalysisState>({ step: "idle" });

  async function handleUploadComplete(imageUrl: string) {
    setState({ step: "analyzing", imageUrl });

    try {
      // Step 1: Analyze
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });

      if (!analyzeRes.ok) {
        const err = await analyzeRes.json();
        throw new Error(err.error ?? "분석 실패");
      }

      const analysisData = await analyzeRes.json();
      setState((s) => ({ ...s, step: "done", analysisId: analysisData.analysisId }));

      // Step 2: Recommend
      const recRes = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId: analysisData.analysisId }),
      });

      if (!recRes.ok) {
        const err = await recRes.json();
        throw new Error(err.error ?? "추천 생성 실패");
      }

      const recData = await recRes.json();
      toast.success("분석 완료! 결과 페이지로 이동합니다.");

      router.push(`/result/${analysisData.analysisId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "알 수 없는 오류";
      toast.error(message);
      setState({ step: "error", error: message });
    }
  }

  const isLoading = state.step === "uploading" || state.step === "analyzing" || state.step === "done";

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Upload Section */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-1">사진 업로드</h2>
          <p className="text-sm text-muted-foreground mb-4">
            정면 전신 사진 1장을 업로드해주세요
          </p>

          <ImageUploader
            onUploadComplete={handleUploadComplete}
            disabled={isLoading}
          />
        </div>

        {/* Tips */}
        <div className="rounded-2xl border border-border bg-amber-50 border-amber-200 p-5">
          <h3 className="text-sm font-semibold text-amber-800 mb-3">
            더 정확한 분석을 위한 팁
          </h3>
          <ul className="space-y-2">
            {TIPS.map((tip) => (
              <li key={tip} className="text-sm text-amber-700">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Progress / Status Section */}
      <div className="space-y-6">
        {state.step !== "idle" && (
          <AnalysisProgress currentStep={state.step} />
        )}

        {state.step === "idle" && (
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">분석 결과 미리보기</h2>
            <div className="space-y-3">
              {[
                { label: "체형 유형", example: "역삼각형, 모래시계 등 5가지 분류" },
                { label: "어깨·허리·힙 분석", example: "부위별 비율 및 특징" },
                { label: "추천 핏 & 스타일", example: "와이드, 슬림, 오버사이즈 등" },
                { label: "맞춤 상품 추천", example: "체형 궁합 상위 상품 리스트" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-3 rounded-xl bg-muted/50 p-3"
                >
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.example}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {state.step === "error" && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="font-semibold text-red-700 mb-1">오류 발생</p>
            <p className="text-sm text-red-600">{state.error}</p>
            <button
              onClick={() => setState({ step: "idle" })}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
