"use client";

import RoleGuard from "../../components/RoleGuard";
import { useCart } from "../../context/KorpaContext";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ChevronLeft, CheckCircle, Loader2, ShoppingBag } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function KorpaContent() {
  const { cart, removeFromCart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
  const [success] = useState(() => searchParams.get("success") === "true");

  const ukupno = cart.reduce((sum, item) => sum + Number(item.cena), 0);

  useEffect(() => {
    if (searchParams.get("success")) {
      clearCart();
    }
  }, []);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const tokenRes = await fetch('/api/csrf-token');
      const tokenData = await tokenRes.json();
      const csrfToken = tokenData.csrfToken;

      const response = await fetch("/api/klijent/checkout", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken
        },
        body: JSON.stringify({ items: cart }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Greška prilikom pokretanja plaćanja.");
        setLoading(false);
      }
    } catch (error: unknown) {
      console.error("Stripe error:", error);
      alert("Došlo je do greške. Pokušajte ponovo.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-200 max-w-md">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={50} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-black mb-2 uppercase tracking-tight">Uplata uspešna!</h1>
          <p className="text-gray-500 mb-8 font-medium">
            Hvala vam na kupovini! Vaši proizvodi su dodati u vašu kolekciju.
          </p>
          <Link
            href="/stranice/kupljeni-proizvodi"
            className="inline-block bg-gray-800 text-white px-10 py-3 rounded-xl font-bold hover:bg-gray-700 transition-all"
          >
            Moja kolekcija
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
        <ShoppingBag size={80} className="text-gray-200 mb-6" />
        <h1 className="text-3xl font-bold mb-4">Tvoja korpa je prazna</h1>
        <Link
          href="/stranice/svi-proizvodi"
          className="inline-flex items-center gap-2 bg-gray-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-700 transition-all"
        >
          <ChevronLeft size={20} /> Istraži prodavnicu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black mb-10 uppercase tracking-tight border-b-4 border-gray-200 inline-block pb-2">
          Tvoja korpa
        </h1>

        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-200">
          <div className="space-y-6">
            {cart.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-100 pb-6 gap-4">
                <div className="flex items-center gap-6 w-full">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 flex-shrink-0">
                    <Image src={item.slika || "/placeholder.jpg"} alt={item.naziv} fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl leading-tight">{item.naziv}</h3>
                    <p className="font-black text-lg mt-1 text-gray-500">{Number(item.cena).toLocaleString()} RSD</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-300 hover:text-red-500 p-2 transition-all hover:bg-red-50 rounded-full"
                  title="Ukloni iz korpe"
                >
                  <Trash2 size={24} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-10 p-8 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center">
            <div className="flex justify-between items-center w-full max-w-md mb-8">
              <span className="text-lg font-bold uppercase tracking-wide text-gray-600">Ukupno:</span>
              <span className="text-4xl font-black">{ukupno.toLocaleString()} RSD</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full max-w-md py-5 bg-gray-800 text-white rounded-2xl font-black text-xl hover:bg-gray-700 transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="animate-spin" /> Povezivanje sa Stripe-om...
                </div>
              ) : "POTVRDI I PLATI"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KorpaPage() {
  return (
    <RoleGuard allowedRoles={["KLIJENT"]}>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin" size={48} />
        </div>
      }>
        <KorpaContent />
      </Suspense>
    </RoleGuard>
  );
}