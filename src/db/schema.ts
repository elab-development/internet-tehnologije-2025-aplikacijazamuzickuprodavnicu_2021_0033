import { integer, numeric, pgEnum, pgTable, uuid, varchar, timestamp, boolean } from "drizzle-orm/pg-core";

export const ulogaEnum = pgEnum("uloga", [
  "ADMIN",
  "KLIJENT",
  "PRODAVAC",
]);

export const korisnik = pgTable("korisnik", {
  id: uuid("id").primaryKey().defaultRandom(),
  ime: varchar("ime", { length: 100 }).notNull(),
  prezime: varchar("prezime", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  lozinka: varchar("lozinka", { length: 255 }).notNull(),
  uloga: ulogaEnum("uloga").notNull(),
  datumRegistracije: timestamp("datum_registracije").defaultNow().notNull(),
  resetToken: varchar("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry", { withTimezone: true, mode: "date" }),
});

export const proizvod = pgTable("proizvod", {
  id: uuid("id").primaryKey().defaultRandom(),
  naziv: varchar("naziv", { length: 150 }).notNull().unique(),
  izvodjac: varchar("izvodjac", { length: 150 }).notNull(),
  opis: varchar("opis", { length: 1000 }).notNull(),
  cena: numeric("cena", { precision: 10, scale: 2 }).notNull(),
  zanr: varchar("zanr", { length: 100 }).notNull(),
  format: varchar("format", { length: 50 }).notNull(), // "Vinyl" | "CD" | "Kaseta"
  godinaIzdavanja: integer("godina_izdavanja").notNull(),
  slika: varchar("slika", { length: 1000 }).notNull(),
  prodavac: uuid("prodavac_id").references(() => korisnik.id).notNull(),
});

export const pesma = pgTable("pesma", {
  id: uuid("id").primaryKey().defaultRandom(),
  naziv: varchar("naziv", { length: 150 }).notNull(),
  trajanje: numeric("trajanje").notNull(), // u sekundama
  poredak: integer("poredak").notNull().default(0),
  proizvodId: uuid("proizvod_id")
    .references(() => proizvod.id, { onDelete: "cascade" })
    .notNull(),
});

export const kupljeniProizvodi = pgTable(
  "kupljeni_proizvodi",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    datum: timestamp("datum").notNull(),
    metodPlacanja: varchar("metod_placanja", { length: 50 }).notNull(),
    statusPlacanja: varchar("status_placanja", { length: 50 }).notNull(),
    korisnikId: uuid("korisnik_id")
      .references(() => korisnik.id)
      .notNull(),
    proizvodId: uuid("proizvod_id")
      .references(() => proizvod.id)
      .notNull(),
  },
  (table) => ({
    uniqueKupovina: {
      columns: [table.korisnikId, table.proizvodId],
      unique: true,
    },
  })
);

export const recenzija = pgTable(
  "recenzija",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ocena: integer("ocena").notNull(), // 1-5
    komentar: varchar("komentar", { length: 1000 }),
    datumKreiranja: timestamp("datum_kreiranja").defaultNow().notNull(),
    korisnikId: uuid("korisnik_id")
      .references(() => korisnik.id)
      .notNull(),
    proizvodId: uuid("proizvod_id")
      .references(() => proizvod.id)
      .notNull(),
  },
  (table) => ({
    uniqueRecenzija: {
      columns: [table.korisnikId, table.proizvodId],
      unique: true,
    },
  })
);