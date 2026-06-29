"use client";

import React, { useState, FormEvent, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Music, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Loader2 className="animate-spin text-white" size={48} />
      </div>
    }>
      <RegisterFormContent />
    </Suspense>
  );
}

function RegisterFormContent() {
  const router = useRouter();

  const [form, setForm] = useState({ ime: "", prezime: "", email: "", lozinka: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr("");

    if (!form.ime || !form.prezime || !form.email || !form.lozinka) {
      setErr("Sva polja su obavezna.");
      return;
    }

    setLoading(true);
    try {
      const tokenRes = await fetch('/api/csrf-token');
      const tokenData = await tokenRes.json();
      const csrfToken = tokenData.csrfToken;

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Neuspešna registracija");

      router.push("/login");
    } catch (error: unknown) {
      setErr(error instanceof Error ? error.message : "Greška pri registraciji.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Music size={32} className="text-gray-900" />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-wide">Registracija</h1>
          <p className="text-gray-400 mt-2">Kreirajte nalog i počnite sa kupovinom</p>
        </div>

        {/* Forma */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          {err && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl mb-6 text-sm font-medium">
              {err}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ime</label>
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-gray-800 transition-colors"
                  value={form.ime}
                  onChange={(e) => setForm({ ...form, ime: e.target.value })}
                  placeholder="Ana"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Prezime</label>
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-gray-800 transition-colors"
                  value={form.prezime}
                  onChange={(e) => setForm({ ...form, prezime: e.target.value })}
                  placeholder="Anić"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email adresa</label>
              <input
                type="email"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-gray-800 transition-colors"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="vas@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Lozinka</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:border-gray-800 transition-colors"
                  value={form.lozinka}
                  onChange={(e) => setForm({ ...form, lozinka: e.target.value })}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-gray-700 transition-all disabled:opacity-50 uppercase tracking-wide mt-2"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" size={24} /> : "Registruj se"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm border-t border-gray-100 pt-6">
            <p className="text-gray-400">
              Već imate nalog?{" "}
              <Link href="/login" className="font-black text-gray-800 hover:underline">
                Prijavi se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}