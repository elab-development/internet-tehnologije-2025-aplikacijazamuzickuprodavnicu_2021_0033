CREATE TABLE "kupljeni_kursevi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"datum" timestamp NOT NULL,
	"metod_placanja" varchar(50) NOT NULL,
	"status_placanja" varchar(50) NOT NULL,
	"korisnik_id" uuid NOT NULL,
	"kurs_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kurs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"naziv" varchar(150) NOT NULL,
	"opis" varchar(1000) NOT NULL,
	"cena" numeric(10, 2) NOT NULL,
	"kategorija" varchar(100) NOT NULL,
	"slika" varchar(1000) NOT NULL,
	"edukator_id" uuid NOT NULL,
	CONSTRAINT "kurs_naziv_unique" UNIQUE("naziv")
);
--> statement-breakpoint
CREATE TABLE "napredak" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"odgledano" boolean NOT NULL,
	"korisnik_id" uuid NOT NULL,
	"video_lekcija_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_lekcija" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"naziv" varchar(150) NOT NULL,
	"trajanje" numeric NOT NULL,
	"opis" varchar(1000) NOT NULL,
	"video" varchar(1000) NOT NULL,
	"poredak" integer DEFAULT 0 NOT NULL,
	"kurs_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "korisnik" ADD COLUMN "brojTelefona" varchar(11) NOT NULL;--> statement-breakpoint
ALTER TABLE "korisnik" ADD COLUMN "datum_registracije" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "kupljeni_kursevi" ADD CONSTRAINT "kupljeni_kursevi_korisnik_id_korisnik_id_fk" FOREIGN KEY ("korisnik_id") REFERENCES "public"."korisnik"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kupljeni_kursevi" ADD CONSTRAINT "kupljeni_kursevi_kurs_id_kurs_id_fk" FOREIGN KEY ("kurs_id") REFERENCES "public"."kurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kurs" ADD CONSTRAINT "kurs_edukator_id_korisnik_id_fk" FOREIGN KEY ("edukator_id") REFERENCES "public"."korisnik"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "napredak" ADD CONSTRAINT "napredak_korisnik_id_korisnik_id_fk" FOREIGN KEY ("korisnik_id") REFERENCES "public"."korisnik"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "napredak" ADD CONSTRAINT "napredak_video_lekcija_id_video_lekcija_id_fk" FOREIGN KEY ("video_lekcija_id") REFERENCES "public"."video_lekcija"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_lekcija" ADD CONSTRAINT "video_lekcija_kurs_id_kurs_id_fk" FOREIGN KEY ("kurs_id") REFERENCES "public"."kurs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "korisnik" ADD CONSTRAINT "korisnik_brojTelefona_unique" UNIQUE("brojTelefona");