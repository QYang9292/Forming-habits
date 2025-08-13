import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code); // 세션 쿠키 저장
  }
  return NextResponse.redirect(new URL(next, request.url));
}
