import "dotenv/config";
import { korisnik, proizvod, pesma } from "./schema";
import { db } from "./index";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function main() {
    console.log("Seed se pokreće...");

    const hash1 = await bcrypt.hash("admin123", 10);
    const hash2 = await bcrypt.hash("prodavac123", 10);
    const hash3 = await bcrypt.hash("klijent123", 10);

    await db.insert(korisnik).values([
        {
            ime: "Marko",
            prezime: "Petrović",
            email: "marko@gmail.com",
            lozinka: hash1,
            uloga: "ADMIN",
        },
        {
            ime: "Nikola",
            prezime: "Jovanović",
            email: "nikola@gmail.com",
            lozinka: hash2,
            uloga: "PRODAVAC",
        },
        {
            ime: "Ana",
            prezime: "Nikolić",
            email: "ana@gmail.com",
            lozinka: hash3,
            uloga: "KLIJENT",
        },
    ]).onConflictDoNothing({ target: korisnik.email });

    const prodavacData = await db
        .select()
        .from(korisnik)
        .where(eq(korisnik.email, "nikola@gmail.com"))
        .limit(1);

    if (prodavacData.length > 0) {
        const nikolaId = prodavacData[0].id;

        await db.insert(proizvod).values([
            {
                naziv: "The Dark Side of the Moon",
                izvodjac: "Pink Floyd",
                opis: "Kultni album Pink Floyd-a iz 1973. godine.",
                cena: "2500",
                zanr: "Rock",
                format: "Vinyl",
                godinaIzdavanja: 1973,
                slika: "https://res.cloudinary.com/izalj0as/image/upload/v1782671683/ud4ga9kvu2abn9ykrzuk.png",
                prodavac: nikolaId,
            },
            {
                naziv: "Thriller",
                izvodjac: "Michael Jackson",
                opis: "Najprodavaniji album svih vremena.",
                cena: "1800",
                zanr: "Pop",
                format: "CD",
                godinaIzdavanja: 1982,
                slika: "https://res.cloudinary.com/izalj0as/image/upload/v1782671727/zvgd3c1iaenzt0qudnuv.png",
                prodavac: nikolaId,
            },
        ]).onConflictDoNothing({ target: proizvod.naziv });

        const pinkFloydAlbum = await db
            .select()
            .from(proizvod)
            .where(eq(proizvod.naziv, "The Dark Side of the Moon"))
            .limit(1);

        if (pinkFloydAlbum.length > 0) {
            const postojecePesme = await db
                .select()
                .from(pesma)
                .where(eq(pesma.proizvodId, pinkFloydAlbum[0].id))
                .limit(1);

            if (postojecePesme.length === 0) {
                await db.insert(pesma).values([
                    { naziv: "Speak to Me", trajanje: "68", poredak: 1, proizvodId: pinkFloydAlbum[0].id },
                    { naziv: "Breathe", trajanje: "163", poredak: 2, proizvodId: pinkFloydAlbum[0].id },
                    { naziv: "Time", trajanje: "421", poredak: 3, proizvodId: pinkFloydAlbum[0].id },
                    { naziv: "Money", trajanje: "382", poredak: 4, proizvodId: pinkFloydAlbum[0].id },
                ]);
            }
        }

        console.log("✅ Uspešno ubačeni korisnici, proizvodi i pesme!");
    } else {
        console.log("❌ Greška: Prodavac nije pronađen.");
    }

    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Seed failed:");
    console.error(err);
    process.exit(1);
});