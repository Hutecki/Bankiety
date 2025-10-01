"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SuchyPage() {
  const [suchy, setSuchy] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuchy();
  }, []);

  const fetchSuchy = async () => {
    try {
      const response = await fetch("/api/suchy");
      if (response.ok) {
        const data = await response.json();
        setSuchy(data);
      }
    } catch (error) {
      console.error("Błąd podczas pobierania produktów suchych:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Zarządzanie Produktami Suchymi
          </h1>
          <p className="text-gray-600 text-lg">
            Wybierz rodzaj produktu suchego do zarządzania
          </p>
          <Link
            href="/"
            className="inline-block mt-4 text-amber-600 hover:text-amber-800 underline cursor-pointer"
          >
            ← Powrót do strony głównej
          </Link>
        </div>

        {/* Product Selection */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Kawa */}
          <Link href="/suchy/kawa" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent group-hover:border-amber-400 min-h-[16rem] flex items-center">
              <div className="text-center w-full">
                <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">☕</div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                  Kawa
                </h3>
                <p className="text-gray-600 mb-2 sm:mb-4">
                  Kawa mielona i ziarnista
                </p>
                {loading ? (
                  <div className="text-gray-500">Ładowanie...</div>
                ) : (
                  <div className="text-xl sm:text-2xl font-bold text-amber-600">
                    {suchy
                      .filter((n) => n.podkategoria === "kawa")
                      .reduce((sum, n) => sum + n.aktualnaIlosc, 0)
                      .toFixed(2)}{" "}
                    kg
                  </div>
                )}
              </div>
            </div>
          </Link>

          {/* Cukier */}
          <Link href="/suchy/cukier" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent group-hover:border-pink-400 min-h-[16rem] flex items-center">
              <div className="text-center w-full">
                <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">🍬</div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                  Cukier
                </h3>
                <p className="text-gray-600 mb-2 sm:mb-4">
                  Cukier brązowy i biały
                </p>
                {loading ? (
                  <div className="text-gray-500">Ładowanie...</div>
                ) : (
                  <div className="text-xl sm:text-2xl font-bold text-pink-600">
                    {suchy
                      .filter((n) => n.podkategoria === "cukier")
                      .reduce((sum, n) => sum + n.aktualnaIlosc, 0)
                      .toFixed(2)}{" "}
                    kg
                  </div>
                )}
              </div>
            </div>
          </Link>
        </div>

        {/* No Data Message */}
        {suchy.length === 0 && !loading && (
          <div className="text-center py-12 mt-12">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Brak produktów suchych w bazie
            </h2>
            <p className="text-gray-600 mb-6">
              Rozpocznij od dodania produktów suchych do magazynu
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
