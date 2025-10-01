"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function NaciagiPage() {
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
            Zarządzanie Naciągami
          </h1>
          <p className="text-gray-600 text-lg">
            Wybierz kategorię produktów do zarządzania
          </p>
          <Link
            href="/"
            className="inline-block mt-4 text-green-600 hover:text-green-800 underline cursor-pointer"
          >
            ← Powrót do strony głównej
          </Link>
        </div>

        {/* Category Selection */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Napoje */}
          <Link href="/naciagi/napoje" className="group">
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent group-hover:border-blue-300 h-64 flex items-center">
              <div className="text-center w-full">
                <div className="text-8xl mb-6">🥤</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Napoje
                </h2>
                <p className="text-gray-600 mb-4">Pepsi, 7up, Mirinda, Softy</p>
                {loading ? (
                  <div className="text-gray-500">Ładowanie...</div>
                ) : (
                  <div className="text-2xl font-bold text-blue-600">
                    {naciagi
                      .filter((n) => n.kategoria === "napoje")
                      .reduce((sum, n) => sum + n.aktualnaIlosc, 0)}{" "}
                    szt
                  </div>
                )}
              </div>
            </div>
          </Link>

          {/* Mleko */}
          <Link href="/naciagi/mleko" className="group">
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent group-hover:border-yellow-300 h-64 flex items-center">
              <div className="text-center w-full">
                <div className="text-8xl mb-6">🥛</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Mleko</h2>
                <p className="text-gray-600 mb-4">Mleko zwykłe, Mleko bl</p>
                {loading ? (
                  <div className="text-gray-500">Ładowanie...</div>
                ) : (
                  <div className="text-2xl font-bold text-yellow-600">
                    {naciagi
                      .filter((n) => n.kategoria === "mleko")
                      .reduce((sum, n) => sum + n.aktualnaIlosc, 0)}{" "}
                    szt
                  </div>
                )}
              </div>
            </div>
          </Link>
        </div>

        {/* No Data Message */}
        {naciagi.length === 0 && !loading && (
          <div className="text-center py-12 mt-12">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Brak danych w bazie
            </h2>
            <p className="text-gray-600 mb-6">
              Rozpocznij od dodania produktów do magazynu naciągów
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
