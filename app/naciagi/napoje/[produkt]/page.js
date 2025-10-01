"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import UzyjNaciagiModal from "../../../../components/UzyjNaciagiModal";
import DodajDostaweNaciagiModal from "../../../../components/DodajDostaweNaciagiModal";

const productInfo = {
  // Napoje
  pepsi: {
    name: "Pepsi",
    icon: "🥤",
    color: "blue",
    dbCategory: "napoje",
    dbSubcategory: "pepsi",
    description: "Napój gazowany cola",
  },
  "7up": {
    name: "7up",
    icon: "🍋",
    color: "green",
    dbCategory: "napoje",
    dbSubcategory: "7up",
    description: "Napój cytrynowy",
  },
  mirinda: {
    name: "Mirinda",
    icon: "🍊",
    color: "orange",
    dbCategory: "napoje",
    dbSubcategory: "mirinda",
    description: "Napój pomarańczowy",
  },
  softy: {
    name: "Softy",
    icon: "🥤",
    color: "purple",
    dbCategory: "napoje",
    dbSubcategory: "softy",
    description: "Napój gazowany",
  },
  // Mleko
  "mleko-zwykle": {
    name: "Mleko Zwykłe",
    icon: "🥛",
    color: "blue",
    dbCategory: "mleko",
    dbSubcategory: "mleko_zwykle",
    description: "Tradycyjne mleko",
  },
  "mleko-bl": {
    name: "Mleko BL",
    icon: "🥛",
    color: "green",
    dbCategory: "mleko",
    dbSubcategory: "mleko bl",
    description: "Mleko bez laktozy",
  },
};

export default function ProduktNaciagu() {
  const params = useParams();
  const router = useRouter();
  const [naciagi, setNaciagi] = useState([]);
  const [transakcje, setTransakcje] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNaciag, setSelectedNaciag] = useState(null);
  const [showUzyjModal, setShowUzyjModal] = useState(false);
  const [showDostawaModal, setShowDostawaModal] = useState(false);

  const productSlug = params.produkt;
  const productData = productInfo[productSlug];

  if (!productData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Produkt nie został znaleziony
          </h1>
          <button
            onClick={() => router.push("/naciagi")}
            className="text-green-600 hover:text-green-800 underline cursor-pointer"
          >
            ← Powrót do naciągów
          </button>
        </div>
      </div>
    );
  }

  // Fetch naciagi for this product
  const pobierzNaciagi = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/naciagi");
      if (response.ok) {
        const data = await response.json();
        const filteredData = data.filter(
          (naciag) => naciag.podkategoria === productData.dbSubcategory
        );
        setNaciagi(filteredData);
      }
    } catch (error) {
      console.error("Błąd podczas pobierania naciągów:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions for this product
  const pobierzTransakcje = async () => {
    try {
      const response = await fetch(
        `/api/naciagi-transakcje?podkategoria=${productData.dbSubcategory}&limit=50`
      );
      if (response.ok) {
        const data = await response.json();
        setTransakcje(data);
      }
    } catch (error) {
      console.error("Błąd podczas pobierania transakcji:", error);
    }
  };

  useEffect(() => {
    pobierzNaciagi();
  }, [productSlug]);

  useEffect(() => {
    if (naciagi.length > 0) {
      pobierzTransakcje();
    }
  }, [naciagi]);

  const refreshData = () => {
    pobierzNaciagi();
    pobierzTransakcje();
  };

  // Split transactions by type
  const dostawy = transakcje.filter((t) => t.typTransakcji === "dostawa");
  const uzycia = transakcje.filter((t) => t.typTransakcji === "uzycie");

  // Determine back URL based on product category
  const getBackUrl = () => {
    if (productData.dbCategory === "napoje") {
      return "/naciagi/napoje";
    } else if (productData.dbCategory === "mleko") {
      return "/naciagi/mleko";
    }
    return "/naciagi";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(getBackUrl())}
              className="text-gray-600 hover:text-gray-800 text-2xl cursor-pointer"
            >
              ←
            </button>
            <div className="flex items-center gap-3">
              <div className="text-5xl">{productData.icon}</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {productData.name}
                </h1>
                <p className="text-gray-600">{productData.description}</p>
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
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                📦 Stan Magazynu
              </h2>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Ładowanie...</p>
                </div>
              ) : naciagi.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">{productData.icon}</div>
                  <p className="text-gray-600 mb-4">
                    Brak produktów w kategorii {productData.name}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {naciagi.map((item) => (
                    <div
                      key={item._id}
                      className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-800">
                            {item.nazwa}
                          </h3>
                          {item.opis && (
                            <p className="text-gray-600 mt-1">{item.opis}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-4xl font-bold text-${productData.color}-600`}
                          >
                            {item.aktualnaIlosc}
                          </div>
                          <div className="text-sm text-gray-500">szt</div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 mb-4">
                        <button
                          onClick={() => {
                            setSelectedNaciag(item);
                            setShowUzyjModal(true);
                          }}
                          disabled={item.aktualnaIlosc === 0}
                          className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium cursor-pointer"
                        >
                          📤 Użyj Naciąg
                        </button>
                        <button
                          onClick={() => {
                            setSelectedNaciag(item);
                            setShowDostawaModal(true);
                          }}
                          className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 font-medium cursor-pointer"
                        >
                          📦 Dodaj Dostawę
                        </button>
                      </div>

                      {/* Last Delivery Info */}
                      {item.ostatniadostawa?.data && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-600">
                            <strong>Ostatnia dostawa:</strong>{" "}
                            {new Date(
                              item.ostatniadostawa.data
                            ).toLocaleDateString()}{" "}
                            ({item.ostatniadostawa.ilosc} szt.)
                            {item.ostatniadostawa.dostarczylKto && (
                              <span>
                                {" "}
                                - {item.ostatniadostawa.dostarczylKto}
                              </span>
                            )}
                          </p>
                        </div>
                      )}
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
                  {dostawy.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="border-l-4 border-green-500 pl-4 py-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {transaction.nazwaNaciagu}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {transaction.nazwaPracownika}
                          </p>
                          {transaction.opis && (
                            <p className="text-xs text-gray-500 mt-1">
                              {transaction.opis}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-green-600">
                            +{transaction.ilosc}
                          </span>
                          <p className="text-xs text-gray-500">
                            {new Date(
                              transaction.dataTransakcji
                            ).toLocaleDateString()}
                          </p>
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
                  {uzycia.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="border-l-4 border-red-500 pl-4 py-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {transaction.nazwaNaciagu}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {transaction.nazwaPracownika}
                          </p>
                          {transaction.opis && (
                            <p className="text-xs text-gray-500 mt-1">
                              {transaction.opis}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-red-600">
                            -{transaction.ilosc}
                          </span>
                          <p className="text-xs text-gray-500">
                            {new Date(
                              transaction.dataTransakcji
                            ).toLocaleDateString()}
                          </p>
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
      {showDostawaModal && (
        <DodajDostaweNaciagiModal
          naciag={selectedNaciag}
          onClose={() => {
            setShowDostawaModal(false);
            setSelectedNaciag(null);
          }}
          onUpdate={refreshData}
        />
      )}

      {showUzyjModal && (
        <UzyjNaciagiModal
          naciag={selectedNaciag}
          onClose={() => {
            setShowUzyjModal(false);
            setSelectedNaciag(null);
          }}
          onUpdate={refreshData}
        />
      )}
    </div>
  );
}
