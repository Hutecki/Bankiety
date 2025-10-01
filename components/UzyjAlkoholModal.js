"use client";

import { useState } from "react";

export default function UzyjAlkoholModal({ alkohol, onClose, onUpdate }) {
  const [ilosc, setIlosc] = useState("");
  const [nazwaPracownika, setNazwaPracownika] = useState("");
  const [notatki, setNotatki] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ilosc || !nazwaPracownika) {
      alert("Podaj ilość i nazwę pracownika");
      return;
    }

    if (parseInt(ilosc) > alkohol.aktualnaIlosc) {
      alert(
        `Nie można użyć ${ilosc} butelek. Dostępne: ${alkohol.aktualnaIlosc}`
      );
      return;
    }

    try {
      setLoading(true);

      // Update alcohol quantity
      const nowaIlosc = alkohol.aktualnaIlosc - parseInt(ilosc);
      const updateResponse = await fetch(`/api/alkohole/${alkohol._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aktualnaIlosc: nowaIlosc,
          lacznaUzyta: alkohol.lacznaUzyta + parseInt(ilosc),
        }),
      });

      if (updateResponse.ok) {
        // Create transaction record
        await fetch("/api/transakcje", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            alkoholId: alkohol._id,
            nazwaAlkoholu: alkohol.nazwa,
            typTransakcji: "uzycie",
            ilosc: -parseInt(ilosc),
            iloscPrzed: alkohol.aktualnaIlosc,
            iloscPo: nowaIlosc,
            nazwaPracownika,
            notatki,
          }),
        });

        onUpdate();
        onClose();
      } else {
        // Show server error to the user when update fails (e.g., 404)
        try {
          const err = await updateResponse.json();
          console.error("Update failed:", err);
          alert(err.error || "Błąd podczas aktualizacji alkoholu");
        } catch (e) {
          console.error("Update failed and response is not JSON", e);
          alert("Błąd podczas aktualizacji alkoholu");
        }
      }
    } catch (error) {
      console.error("Błąd podczas używania alkoholu:", error);
      alert("Wystąpił błąd podczas zapisywania");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          Użyj Alkohol - {alkohol.nazwa}
        </h2>
        <p className="mb-4 text-gray-600">
          Dostępne: {alkohol.aktualnaIlosc} butelek
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Ilość butelek do użycia *
            </label>
            <input
              type="number"
              min="1"
              max={alkohol.aktualnaIlosc}
              value={ilosc}
              onChange={(e) => setIlosc(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-gray-800 cursor-text"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Nazwa pracownika *
            </label>
            <input
              type="text"
              value={nazwaPracownika}
              onChange={(e) => setNazwaPracownika(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-gray-800 cursor-text"
              placeholder="np. Jan Kowalski"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Notatki
            </label>
            <textarea
              value={notatki}
              onChange={(e) => setNotatki(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-gray-800 cursor-text"
              rows="3"
              placeholder="np. Bankiet weselny - 100 osób"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Zapisywanie..." : "Użyj Alkohol"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 cursor-pointer"
            >
              Anuluj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
