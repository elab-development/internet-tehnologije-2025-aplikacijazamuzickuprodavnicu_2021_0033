import { NextResponse } from "next/server";
import { csrf } from '@/lib/csrf';
import { db } from "@/db/index";
import { kupljeniProizvodi, proizvod, korisnik } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "tvoja_tajna_sifra_123";

/**
 * @swagger
 * /api/prodavac/klijenti:
 *   get:
 *     summary: Lista klijenata za ulogovanog prodavca
 *     description: Vraća listu svih korisnika koji su kupili barem jedan proizvod od prodavca koji je trenutno ulogovan.
 *     tags: [Prodavac]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Uspešno dobavljena lista klijenata.
 *       401:
 *         description: Niste ulogovani ili je sesija nevažeća.
 *       403:
 *         description: Zabranjen pristup.
 *       500:
 *         description: Greška na serveru.
 */
export const GET = csrf(async function GET() {
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

    let prodavacId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; uloga: string };

      if (decoded.uloga !== "PRODAVAC" && decoded.uloga !== "ADMIN") {
        return NextResponse.json({ success: false, error: "Nemate pravo pristupa." }, { status: 403 });
      }

      prodavacId = decoded.sub;
    } catch {
      return NextResponse.json({ success: false, error: "Sesija nevažeća ili je istekla." }, { status: 401 });
    }

    const klijenti = await db
      .select({
        korisnikId: kupljeniProizvodi.korisnikId,
        ime: korisnik.ime,
        prezime: korisnik.prezime,
        email: korisnik.email,
        brojProizvoda: sql<number>`COUNT(${kupljeniProizvodi.proizvodId})`,
      })
      .from(kupljeniProizvodi)
      .innerJoin(korisnik, eq(kupljeniProizvodi.korisnikId, korisnik.id))
      .innerJoin(proizvod, eq(kupljeniProizvodi.proizvodId, proizvod.id))
      .where(eq(proizvod.prodavac, prodavacId))
      .groupBy(kupljeniProizvodi.korisnikId, korisnik.ime, korisnik.prezime, korisnik.email);

    return NextResponse.json({
      success: true,
      data: klijenti
    });

  } catch (error: unknown) {
    console.error('API /prodavac/klijenti error:', error);
    return NextResponse.json(
      { success: false, error: 'Greška na serveru prilikom dobavljanja podataka.' },
      { status: 500 }
    );
  }
});