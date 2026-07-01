import Image from "next/image";
import { Music, Disc, Headphones } from "lucide-react";

const zanrovi = [
  {
    id: 1,
    icon: <Music size={40} />,
    title: "Vinyl ploče",
    desc: "Nudimo bogatu kolekciju originalnih vinilnih ploča iz svih žanrova — od klasičnog rocka i jazza do savremene elektronske muzike. Svaka ploča je pažljivo odabrana i proverena."
  },
  {
    id: 2,
    icon: <Disc size={40} />,
    title: "CD albumi",
    desc: "Naša CD kolekcija obuhvata hiljade naslova od svetskih i domaćih izvođača. Idealno za ljubitelje kristalno čistog zvuka i kompletnih albumskih iskustava."
  },
  {
    id: 3,
    icon: <Headphones size={40} />,
    title: "Retke kasete",
    desc: "Za prave kolekcionare — nudimo odabrane kasete iz zlatnog doba analognog zvuka. Unikatni primerci koji nose posebnu nostalgičnu vrednost."
  },
];

export default function ONama() {
  return (
    <main className="min-h-screen bg-gray-50">

      <section className="pt-20 pb-10 px-6 text-center max-w-3xl mx-auto">
        <span className="text-gray-400 uppercase tracking-[0.3em] text-xs font-bold block mb-3">
          O prodavnici
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
          Muzika je <span className="italic font-serif text-gray-500">strast</span>
        </h1>
        <div className="w-16 h-0.5 bg-gray-300 mx-auto"></div>
      </section>

      <section className="pb-24 px-6 max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

        <div className="relative group w-full max-w-[380px] aspect-[3/4] flex-shrink-0">
          <div className="absolute -top-5 -left-5 w-full h-full bg-gray-200 rounded-sm transition-transform duration-500 group-hover:-translate-x-2 group-hover:-translate-y-2"></div>
          <div className="absolute -bottom-5 -right-5 w-full h-full border border-gray-400 rounded-sm z-0 transition-transform duration-500 group-hover:translate-x-2 group-hover:translate-y-2"></div>
          <div className="relative w-full h-full overflow-hidden shadow-xl z-10 bg-white p-2">
            <div className="relative w-full h-full overflow-hidden bg-gray-100 flex items-center justify-center">
              <Disc size={120} className="text-gray-300" />
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-8">
          <div className="relative pl-8 border-l border-gray-200">
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Naša prodavnica muzičkih ploča i CD-ova nastala je iz ljubavi prema muzici i želje da se svima omogući pristup kvalitetnoj muzičkoj kolekciji. Verujemo da muzika nije samo zvuk — ona je iskustvo, sećanje i emocija.
            </p>
            <p className="text-lg text-gray-500 leading-relaxed italic opacity-90">
              Godinama pažljivo biramo albume od najpoznatijih svetskih i domaćih izvođača, kako bismo našim kupcima ponudili jedinstven izbor koji zadovoljava sve ukuse — od klasičnog rocka i jazza do hip-hopa i elektronske muzike.
            </p>
          </div>

          <div className="flex items-center gap-8 md:gap-10 pt-4">
            <div className="text-center">
              <span className="block text-2xl font-bold text-gray-800">10+</span>
              <span className="text-[10px] uppercase tracking-widest text-gray-400">Godina rada</span>
            </div>
            <div className="w-px h-10 bg-gray-200"></div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-gray-800">5000+</span>
              <span className="text-[10px] uppercase tracking-widest text-gray-400">Naslova</span>
            </div>
            <div className="w-px h-10 bg-gray-200"></div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-gray-800">1000+</span>
              <span className="text-[10px] uppercase tracking-widest text-gray-400">Zadovoljnih kupaca</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-bold uppercase tracking-[0.2em] text-gray-800">
              Šta nudimo
            </h2>
            <div className="w-12 h-0.5 bg-gray-300 mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {zanrovi.map((z) => (
              <div key={z.id} className="text-center group">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-500 group-hover:bg-gray-800 group-hover:text-white transition-all duration-300">
                  {z.icon}
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-3 uppercase tracking-tight">
                  {z.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed px-4">
                  {z.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}