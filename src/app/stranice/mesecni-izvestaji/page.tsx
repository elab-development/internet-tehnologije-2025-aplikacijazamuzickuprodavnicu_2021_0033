"use client";

import React, { useEffect, useState, Suspense } from "react";
import RoleGuard from "../../components/RoleGuard";
import { fetchMesecniIzvestaji } from "@/lib/izvestajiClient";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import {
  Users, TrendingUp, Calendar, AlertCircle, Loader2,
  Filter, ArrowUpRight, ArrowDownRight, LayoutList
} from "lucide-react";

interface MesecniPodatak {
  name: string;
  broj: number;
  puniDatum: string;
}

function StatistikaKlijenataSadrzaj() {
  const [data, setData] = useState<MesecniPodatak[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "last3">("all");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetchMesecniIzvestaji();
        if (res.success) {
          setData(res.data || []);
        } else {
          setError(res.error || "Greška pri učitavanju izveštaja.");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Greška na serveru.");
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const chartData = filter === "last3" ? data.slice(-3) : data;
  const ukupnoKlijenata = data.reduce((sum, curr) => sum + curr.broj, 0);
  const prosekPoMesecu = data.length > 0 ? (ukupnoKlijenata / data.length).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin mb-4" size={50} />
        <p className="font-bold uppercase tracking-widest text-gray-400">Generisanje izveštaja...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-10">
      <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-200">
        <h1 className="text-3xl font-black uppercase tracking-wide">Mesečni izveštaji</h1>
        <p className="text-gray-400 mt-2">Pregled registracija klijenata kroz vreme</p>
      </div>

      {error ? (
        <div className="bg-white rounded-3xl p-10 flex items-center gap-3 text-red-500 justify-center">
          <AlertCircle /> {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white flex items-center gap-4 p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="p-3 bg-gray-100 text-gray-700 rounded-2xl"><Users size={28} /></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ukupno klijenata</p>
                <p className="text-2xl font-black">{ukupnoKlijenata}</p>
              </div>
            </div>

            <div className="bg-white flex items-center gap-4 p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="p-3 bg-green-100 text-green-600 rounded-2xl"><TrendingUp size={28} /></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Prosek / Mesec</p>
                <p className="text-2xl font-black">{prosekPoMesecu}</p>
              </div>
            </div>

            <div className="bg-white flex items-center gap-4 p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><Calendar size={28} /></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Aktivni meseci</p>
                <p className="text-2xl font-black">{data.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
              <h3 className="text-lg font-bold flex items-center gap-2 uppercase tracking-tight">
                <Filter size={18} /> Vizuelni prikaz
              </h3>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${filter === 'all' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-600 hover:bg-white'}`}
                >
                  Svi meseci
                </button>
                <button
                  onClick={() => setFilter("last3")}
                  className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${filter === 'last3' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-600 hover:bg-white'}`}
                >
                  Poslednja 3 meseca
                </button>
              </div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorBroj" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1f2937" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1f2937" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="broj" stroke="#1f2937" strokeWidth={3} fillOpacity={1} fill="url(#colorBroj)" animationDuration={1200} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200 pb-10">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <LayoutList size={24} />
              <h3 className="text-xl font-bold uppercase tracking-wide">Detaljan istorijat po mesecima</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 font-bold uppercase text-xs tracking-widest">
                    <th className="p-6">Period</th>
                    <th className="p-6 text-center">Novi klijenti</th>
                    <th className="p-6 text-right">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.slice().reverse().map((m, i) => {
                    const currentIndex = data.findIndex(d => d.puniDatum === m.puniDatum);
                    const prevMonth = data[currentIndex - 1];
                    const isUp = prevMonth ? m.broj >= prevMonth.broj : true;

                    return (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="p-6 font-bold text-sm uppercase tracking-tight">{m.name}</td>
                        <td className="p-6 text-center">
                          <span className="font-black text-2xl bg-gray-100 px-6 py-2 rounded-xl">{m.broj}</span>
                        </td>
                        <td className="p-6 text-right">
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase border ${isUp ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                            {isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                            {isUp ? "Rast" : "Pad"}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function StatistikaKlijenataPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className="min-h-screen bg-gray-50 p-4 md:p-10">
        <div className="max-w-6xl mx-auto">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-40">
              <Loader2 className="animate-spin" size={60} />
            </div>
          }>
            <StatistikaKlijenataSadrzaj />
          </Suspense>
        </div>
      </div>
    </RoleGuard>
  );
}