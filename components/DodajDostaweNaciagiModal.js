"use client";

import { useState } from "react";

export default function DodajDostaweNaciagiModal({
  naciag,
  onClose,
  onUpdate,
  kategoria,
  podkategoria,
  produktId,
}) {
  const [ilosc, setIlosc] = useState("");
  const [dostarczylKto, setDostarczylKto] = useState("");
  const [notatki, setNotatki] = useState("");
  const [nazwa, setNazwa] = useState("");
  const [opis, setOpis] = useState("");
  const [loading, setLoading] = useState(false);

  const isNewProduct = !naciag && kategoria && podkategoria;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ilosc) {
      alert("Podaj ilość");
      return;
    }

    if (!isNewProduct && !dostarczylKto) {
      alert("Podaj osobę dostarczającą");
      return;
    }

    if (isNewProduct && !nazwa) {
      alert("Podaj nazwę nowego produktu");
      return;
    }

    try {
      setLoading(true);

      if (isNewProduct) {
        // Create new product
        const createResponse = await fetch("/api/naciagi", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nazwa: nazwa,
            kategoria: kategoria,
            podkategoria: podkategoria,
            aktualnaIlosc: parseInt(ilosc),
            opis: opis,
            laczenaDostarczona: parseInt(ilosc),
            lacznaUzyta: 0,
            ruchMagazynowy: parseInt(ilosc),
            jednostka: "szt",
          }),
        });

        if (createResponse.ok) {
          alert("Nowy produkt został dodany pomyślnie!");
          onUpdate();
          onClose();
        } else {
          const err = await createResponse.json();
          alert(err.error || "Błąd podczas tworzenia produktu");
        }
      } else {
        // Update existing product
        const updateResponse = await fetch(`/api/naciagi/${naciag._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            typOperacji: "dostawa",
            ilosc: parseInt(ilosc),
            notatki: notatki,
          }),
        });

        if (updateResponse.ok) {
          // Create transaction record
          const transactionResponse = await fetch("/api/naciagi-transakcje", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              naciagiId: naciag._id,
              nazwaNaciagu: naciag.nazwa,
              kategoria: naciag.kategoria,
              podkategoria: naciag.podkategoria,
              typTransakcji: "dostawa",
              ilosc: parseInt(ilosc),
              nazwaPracownika: dostarczylKto,
              opis: notatki,
              jednostka: naciag.jednostka || "szt",
            }),
          });

          if (!transactionResponse.ok) {
            const transErr = await transactionResponse.json();
            console.error("Transaction creation failed:", transErr);
            alert(
              "Produkt zaktualizowany, ale nie udało się zapisać transakcji: " +
                (transErr.error || "Nieznany błąd")
            );
          }

          alert("Dostawa została dodana pomyślnie!");
          onUpdate();
          onClose();
        } else {
          try {
            const err = await updateResponse.json();
            console.error("Update failed:", err);
            alert(err.error || "Błąd podczas aktualizacji produktu");
          } catch (e) {
            console.error("Update failed and response is not JSON", e);
            alert("Błąd podczas aktualizacji produktu");
          }
        }
      }
    } catch (error) {
      console.error("Błąd podczas operacji:", error);
      alert("Wystąpił błąd podczas zapisywania");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {isNewProduct
              ? `➕ Dodaj Nowy ${podkategoria}`
              : `📦 Dodaj Dostawę - ${naciag.nazwa}`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Info */}
        {!isNewProduct && (
          <div className="px-6 pt-4">
            <p className="text-gray-600">
              Aktualny stan: {naciag.aktualnaIlosc} {naciag.jednostka || "szt"}
            </p>
          </div>
        )}

        {/* Form */}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {isNewProduct && (
              <>
                {/* Nazwa */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nazwa produktu *
                  </label>
                  <input
                    type="text"
                    value={nazwa}
                    onChange={(e) => setNazwa(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 cursor-text"
                    placeholder="np. Żubr, Tyskie, itp."
                    required
                  />
                </div>

                {/* Opis */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opis (opcjonalny)
                  </label>
                  <textarea
                    value={opis}
                    onChange={(e) => setOpis(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 cursor-text"
                    placeholder="np. Piwo jasne, Napój alkoholowy"
                    rows="3"
                  />
                </div>
              </>
            )}

            {/* Ilość */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isNewProduct
                  ? "Początkowa ilość *"
                  : `Ilość dostarczonych (${naciag?.jednostka || "szt"}) *`}
              </label>
              <input
                type="number"
                min="1"
                value={ilosc}
                onChange={(e) => setIlosc(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 cursor-text"
                placeholder={isNewProduct ? "np. 24" : ""}
                required
              />
            </div>

            {!isNewProduct && (
              <>
                {/* Kto dostarczył */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kto dostarczył *
                  </label>
                  <input
                    type="text"
                    value={dostarczylKto}
                    onChange={(e) => setDostarczylKto(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 cursor-text"
                    placeholder="np. Menedżer Magazynu"
                    required
                  />
                </div>

                {/* Notatki */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notatki
                  </label>
                  <textarea
                    value={notatki}
                    onChange={(e) => setNotatki(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 cursor-text"
                    rows="3"
                    placeholder="np. Faktura nr 123/2025, Dostawca XYZ"
                  />
                </div>
              </>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium cursor-pointer"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:bg-green-300 font-medium cursor-pointer"
            >
              {loading
                ? "Zapisywanie..."
                : isNewProduct
                ? "Dodaj Produkt"
                : "Dodaj Dostawę"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
