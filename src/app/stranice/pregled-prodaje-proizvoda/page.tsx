"use client";

import { useEffect, useState, Suspense } from "react";
import RoleGuard from "../../components/RoleGuard";
import { fetchProdavacProdaja } from "@/lib/prodavacClient";
import { Mail } from "lucide-react";

interface Klijent {
  klijentIme: string;
  klijentPrezime: string;
  klijentEmail: string;
  metodPlacanja: string;
  statusPlacanja: string;
  datumKupovine: string | null;
}

interface ProizvodSaKlijentima {
  proizvodId: string;
  naziv: string;
  izvodjac: string;
  format: string;
  klijenti: Klijent[];
}

export default function PregledProdajePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex justify-center items-center font-bold text-gray-400">
        Učitavanje stranice...
      </div>
    }>
      <PregledProdajeContent />
    </Suspense>
  );
}

function PregledProdajeContent() {
  const [proizvodi, setProizvodi] = useState<ProizvodSaKlijentima[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetchProdavacProdaja();
        if (res.success) {
          setProizvodi(res.data || []);
        } else {
          setError(res.error || "Greška.");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Greška.");
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <RoleGuard allowedRoles={["PRODAVAC"]}>
      <div className="min-h-screen bg-gray-50 p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <header className="mb-10">
            <h1 className="text-4xl font-extrabold mb-2">Pregled prodaje po proizvodima</h1>
            <p className="text-gray-500 font-medium">Spisak korisnika koji su kupili Vaše proizvode.</p>
          </header>

          {loading ? (
            <div className="flex justify-center p-10 font-bold text-gray-400">Učitavanje podataka o prodaji...</div>
          ) : error ? (
            <div className="text-red-500 bg-red-50 p-4 rounded-xl border border-red-200">{error}</div>
          ) : proizvodi.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
              <p className="text-gray-400 text-xl font-semibold">Još uvek nemate proizvoda ili prodaja.</p>
            </div>
          ) : (
            proizvodi.map((p, idx) => (
              <div key={idx} className="mb-10">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold flex flex-wrap items-center gap-3">
                    {p.naziv}
                    <span className="text-sm font-bold bg-gray-100 px-3 py-1 rounded-full">{p.izvodjac}</span>
                    <span className="text-sm font-bold bg-gray-100 px-3 py-1 rounded-full">{p.format}</span>
                    <span className="text-lg font-bold text-gray-400">
                      ({p.klijenti ? p.klijenti.length : 0} kupovina)
                    </span>
                  </h2>
                </div>

                {!p.klijenti || p.klijenti.length === 0 ? (
                  <p className="text-gray-400 mb-4">Još uvek niko nije kupio ovaj proizvod.</p>
                ) : (
                  <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-800 text-white">
                            <th className="p-5 font-bold uppercase text-sm tracking-wider">Klijent</th>
                            <th className="p-5 font-bold uppercase text-sm tracking-wider">Kontakt</th>
                            <th className="p-5 font-bold uppercase text-sm tracking-wider">Metod</th>
                            <th className="p-5 font-bold uppercase text-sm tracking-wider">Status</th>
                            <th className="p-5 font-bold uppercase text-sm tracking-wider text-center">Datum</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {p.klijenti.map((kl, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                              <td className="p-5">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
                                    {kl.klijentIme?.[0]}{kl.klijentPrezime?.[0]}
                                  </div>
                                  <span className="font-bold">{kl.klijentIme} {kl.klijentPrezime}</span>
                                </div>
                              </td>
                              <td className="p-5">
                                <div className="flex items-center gap-2 text-gray-500">
                                  <Mail size={16} />
                                  <span className="text-sm">{kl.klijentEmail}</span>
                                </div>
                              </td>
                              <td className="p-5">
                                <span className="text-sm font-medium">{kl.metodPlacanja}</span>
                              </td>
                              <td className="p-5">
                                <span className="text-sm font-medium">{kl.statusPlacanja}</span>
                              </td>
                              <td className="p-5 text-center">
                                <span className="text-sm font-bold text-gray-400">
                                  {kl.datumKupovine ? new Date(kl.datumKupovine).toLocaleDateString("sr-RS") : "/"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </RoleGuard>
  );
}