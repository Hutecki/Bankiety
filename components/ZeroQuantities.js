"use client";

import { useState } from "react";

export default function ZeroQuantities() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleZeroQuantities = async () => {
    if (
      !window.confirm(
        "⚠️ UWAGA! Ta operacja wyzeruje wszystkie ilości produktów w magazynie.\n\n" +
          "Czy na pewno chcesz kontynuować? Ta akcja jest nieodwracalna!"
      )
    ) {
      return;
    }

    // Double confirmation
    const confirmText = prompt(
      "Aby potwierdzić, wpisz: ZERO\n\n(Wielkość liter ma znaczenie)"
    );

    if (confirmText !== "ZERO") {
      alert("Operacja anulowana - nieprawidłowe potwierdzenie");
      return;
    }

    try {
      setIsLoading(true);
      setResult(null);

      const requestBody = {
        confirm: "ZERO_ALL_QUANTITIES",
      };

      // Add category filter if not "all"
      if (selectedCategory !== "all") {
        requestBody.category = selectedCategory;
      }

      const response = await fetch("/api/zero-quantities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: data.message,
          results: data.results,
          totalUpdated: data.totalUpdated,
        });
      } else {
        setResult({
          success: false,
          message: data.message || "Operacja nie powiodła się",
          results: data.results,
        });
      }
    } catch (error) {
      console.error("Error zeroing quantities:", error);
      setResult({
        success: false,
        message: "Błąd podczas zerowania ilości: " + error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case "alcohol":
        return "🍷 Alkohole";
      case "naciagi":
        return "🥤 Naciągi";
      case "suchy":
        return "☕ Produkty suche";
      case "all":
        return "🗂️ Wszystkie kategorie";
      default:
        return category;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          🔄 Zerowanie Ilości
        </h2>
        <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
          ⚠️ Operacja nieodwracalna
        </div>
      </div>

      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          Ta funkcja pozwala wyzerować pole{" "}
          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
            aktualnaIlosc
          </code>
          dla wszystkich produktów w bazie danych.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">⚠️</div>
            <div className="ml-2">
              <h4 className="font-semibold text-amber-800">Ostrzeżenie</h4>
              <ul className="text-amber-700 text-sm mt-1 space-y-1">
                <li>• Ta operacja jest nieodwracalna</li>
                <li>• Wszystkie aktualne ilości zostaną ustawione na 0</li>
                <li>• Historia transakcji zostanie zachowana</li>
                <li>• Zaleca się wykonanie kopii zapasowej przed operacją</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Category Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Wybierz kategorię do wyzerowania:
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
          disabled={isLoading}
        >
          <option value="all">🗂️ Wszystkie kategorie</option>
          <option value="alcohol">🍷 Alkohole</option>
          <option value="naciagi">🥤 Naciągi (napoje i mleko)</option>
          <option value="suchy">☕ Produkty suche (kawa, cukier)</option>
        </select>
      </div>

      {/* Action Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleZeroQuantities}
          disabled={isLoading}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:bg-red-300 font-medium cursor-pointer transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Zerowanie...
            </>
          ) : (
            <>🔄 Wyzeruj ilości - {getCategoryLabel(selectedCategory)}</>
          )}
        </button>
      </div>

      {/* Results Display */}
      {result && (
        <div className="mt-6">
          <div
            className={`p-4 rounded-lg border ${
              result.success
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {result.success ? "✅" : "❌"}
              </div>
              <div className="ml-2">
                <h4
                  className={`font-semibold ${
                    result.success ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {result.success ? "Sukces!" : "Błąd"}
                </h4>
                <p
                  className={`text-sm mt-1 ${
                    result.success ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {result.message}
                </p>

                {result.results && (
                  <div className="mt-3 space-y-2">
                    <h5 className="font-medium text-gray-800">Szczegóły:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div className="bg-white p-2 rounded border">
                        <div className="font-medium">🍷 Alkohole</div>
                        <div>
                          {result.results.alcohol.error ? (
                            <span className="text-red-600">
                              Błąd: {result.results.alcohol.error}
                            </span>
                          ) : (
                            <span className="text-green-600">
                              Zaktualizowano: {result.results.alcohol.updated}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="bg-white p-2 rounded border">
                        <div className="font-medium">🥤 Naciągi</div>
                        <div>
                          {result.results.naciagi.error ? (
                            <span className="text-red-600">
                              Błąd: {result.results.naciagi.error}
                            </span>
                          ) : (
                            <span className="text-green-600">
                              Zaktualizowano: {result.results.naciagi.updated}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="bg-white p-2 rounded border">
                        <div className="font-medium">☕ Suchy</div>
                        <div>
                          {result.results.suchy.error ? (
                            <span className="text-red-600">
                              Błąd: {result.results.suchy.error}
                            </span>
                          ) : (
                            <span className="text-green-600">
                              Zaktualizowano: {result.results.suchy.updated}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {result.totalUpdated > 0 && (
                      <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                        <div className="text-blue-800 font-medium">
                          📊 Łącznie zaktualizowano: {result.totalUpdated}{" "}
                          produktów
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="mt-6 text-sm text-gray-500">
        <h4 className="font-medium text-gray-700 mb-2">Alternatywne użycie:</h4>
        <div className="bg-gray-50 p-3 rounded border font-mono text-xs">
          <div>
            Script: <code>node scripts/zero-quantities.mjs</code>
          </div>
          <div>
            Dry run: <code>node scripts/zero-quantities.mjs --dry-run</code>
          </div>
          <div>
            Specific:{" "}
            <code>node scripts/zero-quantities.mjs --category=alcohol</code>
          </div>
        </div>
      </div>
    </div>
  );
}
