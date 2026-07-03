"use server";

import { db } from "@/db/index";
import { korisnik, proizvod, kupljeniProizvodi } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "tvoja_tajna_sifra_123";

export async function getMesecnaStatistikaKlijenata() {
  try {
    const klijenti = await db
      .select({
        datum: korisnik.datumRegistracije,
      })
      .from(korisnik)
      .where(eq(korisnik.uloga, "KLIJENT"));

    const statistika: Record<string, number> = {};

    klijenti.forEach((k) => {
      if (k.datum) {
        const d = new Date(k.datum);
        const kljuc = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        statistika[kljuc] = (statistika[kljuc] || 0) + 1;
      }
    });

    const formatiraniPodaci = Object.entries(statistika)
      .map(([mesec, broj]) => {
        const [godina, m] = mesec.split("-");
        const imeMeseca = new Date(Number(godina), Number(m) - 1).toLocaleString('sr-Latn-RS', { month: 'short' });
        return {
          name: `${imeMeseca} ${godina}.`,
          broj: broj,
          puniDatum: mesec
        };
      })
      .sort((a, b) => a.puniDatum.localeCompare(b.puniDatum));

    return { success: true, data: formatiraniPodaci };
  } catch (error) {
    console.error("Greška pri dohvatanju statistike klijenata:", error);
    return { success: false, error: "Greška prilikom prikaza informacija o broju klijenata" };
  }
}

export async function getStatistikaProdajeProizvoda() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth")?.value;

    if (!token) {
      return { success: false, error: "Niste ulogovani.", status: 401 };
    }

    let decoded: { sub: string; uloga: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { sub: string; uloga: string };
    } catch {
      return { success: false, error: "Sesija nevažeća.", status: 401 };
    }

    if (decoded.uloga !== "ADMIN") {
      return {
        success: false,
        error: "Zabranjen pristup. Samo administrator može videti ove podatke.",
        status: 403
      };
    }

    const sviProizvodi = await db.select().from(proizvod);
    const sveKupovine = await db.select().from(kupljeniProizvodi);

    const statistika = sviProizvodi.map((p) => {
      const brojProdaja = sveKupovine.filter((k) => k.proizvodId === p.id).length;
      const cena = Number(p.cena) || 0;
      const prihod = brojProdaja * cena;

      return {
        id: p.id,
        naziv: p.naziv,
        izvodjac: p.izvodjac,
        zanr: p.zanr,
        format: p.format,
        cena,
        brojProdaja,
        prihod,
      };
    });

    const sortirano = statistika.sort((a, b) => b.prihod - a.prihod);
    const ukupniPrihod = sortirano.reduce((sum, item) => sum + item.prihod, 0);
    const ukupnoProdato = sortirano.reduce((sum, item) => sum + item.brojProdaja, 0);

    return {
      success: true,
      data: sortirano,
      ukupniPrihod,
      ukupnoProdato,
    };

  } catch (error) {
    console.error("Greška pri generisanju izveštaja o prodaji:", error);
    return {
      success: false,
      error: "Sistem ne može da prikaže informacije o prodaji proizvoda.",
      status: 500
    };
  }
}