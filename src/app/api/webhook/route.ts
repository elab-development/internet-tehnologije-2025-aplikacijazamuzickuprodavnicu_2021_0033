import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db/index";
import { kupljeniProizvodi } from "@/db/schema";

/**
 * @swagger
 * /api/webhook:
 *   post:
 *     summary: Stripe Webhook prijemnik
 *     description: Prima događaje sa Stripe servisa. Kada se plaćanje uspešno završi, upisuje kupljene proizvode u bazu.
 *     tags: [Plaćanje]
 *     parameters:
 *       - in: header
 *         name: Stripe-Signature
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Uspešno primljen i obrađen događaj.
 *       400:
 *         description: Greška u verifikaciji potpisa.
 *       500:
 *         description: Greška na serveru.
 */
export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    console.error("Stripe ključevi nisu definisani u .env fajlu!");
    return new NextResponse("Server Configuration Error", { status: 500 });
  }

  const stripe = new Stripe(secretKey);
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook Signature Error:", msg);
    return new NextResponse(`Webhook Error: ${msg}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const korisnikId = session.metadata?.korisnikId;
    const proizvodIds = JSON.parse(session.metadata?.proizvodIds || "[]");
    const metoda = session.payment_method_types?.[0] || "card";

    if (!korisnikId || proizvodIds.length === 0) {
      return new NextResponse("Missing metadata", { status: 400 });
    }

    try {
      for (const proizvodId of proizvodIds) {
        await db.insert(kupljeniProizvodi).values({
          korisnikId,
          proizvodId: proizvodId.toString(),
          metodPlacanja: metoda,
          statusPlacanja: "PLAĆENO",
          datum: new Date(),
        });
      }
    } catch (dbError) {
      console.error("Baza podataka ERROR:", dbError);
      return new NextResponse("Database Error", { status: 500 });
    }
  }

  return new NextResponse("Success", { status: 200 });
}