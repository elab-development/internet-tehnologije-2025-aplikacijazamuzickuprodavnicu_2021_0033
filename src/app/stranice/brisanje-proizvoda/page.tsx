"use client";

import RoleGuard from "../../components/RoleGuard";
import { useEffect, useState, Suspense } from "react";
import { fetchProizvodi, getProizvodSaPesmama, obrisiProizvod } from "@/lib/proizvodiClient";
import Image from "next/image";
import {
  Trash2, AlertTriangle, CheckCircle, Loader2, ArrowLeft, Search, User, Music
} from "lucide-react";

interface Pesma {
  id: string;
  naziv: string;
  trajanje: string | number;
}

interface Proizvod {
  id: string;
  naziv: string;
  izvodjac: string;
  opis: string;
  cena: string;
  zanr: string;
  format: string;
  godinaIzdavanja: number;
  slika: string;
  prodavacIme: string;
  prodavacPrezime: string;
  pesme?: Pesma[];
}

export default function BrisanjeProizvodaPage() {
  return (
    <RoleGuard allowedRoles={["PRODAVAC"]}>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="animate-spin" size={50} />
        </div>
      }>
        <BrisanjeProizvodaSadrzaj />
      </Suspense>
    </RoleGuard>
  );
}

function BrisanjeProizvodaSadrzaj() {
  const [proizvodi, setProizvodi] = useState<Proizvod[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [selected, setSelected] = useState<Proizvod | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null);

  useEffect(() => {
    osveziListu();
  }, []);

  const osveziListu = async () => {
    setLoading(true);
    try {
      const res = await fetchProizvodi();
      setProizvodi((res.proizvodi || []) as Proizvod[]);
    } catch {
      setNotification({ message: "Greška pri učitavanju liste.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewDelete = async (id: string) => {
    setLoadingDetails(id);
    try {
      const detalji = await getProizvodSaPesmama(id);
      setSelected(detalji as Proizvod);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setNotification({ message: "Greška pri učitavanju detalja.", type: "error" });
    } finally {
      setLoadingDetails(null);
    }
  };

  const izvrsiBrisanje = async () => {
    if (!selected) return;
    setIsDeleting(true);
    try {
      const res = await obrisiProizvod(selected.id);
      if (res.success) {
        setNotification({ message: "Proizvod je uspešno obrisan!", type: "success" });
        setSelected(null);
        osveziListu();
      } else {
        setNotification({ message: res.error || "Greška pri brisanju.", type: "error" });
      }
    } catch {
      setNotification({ message: "Problem sa serverom.", type: "error" });
    } finally {
      setIsDeleting(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const filtrirani = proizvodi.filter((p) =>
    p.naziv.toLowerCase().includes(search.toLowerCase()) ||
    p.izvodjac.toLowerCase().includes(search.toLowerCase()) ||
    p.zanr.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">

        {notification && (
          <div className="fixed inset-0 flex items-center justify-center z-[5000] p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 flex flex-col items-center max-w-sm w-full shadow-2xl">
              <div className={`mb-4 p-4 rounded-full ${notification.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                {notification.type === "success" ? <CheckCircle size={48} className="text-green-500" /> : <AlertTriangle size={48} className="text-red-500" />}
              </div>
              <p className="text-xl font-bold text-center mb-6">{notification.message}</p>
              <button onClick={() => setNotification(null)} className="px-8 py-2 bg-gray-800 text-white rounded-xl font-medium">Zatvori</button>
            </div>
          </div>
        )}

        {selected ? (
          <div className="max-w-3xl mx-auto py-10">
            <button onClick={() => setSelected(null)} className="mb-8 flex items-center gap-2 bg-gray-800 text-white font-bold py-3 px-8 rounded-2xl hover:bg-gray-700 transition-all">
              <ArrowLeft size={18} /> Odustani
            </button>

            <div className="bg-white rounded-3xl p-8 shadow-sm border-t-8 border-red-500">
              <h1 className="text-2xl font-bold mb-8 text-center uppercase">Potvrda brisanja</h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <p><span className="font-bold">Naziv:</span> {selected.naziv}</p>
                  <p><span className="font-bold">Izvođač:</span> {selected.izvodjac}</p>
                  <p><span className="font-bold">Format:</span> {selected.format}</p>
                  <p><span className="font-bold">Žanr:</span> {selected.zanr}</p>
                  <p><span className="font-bold">Cena:</span> {selected.cena} RSD</p>
                </div>
                {selected.slika && (
                  <div className="relative h-40 rounded-2xl overflow-hidden border border-gray-200">
                    <Image src={selected.slika} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>

              {selected.pesme && selected.pesme.length > 0 && (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 mb-8">
                  <h2 className="font-bold text-center mb-4 flex items-center justify-center gap-2">
                    <Music size={18} /> Pesme koje će biti obrisane
                  </h2>
                  <div className="space-y-2">
                    {selected.pesme.map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                        <span className="text-sm font-medium">{idx + 1}. {p.naziv}</span>
                        <span className="text-xs text-gray-400">
                          {Math.floor(Number(p.trajanje) / 60)}:{String(Math.floor(Number(p.trajanje) % 60)).padStart(2, '0')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setSelected(null)} className="py-3 bg-gray-100 text-gray-800 rounded-xl font-bold hover:bg-gray-200 transition-all">
                  Odustani
                </button>
                <button onClick={izvrsiBrisanje} disabled={isDeleting} className="py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                  {isDeleting ? <Loader2 className="animate-spin" size={20} /> : <><Trash2 size={20} /> Potvrdi brisanje</>}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
              <h1 className="text-3xl font-bold uppercase tracking-wide">Brisanje proizvoda</h1>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Pretraži proizvode..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-gray-400"
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20"><Loader2 className="animate-spin mx-auto" size={40} /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtrirani.map((p) => (
                  <div key={p.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200 flex flex-col hover:shadow-lg transition-all group">
                    <div className="relative h-52 w-full overflow-hidden">
                      <Image src={p.slika || "/placeholder.jpg"} alt={p.naziv} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute top-4 right-4 bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-bold">{p.format}</div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <h2 className="text-lg font-bold mb-1 line-clamp-1">{p.naziv}</h2>
                      <p className="text-gray-500 text-sm mb-1">{p.izvodjac}</p>
                      <p className="text-gray-400 text-xs mb-4">{p.zanr} · {p.godinaIzdavanja}</p>
                      <div className="flex items-center gap-2 mb-4">
                        <User size={14} className="text-gray-400" />
                        <span className="text-xs text-gray-400">{p.prodavacIme} {p.prodavacPrezime}</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                        <span className="text-lg font-black">{p.cena} RSD</span>
                        <button
                          onClick={() => handleReviewDelete(p.id)}
                          className="flex items-center gap-2 bg-red-50 text-red-500 border-2 border-red-100 px-4 py-2 rounded-xl hover:bg-red-500 hover:text-white transition-all font-bold text-xs uppercase"
                        >
                          {loadingDetails === p.id ? <Loader2 className="animate-spin" size={16} /> : <><Trash2 size={16} /> Obriši</>}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filtrirani.length === 0 && !loading && (
              <div className="text-center py-20 font-bold text-gray-400">Nije pronađen nijedan proizvod.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}