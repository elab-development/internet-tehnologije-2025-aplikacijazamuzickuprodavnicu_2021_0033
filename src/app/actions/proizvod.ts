"use server";

import { eq, asc, and, notInArray } from "drizzle-orm";
import { db } from "@/db/index";
import { proizvod, pesma } from "@/db/schema";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "tvoja_tajna_sifra_123";

interface PesmaInput {
  id?: string;
  naziv: string;
  trajanje: string | number;
}

interface ProizvodInput {
  id?: string;
  naziv: string;
  izvodjac: string;
  opis: string;
  cena: string | number;
  zanr: string;
  format: string;
  godinaIzdavanja: number;
  slika: string;
  pesme: PesmaInput[];
}

export async function kreirajKompletanProizvod(data: ProizvodInput): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth")?.value;
    if (!token) return { success: false, error: "Niste ulogovani." };

    let prodavacId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
      prodavacId = decoded.sub;
    } catch {
      return { success: false, error: "Sesija je istekla. Ulogujte se ponovo." };
    }

    if (!data.naziv || !data.izvodjac || !data.opis || !data.cena || !data.zanr || !data.format || !data.godinaIzdavanja || !data.slika) {
      return { success: false, error: "Sva polja moraju biti popunjena." };
    }

    const cenaBroj = Number(data.cena);
    if (isNaN(cenaBroj) || cenaBroj < 0) {
      return { success: false, error: "Cena mora biti pozitivan broj." };
    }

    return await db.transaction(async (tx) => {
      const [noviProizvod] = await tx.insert(proizvod).values({
        naziv: data.naziv,
        izvodjac: data.izvodjac,
        opis: data.opis,
        cena: cenaBroj.toString(),
        zanr: data.zanr,
        format: data.format,
        godinaIzdavanja: data.godinaIzdavanja,
        slika: data.slika,
        prodavac: prodavacId,
      }).returning();

      if (data.pesme && data.pesme.length > 0) {
        const pesmeZaBazu = data.pesme.map((p, index) => ({
          naziv: p.naziv,
          trajanje: p.trajanje.toString(),
          proizvodId: noviProizvod.id,
          poredak: index,
        }));
        await tx.insert(pesma).values(pesmeZaBazu);
      }

      return { success: true };
    });

  } catch (error: unknown) {
    console.error("Baza Error:", error);
    let poruka = "Greška pri čuvanju podataka.";
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      poruka = "Proizvod sa tim nazivom već postoji.";
    }
    return { success: false, error: poruka };
  }
}

export async function getProizvodiProdavca() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  if (!token) return [];

  let prodavacId: string;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
    prodavacId = decoded.sub;
  } catch {
    return [];
  }

  return await db
    .select({
      id: proizvod.id,
      naziv: proizvod.naziv,
      izvodjac: proizvod.izvodjac,
      opis: proizvod.opis,
      cena: proizvod.cena,
      zanr: proizvod.zanr,
      format: proizvod.format,
      godinaIzdavanja: proizvod.godinaIzdavanja,
      slika: proizvod.slika,
    })
    .from(proizvod)
    .where(eq(proizvod.prodavac, prodavacId));
}

export async function getProizvodSaPesmama(proizvodId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  if (!token) throw new Error("Niste ulogovani");

  let prodavacId: string;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
    prodavacId = decoded.sub;
  } catch {
    throw new Error("Nevažeća sesija");
  }

  const [proizvodPodaci] = await db
    .select()
    .from(proizvod)
    .where(eq(proizvod.id, proizvodId));

  if (!proizvodPodaci || proizvodPodaci.prodavac !== prodavacId) {
    throw new Error("Nemate pravo pristupa ovom proizvodu");
  }

  const pesme = await db
    .select()
    .from(pesma)
    .where(eq(pesma.proizvodId, proizvodId))
    .orderBy(asc(pesma.poredak));

  return { ...proizvodPodaci, pesme };
}

export async function izmeniKompletanProizvod(data: ProizvodInput): Promise<{ success: boolean; error?: string }> {
  try {
    const proizvodId = data.id;
    if (!proizvodId) return { success: false, error: "Nedostaje ID proizvoda." };

    return await db.transaction(async (tx) => {
      await tx.update(proizvod).set({
        naziv: data.naziv,
        izvodjac: data.izvodjac,
        opis: data.opis,
        cena: Number(data.cena).toString(),
        zanr: data.zanr,
        format: data.format,
        godinaIzdavanja: data.godinaIzdavanja,
        slika: data.slika,
      }).where(eq(proizvod.id, proizvodId));

      const stigliIds = data.pesme
        .filter((p) => p.id && p.id !== "")
        .map((p) => p.id as string);

      if (stigliIds.length > 0) {
        await tx.delete(pesma).where(
          and(
            eq(pesma.proizvodId, proizvodId),
            notInArray(pesma.id, stigliIds)
          )
        );
      } else {
        await tx.delete(pesma).where(eq(pesma.proizvodId, proizvodId));
      }

      for (let i = 0; i < data.pesme.length; i++) {
        const p = data.pesme[i];
        if (p.id) {
          await tx.update(pesma).set({
            naziv: p.naziv,
            trajanje: p.trajanje.toString(),
            poredak: i,
          }).where(eq(pesma.id, p.id));
        } else {
          await tx.insert(pesma).values({
            naziv: p.naziv,
            trajanje: p.trajanje.toString(),
            proizvodId,
            poredak: i,
          });
        }
      }
      return { success: true };
    });
  } catch (error: unknown) {
    console.error("IZMENA PROIZVODA ERROR:", error);
    return { success: false, error: "Greška pri izmeni proizvoda." };
  }
}

export async function obrisiProizvod(proizvodId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth")?.value;
    if (!token) return { success: false, error: "Niste ulogovani." };

    let prodavacId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
      prodavacId = decoded.sub;
    } catch {
      return { success: false, error: "Sesija nevažeća." };
    }

    const [provera] = await db
      .select()
      .from(proizvod)
      .where(eq(proizvod.id, proizvodId));

    if (!provera || provera.prodavac !== prodavacId) {
      return { success: false, error: "Nemate pravo da obrišete ovaj proizvod." };
    }

    return await db.transaction(async (tx) => {
      await tx.delete(pesma).where(eq(pesma.proizvodId, proizvodId));
      await tx.delete(proizvod).where(eq(proizvod.id, proizvodId));
      return { success: true };
    });
  } catch (error: unknown) {
    console.error("DELETE ERROR:", error);
    return { success: false, error: "Došlo je do greške pri brisanju iz baze." };
  }
}