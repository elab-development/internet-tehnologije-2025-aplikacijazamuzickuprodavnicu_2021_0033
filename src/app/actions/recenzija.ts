"use server";
import { db } from "@/db/index";
import { recenzija } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "tvoja_tajna_sifra_123";

export async function sacuvajRecenziju(proizvodId: string, ocena: number, komentar?: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth")?.value;
    if (!token) return { success: false, error: "Niste ulogovani" };

    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
    const korisnikId = decoded.sub;

    if (ocena < 1 || ocena > 5) {
      return { success: false, error: "Ocena mora biti između 1 i 5." };
    }

    const postojeca = await db
      .select()
      .from(recenzija)
      .where(
        and(
          eq(recenzija.korisnikId, korisnikId),
          eq(recenzija.proizvodId, proizvodId)
        )
      )
      .limit(1);

    if (postojeca.length > 0) {
      await db.update(recenzija).set({
        ocena,
        komentar: komentar || null,
      }).where(
        and(
          eq(recenzija.korisnikId, korisnikId),
          eq(recenzija.proizvodId, proizvodId)
        )
      );
    } else {
      await db.insert(recenzija).values({
        korisnikId,
        proizvodId,
        ocena,
        komentar: komentar || null,
      });
    }

    return { success: true };
  } catch (err) {
    console.error("Greška pri čuvanju recenzije:", err);
    return { success: false, error: "Greška na serveru." };
  }
}

export async function getRecenzijeZaProizvod(proizvodId: string) {
  try {
    const rezultati = await db
      .select()
      .from(recenzija)
      .where(eq(recenzija.proizvodId, proizvodId));

    return { success: true, data: rezultati };
  } catch {
    return { success: false, error: "Greška pri učitavanju recenzija." };
  }
}