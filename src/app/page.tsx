import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

const FEATURES = [
  { icon: "📸", title: "사진 한 장으로", desc: "정면 사진 업로드 하나로 AI가 체형을 정밀 분석합니다." },
  { icon: "🤖", title: "GPT-4o Vision 분석", desc: "최신 멀티모달 AI가 어깨·허리·힙의 균형을 읽어냅니다." },
  { icon: "👗", title: "맞춤 스타일 추천", desc: "체형에 맞는 핏·상의·하의·아우터를 코디 단위로 제안합니다." },
  { icon: "🛍️", title: "즉시 쇼핑 가능", desc: "추천 스타일에 맞는 실제 상품까지 바로 연결됩니다." },
];

const STATS = [
  { value: "92%", label: "핏 만족도" },
  { value: "3초", label: "평균 분석 시간" },
  { value: "60%↓", label: "반품률 감소" },
  { value: "2.4x", label: "구매 전환율" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm font-medium text-violet-700 mb-8">
          <span className="animate-pulse h-2 w-2 rounded-full bg-violet-500" />
          GPT-4o Vision 기반 체형 분석
        </div>

        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl mb-6">
          <span className="gradient-text">내 체형에 맞는 핏</span>
          <br />
          AI가 찾아드립니다
        </h1>

        <p className="mx-auto max-w-2xl text-xl text-muted-foreground mb-10">
          온라인 쇼핑의 가장 큰 고민, 사이즈·핏 선택.<br />
          사진 한 장만 업로드하면 AI가 체형을 분석하고<br />
          나에게 꼭 맞는 스타일과 상품을 추천해드립니다.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            무료로 체형 분석 시작하기 →
          </Link>
          <Link
            href="#how-it-works"
            className="rounded-xl border border-border bg-white px-8 py-4 text-lg font-semibold hover:bg-muted transition-colors"
          >
            작동 방식 보기
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-4xl px-4 pb-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {STATS.map((stat) => (
            <div key={stat.label} className="glass-card rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold gradient-text">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">이렇게 작동해요</h2>
        <p className="text-center text-muted-foreground mb-12">3단계로 나만의 스타일 가이드를 받아보세요</p>

        <div className="grid sm:grid-cols-3 gap-8">
          {[
            { step: "01", title: "사진 업로드", desc: "정면에서 찍은 전신 사진 1장을 업로드하세요. 평상복 착용 OK.", icon: "📷" },
            { step: "02", title: "AI 체형 분석", desc: "GPT-4o Vision이 어깨·허리·힙 비율을 분석하고 체형 유형을 분류합니다.", icon: "🧠" },
            { step: "03", title: "스타일 & 상품 추천", desc: "체형에 맞는 핏 가이드와 실구매 가능한 상품 리스트를 제공합니다.", icon: "✨" },
          ].map((item) => (
            <div key={item.step} className="rounded-2xl border border-border bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">{item.icon}</div>
              <div className="text-sm font-bold text-primary mb-2">STEP {item.step}</div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gradient-to-br from-violet-600 to-indigo-600 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">StyleFit AI의 핵심 기능</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-6 text-white">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-white/80 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h2 className="text-3xl font-bold mb-4">오늘 바로 나만의 스타일을 찾아보세요</h2>
        <p className="text-muted-foreground mb-8">
          무료로 체형 분석을 받고, AI 스타일리스트의 맞춤 추천을 경험하세요.
        </p>
        <Link
          href="/dashboard"
          className="inline-block rounded-xl bg-primary px-10 py-4 text-lg font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all"
        >
          무료 시작하기 →
        </Link>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © 2026 AI Style Fit Advisor. AX 포트폴리오 프로젝트.
      </footer>
    </div>
  );
}
