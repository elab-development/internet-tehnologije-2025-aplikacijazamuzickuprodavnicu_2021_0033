import { NextResponse } from "next/server";
import Stripe from "stripe";
import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";
import { db } from "@/db";
import { proizvod } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { csrf } from '@/lib/csrf';

const JWT_SECRET = process.env.JWT_SECRET || "tvoja_tajna_sifra_123";

/**
 * @swagger
 * /api/klijent/checkout:
 *   post:
 *     summary: Kreiranje Stripe Checkout sesije
 *     description: Inicijalizuje proces plaćanja. DOZVOLJENO SAMO ZA ULOGOVANE KLIJENTE.
 *     tags: [Plaćanje]
 *     security:
 *       - BearerAuth: []
 *       - CSRFToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *     responses:
 *       200:
 *         description: Uspešno kreirana sesija.
 *       401:
 *         description: Niste ulogovani.
 *       400:
 *         description: Neispravni podaci.
 *       500:
 *         description: Greška na serveru.
 */
export const POST = csrf(async function POST(req: Request) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Greška u konfiguraciji servera" }, { status: 500 });
    }

    const stripe = new Stripe(secretKey);
    const { items } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Korpa je prazna" }, { status: 400 });
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

    if (!token) return NextResponse.json({ error: "Niste ulogovani" }, { status: 401 });

    let korisnikId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
      korisnikId = decoded.sub;
    } catch {
      return NextResponse.json({ error: "Nevažeća sesija" }, { status: 401 });
    }

    const ids = items.map((i: { id: string }) => i.id.toString());
    const proizvodiIzBaze = await db.select().from(proizvod).where(inArray(proizvod.id, ids));

    if (proizvodiIzBaze.length === 0) {
      return NextResponse.json({ error: "Proizvodi nisu pronađeni u bazi" }, { status: 400 });
    }

    const lineItems = proizvodiIzBaze.map((p) => ({
      price_data: {
        currency: "rsd",
        product_data: {
          name: `${p.naziv} - ${p.izvodjac}`,
          images: p.slika ? [p.slika] : []
        },
        unit_amount: Math.round(Number(p.cena) * 100),
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/stranice/korpa?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/stranice/korpa?canceled=true`,
      metadata: {
        korisnikId,
        proizvodIds: JSON.stringify(proizvodiIzBaze.map(p => p.id.toString())),
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Nepoznata greška";
    console.error("Checkout Error:", msg);
    return NextResponse.json({ error: "Došlo je do greške pri kreiranju plaćanja." }, { status: 500 });
  }
});