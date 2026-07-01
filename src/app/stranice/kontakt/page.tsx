"use client";

import React, { useState, Suspense } from "react";
import { FaPhone, FaEnvelope, FaCheckCircle } from "react-icons/fa";
import { Loader2, MapPin } from "lucide-react";

type FormStatus = "IDLE" | "SUBMITTING" | "SUCCESS" | "ERROR";

export default function Kontakt() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={50} />
      </div>
    }>
      <KontaktSadrzaj />
    </Suspense>
  );
}

function KontaktSadrzaj() {
  const [status, setStatus] = useState<FormStatus>("IDLE");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("SUBMITTING");
    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("https://formspree.io/f/xvzjrngq", {
        method: "POST",
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        setStatus("SUCCESS");
      } else {
        setStatus("ERROR");
      }
    } catch {
      setStatus("ERROR");
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-20 px-6 flex items-center">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

        <div className="text-left">
          <h1 className="text-5xl font-black mb-8 text-gray-800">Kontaktirajte nas</h1>
          <p className="text-lg mb-10 text-gray-500 leading-relaxed font-medium">
            Imate pitanje u vezi sa narudžbinom, dostupnošću proizvoda ili nekim albumom?
            Javite nam se putem forme ili direktno putem mejla ili broja telefona.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-white rounded-full text-gray-600 shadow-sm border border-gray-200">
                <FaPhone />
              </div>
              <span className="font-bold text-gray-700">+381 6X XXX XXX</span>
            </div>
            <div className="flex items-center gap-5">
              <div className="p-3 bg-white rounded-full text-gray-600 shadow-sm border border-gray-200">
                <FaEnvelope />
              </div>
              <span className="font-bold text-gray-700">prodavnica@muzika.rs</span>
            </div>
            <div className="flex items-center gap-5">
              <div className="p-3 bg-white rounded-full text-gray-600 shadow-sm border border-gray-200">
                <MapPin size={16} />
              </div>
              <span className="font-bold text-gray-700">Beograd, Srbija</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200">
          {status === "SUCCESS" ? (
            <div className="text-center py-10">
              <FaCheckCircle className="text-7xl text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl font-black text-gray-800">Hvala vam!</h2>
              <p className="text-gray-400 mt-2 font-medium">Poruka je uspešno poslata.</p>
              <button
                onClick={() => setStatus("IDLE")}
                className="mt-8 px-8 py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-700 transition-all"
              >
                Pošalji novu poruku
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-black mb-8 text-center text-gray-800">Pošalji upit</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Ime i Prezime</label>
                  <input
                    type="text"
                    name="IME"
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-gray-400"
                    placeholder="Vaše ime i prezime..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">E-mail adresa</label>
                  <input
                    type="email"
                    name="EMAIL"
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-gray-400"
                    placeholder="vas@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Vaša poruka</label>
                  <textarea
                    name="PORUKA"
                    rows={4}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-gray-400 resize-none"
                    placeholder="Kako možemo da vam pomognemo?"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "SUBMITTING"}
                  className="w-full py-4 bg-gray-800 text-white rounded-2xl font-bold text-lg hover:bg-gray-700 transition-all disabled:opacity-50"
                >
                  {status === "SUBMITTING" ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={20} /> Slanje...
                    </div>
                  ) : "Pošalji poruku"}
                </button>
                {status === "ERROR" && (
                  <p className="text-red-500 text-sm font-bold text-center">Došlo je do greške. Pokušajte opet.</p>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}