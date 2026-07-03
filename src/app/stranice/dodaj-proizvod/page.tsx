"use client";

import RoleGuard from "../../components/RoleGuard";
import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "../../components/ImageUpload";
import { createProizvod } from "@/lib/proizvodiClient";
import Image from "next/image";
import { X, CheckCircle, AlertCircle, Loader2, Music } from "lucide-react";

interface PesmaForm {
  naziv: string;
  trajanje: string;
}

interface ProizvodForm {
  naziv: string;
  izvodjac: string;
  opis: string;
  cena: string;
  zanr: string;
  format: string;
  godinaIzdavanja: string;
  slika: string;
}

function DodajProizvodSadrzaj() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [proizvodData, setProizvodData] = useState<ProizvodForm>({
    naziv: "", izvodjac: "", opis: "", cena: "",
    zanr: "", format: "Vinyl", godinaIzdavanja: "", slika: ""
  });
  const [pesme, setPesme] = useState<PesmaForm[]>([]);
  const [trenutnaPesma, setTrenutnaPesma] = useState<PesmaForm>({ naziv: "", trajanje: "" });

  const handleDodajPesmu = () => {
    if (!trenutnaPesma.naziv.trim()) return setNotification({ message: "Unesite naziv pesme!", type: "error" });
    if (!trenutnaPesma.trajanje || Number(trenutnaPesma.trajanje) <= 0) return setNotification({ message: "Unesite ispravno trajanje pesme!", type: "error" });
    setPesme(prev => [...prev, trenutnaPesma]);
    setTrenutnaPesma({ naziv: "", trajanje: "" });
    setNotification(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proizvodData.naziv || !proizvodData.izvodjac || !proizvodData.opis || !proizvodData.cena || !proizvodData.zanr || !proizvodData.godinaIzdavanja) {
      return setNotification({ message: "Popunite sva obavezna polja!", type: "error" });
    }
    if (!proizvodData.slika) return setNotification({ message: "Otpremite naslovnu sliku!", type: "error" });

    setLoading(true);
    try {
      const rezultat = await createProizvod({
        ...proizvodData,
        godinaIzdavanja: Number(proizvodData.godinaIzdavanja),
        pesme
      });
      if (rezultat.success) {
        setNotification({ message: "Proizvod je uspešno objavljen!", type: "success" });
        setTimeout(() => router.push("/stranice/svi-proizvodi"), 2000);
      } else {
        setNotification({ message: (rezultat as { success: false; error: string }).error || "Došlo je do greške.", type: "error" });
      }
    } catch {
      setNotification({ message: "Problem sa serverom. Pokušajte opet.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 p-6">
      {notification && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center max-w-sm w-full">
            <div className={`mb-4 p-3 rounded-full ${notification.type === 'success' ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
              {notification.type === "success" ? <CheckCircle size={40} /> : <AlertCircle size={40} />}
            </div>
            <p className="text-lg font-bold text-center mb-6">{notification.message}</p>
            <button onClick={() => setNotification(null)} className="px-10 py-2 bg-gray-800 text-white rounded-xl font-medium">Zatvori</button>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold mb-6 text-center uppercase tracking-wide border-b border-gray-100 pb-4">
          Dodaj novi proizvod
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Naziv albuma *</label>
                <input required className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-gray-400" value={proizvodData.naziv} onChange={(e) => setProizvodData(p => ({ ...p, naziv: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Izvođač *</label>
                <input required className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-gray-400" value={proizvodData.izvodjac} onChange={(e) => setProizvodData(p => ({ ...p, izvodjac: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Cena (RSD) *</label>
                  <input required type="number" min="0" className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-gray-400" value={proizvodData.cena} onChange={(e) => setProizvodData(p => ({ ...p, cena: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Godina *</label>
                  <input required type="number" min="1900" max="2100" className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-gray-400" value={proizvodData.godinaIzdavanja} onChange={(e) => setProizvodData(p => ({ ...p, godinaIzdavanja: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Žanr *</label>
                  <input required className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-gray-400" value={proizvodData.zanr} onChange={(e) => setProizvodData(p => ({ ...p, zanr: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Format *</label>
                  <select required className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-gray-400" value={proizvodData.format} onChange={(e) => setProizvodData(p => ({ ...p, format: e.target.value }))}>
                    <option value="Vinyl">Vinyl</option>
                    <option value="CD">CD</option>
                    <option value="Kaseta">Kaseta</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-600 mb-1">Naslovna slika *</label>
              {!proizvodData.slika ? (
                <ImageUpload label="Postavi sliku albuma" onUploadSuccess={(url) => setProizvodData(p => ({ ...p, slika: url }))} />
              ) : (
                <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-gray-200">
                  <Image src={proizvodData.slika} alt="Naslovna" fill className="object-cover" />
                  <button type="button" onClick={() => setProizvodData(p => ({ ...p, slika: "" }))} className="absolute top-2 right-2 bg-white text-red-500 w-7 h-7 rounded-full font-bold shadow flex items-center justify-center">
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Opis *</label>
            <textarea required className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-gray-400 min-h-[80px]" value={proizvodData.opis} onChange={(e) => setProizvodData(p => ({ ...p, opis: e.target.value }))} />
          </div>

          <hr className="border-gray-100" />

          {/* Dodavanje pesama */}
          <div className="p-5 rounded-3xl border-2 border-dashed border-gray-200 space-y-4 bg-gray-50">
            <h2 className="text-lg font-bold text-center flex items-center justify-center gap-2">
              <Music size={20} /> Dodaj pesme (opciono)
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-gray-400"
                placeholder="Naziv pesme"
                value={trenutnaPesma.naziv}
                onChange={(e) => setTrenutnaPesma(p => ({ ...p, naziv: e.target.value }))}
              />
              <input
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-gray-400"
                type="number" min="1"
                placeholder="Trajanje (sekunde)"
                value={trenutnaPesma.trajanje}
                onChange={(e) => setTrenutnaPesma(p => ({ ...p, trajanje: e.target.value }))}
              />
            </div>
            <button type="button" onClick={handleDodajPesmu} className="px-6 py-2 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-all">
              + Dodaj pesmu
            </button>
          </div>

          {pesme.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase text-gray-500">Pesme ({pesme.length}):</p>
              {pesme.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-sm font-medium">{idx + 1}. {p.naziv} ({p.trajanje}s)</span>
                  <button type="button" onClick={() => setPesme(prev => prev.filter((_, i) => i !== idx))}>
                    <X size={16} className="text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full py-4 bg-gray-800 text-white rounded-2xl font-bold text-lg hover:bg-gray-700 transition-all disabled:opacity-50 uppercase tracking-wide">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : "Objavi proizvod"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function DodajProizvodPage() {
  return (
    <RoleGuard allowedRoles={["PRODAVAC"]}>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="animate-spin" size={40} />
        </div>
      }>
        <DodajProizvodSadrzaj />
      </Suspense>
    </RoleGuard>
  );
}