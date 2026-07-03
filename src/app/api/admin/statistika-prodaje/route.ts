import { NextResponse } from "next/server";
import { getStatistikaProdajeProizvoda } from "@/app/actions/admin";
import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "tvoja_tajna_sifra_123";

/**
 * @swagger
 * /api/admin/statistika-prodaje:
 *   get:
 *     summary: Statistika prodaje po proizvodima
 *     description: Vraća zbirne podatke o prodaji za svaki proizvod. DOZVOLJENO SAMO ZA ADMINA.
 *     tags: [Izveštaji]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Uspešno dobavljena statistika prodaje.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       naziv:
 *                         type: string
 *                         description: Naziv albuma/ploče
 *                       izvodjac:
 *                         type: string
 *                         description: Ime izvođača
 *                       prihod:
 *                         type: number
 *                         description: Ukupna zarada od ovog proizvoda
 *                       prodato:
 *                         type: integer
 *                         description: Broj prodatih primeraka
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
      return NextResponse.json({ success: false, error: "Niste ulogovani." }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; uloga: string };
      if (decoded.uloga !== "ADMIN") {
        return NextResponse.json(
          { success: false, error: "Zabranjen pristup. Samo administrator može videti statistiku." },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json({ success: false, error: "Sesija nevažeća ili je istekla." }, { status: 401 });
    }

    const res = await getStatistikaProdajeProizvoda();

    if (res.success) {
      return NextResponse.json(res);
    } else {
      const statusKod = (res as { status?: number }).status || 500;
      return NextResponse.json(
        { success: false, error: res.error },
        { status: statusKod }
      );
    }

  } catch (error: unknown) {
    console.error("Greška u API ruti /api/admin/statistika-prodaje:", error);
    return NextResponse.json(
      { success: false, error: "Greška na serveru prilikom generisanja statistike." },
      { status: 500 }
    );
  }
}