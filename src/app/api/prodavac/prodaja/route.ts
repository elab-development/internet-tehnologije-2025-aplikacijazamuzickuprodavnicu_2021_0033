import { NextResponse } from "next/server";
import { db } from "@/db/index";
import { kupljeniProizvodi, proizvod, korisnik } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "tvoja_tajna_sifra_123";

/**
 * @swagger
 * /api/prodavac/prodaja:
 *   get:
 *     summary: Detaljan pregled prodaje po proizvodima
 *     description: Vraća listu svih proizvoda ulogovanog prodavca sa spiskom klijenata koji su ih kupili. DOZVOLJENO SAMO ZA PRODAVCE.
 *     tags: [Prodavac]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Uspešno dobavljeni podaci o prodaji.
 *       401:
 *         description: Niste ulogovani ili je sesija nevažeća.
 *       403:
 *         description: Zabranjen pristup.
 *       500:
 *         description: Greška na serveru.
 */
export async function GET() {
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
      return NextResponse.json({ success: false, error: "Sesija nevažeća." }, { status: 401 });
    }

    const rezultati = await db
      .select({
        proizvodId: proizvod.id,
        naziv: proizvod.naziv,
        izvodjac: proizvod.izvodjac,
        format: proizvod.format,
        klijentIme: korisnik.ime,
        klijentPrezime: korisnik.prezime,
        klijentEmail: korisnik.email,
        datumKupovine: kupljeniProizvodi.datum,
        metodPlacanja: kupljeniProizvodi.metodPlacanja,
        statusPlacanja: kupljeniProizvodi.statusPlacanja,
      })
      .from(proizvod)
      .leftJoin(kupljeniProizvodi, eq(proizvod.id, kupljeniProizvodi.proizvodId))
      .leftJoin(korisnik, eq(kupljeniProizvodi.korisnikId, korisnik.id))
      .where(eq(proizvod.prodavac, prodavacId))
      .orderBy(desc(kupljeniProizvodi.datum));

    const proizvodiSaKlijentima = rezultati.reduce((acc: {
      proizvodId: string;
      naziv: string;
      izvodjac: string;
      format: string;
      klijenti: {
        klijentIme: string | null;
        klijentPrezime: string | null;
        klijentEmail: string | null;
        datumKupovine: Date | null;
        metodPlacanja: string | null;
        statusPlacanja: string | null;
      }[];
    }[], curr) => {
      let proizvodObj = acc.find((item) => item.proizvodId === curr.proizvodId);

      if (!proizvodObj) {
        proizvodObj = {
          proizvodId: curr.proizvodId,
          naziv: curr.naziv,
          izvodjac: curr.izvodjac,
          format: curr.format,
          klijenti: []
        };
        acc.push(proizvodObj);
      }

      if (curr.klijentEmail) {
        proizvodObj.klijenti.push({
          klijentIme: curr.klijentIme,
          klijentPrezime: curr.klijentPrezime,
          klijentEmail: curr.klijentEmail,
          datumKupovine: curr.datumKupovine,
          metodPlacanja: curr.metodPlacanja,
          statusPlacanja: curr.statusPlacanja,
        });
      }
      return acc;
    }, []);

    return NextResponse.json({ success: true, data: proizvodiSaKlijentima });

  } catch (error: unknown) {
    console.error("Greška na serveru (GET /api/prodavac/prodaja):", error);
    return NextResponse.json(
      { success: false, error: "Sistem trenutno ne može da učita izveštaj o prodaji." },
      { status: 500 }
    );
  }
}