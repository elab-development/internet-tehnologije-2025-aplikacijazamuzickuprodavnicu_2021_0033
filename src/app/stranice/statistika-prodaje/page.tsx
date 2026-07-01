"use client";

import React, { useEffect, useState, Suspense } from "react";
import RoleGuard from "../../components/RoleGuard";
import { fetchStatistikaProdaje } from "@/lib/izvestajiClient";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { ShoppingCart, TrendingUp, Award, Loader2, AlertCircle, LayoutList, Music } from "lucide-react";

const COLORS = ["#1a1a2e", "#16213e", "#0f3460", "#533483", "#e94560", "#6c757d"];

interface ProizvodStatistika {
  id: string;
  naziv: string;
  izvodjac: string;
  zanr: string;
  format: string;
  cena: number;
  brojProdaja: number;
  prihod: number;
}

export default function StatistikaProdajePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="animate-spin" size={60} />
      </div>
    }>
      <StatistikaProdajeContent />
    </Suspense>
  );
}

function StatistikaProdajeContent() {
  const [data, setData] = useState<ProizvodStatistika[]>([]);
  const [ukupniPrihod, setUkupniPrihod] = useState(0);
  const [ukupnoProdato, setUkupnoProdato] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetchStatistikaProdaje();
        if (res.success) {
          setData(res.data || []);
          setUkupniPrihod(res.ukupniPrihod || 0);
          setUkupnoProdato(res.ukupnoProdato || 0);
        } else {
          setError(res.error || "Greška pri učitavanju statistike.");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Došlo je do greške.");
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className="min-h-screen bg-gray-50 p-4 md:p-10">
        <div className="max-w-7xl mx-auto">

          <div className="bg-white rounded-3xl p-8 mb-10 shadow-sm border border-gray-200 text-center">
            <h1 className="text-3xl font-black uppercase tracking-wide">Statistika prodaje</h1>
            <p className="text-gray-400 mt-2">Pregled prometa i uspešnosti svakog proizvoda</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin" size={60} />
            </div>
          ) : error ? (
            <div className="bg-white rounded-3xl p-10 text-red-500 text-center">
              <AlertCircle className="mx-auto mb-2" size={40} />
              <p className="font-bold">{error}</p>
            </div>
          ) : (
            <div className="space-y-10">

              {/* KPI kartice */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white flex items-center gap-5 shadow-sm border-l-8 border-green-500 p-6 rounded-2xl">
                  <div className="p-4 bg-green-100 text-green-600 rounded-full">
                    <Music size={35} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ukupni prihod</p>
                    <p className="text-3xl font-black">{ukupniPrihod.toLocaleString()} RSD</p>
                  </div>
                </div>

                <div className="bg-white flex items-center gap-5 shadow-sm border-l-8 border-blue-500 p-6 rounded-2xl">
                  <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
                    <ShoppingCart size={35} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Prodatih primeraka</p>
                    <p className="text-3xl font-black">{ukupnoProdato}</p>
                  </div>
                </div>

                <div className="bg-white flex items-center gap-5 shadow-sm border-l-8 border-yellow-500 p-6 rounded-2xl">
                  <div className="p-4 bg-yellow-100 text-yellow-600 rounded-full flex-shrink-0">
                    <Award size={35} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Najprodavaniji</p>
                    <p className="text-lg font-black leading-tight">{data[0]?.naziv || "/"}</p>
                    <p className="text-sm text-gray-400">{data[0]?.izvodjac || ""}</p>
                  </div>
                </div>
              </div>

              {/* Grafici */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 shadow-sm rounded-3xl border border-gray-200">
                  <h3 className="text-lg font-bold mb-8 uppercase tracking-tight flex items-center gap-2">
                    <TrendingUp size={20} /> Prihod po proizvodu (RSD)
                  </h3>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data} layout="vertical" margin={{ left: 30, right: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="naziv" type="category" width={120} fontSize={10} tick={{ fill: '#374151', fontWeight: 'bold' }} />
                        <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} />
                        <Bar dataKey="prihod" fill="#1f2937" radius={[0, 10, 10, 0]} barSize={25} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-8 shadow-sm rounded-3xl border border-gray-200">
                  <h3 className="text-lg font-bold mb-8 uppercase tracking-tight flex items-center gap-2">
                    <LayoutList size={20} /> Udeo u broju prodaja
                  </h3>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data} dataKey="brojProdaja" nameKey="naziv" cx="50%" cy="50%" outerRadius={100} innerRadius={60} paddingAngle={5} label>
                          {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Tabela */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200 mb-20">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-bold uppercase tracking-wide flex items-center gap-3">
                    <LayoutList /> Specifikacija prodaje po proizvodu
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 font-bold uppercase text-xs tracking-widest">
                        <th className="p-6">Naziv</th>
                        <th className="p-6">Izvođač</th>
                        <th className="p-6">Žanr</th>
                        <th className="p-6">Format</th>
                        <th className="p-6 text-center">Cena (RSD)</th>
                        <th className="p-6 text-center">Prodato</th>
                        <th className="p-6 text-right">Prihod (RSD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.map((p, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="p-6 font-bold text-sm">{p.naziv}</td>
                          <td className="p-6 text-gray-500 text-sm">{p.izvodjac}</td>
                          <td className="p-6">
                            <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded">{p.zanr}</span>
                          </td>
                          <td className="p-6">
                            <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded">{p.format}</span>
                          </td>
                          <td className="p-6 text-center font-bold text-gray-500">{p.cena.toLocaleString()}</td>
                          <td className="p-6 text-center">
                            <span className="bg-blue-50 text-blue-600 font-black px-4 py-1 rounded-full text-sm">{p.brojProdaja}</span>
                          </td>
                          <td className="p-6 text-right font-black text-lg">{p.prihod.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-800 text-white">
                        <td colSpan={5} className="p-6 font-bold uppercase tracking-widest">Ukupno:</td>
                        <td className="p-6 text-center font-black text-xl">{ukupnoProdato}</td>
                        <td className="p-6 text-right font-black text-2xl">{ukupniPrihod.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}