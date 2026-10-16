"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const supabase = getSupabaseBrowserClient();
      supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
      const { data } = supabase.auth.onAuthStateChange((_event, session) => setUserEmail(session?.user.email ?? null));
      return () => data.subscription.unsubscribe();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Supabase configuration is missing.");
    }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const supabase = getSupabaseBrowserClient();
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          setUserEmail(data.user?.email ?? email);
          setMessage("Your account is ready. Your progress will be saved to this account.");
        } else {
          setMessage("Check your email to confirm your account, then sign in.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setUserEmail(data.user.email ?? email);
        setMessage("You are signed in. Your personal progress is ready.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to complete the request.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    try {
      const { error } = await getSupabaseBrowserClient().auth.signOut();
      if (error) throw error;
      setUserEmail(null);
      setMessage("You have signed out.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign out.");
    }
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <section className="glass rounded-3xl p-6 md:p-9">
        <h1 className="font-display text-3xl font-bold text-[#0E5A45]">حسابك وتقدّمك</h1>
        <p className="mt-3 leading-8 text-[#6C7A73]">أنشئ حساباً لحفظ محفوظاتك ومراجعاتك بشكل خاص، والوصول إليها من أجهزتك المختلفة.</p>
        {userEmail ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-xl bg-[#0E5A45]/10 p-4">أنت مسجّل الدخول باسم <strong dir="ltr">{userEmail}</strong></p>
            <div className="flex flex-wrap gap-3">
              <Link href="/progress" className="btn-gold rounded-full px-5 py-3 font-bold">عرض تقدّمي</Link>
              <button onClick={signOut} className="btn-ghost rounded-full px-5 py-3 font-bold">تسجيل الخروج</button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="flex gap-2 rounded-full bg-black/[0.04] p-1">
              <button type="button" onClick={() => setMode("signin")} className={`flex-1 rounded-full px-4 py-2 font-bold ${mode === "signin" ? "bg-[#0E5A45] text-white" : ""}`}>تسجيل الدخول</button>
              <button type="button" onClick={() => setMode("signup")} className={`flex-1 rounded-full px-4 py-2 font-bold ${mode === "signup" ? "bg-[#0E5A45] text-white" : ""}`}>إنشاء حساب</button>
            </div>
            <label className="block text-sm font-bold">البريد الإلكتروني<input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-[#E6E2D8] bg-white p-3" dir="ltr" /></label>
            <label className="block text-sm font-bold">كلمة المرور<input type="password" required minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-[#E6E2D8] bg-white p-3" dir="ltr" /></label>
            <button disabled={busy} className="btn-gold w-full rounded-full px-5 py-3 font-bold disabled:opacity-60">{busy ? "جارٍ المعالجة…" : mode === "signup" ? "إنشاء حساب" : "تسجيل الدخول"}</button>
          </form>
        )}
        {message && <p role="status" className="mt-4 rounded-xl bg-[#0E5A45]/10 p-3 text-sm leading-7">{message}</p>}
        <p className="mt-5 text-xs leading-6 text-[#6C7A73]">لا تشارك كلمة مرورك مع أحد. لن تُعرض محفوظاتك لمستخدمين آخرين.</p>
      </section>
    </main>
  );
}
