import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { proizvod, pesma, kupljeniProizvodi } from '@/db/schema';
import { eq, asc, and } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { cookies, headers } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'super_tajni_string_123';

async function getAuth() {
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

    if (!token) return null;
    return jwt.verify(token, JWT_SECRET) as { sub: string, uloga: string };
  } catch (e) {
    return null;
  }
}

/**
 * @swagger
 * /api/proizvodi/{id}:
 *   get:
 *     summary: Dobavljanje detalja o određenom proizvodu
 *     description: Vraća podatke o albumu/ploči uključujući listu pesama.
 *     tags: [Proizvodi]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID proizvoda
 *     responses:
 *       200:
 *         description: Uspešno vraćeni podaci o proizvodu.
 *       403:
 *         description: Pristup zabranjen za ADMIN ulogu.
 *       404:
 *         description: Proizvod nije pronađen.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: proizvodId } = await params;
    const auth = await getAuth();

    if (auth?.uloga === 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Admini nemaju pristup detaljima proizvoda.' }, { status: 403 });
    }

    const [proizvodPodaci] = await db.select().from(proizvod).where(eq(proizvod.id, proizvodId));
    if (!proizvodPodaci) {
      return NextResponse.json({ success: false, error: 'Proizvod nije pronađen.' }, { status: 404 });
    }

    let jeKupljen = false;
    if (auth) {
      const [kupovina] = await db
        .select()
        .from(kupljeniProizvodi)
        .where(and(
          eq(kupljeniProizvodi.proizvodId, proizvodId),
          eq(kupljeniProizvodi.korisnikId, auth.sub)
        ))
        .limit(1);

      if (kupovina || String(proizvodPodaci.prodavac) === String(auth.sub)) {
        jeKupljen = true;
      }
    }

    const pesme = await db
      .select()
      .from(pesma)
      .where(eq(pesma.proizvodId, proizvodId))
      .orderBy(asc(pesma.poredak));

    return NextResponse.json({
      success: true,
      proizvod: {
        ...proizvodPodaci,
        pesme,
        jeKupljen,
      }
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Nepoznata greška';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/proizvodi/{id}:
 *   patch:
 *     summary: Ažuriranje postojećeg proizvoda
 *     description: Dozvoljava PRODAVCU da izmeni podatke o svom proizvodu.
 *     tags: [Proizvodi]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               naziv: { type: string }
 *               izvodjac: { type: string }
 *               opis: { type: string }
 *               cena: { type: number }
 *               zanr: { type: string }
 *               format: { type: string }
 *               godinaIzdavanja: { type: number }
 *               slika: { type: string }
 *     responses:
 *       200:
 *         description: Proizvod uspešno ažuriran.
 *       401:
 *         description: Niste ulogovani.
 *       403:
 *         description: Nemate dozvolu.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const csrfToken = request.headers.get("x-csrf-token");
  if (!csrfToken || csrfToken !== process.env.CSRF_SECRET) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ message: "CSRF zaštita: nevalidan token" }, { status: 403 });
    }
  }

  try {
    const { id: proizvodId } = await params;
    const body = await request.json();
    const { naziv, izvodjac, opis, cena, zanr, format, godinaIzdavanja, slika } = body;

    const auth = await getAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Niste ulogovani.' }, { status: 401 });
    }

    const [postojeciProizvod] = await db.select().from(proizvod).where(eq(proizvod.id, proizvodId));
    if (!postojeciProizvod) {
      return NextResponse.json({ error: 'Proizvod ne postoji.' }, { status: 404 });
    }

    if (String(postojeciProizvod.prodavac) !== String(auth.sub)) {
      return NextResponse.json({ error: 'Zabranjen pristup - niste vlasnik proizvoda.' }, { status: 403 });
    }

    await db.update(proizvod).set({
      naziv, izvodjac, opis,
      cena: cena.toString(),
      zanr, format, godinaIzdavanja, slika
    }).where(eq(proizvod.id, proizvodId));

    return NextResponse.json({ success: true, message: 'Proizvod je uspešno ažuriran.' });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Nepoznata greška';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/proizvodi/{id}:
 *   delete:
 *     summary: Brisanje proizvoda
 *     description: Briše proizvod ako nema prodaja. Zahteva vlasništvo.
 *     tags: [Proizvodi]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proizvod uspešno obrisan.
 *       400:
 *         description: Nije moguće obrisati prodat proizvod.
 *       403:
 *         description: Zabranjen pristup.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const csrfToken = request.headers.get("x-csrf-token");
  if (!csrfToken || csrfToken !== process.env.CSRF_SECRET) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ message: "CSRF zaštita" }, { status: 403 });
    }
  }

  try {
    const { id: proizvodId } = await params;
    const auth = await getAuth();

    if (!auth) {
      return NextResponse.json({ success: false, error: 'Niste ulogovani.' }, { status: 401 });
    }

    const [provera] = await db.select().from(proizvod).where(eq(proizvod.id, proizvodId));
    if (!provera) {
      return NextResponse.json({ success: false, error: 'Proizvod ne postoji.' }, { status: 404 });
    }

    if (String(provera.prodavac) !== String(auth.sub)) {
      return NextResponse.json({ success: false, error: 'Nemate dozvolu.' }, { status: 403 });
    }

    const prodaje = await db
      .select()
      .from(kupljeniProizvodi)
      .where(eq(kupljeniProizvodi.proizvodId, proizvodId))
      .limit(1);

    if (prodaje.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Nije moguće obrisati proizvod koji je već kupljen!' },
        { status: 400 }
      );
    }

    await db.transaction(async (tx) => {
      await tx.delete(pesma).where(eq(pesma.proizvodId, proizvodId));
      await tx.delete(proizvod).where(eq(proizvod.id, proizvodId));
    });

    return NextResponse.json({ success: true, message: 'Proizvod je uspešno obrisan.' });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Nepoznata greška';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}