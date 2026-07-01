"use client";
import { useState, useEffect } from "react";
import { sacuvajRecenziju, getRecenzijeZaProizvod } from "../actions/recenzija";
import { CheckCircle, Music, Star } from "lucide-react";
import { escapeHtml } from "../utils/sanitize";

interface Pesma {
  id: string;
  naziv: string;
  trajanje: string | number;
  poredak: number;
}

interface Recenzija {
  id: string;
  korisnikId: string;
  ocena: number;
  komentar?: string | null;
}

function formatirajTrajanje(sekunde: number): string {
  const min = Math.floor(sekunde / 60);
  const sec = Math.floor(sekunde % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export default function TrackLista({
  pesme,
  proizvodId,
  nazivAlbuma,
}: {
  pesme: Pesma[];
  proizvodId: string;
  nazivAlbuma: string;
}) {
  const [ocena, setOcena] = useState(0);
  const [komentar, setKomentar] = useState("");
  const [poslato, setPoslato] = useState(false);
  const [greska, setGreska] = useState("");
  const [recenzije, setRecenzije] = useState<Recenzija[]>([]);

  useEffect(() => {
    async function ucitajRecenzije() {
      const res = await getRecenzijeZaProizvod(proizvodId);
      if (res.success) {
        setRecenzije((res.data as Recenzija[]) || []);
      }
    }
    ucitajRecenzije();
  }, [proizvodId]);

  const handleRecenzija = async () => {
    if (ocena < 1) {
      setGreska("Izaberite ocenu.");
      return;
    }
    const res = await sacuvajRecenziju(proizvodId, ocena, komentar);
    if (res.success) {
      setPoslato(true);
      setGreska("");
      const osvezene = await getRecenzijeZaProizvod(proizvodId);
      if (osvezene.success) setRecenzije((osvezene.data as Recenzija[]) || []);
    } else {
      setGreska(res.error || "Greška pri čuvanju recenzije.");
    }
  };

  const prosecnaOcena = recenzije.length > 0
    ? (recenzije.reduce((sum, r) => sum + r.ocena, 0) / recenzije.length).toFixed(1)
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Music size={24} /> {escapeHtml(nazivAlbuma)}
            </h2>
            <p className="text-gray-500 mt-1">{pesme.length} pesama</p>
          </div>

          <div className="divide-y divide-gray-100">
            {pesme.map((pesma, index) => (
              <div key={pesma.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <span className="text-gray-400 text-sm w-6 text-center">{index + 1}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{escapeHtml(pesma.naziv)}</p>
                </div>
                <span className="text-gray-400 text-sm">{formatirajTrajanje(Number(pesma.trajanje))}</span>
              </div>
            ))}
          </div>
        </div>

        {recenzije.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Recenzije</h3>
              <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-sm">{prosecnaOcena}</span>
                <span className="text-gray-400 text-sm">({recenzije.length})</span>
              </div>
            </div>
            <div className="space-y-4">
              {recenzije.map((r) => (
                <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <Star key={val} size={14} className={val <= r.ocena ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
                    ))}
                  </div>
                  {r.komentar && <p className="text-sm text-gray-600">{escapeHtml(r.komentar)}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 h-fit">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Ostavi recenziju</h3>

        {poslato ? (
          <div className="flex items-center gap-2 text-green-600 font-medium">
            <CheckCircle size={20} /> Recenzija je sačuvana!
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Ocena</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button key={val} onClick={() => setOcena(val)}>
                    <Star size={28} className={val <= ocena ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Komentar (opciono)</p>
              <textarea
                value={komentar}
                onChange={(e) => setKomentar(e.target.value)}
                rows={4}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-gray-400"
                placeholder="Napišite utisak o albumu..."
              />
            </div>

            {greska && <p className="text-red-500 text-sm">{greska}</p>}

            <button
              onClick={handleRecenzija}
              className="w-full bg-gray-800 text-white py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors"
            >
              Pošalji recenziju
            </button>
          </div>
        )}
      </div>
    </div>
  );
}