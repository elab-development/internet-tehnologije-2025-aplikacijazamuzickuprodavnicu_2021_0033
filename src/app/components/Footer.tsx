"use client";

import Link from "next/link";
import { Music, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Logo i opis */}
          <div>
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <Music size={20} className="text-gray-900" />
              </div>
              <span className="text-white font-black text-lg uppercase tracking-wide">Muzička Prodavnica</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Vaše odredište za vinyl ploče, CD-ove i retke kasete. Muzika za sve ukuse.
            </p>
          </div>

          {/* Brzi linkovi */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-wide mb-4 text-sm">Brzi linkovi</h3>
            <div className="space-y-2">
              <Link href="/stranice/svi-proizvodi" className="block text-sm hover:text-white transition-colors">Prodavnica</Link>
              <Link href="/stranice/o-meni" className="block text-sm hover:text-white transition-colors">O nama</Link>
              <Link href="/stranice/kontakt" className="block text-sm hover:text-white transition-colors">Kontakt</Link>
              <Link href="/register" className="block text-sm hover:text-white transition-colors">Registracija</Link>
            </div>
          </div>

          {/* Kontakt */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-wide mb-4 text-sm">Kontakt</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="flex-shrink-0" />
                <span>prodavnica@muzika.rs</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone size={16} className="flex-shrink-0" />
                <span>+381 6X XXX XXX</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={16} className="flex-shrink-0" />
                <span>Beograd, Srbija</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-sm">
          <p>© {new Date().getFullYear()} Muzička Prodavnica. Sva prava zadržana.</p>
        </div>
      </div>
    </footer>
  );
}