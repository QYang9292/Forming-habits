"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const signin = async () => {
    try {
      setLoading(true);
      const supabase = supabaseBrowser();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback?next=/` },
      });
    } catch (e) {
      console.error(e);
      alert("로그인 실패. 콘솔을 확인하세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-sm mx-auto mt-24 grid gap-3">
      <h1 className="text-xl font-semibold">로그인</h1>
      <button className="border rounded p-2" onClick={signin} disabled={loading}>
        {loading ? "로그인 중..." : "Google로 로그인"}
      </button>
    </main>
  );
}
