import { NextResponse } from "next/server";
import { csrf } from '@/lib/csrf';
import { dodajKorisnikaAction } from "@/app/actions/korisnik";
import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "tvoja_tajna_sifra_123";

/**
 * @swagger
 * /api/admin/korisnik:
 *   post:
 *     summary: Ručno dodavanje novog korisnika
 *     description: Kreira novog korisnika u bazi podataka. DOZVOLJENO SAMO ZA ADMINA.
 *     tags: [Korisnici]
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
 *             required: [ime, prezime, email, lozinka, uloga]
 *             properties:
 *               ime: { type: string, example: Jovan }
 *               prezime: { type: string, example: Jovanović }
 *               email: { type: string, format: email, example: jovan@example.com }
 *               lozinka: { type: string, format: password, example: Sifra123! }
 *               uloga: { type: string, enum: [KLIJENT, PRODAVAC, ADMIN], example: KLIJENT }
 *     responses:
 *       200:
 *         description: Uspešno dodat korisnik.
 *       401:
 *         description: Niste ulogovani.
 *       403:
 *         description: Zabranjen pristup.
 *       500:
 *         description: Greška na serveru.
 */
export const POST = csrf(async function POST(req: Request) {
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

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; uloga: string };
      if (decoded.uloga !== "ADMIN") {
        return NextResponse.json(
          { success: false, error: "Zabranjen pristup. Samo administrator može dodavati korisnike." },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json({ success: false, error: "Sesija nevažeća ili je istekla." }, { status: 401 });
    }

    const body = await req.json() as {
      ime: string;
      prezime: string;
      email: string;
      lozinka: string;
      uloga: "ADMIN" | "KLIJENT" | "PRODAVAC";
    };

    if (!body.email || !body.lozinka || !body.uloga) {
      return NextResponse.json(
        { success: false, error: "Nedostaju obavezni podaci (email, lozinka ili uloga)." },
        { status: 400 }
      );
    }

    const result = await dodajKorisnikaAction(body);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

  } catch (err: unknown) {
    console.error("Greška u API ruti /api/admin/korisnik:", err);
    return NextResponse.json(
      { success: false, error: "Greška na serveru prilikom dodavanja korisnika." },
      { status: 500 }
    );
  }
});