"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "../context/KorpaContext";
import { escapeHtml } from "../utils/sanitize";
import {
  Search,
  ShoppingBasket,
  X,
  CheckCircle,
  AlertTriangle,
  User,
  Edit,
  Trash2,
  Loader2,
  ArrowLeft,
  Music,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchProizvodi, getProizvodSaPesmama, obrisiProizvod } from "@/lib/proizvodiClient";
import { getRecenzijeZaProizvod } from "@/app/actions/recenzija";

interface Pesma {
  id: string;
  naziv: string;
  trajanje: string | number;
  poredak: number;
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
  prodavacId: string;
  pesme?: Pesma[];
}

export default function KurseviContent() {
  const [proizvodi, setProizvodi] = useState<Proizvod[]>([]);
  const [userRole, setUserRole] = useState<"KLIJENT" | "PRODAVAC" | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedProizvod, setSelectedProizvod] = useState<Proizvod | null>(null);
  const [selectedZaBrisanje, setSelectedZaBrisanje] = useState<Proizvod | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [recenzijeModal, setRecenzijeModal] = useState<{id: string; ocena: number; komentar?: string | null}[]>([]);

  const { addToCart, cart } = useCart();
  useEffect(() => {
    if (!selectedProizvod) return;
    getRecenzijeZaProizvod(selectedProizvod.id).then((res) => {
      if (res.success) setRecenzijeModal((res.data as {id: string; ocena: number; komentar?: string | null}[]) || []);
    });
  }, [selectedProizvod]);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchProizvodi();
        if (mounted) {
          setProizvodi(data.proizvodi || []);
          setUserRole(data.userRole || null);
          setUserId(data.userId || null);
        }
      } catch (err: unknown) {
        setNotification({
          message: err instanceof Error ? err.message : "Greška pri učitavanju proizvoda.",
          type: "error"
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  const handleAddToCart = (p: Proizvod) => {
    const vecUKorpi = cart.find((item) => item.id === p.id);
    if (vecUKorpi) {
      setNotification({ message: "Ovaj proizvod se već nalazi u vašoj korpi.", type: "error" });
    } else {
      addToCart({ id: p.id, naziv: p.naziv, cena: p.cena, slika: p.slika });
      setNotification({ message: "Proizvod je uspešno dodat u korpu!", type: "success" });
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const handleReviewDelete = async (id: string) => {
    setLoadingDetails(true);
    try {
      const detalji = await getProizvodSaPesmama(id);
      setSelectedZaBrisanje(detalji);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setNotification({ message: "Greška pri učitavanju detalja.", type: "error" });
    } finally {
      setLoadingDetails(false);
    }
  };

  const izvrsiBrisanje = async () => {
    if (!selectedZaBrisanje) return;
    setIsDeleting(true);
    try {
      const res = await obrisiProizvod(selectedZaBrisanje.id);
      if (res.success) {
        setNotification({ message: "Proizvod je uspešno obrisan!", type: "success" });
        setProizvodi(prev => prev.filter(p => p.id !== selectedZaBrisanje.id));
        setSelectedZaBrisanje(null);
      } else {
        setNotification({ message: res.error || "Greška pri brisanju.", type: "error" });
      }
    } catch {
      setNotification({ message: "Greška na serveru.", type: "error" });
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
                {notification.type === "success"
                  ? <CheckCircle size={48} className="text-green-500" />
                  : <AlertTriangle size={48} className="text-red-500" />}
              </div>
              <p className="text-xl font-bold text-center mb-6">{escapeHtml(notification.message)}</p>
              <button onClick={() => setNotification(null)} className="px-8 py-3 bg-gray-800 text-white rounded-xl font-medium">
                Zatvori
              </button>
            </div>
          </div>
        )}

        {selectedZaBrisanje ? (
          <div className="max-w-3xl mx-auto py-10">
            <button
              onClick={() => setSelectedZaBrisanje(null)}
              className="mb-8 flex items-center gap-2 bg-gray-800 text-white font-bold py-3 px-8 rounded-2xl hover:bg-gray-700 transition-all"
            >
              <ArrowLeft size={18} /> Odustani
            </button>

            <div className="bg-white rounded-3xl p-8 shadow-sm border-t-8 border-red-500">
              <h1 className="text-2xl font-bold mb-8 text-center uppercase">Potvrda brisanja</h1>
              <div className="space-y-4 mb-8">
                <p><span className="font-bold">Naziv:</span> {escapeHtml(selectedZaBrisanje.naziv)}</p>
                <p><span className="font-bold">Izvođač:</span> {escapeHtml(selectedZaBrisanje.izvodjac)}</p>
                <p><span className="font-bold">Format:</span> {selectedZaBrisanje.format}</p>
                <p><span className="font-bold">Cena:</span> {selectedZaBrisanje.cena} RSD</p>
              </div>

              {selectedZaBrisanje.pesme && selectedZaBrisanje.pesme.length > 0 && (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 mb-8">
                  <h2 className="font-bold text-center mb-4">Pesme koje će biti obrisane</h2>
                  <div className="space-y-2">
                    {selectedZaBrisanje.pesme.map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                        <span className="text-sm font-medium">{idx + 1}. {escapeHtml(p.naziv)}</span>
                        <span className="text-xs text-gray-400">{Math.floor(Number(p.trajanje) / 60)}:{String(Math.floor(Number(p.trajanje) % 60)).padStart(2, '0')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setSelectedZaBrisanje(null)} className="py-3 px-6 bg-gray-100 text-gray-800 rounded-xl font-bold hover:bg-gray-200 transition-all">
                  Odustani
                </button>
                <button onClick={izvrsiBrisanje} disabled={isDeleting} className="py-3 px-6 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                  {isDeleting ? <Loader2 className="animate-spin" size={20} /> : <><Trash2 size={20} /> Obriši</>}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
              <h1 className="text-3xl font-bold uppercase tracking-wide">
                {userRole === "PRODAVAC" ? "Moji proizvodi" : "Prodavnica"}
              </h1>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Pretraži po nazivu, izvođaču, žanru..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-gray-400"
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtrirani.map((p) => (
                <div key={p.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200 flex flex-col hover:shadow-lg transition-all group">
                  <div className="relative h-52 w-full cursor-pointer overflow-hidden" onClick={() => setSelectedProizvod(p)}>
                    <Image src={p.slika || "/placeholder.jpg"} alt={p.naziv} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-4 right-4 bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-bold">{p.format}</div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h2 className="text-lg font-bold mb-1 line-clamp-1">{escapeHtml(p.naziv)}</h2>
                    <p className="text-gray-500 text-sm mb-1 font-medium">{escapeHtml(p.izvodjac)}</p>
                    <p className="text-gray-400 text-xs mb-4">{p.zanr} · {p.godinaIzdavanja}</p>

                    <div className="flex items-center gap-2 mb-4">
                      <User size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-400">{p.prodavacIme} {p.prodavacPrezime}</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                      <span className="text-xl font-black">{p.cena} RSD</span>

                      {userRole === "KLIJENT" ? (
                        <button onClick={() => handleAddToCart(p)} className="flex items-center gap-2 bg-gray-800 text-white py-2 px-4 rounded-xl text-sm font-medium hover:bg-gray-700 transition-all">
                          <ShoppingBasket size={16} /> Kupi
                        </button>
                      ) : userRole === "PRODAVAC" && p.prodavacId === userId ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push(`/stranice/izmeni-proizvod?proizvodId=${p.id}`)}
                            className="p-2 border-2 border-gray-200 rounded-xl hover:bg-gray-100 transition-all"
                            title="Izmeni"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleReviewDelete(p.id)}
                            className="p-2 border-2 border-red-100 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                            title="Obriši"
                          >
                            {loadingDetails ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {selectedProizvod && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[2000] backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-2xl p-6 md:p-8 relative flex flex-col max-h-[90vh] shadow-2xl">
              <button onClick={() => setSelectedProizvod(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:rotate-90 transition-all">
                <X size={32} />
              </button>

              <div className="mb-4">
                <h2 className="text-2xl font-bold mb-1">{escapeHtml(selectedProizvod.naziv)}</h2>
                <p className="text-gray-500 font-medium">{escapeHtml(selectedProizvod.izvodjac)}</p>
                <div className="flex gap-2 mt-2">
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold">{selectedProizvod.zanr}</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold">{selectedProizvod.format}</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold">{selectedProizvod.godinaIzdavanja}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4">
                <div className="relative h-56 w-full rounded-2xl overflow-hidden">
                  <Image src={selectedProizvod.slika || "/placeholder.jpg"} alt={selectedProizvod.naziv} fill className="object-cover" />
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{escapeHtml(selectedProizvod.opis)}</p>
                {recenzijeModal.length > 0 && (
                  <div className="border border-gray-100 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-sm">Recenzije</span>
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold">
                          {(recenzijeModal.reduce((s, r) => s + r.ocena, 0) / recenzijeModal.length).toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-400">({recenzijeModal.length})</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {recenzijeModal.map((r) => (
                        <div key={r.id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                          <div className="flex gap-1 mb-1">
                            {[1,2,3,4,5].map((val) => (
                              <Star key={val} size={12} className={val <= r.ocena ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
                            ))}
                          </div>
                          {r.komentar && <p className="text-xs text-gray-500">{escapeHtml(r.komentar)}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProizvod.pesme && selectedProizvod.pesme.length > 0 && (
                  <div className="border border-gray-100 rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                      <Music size={16} />
                      <span className="font-bold text-sm">Tracklista</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {selectedProizvod.pesme.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-4 px-4 py-3">
                          <span className="text-gray-400 text-sm w-5">{idx + 1}</span>
                          <span className="flex-1 text-sm font-medium">{escapeHtml(p.naziv)}</span>
                          <span className="text-xs text-gray-400">
                            {Math.floor(Number(p.trajanje) / 60)}:{String(Math.floor(Number(p.trajanje) % 60)).padStart(2, '0')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {userRole === "KLIJENT" && (
                <div className="flex justify-between items-center border-t border-gray-100 pt-6 mt-4">
                  <span className="text-2xl font-black">{selectedProizvod.cena} RSD</span>
                  <button onClick={() => { handleAddToCart(selectedProizvod); setSelectedProizvod(null); }} className="flex items-center gap-2 bg-gray-800 text-white py-3 px-8 rounded-xl font-medium hover:bg-gray-700 transition-all">
                    <ShoppingBasket size={18} /> Dodaj u korpu
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {filtrirani.length === 0 && !selectedZaBrisanje && (
          <div className="text-center py-20 font-bold text-gray-400">
            Nije pronađen nijedan proizvod koji odgovara pretrazi.
          </div>
        )}
      </div>
    </div>
  );
}