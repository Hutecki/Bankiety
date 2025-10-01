"use client";

import { useState } from "react";

export default function TransactionCleanup() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cleanupResult, setCleanupResult] = useState(null);

  // Get cleanup statistics
  const getStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/cleanup-transactions");
      const data = await response.json();

      if (data.success) {
        setStats(data);
      } else {
        alert("Błąd podczas pobierania statystyk: " + data.error);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      alert("Błąd połączenia");
    } finally {
      setLoading(false);
    }
  };

  // Run cleanup
  const runCleanup = async (type = "all") => {
    const confirmed = confirm(
      `Czy na pewno chcesz usunąć transakcje starsze niż 1 miesiąc?\n\nTyp: ${type}\nTa operacja nie może być cofnięta!`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/cleanup-transactions?type=${type}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        setCleanupResult(data);
        // Refresh stats after cleanup
        await getStats();
      } else {
        alert("Błąd podczas czyszczenia: " + data.error);
      }
    } catch (error) {
      console.error("Error running cleanup:", error);
      alert("Błąd połączenia");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        🗑️ Czyszczenie Transakcji
      </h2>

      <p className="text-gray-600 mb-6">
        System automatycznie usuwa logi transakcji starsze niż 1 miesiąc. Stany
        magazynowe pozostają niezmienione.
      </p>

      {/* Get Statistics */}
      <div className="mb-6">
        <button
          onClick={getStats}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
        >
          {loading ? "Ładowanie..." : "📊 Sprawdź Statystyki"}
        </button>
      </div>

      {/* Statistics Display */}
      {stats && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Statystyki Transakcji
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Transakcje starsze niż:{" "}
            <strong>{stats.summary.cutoffDateFormatted}</strong>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded p-3">
              <div className="text-sm text-gray-600">🍷 Alkohole</div>
              <div className="text-lg font-semibold">
                {stats.stats.alcohol.total} total
              </div>
              <div className="text-sm text-red-600">
                {stats.stats.alcohol.toDelete} do usunięcia
              </div>
            </div>

            <div className="bg-white rounded p-3">
              <div className="text-sm text-gray-600">🥤 Naciągi</div>
              <div className="text-lg font-semibold">
                {stats.stats.naciagi.total} total
              </div>
              <div className="text-sm text-red-600">
                {stats.stats.naciagi.toDelete} do usunięcia
              </div>
            </div>

            <div className="bg-white rounded p-3">
              <div className="text-sm text-gray-600">🥄 Suchy</div>
              <div className="text-lg font-semibold">
                {stats.stats.suchy.total} total
              </div>
              <div className="text-sm text-red-600">
                {stats.stats.suchy.toDelete} do usunięcia
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <div className="text-sm text-blue-800">
              <strong>Podsumowanie:</strong>
            </div>
            <div className="text-lg font-bold text-blue-800">
              {stats.summary.totalToDelete} transakcji do usunięcia
            </div>
            <div className="text-sm text-blue-600">
              {stats.summary.totalToKeep} transakcji zostanie zachowanych
            </div>
          </div>
        </div>
      )}

      {/* Cleanup Buttons */}
      {stats && stats.summary.totalToDelete > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">
            Uruchom Czyszczenie:
          </h3>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => runCleanup("all")}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
            >
              🗑️ Wyczyść Wszystkie ({stats.summary.totalToDelete})
            </button>

            {stats.stats.alcohol.toDelete > 0 && (
              <button
                onClick={() => runCleanup("alcohol")}
                disabled={loading}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
              >
                🍷 Alkohole ({stats.stats.alcohol.toDelete})
              </button>
            )}

            {stats.stats.naciagi.toDelete > 0 && (
              <button
                onClick={() => runCleanup("naciagi")}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
              >
                🥤 Naciągi ({stats.stats.naciagi.toDelete})
              </button>
            )}

            {stats.stats.suchy.toDelete > 0 && (
              <button
                onClick={() => runCleanup("suchy")}
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
              >
                🥄 Suchy ({stats.stats.suchy.toDelete})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Cleanup Result */}
      {cleanupResult && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            ✅ Czyszczenie Zakończone
          </h3>
          <p className="text-green-700 mb-3">{cleanupResult.message}</p>

          <div className="text-sm text-green-600">
            <div>Usunięte transakcje:</div>
            <ul className="list-disc list-inside ml-4">
              <li>Alkohole: {cleanupResult.results.alcohol.deleted}</li>
              <li>Naciągi: {cleanupResult.results.naciagi.deleted}</li>
              <li>Suchy: {cleanupResult.results.suchy.deleted}</li>
            </ul>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-yellow-800 mb-2">
          ℹ️ Informacja
        </h4>
        <div className="text-sm text-yellow-700 space-y-1">
          <div>• Usuwane są tylko logi transakcji starsze niż 1 miesiąc</div>
          <div>• Aktualne stany magazynowe pozostają niezmienione</div>
          <div>• Operacja jest nieodwracalna</div>
          <div>• Zaleca się regularne czyszczenie dla lepszej wydajności</div>
        </div>
      </div>
    </div>
  );
}
