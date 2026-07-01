"use client";

import { useState, useEffect, Suspense } from "react";
import { Mail, ShoppingBag } from "lucide-react";
import RoleGuard from "../../components/RoleGuard";
import { fetchProdavacKlijenti } from "@/lib/prodavacClient";

interface Klijent {
  korisnikId: string;
  ime: string;
  prezime: string;
  email: string;
  brojProizvoda: number;
}

export default function PregledKlijenataPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex justify-center items-center font-bold">
        Učitavanje...
      </div>
    }>
      <PregledKlijenataContent />
    </Suspense>
  );
}

function PregledKlijenataContent() {
  const [klijenti, setKlijenti] = useState<Klijent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetchProdavacKlijenti();
        if (res.success) {
          setKlijenti(res.data || []);
        } else {
          setError(res.error || "Greška pri učitavanju klijenata.");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Došlo je do greške.");
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const filtrirani = klijenti.filter(
    (k) =>
      k.ime.toLowerCase().includes(query.toLowerCase()) ||
      k.prezime.toLowerCase().includes(query.toLowerCase()) ||
      k.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <RoleGuard allowedRoles={["PRODAVAC"]}>
      <div className="min-h-screen bg-gray-50 p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <header className="mb-10">
            <h1 className="text-4xl font-extrabold mb-2">Pregled klijenata</h1>
            <p className="text-gray-500 font-medium">Spisak klijenata koji su kupili Vaše proizvode.</p>
          </header>

          {loading ? (
            <div className="flex justify-center p-10 font-bold text-gray-400">Učitavanje podataka...</div>
          ) : error ? (
            <div className="text-red-500 bg-red-50 p-4 rounded-xl border border-red-200">{error}</div>
          ) : klijenti.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
              <p className="text-gray-400 text-xl font-semibold">Još uvek niko nije kupio Vaše proizvode.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Pretraži po imenu, prezimenu ili emailu..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full p-4 rounded-2xl border border-gray-200 focus:outline-none focus:border-gray-400 bg-white font-medium"
              />

              <div className="overflow-x-auto bg-white rounded-3xl shadow-sm border border-gray-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-800 text-white">
                      <th className="p-5 font-bold uppercase text-sm tracking-wider">Klijent</th>
                      <th className="p-5 font-bold uppercase text-sm tracking-wider">Kontakt</th>
                      <th className="p-5 font-bold uppercase text-sm tracking-wider text-center">Kupljenih proizvoda</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtrirani.map((k) => (
                      <tr key={k.korisnikId} className="hover:bg-gray-50 transition-colors">
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
                              {k.ime[0]}{k.prezime[0]}
                            </div>
                            <span className="font-bold">{k.ime} {k.prezime}</span>
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-2 text-gray-500">
                            <Mail size={16} />
                            <span className="text-sm">{k.email}</span>
                          </div>
                        </td>
                        <td className="p-5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <ShoppingBag size={16} className="text-gray-400" />
                            <span className="font-medium">{k.brojProizvoda}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtrirani.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-10 text-center text-gray-400">
                          Nema rezultata za pretragu &quot;{query}&quot;
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 text-white p-6 rounded-3xl shadow-lg">
                  <p className="text-sm opacity-80 font-bold uppercase">Ukupan broj klijenata</p>
                  <p className="text-4xl font-black">{klijenti.length}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}