# Muzička Prodavnica - Veb aplikacija za kupovinu muzičkih ploča i CD-ova

Aplikacija je namenjena za prodaju vinilnih ploča, CD albuma i kaseta.
Ciljevi aplikacije su omogućavanje bezbednog i lakog pristupa muzičkim proizvodima, kao i poboljšanje korisničkog iskustva kroz jednostavnu registraciju, pregled ponude i online plaćanje.

## Funkcionalnosti aplikacije:

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
**Hosting/Deployment:** Docker Compose za lokalni razvoj

## Instalacija

**1. Kloniranje repozitorijuma:**

git clone https://github.com/username/naziv-repozitorijuma.git
cd naziv-repozitorijuma

**2. Kreiranje .env fajla sa potrebnim varijablama:**

DATABASE_URL=postgres://postgres:postgres@db:5432/muzika
NODE_ENV=production
JWT_SECRET=your_jwt_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
CSRF_SECRET=your_csrf_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
STRIPE_SECRET_KEY=your_stripe_key
GMAIL_USER=your@gmail.com
GMAIL_APP_PASSWORD=your_app_password
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=muzika

**3. Pokretanje Docker-a:**

docker-compose up --build

**4. Punjenje baze test podacima:**

docker exec -it nextjs_app_sminkanje npm run db:seed

**Aplikacija će biti dostupna na:**
http://localhost:3000

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
/drizzle.config.ts - Konfiguracija baze podataka
Dockerfile - Multi-stage build za Next.js aplikaciju
docker-compose.yml - Definisanje servisa: web, db, stripe