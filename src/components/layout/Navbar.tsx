import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold gradient-text">StyleFit AI</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            분석하기
          </Link>
          <Link
            href="/history"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            히스토리
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            시작하기 →
          </Link>
        </div>
      </div>
    </nav>
  );
}
