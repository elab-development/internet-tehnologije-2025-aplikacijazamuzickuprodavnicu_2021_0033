import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { proizvod, korisnik, pesma } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { cookies, headers } from 'next/headers';
import { csrf } from '@/lib/csrf';

const JWT_SECRET = process.env.JWT_SECRET || 'tvoja_tajna_sifra_123';

/**
 * @swagger
 * /api/proizvodi:
 *   get:
 *     summary: Vraća listu proizvoda
 *     description: |
 *       Pravila pristupa:
 *       - GOST ili KLIJENT: Vraća SVE dostupne proizvode u bazi.
 *       - PRODAVAC: Vraća samo proizvode čiji je on vlasnik.
 *       - ADMIN: Pristup zabranjen (403).
 *     tags: [Proizvodi]
 *     responses:
 *       200:
 *         description: Uspešno vraćeni podaci o proizvodima.
 *       403:
 *         description: Pristup zabranjen za ulogu ADMIN.
 *       500:
 *         description: Greška na serveru.
 */
export async function GET() {
  try {
    let userRole: string | null = null;
    let userId: string | null = null;
    let token: string | undefined;

    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get('auth')?.value;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; uloga?: string };
        userRole = decoded.uloga || null;
        userId = decoded.sub;
      } catch (e) {}
    }

    if (userRole === 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Administratori nemaju pravo pristupa listi proizvoda na ovoj ruti.' },
        { status: 403 }
      );
    }

    const query = db
      .select({
        id: proizvod.id,
        naziv: proizvod.naziv,
        izvodjac: proizvod.izvodjac,
        opis: proizvod.opis,
        cena: proizvod.cena,
        slika: proizvod.slika,
        zanr: proizvod.zanr,
        format: proizvod.format,
        godinaIzdavanja: proizvod.godinaIzdavanja,
        prodavacIme: korisnik.ime,
        prodavacPrezime: korisnik.prezime,
        prodavacId: proizvod.prodavac,
      })
      .from(proizvod)
      .leftJoin(korisnik, eq(proizvod.prodavac, korisnik.id));

    let rezultati;

    if (userRole === 'PRODAVAC' && userId) {
      rezultati = await query.where(eq(proizvod.prodavac, userId));
    } else {
      rezultati = await query;
    }

    return NextResponse.json({
      success: true,
      proizvodi: rezultati,
      userRole,
      userId
    });

  } catch (error: unknown) {
    console.error('API /proizvodi GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Greška pri učitavanju proizvoda.' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/proizvodi:
 *   post:
 *     summary: Kreiranje novog proizvoda
 *     description: Dozvoljeno samo korisnicima sa ulogom PRODAVAC.
 *     tags: [Proizvodi]
 *     security:
 *       - BearerAuth: []
 *       - CSRFToken: []
 *     parameters:
 *       - in: header
 *         name: x-csrf-token
 *         schema:
 *           type: string
 *         required: true
 *         description: CSRF zaštita
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [naziv, izvodjac, opis, cena, zanr, format, godinaIzdavanja, slika, pesme]
 *             properties:
 *               naziv: { type: string, example: "The Dark Side of the Moon" }
 *               izvodjac: { type: string, example: "Pink Floyd" }
 *               opis: { type: string, example: "Kultni album iz 1973." }
 *               cena: { type: number, example: 2500 }
 *               zanr: { type: string, example: "Rock" }
 *               format: { type: string, example: "Vinyl" }
 *               godinaIzdavanja: { type: number, example: 1973 }
 *               slika: { type: string, example: "https://putanja-do-slike.jpg" }
 *               pesme:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     naziv: { type: string }
 *                     trajanje: { type: string }
 *     responses:
 *       200:
 *         description: Proizvod je uspešno kreiran.
 *       401:
 *         description: Niste ulogovani.
 *       403:
 *         description: Pristup zabranjen ili CSRF token nije validan.
 *       500:
 *         description: Greška na serveru.
 */
export const POST = csrf(async function POST(request: Request) {
  try {
    let token: string | undefined;

    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get('auth')?.value;
    }

    if (!token) {
      return NextResponse.json({ success: false, error: 'Niste ulogovani.' }, { status: 401 });
    }

    let prodavacId: string;
    let uloga: string;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; uloga: string };
      prodavacId = decoded.sub;
      uloga = decoded.uloga;
    } catch {
      return NextResponse.json({ success: false, error: 'Sesija nevažeća ili istekla.' }, { status: 401 });
    }

    if (uloga !== 'PRODAVAC') {
      return NextResponse.json(
        { success: false, error: 'Pristup zabranjen. Samo prodavci mogu dodavati proizvode.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { naziv, izvodjac, opis, cena, zanr, format, godinaIzdavanja, slika, pesme } = body;

    if (!naziv || !izvodjac || !opis || !cena || !zanr || !format || !godinaIzdavanja || !slika) {
      return NextResponse.json({ success: false, error: 'Sva polja su obavezna.' }, { status: 400 });
    }

    await db.transaction(async (tx) => {
      const [noviProizvod] = await tx.insert(proizvod).values({
        naziv,
        izvodjac,
        opis,
        cena: cena.toString(),
        zanr,
        format,
        godinaIzdavanja,
        slika,
        prodavac: prodavacId,
      }).returning();

      if (pesme && pesme.length > 0) {
        const pesmeZaBazu = pesme.map((p: { naziv: string; trajanje: string }, index: number) => ({
          naziv: p.naziv,
          trajanje: p.trajanje.toString(),
          proizvodId: noviProizvod.id,
          poredak: index,
        }));
        await tx.insert(pesma).values(pesmeZaBazu);
      }
    });

    return NextResponse.json({ success: true, message: "Proizvod je uspešno kreiran." });

  } catch (error: unknown) {
    console.error('API /proizvodi POST error:', error);
    return NextResponse.json({ success: false, error: 'Greška pri čuvanju podataka.' }, { status: 500 });
  }
});