"use client";

import RoleGuard from "../../../components/RoleGuard";
import TrackLista from "../../../components/TrackLista";
import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import { Loader2, Music } from "lucide-react";

interface Pesma {
  id: string;
  naziv: string;
  trajanje: string | number;
  poredak: number;
}

interface ProizvodPodaci {
  id: string;
  naziv: string;
  izvodjac: string;
  opis: string;
  zanr: string;
  format: string;
  godinaIzdavanja: number;
  slika: string;
}

function ProizvodDetaljiSadrzaj() {
  const { proizvodId } = useParams();
  const [proizvodPodaci, setProizvodPodaci] = useState<ProizvodPodaci | null>(null);
  const [pesme, setPesme] = useState<Pesma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/klijent/kupljeni-proizvodi/${String(proizvodId)}`);
        const data = await res.json();
        if (data.success) {
          setProizvodPodaci(data.proizvod);
          setPesme(data.pesme || []);
        } else {
          setError(data.error || "Greška pri učitavanju proizvoda.");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Došlo je do greške na serveru.");
      }
      setLoading(false);
    }
    fetchData();
  }, [proizvodId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-bold">Učitavanje albuma...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 font-bold text-xl mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-gray-800 text-white rounded-xl">
          Pokušaj ponovo
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 md:p-8">

        {/* Header albuma */}
        <div className="flex gap-6 mb-8 bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
          {proizvodPodaci?.slika && (
            <img
              src={proizvodPodaci.slika}
              alt={proizvodPodaci.naziv}
              className="w-32 h-32 rounded-2xl object-cover shadow-md"
            />
          )}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Music size={14} />
              <span>{proizvodPodaci?.format} · {proizvodPodaci?.zanr} · {proizvodPodaci?.godinaIzdavanja}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-800">{proizvodPodaci?.naziv}</h1>
            <p className="text-lg text-gray-500 mt-1">{proizvodPodaci?.izvodjac}</p>
            <p className="text-sm text-gray-400 mt-2">{proizvodPodaci?.opis}</p>
          </div>
        </div>

        {/* Track lista i recenzija */}
        <TrackLista
          pesme={pesme}
          proizvodId={String(proizvodId)}
          nazivAlbuma={proizvodPodaci?.naziv || ""}
        />
      </div>
    </div>
  );
}

export default function ProizvodDetaljiPage() {
  return (
    <RoleGuard allowedRoles={["KLIJENT"]}>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="animate-spin" size={50} />
        </div>
      }>
        <ProizvodDetaljiSadrzaj />
      </Suspense>
    </RoleGuard>
  );
}