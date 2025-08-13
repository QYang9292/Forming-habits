import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Me() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return (
    <main className="max-w-2xl mx-auto mt-10">
      로그인됨: {user.email}
    </main>
  );
}
