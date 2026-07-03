# Muzička Prodavnica - Veb aplikacija za kupovinu muzičkih ploča i CD-ova

Aplikacija je namenjena za prodaju vinilnih ploča, CD albuma i kaseta.
Ciljevi aplikacije su omogućavanje bezbednog i lakog pristupa muzičkim proizvodima, kao i poboljšanje korisničkog iskustva kroz jednostavnu registraciju, pregled ponude i online plaćanje.

## Funkcionalnosti aplikacije

**Za klijente:**
- Registracija i kreiranje korisničkog naloga
- Prijava i reset lozinke putem emaila
- Pregled prodavnice: vinyl ploče, CD-ovi, kasete
- Kupovina proizvoda i online plaćanje (Stripe)
- Pregled kupljenih albuma sa tracklistom
- Ostavljanje recenzija i ocena

**Za prodavce:**
- Dodavanje, izmena i brisanje proizvoda
- Upload slika albuma (Cloudinary)
- Unos trackliste za svaki album
- Pregled klijenata i statistike prodaje

**Za administratore:**
- Pregled svih korisnika sistema
- Dodavanje novih korisnika
- Mesečni izveštaji o registracijama klijenata
- Statistika prodaje po proizvodima sa grafikonima

## Tehnologije

**Frontend:** Next.js, React, TypeScript, TailwindCSS  
**Backend:** Next.js API Routes  
**Baza podataka:** PostgreSQL (Drizzle ORM)  
**Autentikacija:** JWT  
**Plaćanje:** Stripe  
**Upload slika:** Cloudinary  
**Email:** Nodemailer  
**Dokumentacija API-ja:** Swagger  
**Docker:** multi-stage build za izgradnju i deployment  

## Instalacija

**1. Kloniranje repozitorijuma:**
```bash
git clone https://github.com/elab-development/internet-tehnologije-2025-aplikacijazamuzickuprodavnicu_2021_0033.git
cd internet-tehnologije-2025-aplikacijazamuzickuprodavnicu_2021_0033
```

**2. Kreiranje .env fajla:**
```bash
cp .env.example .env
```
Popuniti vrednosti u `.env` fajlu.

**3. Pokretanje aplikacije:**
```bash
docker compose up --build
```

Baza podataka se automatski puni test podacima prilikom pokretanja.

**Aplikacija će biti dostupna na:** http://localhost:3000  
**Swagger dokumentacija:** http://localhost:3000/api/api-doc

## Test nalozi

| Uloga | Email | Lozinka |
|-------|-------|---------|
| Admin | marko@gmail.com | admin123 |
| Prodavac | nikola@gmail.com | prodavac123 |
| Klijent | ana@gmail.com | klijent123 |

## Struktura projekta

/src - Kod (komponente, stranice, API rute)
/public - Slike, ikone
drizzle.config.ts - Konfiguracija baze podataka
Dockerfile - Multi-stage build za Next.js aplikaciju
docker-compose.yml - Definisanje servisa: web, db, stripe