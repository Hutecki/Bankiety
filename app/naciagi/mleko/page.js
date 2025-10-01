"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function MlekoPage() {
  const [naciagi, setNaciagi] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNaciagi();
  }, []);

  const fetchNaciagi = async () => {
    try {
      const response = await fetch("/api/naciagi");
      if (response.ok) {
        const data = await response.json();
        setNaciagi(data);
      }
    } catch (error) {
      console.error("Błąd podczas pobierania naciągów:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Zarządzanie Mlekiem
          </h1>
          <p className="text-gray-600 text-lg">
            Wybierz rodzaj mleka do zarządzania
          </p>
          <Link
            href="/naciagi"
            className="inline-block mt-4 text-green-600 hover:text-green-800 underline cursor-pointer"
          >
            ← Powrót do naciągów
          </Link>
        </div>

        {/* Product Selection */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Mleko Zwykłe */}
          <Link href="/naciagi/mleko/mleko-zwykle" className="group">
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent group-hover:border-blue-300 h-64 flex items-center">
              <div className="text-center w-full">
                <div className="text-8xl mb-6">🥛</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  Mleko Zwykłe
                </h3>
                <p className="text-gray-600 mb-4">Tradycyjne mleko</p>
                {loading ? (
                  <div className="text-gray-500">Ładowanie...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-blue-600">
                      {naciagi
                        .filter((n) => n.podkategoria === "mleko zwykle")
                        .reduce((sum, n) => sum + n.aktualnaIlosc, 0)}{" "}
                      szt
                    </div>
                  </>
                )}
              </div>
            </div>
          </Link>

          {/* Mleko BL */}
          <Link href="/naciagi/mleko/mleko-bl" className="group">
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent group-hover:border-green-300 h-64 flex items-center">
              <div className="text-center w-full">
                <div className="text-8xl mb-6">🥛</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  Mleko BL
                </h3>
                <p className="text-gray-600 mb-4">Mleko bez laktozy</p>
                {loading ? (
                  <div className="text-gray-500">Ładowanie...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-green-600">
                      {naciagi
                        .filter((n) => n.podkategoria === "mleko bl")
                        .reduce((sum, n) => sum + n.aktualnaIlosc, 0)}{" "}
                      szt
                    </div>
                  </>
                )}
              </div>
            </div>
          </Link>
        </div>

        {/* No Data Message */}
        {naciagi.filter((n) => n.kategoria === "mleko").length === 0 &&
          !loading && (
            <div className="text-center py-12 mt-12">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Brak mleka w bazie
              </h2>
              <p className="text-gray-600 mb-6">
                Rozpocznij od dodania produktów mlecznych do magazynu
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
