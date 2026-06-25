import Navbar from "@/components/layout/Navbar";
import DashboardClient from "./DashboardClient";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold">체형 분석 시작하기</h1>
          <p className="mt-2 text-muted-foreground">
            사진을 업로드하면 AI가 체형을 분석하고 맞춤 스타일을 추천해드립니다.
          </p>
        </div>
        <DashboardClient />
      </main>
    </div>
  );
}
