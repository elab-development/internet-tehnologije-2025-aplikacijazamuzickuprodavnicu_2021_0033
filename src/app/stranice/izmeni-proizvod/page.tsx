"use client";

import {
  X, CheckCircle, AlertCircle, Loader2, Music,
  ChevronUp, ChevronDown
} from "lucide-react";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import RoleGuard from "../../components/RoleGuard";
import { ImageUpload } from "../../components/ImageUpload";
import { escapeHtml } from "../../utils/sanitize";
import { fetchProizvodi, getProizvodSaPesmama, updateProizvod } from "../../../lib/proizvodiClient";

interface PesmaForm {
  id?: string;
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

function IzmeniProizvodSadrzaj() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [proizvodi, setProizvodi] = useState<{ id: string; naziv: string }[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [proizvodData, setProizvodData] = useState<ProizvodForm>({
    naziv: "", izvodjac: "", opis: "", cena: "",
    zanr: "", format: "Vinyl", godinaIzdavanja: "", slika: ""
  });
  const [pesme, setPesme] = useState<PesmaForm[]>([]);
  const [trenutnaPesma, setTrenutnaPesma] = useState<PesmaForm>({ naziv: "", trajanje: "" });

  useEffect(() => {
    fetchProizvodi().then((res) => {
      const lista = (res.proizvodi || []) as { id: string; naziv: string }[];
      setProizvodi(lista);
      const idIzQuery = searchParams.get("proizvodId");
      if (idIzQuery && lista.find((p) => p.id === idIzQuery)) {
        setSelectedId(idIzQuery);
      }
    }).catch(() => {});
  }, [searchParams]);

  useEffect(() => {
    if (!selectedId) return;
    let mounted = true;
    (async () => {
      try {
        const p = await getProizvodSaPesmama(selectedId);
        if (!mounted) return;
        setProizvodData({
          naziv: p.naziv || "",
          izvodjac: p.izvodjac || "",
          opis: p.opis || "",
          cena: p.cena || "",
          zanr: p.zanr || "",
          format: p.format || "Vinyl",
          godinaIzdavanja: String(p.godinaIzdavanja || ""),
          slika: p.slika || "",
        });
        setPesme(p.pesme || []);
      } catch (err: unknown) {
        setNotification({ message: err instanceof Error ? err.message : "Greška pri učitavanju.", type: "error" });
        setSelectedId("");
      }
    })();
    return () => { mounted = false; };
  }, [selectedId]);

  const pomeriPesmu = (index: number, smer: 'gore' | 'dole') => {
    const nove = [...pesme];
    const ciljni = smer === 'gore' ? index - 1 : index + 1;
    if (ciljni < 0 || ciljni >= nove.length) return;
    [nove[index], nove[ciljni]] = [nove[ciljni], nove[index]];
    setPesme(nove);
  };

  const handleDodajPesmu = () => {
    if (!trenutnaPesma.naziv.trim()) return setNotification({ message: "Unesite naziv pesme!", type: "error" });
    if (!trenutnaPesma.trajanje || Number(trenutnaPesma.trajanje) <= 0) return setNotification({ message: "Unesite ispravno trajanje!", type: "error" });
    setPesme(prev => [...prev, trenutnaPesma]);
    setTrenutnaPesma({ naziv: "", trajanje: "" });
    setNotification(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setLoading(true);
    try {
      const res = await updateProizvod(selectedId, {
        id: selectedId,
        ...proizvodData,
        godinaIzdavanja: Number(proizvodData.godinaIzdavanja),
        pesme,
      });
      if (res.success) {
        setNotification({ message: "Proizvod uspešno izmenjen!", type: "success" });
        setTimeout(() => router.push("/stranice/svi-proizvodi"), 2000);
      } else {
        setNotification({ message: res.error || "Greška.", type: "error" });
      }
    } catch {
      setNotification({ message: "Problem sa serverom.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 p-6">
      {notification && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center">
            <div className={`mx-auto mb-4 p-3 rounded-full w-fit ${notification.type === "success" ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500"}`}>
              {notification.type === "success" ? <CheckCircle size={40} /> : <AlertCircle size={40} />}
            </div>
            <p className="text-lg font-bold mb-6">{escapeHtml(notification.message)}</p>
            <button onClick={() => setNotification(null)} className="px-8 py-2 bg-gray-800 text-white rounded-xl font-medium">Zatvori</button>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 shadow-sm border border-gray-200 mb-8">
        <label className="block text-sm font-bold text-gray-600 mb-2">Koji proizvod želite da izmenite?</label>
        <select
          className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-gray-400"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">-- Odaberite proizvod --</option>
          {proizvodi.map((p) => (
            <option key={p.id} value={p.id}>{p.naziv}</option>
          ))}
        </select>
      </div>

      {selectedId && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 shadow-sm border border-gray-200">
          <h1 className="text-2xl font-bold mb-6 text-center uppercase tracking-wide border-b border-gray-100 pb-4">
            Izmena proizvoda
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Naziv albuma</label>
                  <input className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-gray-400" value={proizvodData.naziv} onChange={(e) => setProizvodData(p => ({ ...p, naziv: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Izvođač</label>
                  <input className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-gray-400" value={proizvodData.izvodjac} onChange={(e) => setProizvodData(p => ({ ...p, izvodjac: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Cena (RSD)</label>
                    <input type="number" className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-gray-400" value={proizvodData.cena} onChange={(e) => setProizvodData(p => ({ ...p, cena: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Godina</label>
                    <input type="number" className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-gray-400" value={proizvodData.godinaIzdavanja} onChange={(e) => setProizvodData(p => ({ ...p, godinaIzdavanja: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Žanr</label>
                    <input className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-gray-400" value={proizvodData.zanr} onChange={(e) => setProizvodData(p => ({ ...p, zanr: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Format</label>
                    <select className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-gray-400" value={proizvodData.format} onChange={(e) => setProizvodData(p => ({ ...p, format: e.target.value }))}>
                      <option value="Vinyl">Vinyl</option>
                      <option value="CD">CD</option>
                      <option value="Kaseta">Kaseta</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Naslovna slika</label>
                {proizvodData.slika ? (
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-gray-200">
                    <Image src={proizvodData.slika} alt="Slika" fill className="object-cover" />
                    <button type="button" onClick={() => setProizvodData(p => ({ ...p, slika: "" }))} className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <ImageUpload label="Postavi sliku" onUploadSuccess={(url) => setProizvodData(p => ({ ...p, slika: url }))} />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">Opis</label>
              <textarea className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-gray-400 min-h-[80px]" value={proizvodData.opis} onChange={(e) => setProizvodData(p => ({ ...p, opis: e.target.value }))} />
            </div>

            <hr className="border-gray-100" />

            {/* Pesme */}
            <div className="p-5 rounded-3xl border-2 border-dashed border-gray-200 space-y-4 bg-gray-50">
              <h2 className="font-bold text-center flex items-center justify-center gap-2">
                <Music size={18} /> Upravljanje pesmama
              </h2>

              <div className="space-y-2">
                {pesme.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <button type="button" onClick={() => pomeriPesmu(idx, 'gore')} disabled={idx === 0} className="text-gray-300 hover:text-gray-600 disabled:opacity-20">
                          <ChevronUp size={18} />
                        </button>
                        <button type="button" onClick={() => pomeriPesmu(idx, 'dole')} disabled={idx === pesme.length - 1} className="text-gray-300 hover:text-gray-600 disabled:opacity-20">
                          <ChevronDown size={18} />
                        </button>
                      </div>
                      <div>
                        <span className="text-sm font-medium">{idx + 1}. {p.naziv}</span>
                        <span className="text-xs text-gray-400 block">{p.trajanje}s</span>
                      </div>
                    </div>
                    <button type="button" onClick={() => setPesme(prev => prev.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600">
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-xs font-bold text-gray-500 uppercase">Dodaj novu pesmu:</p>
                <div className="grid grid-cols-2 gap-3">
                  <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" placeholder="Naziv pesme" value={trenutnaPesma.naziv} onChange={(e) => setTrenutnaPesma(p => ({ ...p, naziv: e.target.value }))} />
                  <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" type="number" placeholder="Trajanje (sekunde)" value={trenutnaPesma.trajanje} onChange={(e) => setTrenutnaPesma(p => ({ ...p, trajanje: e.target.value }))} />
                </div>
                <button type="button" onClick={handleDodajPesmu} className="px-6 py-2 bg-gray-700 text-white rounded-xl text-sm font-medium hover:bg-gray-600 transition-all">
                  + Dodaj pesmu
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-gray-800 text-white rounded-2xl font-bold uppercase tracking-wide hover:bg-gray-700 transition-all disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin mx-auto" /> : "Sačuvaj izmene"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function IzmeniProizvodPage() {
  return (
    <RoleGuard allowedRoles={["PRODAVAC"]}>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="animate-spin" size={48} />
        </div>
      }>
        <IzmeniProizvodSadrzaj />
      </Suspense>
    </RoleGuard>
  );
}