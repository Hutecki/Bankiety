"use client";

import { useState } from "react";

export default function DodajAlkoholModal({
  isOpen,
  onClose,
  onSuccess,
  kategoria,
}) {
  const [formData, setFormData] = useState({
    nazwa: "",
    ilosc: "",
    opis: "",
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nazwa || !formData.ilosc) {
      alert("Podaj nazwę i ilość alkoholu");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/alkohole", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nazwa: formData.nazwa,
          kategoria: kategoria.dbCategory,
          aktualnaIlosc: parseInt(formData.ilosc),
          opis: formData.opis,
          laczenaDostarczona: parseInt(formData.ilosc),
          lacznaUzyta: 0,
          ruchMagazynowy: parseInt(formData.ilosc),
        }),
      });

      if (response.ok) {
        alert("Alkohol został dodany pomyślnie!");
        setFormData({ nazwa: "", ilosc: "", opis: "" });
        onSuccess();
        onClose();
      } else {
        throw new Error("Nie udało się dodać alkoholu");
      }
    } catch (error) {
      console.error("Błąd podczas dodawania alkoholu:", error);
      alert("Wystąpił błąd podczas dodawania alkoholu");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ nazwa: "", ilosc: "", opis: "" });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            ➕ Dodaj Nowy Alkohol
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Nazwa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nazwa alkoholu *
              </label>
              <input
                type="text"
                value={formData.nazwa}
                onChange={(e) =>
                  setFormData({ ...formData, nazwa: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 cursor-text"
                placeholder="np. Wino Chardonnay 2021"
                required
              />
            </div>

            {/* Ilość */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Początkowa ilość *
              </label>
              <input
                type="number"
                min="1"
                value={formData.ilosc}
                onChange={(e) =>
                  setFormData({ ...formData, ilosc: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 cursor-text"
                placeholder="np. 24"
                required
              />
            </div>

            {/* Opis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opis (opcjonalny)
              </label>
              <textarea
                value={formData.opis}
                onChange={(e) =>
                  setFormData({ ...formData, opis: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 cursor-text"
                placeholder="np. Białe wino suche z Francji"
                rows="3"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium cursor-pointer"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-blue-300 font-medium cursor-pointer"
            >
              {loading ? "Dodawanie..." : "Dodaj Alkohol"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
