"use client";

import Link from "next/link";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Music, ShoppingCart, LogOut } from "lucide-react";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const uloga = user?.uloga;

  const linkStyle = "text-sm font-medium text-gray-300 hover:text-white transition-colors";

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
            <Music size={18} className="text-gray-900" />
          </div>
          <span className="text-white font-black text-lg uppercase tracking-wide hidden md:block">
            Muzička Prodavnica
          </span>
        </Link>

        {/* Navigacija */}
        <div className="flex items-center gap-6">

          {!user && (
            <>
              <Link href="/stranice/o-meni" className={linkStyle}>O nama</Link>
              <Link href="/stranice/kontakt" className={linkStyle}>Kontakt</Link>
              <Link href="/login" className="text-sm font-bold text-gray-300 hover:text-white transition-colors">Prijava</Link>
              <Link href="/register" className="bg-white text-gray-900 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all">
                Registracija
              </Link>
            </>
          )}

          {uloga === "KLIJENT" && (
            <>
              <Link href="/stranice/svi-proizvodi" className={linkStyle}>Prodavnica</Link>
              <Link href="/stranice/kupljeni-proizvodi" className={linkStyle}>Moja kolekcija</Link>
              <Link href="/stranice/o-meni" className={linkStyle}>O nama</Link>
              <Link href="/stranice/kontakt" className={linkStyle}>Kontakt</Link>
              <Link href="/stranice/korpa" className="text-gray-300 hover:text-white transition-colors">
                <ShoppingCart size={22} />
              </Link>
              <button onClick={logout} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                <LogOut size={18} /> Logout
              </button>
            </>
          )}

          {uloga === "PRODAVAC" && (
            <>
              <Link href="/stranice/pregled-klijenata" className={linkStyle}>Klijenti</Link>
              <Link href="/stranice/svi-proizvodi" className={linkStyle}>Proizvodi</Link>
              <Link href="/stranice/dodaj-proizvod" className={linkStyle}>Dodaj</Link>
              <Link href="/stranice/brisanje-proizvoda" className={linkStyle}>Obriši</Link>
              <Link href="/stranice/izmeni-proizvod" className={linkStyle}>Izmeni</Link>
              <Link href="/stranice/pregled-prodaje-proizvoda" className={linkStyle}>Prodaja</Link>
              <button onClick={logout} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                <LogOut size={18} /> Logout
              </button>
            </>
          )}

          {uloga === "ADMIN" && (
            <>
              <Link href="/stranice/pregled-korisnika" className={linkStyle}>Korisnici</Link>
              <Link href="/stranice/dodaj-korisnika" className={linkStyle}>Dodaj korisnika</Link>
              <Link href="/stranice/mesecni-izvestaji" className={linkStyle}>Izveštaji</Link>
              <Link href="/stranice/statistika-prodaje" className={linkStyle}>Statistika</Link>
              <button onClick={logout} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                <LogOut size={18} /> Logout
              </button>
            </>
          )}

        </div>
      </nav>
    </header>
  );
}