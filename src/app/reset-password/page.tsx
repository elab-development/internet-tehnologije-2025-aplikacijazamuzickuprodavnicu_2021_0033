"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, Music } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-white" size={48} />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const [novaLozinka, setNovaLozinka] = useState("");
  const [potvrda, setPotvrda] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");

    if (!token) {
      setErr("Token nedostaje. Molimo vas koristite link iz email-a.");
      return;
    }
    if (novaLozinka.length < 6) {
      setErr("Lozinka mora imati barem 6 karaktera.");
      return;
    }
    if (novaLozinka !== potvrda) {
      setErr("Lozinke se ne podudaraju!");
      return;
    }

    setLoading(true);
    try {
      const tokenRes = await fetch('/api/csrf-token');
      const tokenData = await tokenRes.json();
      const csrfToken = tokenData.csrfToken;

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify({ token, novaLozinka }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Greška pri ažuriranju.");
      setShowSuccess(true);
    } catch (error: unknown) {
      setErr(error instanceof Error ? error.message : "Greška pri ažuriranju.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <p className="text-red-500 mb-6 font-bold">Nevažeći ili nepostojeći link za resetovanje lozinke.</p>
          <button
            onClick={() => router.push("/login")}
            className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-700 transition-all"
          >
            Nazad na prijavu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">

      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 flex flex-col items-center text-center max-w-sm w-full shadow-2xl">
            <div className="bg-green-100 text-green-500 p-4 rounded-full mb-4">
              <CheckCircle size={48} />
            </div>
            <h2 className="text-2xl font-black mb-2">Lozinka je promenjena!</h2>
            <p className="text-sm text-gray-500 mb-6">
              Vaša lozinka je uspešno promenjena. Sada se možete prijaviti.
            </p>
            <button
              onClick={() => { setShowSuccess(false); router.push("/login"); }}
              className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-700 transition-all"
            >
              Idi na prijavu
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Music size={32} className="text-gray-900" />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-wide">Nova lozinka</h1>
          <p className="text-gray-400 mt-2">Postavite novu lozinku za vaš nalog</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          {err && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl mb-6 text-sm font-medium">
              {err}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nova lozinka</label>
              <input
                type="password"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-gray-800 transition-colors"
                value={novaLozinka}
                onChange={(e) => setNovaLozinka(e.target.value)}
                placeholder="Min. 6 karaktera"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Potvrdite lozinku</label>
              <input
                type="password"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-gray-800 transition-colors"
                value={potvrda}
                onChange={(e) => setPotvrda(e.target.value)}
                placeholder="Ponovite lozinku"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-gray-700 transition-all disabled:opacity-50 uppercase tracking-wide"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" size={24} /> : "Sačuvaj novu lozinku"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}