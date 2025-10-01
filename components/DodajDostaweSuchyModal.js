"use client";

import { useState } from "react";

export default function DodajDostaweSuchyModal({
  isOpen,
  onClose,
  produkt,
  onSuccess,
}) {
  const [ilosc, setIlosc] = useState("");
  const [dostarczylKto, setDostarczylKto] = useState("");
  const [opis, setOpis] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ilosc || !dostarczylKto) {
      alert("Podaj ilość i nazwę dostawcy");
      return;
    }

    if (Number(ilosc) <= 0) {
      alert("Podaj prawidłową ilość większą od 0");
      return;
    }

    setIsSubmitting(true);

    try {
      // Update product quantity
      const updateResponse = await fetch(`/api/suchy/${produkt._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          typOperacji: "dostawa",
          ilosc: Number(ilosc),
          notatki: opis,
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(
          errorData.error || "Błąd podczas aktualizacji produktu"
        );
      }

      // Create transaction record
      const transactionResponse = await fetch(`/api/suchy-transakcje`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          suchyId: produkt._id,
          nazwaSuchy: produkt.nazwa,
          ilosc: Number(ilosc),
          typTransakcji: "dostawa",
          opis: opis,
          nazwaPracownika: dostarczylKto,
          dataTransakcji: new Date(),
        }),
      });

      if (!transactionResponse.ok) {
        const errorData = await transactionResponse.json();
        console.warn(
          "Ostrzeżenie: Nie udało się zapisać transakcji:",
          errorData.error
        );
        alert(
          "Dostawa została dodana, ale transakcja może nie zostać zapisana"
        );
      }

      // Reset form
      setIlosc("");
      setDostarczylKto("");
      setOpis("");

      // Close modal and refresh data
      onClose();
      onSuccess();
    } catch (error) {
      console.error("Błąd podczas dodawania dostawy:", error);
      alert(`Błąd: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIlosc("");
      setDostarczylKto("");
      setOpis("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          Dodaj dostawę: {produkt?.nazwa}
        </h2>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Aktualny stan: {produkt?.aktualnaIlosc} {produkt?.jednostka || "kg"}
          </p>
          <p className="text-sm text-gray-600">
            Kategoria: {produkt?.podkategoria}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ilość dostawy ({produkt?.jednostka || "kg"})
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={ilosc}
              onChange={(e) => setIlosc(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 cursor-text"
              placeholder="0.0"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dostarczone przez
            </label>
            <input
              type="text"
              value={dostarczylKto}
              onChange={(e) => setDostarczylKto(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 cursor-text"
              placeholder="Kto dostarcza produkt?"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opis (opcjonalny)
            </label>
            <textarea
              value={opis}
              onChange={(e) => setOpis(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 cursor-text"
              rows={3}
              placeholder="Informacje o dostawie, dostawca, data faktury..."
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Dodawanie..." : "Dodaj dostawę"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 disabled:opacity-50 cursor-pointer"
              disabled={isSubmitting}
            >
              Anuluj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
