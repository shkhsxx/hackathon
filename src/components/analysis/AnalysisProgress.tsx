"use client";

import { cn } from "@/lib/utils/cn";
import type { AnalysisStep } from "@/types";

interface Step {
  id: AnalysisStep;
  label: string;
  description: string;
  icon: string;
}

const STEPS: Step[] = [
  { id: "uploading", label: "이미지 업로드", description: "Supabase Storage에 안전하게 저장 중", icon: "📤" },
  { id: "analyzing", label: "AI 체형 분석", description: "GPT-4o Vision이 체형을 분석 중", icon: "🔍" },
  { id: "done", label: "추천 생성", description: "맞춤 스타일 & 상품 추천 생성 중", icon: "✨" },
];

const STEP_ORDER: AnalysisStep[] = ["idle", "uploading", "analyzing", "done"];

interface AnalysisProgressProps {
  currentStep: AnalysisStep;
}

export default function AnalysisProgress({ currentStep }: AnalysisProgressProps) {
  const currentIdx = STEP_ORDER.indexOf(currentStep);

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <h3 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wide">
        분석 진행 상태
      </h3>

      <div className="space-y-4">
        {STEPS.map((step, i) => {
          const stepIdx = i + 1; // steps start at idx 1
          const isActive = currentStep === step.id;
          const isDone = currentIdx > stepIdx;
          const isPending = currentIdx < stepIdx;

          return (
            <div key={step.id} className="flex items-start gap-4">
              {/* Icon */}
              <div
                className={cn(
                  "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg transition-all",
                  isDone && "bg-green-100",
                  isActive && "bg-primary/10 animate-pulse",
                  isPending && "bg-muted"
                )}
              >
                {isDone ? "✅" : step.icon}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "font-medium text-sm",
                    isDone && "text-green-600",
                    isActive && "text-primary",
                    isPending && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {step.description}
                </p>
                {isActive && (
                  <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary animate-[shimmer_1.5s_ease-in-out_infinite] w-1/2" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
