import { NextResponse } from "next/server";
import { db } from "@/db";
import { pesma, proizvod, kupljeniProizvodi } from "@/db/schema";
import { eq, asc, and } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "tvoja_tajna_sifra_123";

/**
 * @swagger
 * /api/klijent/kupljeni-proizvodi/{id}:
 *   get:
 *     summary: Detalji kupljenog proizvoda sa listom pesama
 *     description: Vraća podatke o albumu samo ako je ulogovani klijent zaista kupio taj proizvod.
 *     tags: [Proizvodi]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Jedinstveni ID proizvoda
 *     responses:
 *       200:
 *         description: Uspešno dobavljeni podaci.
 *       401:
 *         description: Niste ulogovani.
 *       403:
 *         description: Zabranjen pristup, proizvod nije kupljen.
 *       404:
 *         description: Proizvod nije pronađen.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: proizvodId } = await params;

    if (!proizvodId) {
      return NextResponse.json({ success: false, error: "Nedostaje ID proizvoda." }, { status: 400 });
    }

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

    let korisnikId = "";
    try {
      if (!token) throw new Error("Token nedostaje");
      const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
      korisnikId = decoded.sub;
    } catch {
      return NextResponse.json({ success: false, error: "Niste ulogovani ili je sesija nevažeća." }, { status: 401 });
    }

    const [proveraKupovine] = await db
      .select()
      .from(kupljeniProizvodi)
      .where(
        and(
          eq(kupljeniProizvodi.korisnikId, korisnikId),
          eq(kupljeniProizvodi.proizvodId, proizvodId)
        )
      )
      .limit(1);

    if (!proveraKupovine) {
      return NextResponse.json({
        success: false,
        error: "Zabranjen pristup. Niste kupili ovaj proizvod."
      }, { status: 403 });
    }

    const [proizvodPodaci] = await db
      .select()
      .from(proizvod)
      .where(eq(proizvod.id, proizvodId));

    if (!proizvodPodaci) {
      return NextResponse.json({ success: false, error: "Proizvod nije pronađen." }, { status: 404 });
    }

    const pesme = await db
      .select()
      .from(pesma)
      .where(eq(pesma.proizvodId, proizvodId))
      .orderBy(asc(pesma.poredak));

    return NextResponse.json({
      success: true,
      proizvod: proizvodPodaci,
      pesme,
    });

  } catch (error: unknown) {
    console.error('API /klijent/kupljeni-proizvodi/[id] GET error:', error);
    return NextResponse.json({ success: false, error: "Interna greška na serveru." }, { status: 500 });
  }
}