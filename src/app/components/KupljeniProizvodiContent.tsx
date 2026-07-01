"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, User, Music, Disc } from "lucide-react";
import { escapeHtml } from "../utils/sanitize";

interface Proizvod {
  id: string;
  naziv: string;
  izvodjac: string;
  opis: string;
  slika: string;
  zanr: string;
  format: string;
  godinaIzdavanja: number;
  prodavacIme: string;
  prodavacPrezime: string;
  datumKupovine?: string;
}

export default function KupljeniKurseviContent({
  pocetniKursevi = [],
  loading,
  error
}: {
  pocetniKursevi: unknown[];
  loading?: boolean;
  error?: string;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Proizvod | null>(null);

  const proizvodi = pocetniKursevi as Proizvod[];

  const filtrirani = proizvodi.filter((p) =>
    p?.naziv?.toLowerCase().includes(search.toLowerCase()) ||
    p?.izvodjac?.toLowerCase().includes(search.toLowerCase()) ||
    p?.zanr?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <h1 className="text-3xl font-bold">Moja kolekcija</h1>
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

        {loading ? (
          <div className="text-center py-20 text-gray-400">Učitavanje...</div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtrirani.map((p) => (
                <div key={p.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200 flex flex-col hover:shadow-lg transition-all group">
                  <div className="relative h-52 w-full cursor-pointer overflow-hidden" onClick={() => setSelected(p)}>
                    <Image
                      src={p.slika || "/placeholder.jpg"}
                      alt={p.naziv}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-bold">
                      {p.format}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h2 className="text-lg font-bold mb-1 line-clamp-1">{escapeHtml(p.naziv)}</h2>
                    <p className="text-gray-500 text-sm font-medium mb-1">{escapeHtml(p.izvodjac)}</p>
                    <p className="text-gray-400 text-xs mb-4">{p.zanr} · {p.godinaIzdavanja}</p>

                    <div className="flex items-center gap-2 mb-4">
                      <User size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-400">{p.prodavacIme} {p.prodavacPrezime}</span>
                    </div>

                    <div className="border-t border-gray-100 pt-4 mt-auto">
                      <Link
                        href={`/stranice/kupljeni-proizvodi/${p.id}`}
                        className="flex items-center justify-center gap-2 bg-gray-800 text-white py-3 rounded-xl font-medium hover:bg-gray-700 transition-all"
                      >
                        <Disc size={18} /> Pogledaj album
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selected && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[2000] backdrop-blur-sm">
                <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 relative shadow-2xl flex flex-col max-h-[90vh]">
                  <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-gray-400 hover:rotate-90 transition-all">
                    <X size={32} />
                  </button>

                  <div className="mb-4">
                    <h2 className="text-2xl font-bold mb-1 pr-10">{escapeHtml(selected.naziv)}</h2>
                    <p className="text-gray-500 font-medium">{escapeHtml(selected.izvodjac)}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold">{selected.zanr}</span>
                      <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold">{selected.format}</span>
                      <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold">{selected.godinaIzdavanja}</span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4">
                    <div className="relative h-56 w-full rounded-2xl overflow-hidden">
                      <Image src={selected.slika || "/placeholder.jpg"} alt={selected.naziv} fill className="object-cover" />
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <User size={14} />
                      <span>Prodavac: {selected.prodavacIme} {selected.prodavacPrezime}</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{escapeHtml(selected.opis)}</p>
                  </div>

                  <div className="pt-6 mt-4 border-t border-gray-100">
                    <Link
                      href={`/stranice/kupljeni-proizvodi/${selected.id}`}
                      className="flex items-center justify-center gap-2 bg-gray-800 text-white py-4 rounded-xl font-medium hover:bg-gray-700 transition-all text-lg"
                    >
                      <Music size={22} /> Otvori album
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {filtrirani.length === 0 && (
              <div className="text-center py-20 text-gray-400 font-medium">
                Nemate kupljenih proizvoda.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}