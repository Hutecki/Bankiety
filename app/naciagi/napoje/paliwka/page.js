"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import UzyjNaciagiModal from "../../../../components/UzyjNaciagiModal";
import DodajDostaweNaciagiModal from "../../../../components/DodajDostaweNaciagiModal";

export default function PaliwkaPage() {
  const router = useRouter();
  const [naciagi, setNaciagi] = useState([]);
  const [transakcje, setTransakcje] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUzyjModal, setShowUzyjModal] = useState(false);
  const [showDodajModal, setShowDodajModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch paliwka products
  const pobierzNaciagi = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/naciagi");
      if (response.ok) {
        const data = await response.json();
        const filteredData = data.filter((n) => n.podkategoria === "paliwka");
        setNaciagi(filteredData);
      }
    } catch (error) {
      console.error("Błąd podczas pobierania paliwek:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch transactions for paliwka
  const pobierzTransakcje = useCallback(async () => {
    try {
      const response = await fetch("/api/naciagi-transakcje");
      if (response.ok) {
        const data = await response.json();
        // Filter transactions for paliwka products
        const filteredTransactions = data.filter((t) =>
          naciagi.some(
            (n) => n.nazwa === t.nazwaNaciagu && t.podkategoria === "paliwka"
          )
        );
        setTransakcje(filteredTransactions);
      }
    } catch (error) {
      console.error("Błąd podczas pobierania transakcji:", error);
    }
  }, [naciagi]);

  useEffect(() => {
    pobierzNaciagi();
  }, [pobierzNaciagi]);

  useEffect(() => {
    if (naciagi.length > 0) {
      pobierzTransakcje();
    }
  }, [naciagi, pobierzTransakcje]);

  const refreshData = () => {
    pobierzNaciagi();
    pobierzTransakcje();
  };

  const handleUzyj = useCallback((product) => {
    setSelectedProduct(product);
    setShowUzyjModal(true);
  }, []);

  const handleDodajDostawe = useCallback((product) => {
    setSelectedProduct(product);
    setShowDodajModal(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setShowUzyjModal(false);
    setShowDodajModal(false);
    setSelectedProduct(null);
    refreshData();
  }, []);

  // Split transactions by type
  const dostawy = transakcje.filter((t) => t.typTransakcji === "dostawa");
  const uzycia = transakcje.filter((t) => t.typTransakcji === "uzycie");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/naciagi/napoje")}
              className="text-gray-600 hover:text-gray-800 text-2xl cursor-pointer"
            >
              ←
            </button>
            <div className="flex items-center gap-3">
              <div className="text-5xl">🍺</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Paliwka</h1>
                <p className="text-gray-600">Zarządzanie stanem magazynowym</p>
              </div>
            </div>
          </div>
          <button
            onClick={refreshData}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
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
                  onClick={() => {
                    setSelectedProduct({
                      kategoria: "napoje",
                      podkategoria: "paliwka",
                    });
                    setShowDodajModal(true);
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  ➕ Dodaj Paliwko
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Ładowanie...</p>
                </div>
              ) : naciagi.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🍺</div>
                  <p className="text-gray-600 mb-4">
                    Brak produktów w kategorii Paliwka
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {naciagi.map((naciag) => (
                    <div
                      key={naciag._id}
                      className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-800">
                            {naciag.nazwa}
                          </h3>
                          {naciag.opis && (
                            <p className="text-gray-600 mt-1">{naciag.opis}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-bold text-amber-600">
                            {naciag.aktualnaIlosc}
                          </div>
                          <div className="text-sm text-gray-500">sztuk</div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setSelectedProduct(naciag);
                            setShowUzyjModal(true);
                          }}
                          disabled={naciag.aktualnaIlosc === 0}
                          className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium cursor-pointer"
                        >
                          📤 Użyj Paliwko
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProduct(naciag);
                            setShowDodajModal(true);
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
                            {dostawa.nazwaNaciagu}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            👤 {dostawa.nazwaPracownika}
                          </p>
                          {dostawa.opis && (
                            <p className="text-sm text-gray-500 mt-2 italic">
                              &ldquo;{dostawa.opis}&rdquo;
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            +{dostawa.ilosc}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(
                              dostawa.dataTransakcji
                            ).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(
                              dostawa.dataTransakcji
                            ).toLocaleTimeString()}
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
                  <p className="text-gray-600">Brak użyć</p>
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
                            {uzycie.nazwaNaciagu}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            👤 {uzycie.nazwaPracownika}
                          </p>
                          {uzycie.opis && (
                            <p className="text-sm text-gray-500 mt-2 italic">
                              &ldquo;{uzycie.opis}&rdquo;
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-600">
                            -{uzycie.ilosc}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(
                              uzycie.dataTransakcji
                            ).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(
                              uzycie.dataTransakcji
                            ).toLocaleTimeString()}
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
      </div>

      {/* Modals */}
      {showUzyjModal && selectedProduct && (
        <UzyjNaciagiModal
          isOpen={showUzyjModal}
          onClose={handleModalClose}
          produktId={selectedProduct._id}
        />
      )}

      {showDodajModal && (
        <DodajDostaweNaciagiModal
          naciag={selectedProduct?._id ? selectedProduct : null}
          onClose={handleModalClose}
          onUpdate={refreshData}
          kategoria="napoje"
          podkategoria="paliwka"
        />
      )}
    </div>
  );
}
