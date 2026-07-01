"use client";

import RoleGuard from "../../components/RoleGuard";
import KupljeniKurseviContent from "../../components/KupljeniProizvodiContent";
import { useEffect, useState, Suspense } from "react";
import { fetchKupljeniProizvodi } from "@/lib/kupljeniProizvodiClient";
import { Loader2 } from "lucide-react";

function MojiProizvodiSadrzaj() {
  const [proizvodi, setProizvodi] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetchKupljeniProizvodi();
        if (res.success) {
          setProizvodi(res.data || []);
        } else {
          setError(res.error || "Greška pri učitavanju proizvoda.");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Greška na serveru.");
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <KupljeniKurseviContent
      pocetniKursevi={proizvodi}
      loading={loading}
      error={error}
    />
  );
}

export default function MojiProizvodiPage() {
  return (
    <RoleGuard allowedRoles={["KLIJENT"]}>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-screen">
            <Loader2 className="animate-spin" size={50} />
            <p className="mt-4 font-bold">Učitavanje vaših proizvoda...</p>
          </div>
        }
      >
        <MojiProizvodiSadrzaj />
      </Suspense>
    </RoleGuard>
  );
}