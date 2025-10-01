"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RaportPage() {
  const router = useRouter();
  const [reportData, setReportData] = useState({
    alkohole: { total: 0, used: 0, delivered: 0, count: 0, products: [] },
    naciagi: { total: 0, used: 0, delivered: 0, count: 0, products: [] },
    suchy: { total: 0, used: 0, delivered: 0, count: 0, products: [] },
  });
  const [loading, setLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState("month");
  const [selectedCategory, setSelectedCategory] = useState("overview");

  const fetchReportData = async () => {
    try {
      setLoading(true);

      // Calculate date filter
      const now = new Date();
      let startDate = null;
      if (timeFilter === "week") {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (timeFilter === "month") {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Fetch alkohole data
      const alkoholeRes = await fetch("/api/alkohole");
      const alkohole = alkoholeRes.ok ? await alkoholeRes.json() : [];

      // Fetch alkohole transactions
      const alkoholeTransRes = await fetch("/api/transakcje");
      const alkoholeTransakcje = alkoholeTransRes.ok
        ? await alkoholeTransRes.json()
        : [];

      // Fetch naciagi data
      const naciagiRes = await fetch("/api/naciagi");
      const naciagi = naciagiRes.ok ? await naciagiRes.json() : [];

      // Fetch naciagi transactions
      const naciagiTransRes = await fetch("/api/naciagi-transakcje");
      const naciagiTransakcje = naciagiTransRes.ok
        ? await naciagiTransRes.json()
        : [];

      // Fetch suchy data
      const suchyRes = await fetch("/api/suchy");
      const suchy = suchyRes.ok ? await suchyRes.json() : [];

      // Fetch suchy transactions
      const suchyTransRes = await fetch("/api/suchy-transakcje");
      const suchyTransakcje = suchyTransRes.ok
        ? await suchyTransRes.json()
        : [];

      // Filter transactions by date if needed
      const filterTransactions = (transactions) => {
        if (!startDate) return transactions;
        return transactions.filter(
          (t) => new Date(t.dataTransakcji) >= startDate
        );
      };

      const filteredAlkoholeTransakcje = filterTransactions(alkoholeTransakcje);
      const filteredNaciagiTransakcje = filterTransactions(naciagiTransakcje);
      const filteredSuchyTransakcje = filterTransactions(suchyTransakcje);

      // Calculate detailed product summaries for alkohole
      const alkoholeProducts = alkohole.map((product) => {
        const productTransactions = filteredAlkoholeTransakcje.filter((t) => {
          // Handle both populated object and string ID cases
          const transactionProductId =
            typeof t.alkoholId === "object"
              ? t.alkoholId._id || t.alkoholId.id
              : t.alkoholId;

          return (
            transactionProductId === product._id ||
            t.idAlkoholu === product._id ||
            transactionProductId === product.id
          );
        });
        const used = productTransactions
          .filter((t) => t.typTransakcji === "uzycie")
          .reduce((sum, t) => sum + t.ilosc, 0);
        const delivered = productTransactions
          .filter((t) => t.typTransakcji === "dostawa")
          .reduce((sum, t) => sum + t.ilosc, 0);

        return {
          ...product,
          used,
          delivered,
          turnover: delivered - used,
          transactionCount: productTransactions.length,
        };
      });

      // Calculate detailed product summaries for naciagi
      const naciagiProducts = naciagi.map((product) => {
        const productTransactions = filteredNaciagiTransakcje.filter((t) => {
          // Handle both populated object and string ID cases
          const transactionProductId =
            typeof t.naciagiId === "object"
              ? t.naciagiId._id || t.naciagiId.id
              : t.naciagiId;

          return (
            transactionProductId === product._id ||
            t.idNaciagu === product._id ||
            transactionProductId === product.id
          );
        });
        const used = productTransactions
          .filter((t) => t.typTransakcji === "uzycie")
          .reduce((sum, t) => sum + t.ilosc, 0);
        const delivered = productTransactions
          .filter((t) => t.typTransakcji === "dostawa")
          .reduce((sum, t) => sum + t.ilosc, 0);

        return {
          ...product,
          used,
          delivered,
          turnover: delivered - used,
          transactionCount: productTransactions.length,
        };
      });

      // Calculate detailed product summaries for suchy
      const suchyProducts = suchy.map((product) => {
        const productTransactions = filteredSuchyTransakcje.filter((t) => {
          // Handle both populated object and string ID cases
          const transactionProductId =
            typeof t.suchyId === "object"
              ? t.suchyId._id || t.suchyId.id
              : t.suchyId;

          return (
            transactionProductId === product._id ||
            t.idSuchy === product._id ||
            transactionProductId === product.id
          );
        });
        const used = productTransactions
          .filter((t) => t.typTransakcji === "uzycie")
          .reduce((sum, t) => sum + t.ilosc, 0);
        const delivered = productTransactions
          .filter((t) => t.typTransakcji === "dostawa")
          .reduce((sum, t) => sum + t.ilosc, 0);

        return {
          ...product,
          used,
          delivered,
          turnover: delivered - used,
          transactionCount: productTransactions.length,
        };
      });

      // Calculate category summaries
      const alkoholeSummary = {
        count: alkohole.length,
        total: alkohole.reduce(
          (sum, item) => sum + (item.aktualnaIlosc || 0),
          0
        ),
        used: alkoholeProducts.reduce((sum, p) => sum + p.used, 0),
        delivered: alkoholeProducts.reduce((sum, p) => sum + p.delivered, 0),
        products: alkoholeProducts.sort((a, b) => b.turnover - a.turnover),
      };

      const naciagiSummary = {
        count: naciagi.length,
        total: naciagi.reduce(
          (sum, item) => sum + (item.aktualnaIlosc || 0),
          0
        ),
        used: naciagiProducts.reduce((sum, p) => sum + p.used, 0),
        delivered: naciagiProducts.reduce((sum, p) => sum + p.delivered, 0),
        products: naciagiProducts.sort((a, b) => b.turnover - a.turnover),
      };

      const suchySummary = {
        count: suchy.length,
        total: suchy.reduce((sum, item) => sum + (item.aktualnaIlosc || 0), 0),
        used: suchyProducts.reduce((sum, p) => sum + p.used, 0),
        delivered: suchyProducts.reduce((sum, p) => sum + p.delivered, 0),
        products: suchyProducts.sort((a, b) => b.turnover - a.turnover),
      };

      setReportData({
        alkohole: alkoholeSummary,
        naciagi: naciagiSummary,
        suchy: suchySummary,
      });
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [timeFilter]);

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case "week":
        return "Ostatni tydzień";
      case "month":
        return "Ostatni miesiąc";
      case "all":
        return "Wszystkie dane";
      default:
        return "Ostatni miesiąc";
    }
  };

  const renderProductDetails = (products, category) => {
    const unit = category === "suchy" ? "kg" : "szt";
    const colorClass =
      category === "alkohole"
        ? "blue"
        : category === "naciagi"
        ? "green"
        : "amber";

    return (
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {products.map((product) => (
          <div
            key={product._id}
            className={`bg-gradient-to-br from-${colorClass}-50 to-${colorClass}-100 rounded-lg p-4 border-l-4 border-${colorClass}-500`}
          >
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-semibold text-gray-800">{product.nazwa}</h4>
              <span className={`text-lg font-bold text-${colorClass}-600`}>
                {product.aktualnaIlosc?.toFixed(2)} {unit}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Dostarczone:</span>
                <span className="font-medium text-green-600">
                  +{product.delivered.toFixed(2)} {unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Użyte:</span>
                <span className="font-medium text-red-600">
                  -{product.used.toFixed(2)} {unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Obrót:</span>
                <span className={`font-bold text-${colorClass}-600`}>
                  {product.turnover > 0 ? "+" : ""}
                  {product.turnover.toFixed(2)} {unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transakcje:</span>
                <span className="font-medium text-gray-700">
                  {product.transactionCount}
                </span>
              </div>
              {product.opis && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">{product.opis}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="text-gray-600 hover:text-gray-800 text-2xl cursor-pointer"
            >
              ←
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">📊 Raport</h1>
              <p className="text-gray-600">
                Szczegółowa analiza magazynu i aktywności
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeFilter("week")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                timeFilter === "week"
                  ? "bg-purple-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tydzień
            </button>
            <button
              onClick={() => setTimeFilter("month")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                timeFilter === "month"
                  ? "bg-purple-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Miesiąc
            </button>
            <button
              onClick={() => setTimeFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                timeFilter === "all"
                  ? "bg-purple-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Wszystko
            </button>
            <button
              onClick={fetchReportData}
              className="ml-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
            >
              🔄 Odśwież
            </button>
          </div>
        </div>

        {/* Time Filter Info */}
        <div className="text-center mb-8">
          <p className="text-lg font-medium text-gray-700">
            {getTimeFilterLabel()}
          </p>
        </div>

        {/* Category Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-2 flex gap-2">
            <button
              onClick={() => setSelectedCategory("overview")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedCategory === "overview"
                  ? "bg-purple-500 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              📊 Przegląd
            </button>
            <button
              onClick={() => setSelectedCategory("alkohole")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedCategory === "alkohole"
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              🍷 Alkohole
            </button>
            <button
              onClick={() => setSelectedCategory("naciagi")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedCategory === "naciagi"
                  ? "bg-green-500 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              🥤 Naciągi
            </button>
            <button
              onClick={() => setSelectedCategory("suchy")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedCategory === "suchy"
                  ? "bg-amber-500 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              ☕ Suchy
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-lg">
              Ładowanie danych raportu...
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overview */}
            {selectedCategory === "overview" && (
              <div>
                {/* Summary Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-800">
                        🍷 Alkohole
                      </h3>
                      <span className="text-2xl font-bold text-blue-600">
                        {reportData.alkohole.count}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Stan aktualny:</span>
                        <span className="font-bold text-gray-800">
                          {reportData.alkohole.total.toFixed(2)} szt
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Użyte:</span>
                        <span className="font-bold text-red-600">
                          -{reportData.alkohole.used.toFixed(2)} szt
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Dostarczone:</span>
                        <span className="font-bold text-green-600">
                          +{reportData.alkohole.delivered.toFixed(2)} szt
                        </span>
                      </div>
                      <div className="pt-2 border-t border-blue-200">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Obrót:</span>
                          <span className="font-bold text-blue-600">
                            {(
                              reportData.alkohole.delivered -
                              reportData.alkohole.used
                            ).toFixed(2)}{" "}
                            szt
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-800">
                        🥤 Naciągi
                      </h3>
                      <span className="text-2xl font-bold text-green-600">
                        {reportData.naciagi.count}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Stan aktualny:</span>
                        <span className="font-bold text-gray-800">
                          {reportData.naciagi.total.toFixed(2)} szt
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Użyte:</span>
                        <span className="font-bold text-red-600">
                          -{reportData.naciagi.used.toFixed(2)} szt
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Dostarczone:</span>
                        <span className="font-bold text-green-600">
                          +{reportData.naciagi.delivered.toFixed(2)} szt
                        </span>
                      </div>
                      <div className="pt-2 border-t border-green-200">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Obrót:</span>
                          <span className="font-bold text-green-600">
                            {(
                              reportData.naciagi.delivered -
                              reportData.naciagi.used
                            ).toFixed(2)}{" "}
                            szt
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-6 border-l-4 border-amber-500">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-800">
                        ☕ Suchy
                      </h3>
                      <span className="text-2xl font-bold text-amber-600">
                        {reportData.suchy.count}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Stan aktualny:</span>
                        <span className="font-bold text-gray-800">
                          {reportData.suchy.total.toFixed(2)} kg
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Użyte:</span>
                        <span className="font-bold text-red-600">
                          -{reportData.suchy.used.toFixed(2)} kg
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Dostarczone:</span>
                        <span className="font-bold text-green-600">
                          +{reportData.suchy.delivered.toFixed(2)} kg
                        </span>
                      </div>
                      <div className="pt-2 border-t border-amber-200">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Obrót:</span>
                          <span className="font-bold text-amber-600">
                            {(
                              reportData.suchy.delivered - reportData.suchy.used
                            ).toFixed(2)}{" "}
                            kg
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overall Summary Stats */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    📈 Podsumowanie Ogólne
                  </h3>
                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-800">
                        {reportData.alkohole.count +
                          reportData.naciagi.count +
                          reportData.suchy.count}
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        Łączna ilość produktów
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        +
                        {(
                          reportData.alkohole.delivered +
                          reportData.naciagi.delivered +
                          reportData.suchy.delivered
                        ).toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        Łącznie dostarczone
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">
                        -
                        {(
                          reportData.alkohole.used +
                          reportData.naciagi.used +
                          reportData.suchy.used
                        ).toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        Łącznie użyte
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {(
                          reportData.alkohole.delivered +
                          reportData.naciagi.delivered +
                          reportData.suchy.delivered -
                          (reportData.alkohole.used +
                            reportData.naciagi.used +
                            reportData.suchy.used)
                        ).toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        Saldo ogólne
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Product Reports */}
            {selectedCategory === "alkohole" && (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  🍷 Szczegółowy Raport Alkoholi
                </h3>
                {reportData.alkohole.products.length > 0 ? (
                  renderProductDetails(reportData.alkohole.products, "alkohole")
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-6xl mb-4">🍷</div>
                    <p>Brak danych o alkoholach</p>
                  </div>
                )}
              </div>
            )}

            {selectedCategory === "naciagi" && (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  🥤 Szczegółowy Raport Naciągów
                </h3>
                {reportData.naciagi.products.length > 0 ? (
                  renderProductDetails(reportData.naciagi.products, "naciagi")
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-6xl mb-4">🥤</div>
                    <p>Brak danych o naciągach</p>
                  </div>
                )}
              </div>
            )}

            {selectedCategory === "suchy" && (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  ☕ Szczegółowy Raport Produktów Suchych
                </h3>
                {reportData.suchy.products.length > 0 ? (
                  renderProductDetails(reportData.suchy.products, "suchy")
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-6xl mb-4">☕</div>
                    <p>Brak danych o produktach suchych</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
