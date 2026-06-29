import Link from "next/link";
import { Music, Disc3, Headphones, ShoppingBag, Star, Truck } from "lucide-react";

const zanrovi = ["Rock", "Jazz", "Pop", "Hip-Hop", "Electronic", "Classical", "R&B", "Metal", "Folk", "Blues"];

const prednosti = [
  {
    icon: <Music size={32} />,
    title: "Bogata kolekcija",
    desc: "Više od 5000 naslova iz svih žanrova — vinyl ploče, CD-ovi i retke kasete."
  },
  {
    icon: <Star size={32} />,
    title: "Provereni kvalitet",
    desc: "Svaki proizvod prolazi kroz pažljivu proveru pre nego što dođe do vas."
  },
  {
    icon: <Truck size={32} />,
    title: "Brza dostava",
    desc: "Dostavljamo širom Srbije. Narudžbine obrađujemo u roku od 24 sata."
  },
];

export default function HomePage() {
  return (
    <main className="flex flex-col w-full overflow-x-hidden">

      {/* Hero sekcija */}
      <section className="relative w-full min-h-[80vh] bg-gray-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white opacity-5"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white opacity-5"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <Disc3 size={80} className="text-white opacity-80 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <span className="text-gray-400 uppercase tracking-[0.5em] text-xs font-bold mb-4 block">
            Prodavnica muzike
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tight mb-6">
            Zvuk koji<br />
            <span className="text-gray-400 italic font-serif">osećaš</span>
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed mb-12 max-w-2xl mx-auto">
            Otkrijte našu kolekciju vinilnih ploča, CD albuma i retkih kaseta.
            Muzika za sve ukuse — od klasičnog rocka do savremene elektronike.
          </p>
          <Link
            href="/stranice/svi-proizvodi"
            className="inline-flex items-center gap-3 bg-white text-gray-900 px-10 py-5 rounded-full text-lg font-bold uppercase tracking-widest hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl"
          >
            <ShoppingBag size={22} /> Istraži prodavnicu
          </Link>
        </div>
      </section>

      {/* Žanrovi ticker */}
      <section className="py-6 bg-gray-800 overflow-hidden">
        <div className="flex gap-8 animate-marquee whitespace-nowrap">
          {[...zanrovi, ...zanrovi, ...zanrovi].map((z, idx) => (
            <span key={idx} className="text-gray-400 font-bold uppercase tracking-widest text-sm flex items-center gap-3">
              <Disc3 size={14} className="text-gray-600" /> {z}
            </span>
          ))}
        </div>
      </section>

      {/* Prednosti sekcija */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black uppercase tracking-wide text-gray-800 mb-4">
              Zašto kupovati kod nas?
            </h2>
            <div className="w-16 h-1 bg-gray-800 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {prednosti.map((p, idx) => (
              <div key={idx} className="text-center group">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-600 group-hover:bg-gray-800 group-hover:text-white transition-all duration-300">
                  {p.icon}
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-3">{p.title}</h3>
                <p className="text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formati sekcija */}
      <section className="py-24 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black uppercase tracking-wide text-gray-800 mb-4">
              Naši formati
            </h2>
            <div className="w-16 h-1 bg-gray-800 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 text-white rounded-3xl p-10 text-center hover:scale-105 transition-transform duration-300">
              <Music size={48} className="mx-auto mb-6 opacity-80" />
              <h3 className="text-2xl font-black mb-3 uppercase">Vinyl</h3>
              <p className="text-gray-400">Topli analogni zvuk. Originalni pressing-i i reissuei najvažnijih albuma u istoriji muzike.</p>
            </div>

            <div className="bg-white text-gray-800 rounded-3xl p-10 text-center border-2 border-gray-800 hover:scale-105 transition-transform duration-300">
              <Disc3 size={48} className="mx-auto mb-6 opacity-80" />
              <h3 className="text-2xl font-black mb-3 uppercase">CD</h3>
              <p className="text-gray-500">Kristalno čist digitalni zvuk. Hiljade naslova od klasike do najnovijih izdanja.</p>
            </div>

            <div className="bg-gray-800 text-white rounded-3xl p-10 text-center hover:scale-105 transition-transform duration-300">
              <Headphones size={48} className="mx-auto mb-6 opacity-80" />
              <h3 className="text-2xl font-black mb-3 uppercase">Kasete</h3>
              <p className="text-gray-400">Nostalgični zvuk iz zlatnog doba. Retki i kolekcionar­ski primerci za prave entuzijaste.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA sekcija */}
      <section className="py-24 bg-gray-900 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <Disc3 size={60} className="text-gray-600 mx-auto mb-8" />
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-6">
            Pronađi svoju muziku
          </h2>
          <p className="text-gray-400 text-lg mb-12 leading-relaxed">
            Registruj se i počni da gradiš svoju muzičku kolekciju danas.
            Hiljde albuma čekaju na tebe.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-block bg-white text-gray-900 px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-gray-100 transition-all"
            >
              Registruj se
            </Link>
            <Link
              href="/stranice/svi-proizvodi"
              className="inline-block border-2 border-white text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-white hover:text-gray-900 transition-all"
            >
              Pregled kolekcije
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}