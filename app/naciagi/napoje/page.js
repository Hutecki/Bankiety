"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function NapojePage() {
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
            Zarządzanie Napojami
          </h1>
          <p className="text-gray-600 text-lg">
            Wybierz rodzaj napoju do zarządzania
          </p>
          <Link
            href="/naciagi"
            className="inline-block mt-4 text-green-600 hover:text-green-800 underline cursor-pointer"
          >
            ← Powrót do naciągów
          </Link>
        </div>

        {/* Product Selection */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {/* Pepsi */}
          <Link href="/naciagi/napoje/pepsi" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent group-hover:border-blue-500 h-64 flex items-center">
              <div className="text-center w-full">
                <div className="text-6xl mb-4">🥤</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Pepsi</h3>
                <p className="text-gray-600 mb-4">Napój gazowany cola</p>

                {loading ? (
                  <div className="text-gray-500">Ładowanie...</div>
                ) : (
                  <div className="text-2xl font-bold text-blue-600">
                    {naciagi
                      .filter((n) => n.podkategoria === "pepsi")
                      .reduce((sum, n) => sum + n.aktualnaIlosc, 0)}{" "}
                    szt
                  </div>
                )}
              </div>
            </div>
          </Link>

          {/* 7up */}
          <Link href="/naciagi/napoje/7up" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent group-hover:border-green-400 h-64 flex items-center">
              <div className="text-center w-full">
                <div className="text-6xl mb-4">🍋</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">7up</h3>
                <p className="text-gray-600 mb-4">Napój cytrynowy</p>
                {loading ? (
                  <div className="text-gray-500">Ładowanie...</div>
                ) : (
                  <div className="text-2xl font-bold text-green-600">
                    {naciagi
                      .filter((n) => n.podkategoria === "7up")
                      .reduce((sum, n) => sum + n.aktualnaIlosc, 0)}{" "}
                    szt
                  </div>
                )}
              </div>
            </div>
          </Link>

          {/* Mirinda */}
          <Link href="/naciagi/napoje/mirinda" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent group-hover:border-orange-400 h-64 flex items-center">
              <div className="text-center w-full">
                <div className="text-6xl mb-4">🍊</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Mirinda
                </h3>
                <p className="text-gray-600 mb-4">Napój pomarańczowy</p>
                {loading ? (
                  <div className="text-gray-500">Ładowanie...</div>
                ) : (
                  <div className="text-2xl font-bold text-orange-600">
                    {naciagi
                      .filter((n) => n.podkategoria === "mirinda")
                      .reduce((sum, n) => sum + n.aktualnaIlosc, 0)}{" "}
                    szt
                  </div>
                )}
              </div>
            </div>
          </Link>

          {/* Softy */}
          <Link href="/naciagi/napoje/softy" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent group-hover:border-purple-400 h-64 flex items-center">
              <div className="text-center w-full">
                <div className="text-6xl mb-4">🥤</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Softy</h3>
                <p className="text-gray-600 mb-4">Napój gazowany</p>
                {loading ? (
                  <div className="text-gray-500">Ładowanie...</div>
                ) : (
                  <div className="text-2xl font-bold text-purple-600">
                    {naciagi
                      .filter((n) => n.podkategoria === "softy")
                      .reduce((sum, n) => sum + n.aktualnaIlosc, 0)}{" "}
                    szt
                  </div>
                )}
              </div>
            </div>
          </Link>

          {/* Paliwka */}
          <Link href="/naciagi/napoje/paliwka" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent group-hover:border-amber-400 h-64 flex items-center">
              <div className="text-center w-full">
                <div className="text-6xl mb-4">🍺</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Paliwka
                </h3>
                <p className="text-gray-600 mb-4">Napoje alkoholowe</p>
                {loading ? (
                  <div className="text-gray-500">Ładowanie...</div>
                ) : (
                  <div className="text-2xl font-bold text-amber-600">
                    {naciagi
                      .filter((n) => n.podkategoria === "paliwka")
                      .reduce((sum, n) => sum + n.aktualnaIlosc, 0)}{" "}
                    szt
                  </div>
                )}
              </div>
            </div>
          </Link>
        </div>

        {/* No Data Message */}
        {naciagi.filter((n) => n.kategoria === "napoje").length === 0 &&
          !loading && (
            <div className="text-center py-12 mt-12">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Brak napojów w bazie
              </h2>
              <p className="text-gray-600 mb-6">
                Rozpocznij od dodania napojów do magazynu
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
