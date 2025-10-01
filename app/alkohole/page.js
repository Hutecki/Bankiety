"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AlkoholePage() {
  const [alkohole, setAlkohole] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlkohole();
  }, []);

  const fetchAlkohole = async () => {
    try {
      const response = await fetch("/api/alkohole");
      if (response.ok) {
        const data = await response.json();
        setAlkohole(data);
      }
    } catch (error) {
      console.error("Błąd podczas pobierania alkoholi:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Zarządzanie Alkoholami
          </h1>
          <p className="text-gray-600 text-lg">
            Wybierz kategorię alkoholi do zarządzania
          </p>
          <Link
            href="/"
            className="inline-block mt-4 text-blue-600 hover:text-blue-800 underline cursor-pointer"
          >
            ← Powrót do strony głównej
          </Link>
        </div>

        {/* Category Selection */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Wine Białe */}
          <Link href="/alkohole/wino-biale" className="group">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent group-hover:border-yellow-300 min-h-[16rem] flex items-center">
              <div className="text-center w-full">
                <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🥂</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                  Wino Białe
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-4">
                  Białe wina do bankietów
                </p>
                {loading ? (
                  <div className="text-gray-500">Ładowanie...</div>
                ) : (
                  <div className="text-lg sm:text-2xl font-bold text-yellow-600">
                    {alkohole
                      .filter((a) => a.kategoria === "wino_biale")
                      .reduce((sum, a) => sum + a.aktualnaIlosc, 0)}{" "}
                    butelek
                  </div>
                )}
              </div>
            </div>
          </Link>

          {/* Wine Czerwone */}
          <Link href="/alkohole/wino-czerwone" className="group">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent group-hover:border-red-300 min-h-[16rem] flex items-center">
              <div className="text-center w-full">
                <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🍷</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                  Wino Czerwone
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-4">
                  Czerwone wina do bankietów
                </p>
                {loading ? (
                  <div className="text-gray-500">Ładowanie...</div>
                ) : (
                  <div className="text-lg sm:text-2xl font-bold text-red-600">
                    {alkohole
                      .filter((a) => a.kategoria === "wino_czerwone")
                      .reduce((sum, a) => sum + a.aktualnaIlosc, 0)}{" "}
                    butelek
                  </div>
                )}
              </div>
            </div>
          </Link>

          {/* Whiskey */}
          <Link href="/alkohole/whiskey" className="group">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent group-hover:border-amber-400 min-h-[16rem] flex items-center">
              <div className="text-center w-full">
                <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🥃</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                  Whiskey
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-4">
                  Whiskey i mocne alkohole
                </p>
                {loading ? (
                  <div className="text-gray-500">Ładowanie...</div>
                ) : (
                  <div className="text-lg sm:text-2xl font-bold text-amber-600">
                    {alkohole
                      .filter((a) => a.kategoria === "whiskey")
                      .reduce((sum, a) => sum + a.aktualnaIlosc, 0)}{" "}
                    butelek
                  </div>
                )}
              </div>
            </div>
          </Link>

          {/* Inne */}
          <Link href="/alkohole/inne" className="group">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent group-hover:border-purple-300 min-h-[16rem] flex items-center">
              <div className="text-center w-full">
                <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🍸</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                  Inne Alkohole
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-4">
                  Pozostałe alkohole
                </p>
                {loading ? (
                  <div className="text-gray-500">Ładowanie...</div>
                ) : (
                  <div className="text-lg sm:text-2xl font-bold text-purple-600">
                    {alkohole
                      .filter((a) => a.kategoria === "inne")
                      .reduce((sum, a) => sum + a.aktualnaIlosc, 0)}{" "}
                    butelek
                  </div>
                )}
              </div>
            </div>
          </Link>
        </div>

        {/* No Data Message */}
        {alkohole.length === 0 && !loading && (
          <div className="text-center py-12 mt-12">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Brak danych w bazie
            </h2>
            <p className="text-gray-600 mb-6">
              Rozpocznij od zainicjalizowania bazy danych przykładowymi
              produktami
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
