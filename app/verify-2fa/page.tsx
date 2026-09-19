"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";
import { useApp } from "@/components/providers/AppProviders";

export default function Verify2FAPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useApp();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailHint = searchParams.get("email") || "your registered email";
  const redirectTarget = searchParams.get("redirect") || "/dashboard";

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "2FA verification failed");
      }

      await refreshUser();
      router.push(redirectTarget);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 shadow-sm border border-amber-100">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Two-Factor Authentication</h2>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          Please enter the 6-digit security code dispatched to <strong className="text-slate-700">{emailHint}</strong>.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-200/80">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="block text-center text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Enter 6-Digit 2FA Code
              </label>
              <input
                type="text"
                maxLength={6}
                required
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="------"
                className="w-full text-center tracking-[12px] text-2xl font-mono font-bold py-3 rounded-2xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
              />
              <p className="text-[11px] text-slate-400 text-center mt-2">
                (If testing locally without SMTP, check your server console log for the code)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full py-3 px-4 bg-brand hover:bg-brand-hover text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Confirm & Sign In"}
              <ShieldCheck className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <Link href="/login" className="text-xs text-slate-500 hover:text-slate-700">
                Cancel and return to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
