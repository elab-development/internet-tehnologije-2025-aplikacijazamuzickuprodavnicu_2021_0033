"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Mail } from "lucide-react";
import RoleGuard from "../../components/RoleGuard";
import { fetchKorisnici } from "@/lib/korisniciClient";

interface Korisnik {
  id: string;
  ime: string;
  prezime: string;
  email: string;
  uloga: "KLIJENT" | "PRODAVAC" | "ADMIN";
}

function KorisnikTabela({ lista, headerColor }: { lista: Korisnik[]; headerColor: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className={headerColor}>
            <th className="p-4 font-bold uppercase text-sm">Korisnik</th>
            <th className="p-4 font-bold uppercase text-sm">Email</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {lista.map((k) => (
            <tr key={k.id} className="hover:bg-gray-50 transition-colors">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600 flex-none">
                    {k.ime[0]}{k.prezime[0]}
                  </div>
                  <span className="font-medium">{k.ime} {k.prezime}</span>
                </div>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <Mail size={16} />
                  <span className="text-sm">{k.email}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PregledKorisnikaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex justify-center items-center font-bold text-gray-400">
        Učitavanje...
      </div>
    }>
      <PregledKorisnikaContent />
    </Suspense>
  );
}

function PregledKorisnikaContent() {
  const [korisnici, setKorisnici] = useState<Korisnik[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function loadKorisnici() {
      try {
        const data = await fetchKorisnici();
        setKorisnici(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadKorisnici();
  }, []);

  const filtrirani = korisnici.filter(
    (k) =>
      k.ime.toLowerCase().includes(query.toLowerCase()) ||
      k.prezime.toLowerCase().includes(query.toLowerCase()) ||
      k.email.toLowerCase().includes(query.toLowerCase())
  );

  const prodavci = filtrirani.filter(k => k.uloga === "PRODAVAC");
  const admini = filtrirani.filter(k => k.uloga === "ADMIN");
  const klijenti = filtrirani.filter(k => k.uloga === "KLIJENT");

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className="min-h-screen bg-gray-50 p-6 md:p-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <header>
            <h1 className="text-4xl font-extrabold mb-2">Pregled korisnika</h1>
            <p className="text-gray-500 font-medium">Spisak svih registrovanih korisnika.</p>
          </header>

          <input
            type="text"
            placeholder="Pretraži po imenu, prezimenu ili emailu..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-4 rounded-2xl border border-gray-200 focus:outline-none focus:border-gray-400 bg-white font-medium"
          />

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold mb-4">Prodavci</h2>
            {prodavci.length === 0 ? (
              <p className="text-gray-400">Nema prodavaca u sistemu.</p>
            ) : (
              <KorisnikTabela lista={prodavci} headerColor="bg-gray-800 text-white" />
            )}
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold mb-4">Administratori</h2>
            {admini.length === 0 ? (
              <p className="text-gray-400">Nema administratora u sistemu.</p>
            ) : (
              <KorisnikTabela lista={admini} headerColor="bg-gray-600 text-white" />
            )}
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold mb-4">Klijenti</h2>
            {klijenti.length === 0 ? (
              <p className="text-gray-400">Nema registrovanih klijenata.</p>
            ) : (
              <KorisnikTabela lista={klijenti} headerColor="bg-gray-100 text-gray-700" />
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 pb-10">
            <div className="bg-gray-800 text-white p-5 rounded-2xl text-center">
              <p className="text-xs font-bold uppercase opacity-70">Prodavci</p>
              <p className="text-3xl font-black">{prodavci.length}</p>
            </div>
            <div className="bg-gray-600 text-white p-5 rounded-2xl text-center">
              <p className="text-xs font-bold uppercase opacity-70">Admini</p>
              <p className="text-3xl font-black">{admini.length}</p>
            </div>
            <div className="bg-gray-100 text-gray-800 p-5 rounded-2xl text-center">
              <p className="text-xs font-bold uppercase opacity-70">Klijenti</p>
              <p className="text-3xl font-black">{klijenti.length}</p>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}