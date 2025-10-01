"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import UzyjAlkoholModal from "../../../components/UzyjAlkoholModal";
import DodajDostaweModal from "../../../components/DodajDostaweModal";
import DodajAlkoholModal from "../../../components/DodajAlkoholModal";

const categoryInfo = {
  "wino-biale": {
    name: "Wino Białe",
    icon: "🥂",
    color: "yellow",
    dbCategory: "wino_biale",
  },
  "wino-czerwone": {
    name: "Wino Czerwone",
    icon: "🍷",
    color: "red",
    dbCategory: "wino_czerwone",
  },
  whiskey: {
    name: "Whiskey",
    icon: "🥃",
    color: "amber",
    dbCategory: "whiskey",
  },
  inne: {
    name: "Inne Alkohole",
    icon: "🍸",
    color: "purple",
    dbCategory: "inne",
  },
};

export default function KategoriaAlkoholu() {
  const params = useParams();
  const router = useRouter();
  const [alkohole, setAlkohole] = useState([]);
  const [transakcje, setTransakcje] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAlkohol, setSelectedAlkohol] = useState(null);
  const [showUzyjModal, setShowUzyjModal] = useState(false);
  const [showDostawaModal, setShowDostawaModal] = useState(false);
  const [showAddAlkoholModal, setShowAddAlkoholModal] = useState(false);

  const categorySlug = params.kategoria;
  const categoryData = categoryInfo[categorySlug];

  // Fetch alcohol for this category
  const pobierzAlkohole = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/alkohole");
      if (response.ok) {
        const data = await response.json();
        const filteredData = data.filter(
          (alkohol) => alkohol.kategoria === categoryData?.dbCategory
        );
        setAlkohole(filteredData);
      }
    } catch (error) {
      console.error("Błąd podczas pobierania alkoholi:", error);
    } finally {
      setLoading(false);
    }
  }, [categoryData?.dbCategory]);

  // Fetch transactions for this category
  const pobierzTransakcje = useCallback(async () => {
    try {
      const response = await fetch("/api/transakcje?limit=50");
      if (response.ok) {
        const data = await response.json();
        // Filter transactions for alcohols in this category
        const filteredTransactions = data.filter((t) =>
          alkohole.some((a) => a.nazwa === t.nazwaAlkoholu)
        );
        setTransakcje(filteredTransactions);
      }
    } catch (error) {
      console.error("Błąd podczas pobierania transakcji:", error);
    }
  }, [alkohole]);

  useEffect(() => {
    pobierzAlkohole();
  }, [categorySlug, pobierzAlkohole]);

  useEffect(() => {
    if (alkohole.length > 0) {
      pobierzTransakcje();
    }
  }, [alkohole, pobierzTransakcje]);

  const refreshData = () => {
    pobierzAlkohole();
    pobierzTransakcje();
  };

  if (!categoryData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Nieznana kategoria
          </h1>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 cursor-pointer"
          >
            Powrót do strony głównej
          </button>
        </div>
      </div>
    );
  }

  // Split transactions by type
  const dostawy = transakcje.filter((t) => t.typTransakcji === "dostawa");
  const uzycia = transakcje.filter((t) => t.typTransakcji === "uzycie");

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/alkohole")}
              className="text-gray-600 hover:text-gray-800 text-2xl cursor-pointer"
            >
              ←
            </button>
            <div className="flex items-center gap-3">
              <div className="text-5xl">{categoryData.icon}</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {categoryData.name}
                </h1>
                <p className="text-gray-600">Zarządzanie stanem magazynowym</p>
              </div>
            </div>
          </div>
          <button
            onClick={refreshData}
            disabled={loading}
            className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
          >
            🔄 Odśwież
          </button>
        </div>

        <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-6">
          {/* Inventory Section */}
          <div className="xl:col-span-1 lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  📦 Stan Magazynu
                </h2>
                <button
                  onClick={() => setShowAddAlkoholModal(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  ➕ Dodaj Alkohol
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Ładowanie...</p>
                </div>
              ) : alkohole.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">{categoryData.icon}</div>
                  <p className="text-gray-600 mb-4">
                    Brak produktów w kategorii {categoryData.name}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alkohole.map((alkohol) => (
                    <div
                      key={alkohol._id}
                      className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-800">
                            {alkohol.nazwa}
                          </h3>
                          {alkohol.opis && (
                            <p className="text-gray-600 mt-1">{alkohol.opis}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-4xl font-bold text-${categoryData.color}-600`}
                          >
                            {alkohol.aktualnaIlosc}
                          </div>
                          <div className="text-sm text-gray-500">butelek</div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setSelectedAlkohol(alkohol);
                            setShowUzyjModal(true);
                          }}
                          disabled={alkohol.aktualnaIlosc === 0}
                          className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium cursor-pointer"
                        >
                          📤 Użyj Alkohol
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAlkohol(alkohol);
                            setShowDostawaModal(true);
                          }}
                          className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 font-medium cursor-pointer"
                        >
                          📦 Dodaj Dostawę
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Delivery History */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                📥 Historia Dostaw
              </h2>

              {dostawy.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📥</div>
                  <p className="text-gray-600">Brak dostaw</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {dostawy.map((dostawa) => (
                    <div
                      key={dostawa._id}
                      className="border border-green-200 rounded-lg p-4 bg-green-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              📥 Dostawa
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-800">
                            {dostawa.nazwaAlkoholu}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            👤 {dostawa.nazwaPracownika}
                          </p>
                          {dostawa.notatki && (
                            <p className="text-sm text-gray-500 mt-2 italic">
                              &ldquo;{dostawa.notatki}&rdquo;
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            +{dostawa.ilosc}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(dostawa.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(dostawa.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Usage History */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                📤 Historia Użycia
              </h2>

              {uzycia.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📤</div>
                  <p className="text-gray-600">Brak użycia</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {uzycia.map((uzycie) => (
                    <div
                      key={uzycie._id}
                      className="border border-red-200 rounded-lg p-4 bg-red-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              📤 Użycie
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-800">
                            {uzycie.nazwaAlkoholu}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            👤 {uzycie.nazwaPracownika}
                          </p>
                          {uzycie.notatki && (
                            <p className="text-sm text-gray-500 mt-2 italic">
                              &ldquo;{uzycie.notatki}&rdquo;
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-600">
                            {uzycie.ilosc}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(uzycie.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(uzycie.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        {showUzyjModal && selectedAlkohol && (
          <UzyjAlkoholModal
            alkohol={selectedAlkohol}
            onClose={() => {
              setShowUzyjModal(false);
              setSelectedAlkohol(null);
            }}
            onUpdate={refreshData}
          />
        )}

        {showDostawaModal && selectedAlkohol && (
          <DodajDostaweModal
            alkohol={selectedAlkohol}
            onClose={() => {
              setShowDostawaModal(false);
              setSelectedAlkohol(null);
            }}
            onUpdate={refreshData}
          />
        )}

        {showAddAlkoholModal && (
          <DodajAlkoholModal
            isOpen={showAddAlkoholModal}
            kategoria={categoryData}
            onClose={() => setShowAddAlkoholModal(false)}
            onSuccess={refreshData}
          />
        )}
      </div>
    </div>
  );
}
