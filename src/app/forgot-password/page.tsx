"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { Loader2, Music } from "lucide-react";

function ForgotPasswordSadrzaj() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setMessage("");
    setLoading(true);

    try {
      const tokenRes = await fetch('/api/csrf-token');
      const tokenData = await tokenRes.json();
      const csrfToken = tokenData.csrfToken;
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Greška pri slanju.");
      setMessage("Link za promenu lozinke je poslat na vaš email!");
    } catch (error: unknown) {
      setErr(error instanceof Error ? error.message : "Greška pri slanju.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Music size={32} className="text-gray-900" />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-wide">Zaboravljena lozinka</h1>
          <p className="text-gray-400 mt-2">Unesite email da biste resetovali lozinku</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          {err && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl mb-6 text-sm font-medium">
              {err}
            </div>
          )}
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl mb-6 text-sm font-medium">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email adresa</label>
              <input
                type="email"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-gray-800 transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vas@email.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-gray-700 transition-all disabled:opacity-50 uppercase tracking-wide"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={18} /> Slanje...
                </div>
              ) : "Pošalji link"}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-gray-100 pt-6">
            <Link href="/login" className="text-sm font-bold text-gray-400 hover:text-gray-600">
              Vrati se na prijavu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-white" size={40} />
      </div>
    }>
      <ForgotPasswordSadrzaj />
    </Suspense>
  );
}