import { NextResponse, type NextRequest } from "next/server";

// Auth 없이 모든 경로 통과
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
