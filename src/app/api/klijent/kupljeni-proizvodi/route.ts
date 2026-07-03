import { NextResponse } from "next/server";
import { csrf } from '@/lib/csrf';
import { db } from "@/db/index";
import { kupljeniProizvodi, proizvod, korisnik } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "tvoja_tajna_sifra_123";

/**
 * @swagger
 * /api/klijent/kupljeni-proizvodi:
 *   get:
 *     summary: Lista kupljenih proizvoda ulogovanog korisnika
 *     description: Vraća listu svih albuma/ploča koje je trenutno ulogovani klijent kupio.
 *     tags: [Proizvodi]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Uspešno dobavljena lista kupljenih proizvoda.
 *       401:
 *         description: Niste ulogovani ili je sesija nevažeća.
 *       500:
 *         description: Greška na serveru.
 */
export const GET = csrf(async function GET(req: Request) {
  try {
    let token: string | undefined;

    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get("auth")?.value;
    }

    if (!token) {
      return NextResponse.json({ success: false, error: "Niste ulogovani." }, { status: 401 });
    }

    let korisnikId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; uloga: string };
      korisnikId = decoded.sub;
    } catch {
      return NextResponse.json({ success: false, error: "Sesija nevažeća ili je istekla." }, { status: 401 });
    }

    const mojiProizvodi = await db
      .select({
        id: proizvod.id,
        naziv: proizvod.naziv,
        izvodjac: proizvod.izvodjac,
        opis: proizvod.opis,
        slika: proizvod.slika,
        zanr: proizvod.zanr,
        format: proizvod.format,
        godinaIzdavanja: proizvod.godinaIzdavanja,
        prodavacIme: korisnik.ime,
        prodavacPrezime: korisnik.prezime,
        datumKupovine: kupljeniProizvodi.datum,
      })
      .from(kupljeniProizvodi)
      .innerJoin(proizvod, eq(kupljeniProizvodi.proizvodId, proizvod.id))
      .innerJoin(korisnik, eq(proizvod.prodavac, korisnik.id))
      .where(eq(kupljeniProizvodi.korisnikId, korisnikId));

    return NextResponse.json({
      success: true,
      data: mojiProizvodi
    });

  } catch (error: unknown) {
    console.error("Greška API /klijent/kupljeni-proizvodi:", error);
    return NextResponse.json(
      { success: false, error: "Greška na serveru." },
      { status: 500 }
    );
  }
});