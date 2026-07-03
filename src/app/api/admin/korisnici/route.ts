import { NextResponse } from "next/server";
import { db } from "@/db";
import { korisnik } from "@/db/schema";
import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "tvoja_tajna_sifra_123";

/**
 * @swagger
 * /api/admin/korisnici:
 *   get:
 *     summary: Dobavljanje liste svih korisnika
 *     description: Vraća listu svih registrovanih korisnika. DOZVOLJENO SAMO ZA ADMINA.
 *     tags: [Korisnici]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Uspešno vraćena lista korisnika.
 *       401:
 *         description: Niste ulogovani.
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
      return NextResponse.json(
        { success: false, error: "Niste ulogovani." },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; uloga: string };
      if (decoded.uloga !== "ADMIN") {
        return NextResponse.json(
          { success: false, error: "Zabranjen pristup. Samo administrator može videti ove podatke." },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: "Sesija nevažeća ili je istekao token." },
        { status: 401 }
      );
    }

    const users = await db
      .select({
        id: korisnik.id,
        ime: korisnik.ime,
        prezime: korisnik.prezime,
        email: korisnik.email,
        uloga: korisnik.uloga,
        datumRegistracije: korisnik.datumRegistracije,
      })
      .from(korisnik);

    return NextResponse.json(users);

  } catch (error: unknown) {
    console.error("Greška na serveru (GET /api/admin/korisnici):", error);
    return NextResponse.json(
      { success: false, error: "Greška na serveru prilikom pristupa bazi podataka." },
      { status: 500 }
    );
  }
}