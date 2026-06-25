import { NextResponse } from "next/server";

// 위시리스트 기능은 로그인 없이 사용하지 않으므로 비활성화
export async function GET() {
  return NextResponse.json({ items: [] });
}
