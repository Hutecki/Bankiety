"use client";

import { useState, useEffect } from "react";

export default function WeeklyPlanner() {
  const [plans, setPlans] = useState([]);
  const [currentWeek, setCurrentWeek] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    nazwaFirmy: "",
    dzienTygodnia: "",
    godzinyObslugi: "",
  });

  const daysOfWeek = [
    "poniedziałek",
    "wtorek",
    "środa",
    "czwartek",
    "piątek",
    "sobota",
    "niedziela",
  ];

  const dayIcons = {
    poniedziałek: "📅",
    wtorek: "📅",
    środa: "📅",
    czwartek: "📅",
    piątek: "📅",
    sobota: "🎉",
    niedziela: "🎉",
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/weekly-plan");
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans);
        setCurrentWeek(data.currentWeek);
      }
    } catch (error) {
      console.error("Błąd podczas pobierania planów:", error);
      alert("Błąd podczas ładowania planów");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlan = async (e) => {
    e.preventDefault();

    if (
      !formData.nazwaFirmy ||
      !formData.dzienTygodnia ||
      !formData.godzinyObslugi
    ) {
      alert("Wszystkie pola są wymagane");
      return;
    }

    try {
      const response = await fetch("/api/weekly-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchPlans();
        setShowAddModal(false);
        setFormData({ nazwaFirmy: "", dzienTygodnia: "", godzinyObslugi: "" });
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Błąd podczas dodawania planu");
      }
    } catch (error) {
      console.error("Błąd podczas dodawania planu:", error);
      alert("Błąd podczas dodawania planu");
    }
  };

  const handleEditPlan = async (e) => {
    e.preventDefault();

    if (
      !formData.nazwaFirmy ||
      !formData.dzienTygodnia ||
      !formData.godzinyObslugi
    ) {
      alert("Wszystkie pola są wymagane");
      return;
    }

    try {
      const response = await fetch(`/api/weekly-plan/${selectedPlan._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchPlans();
        setShowEditModal(false);
        setSelectedPlan(null);
        setFormData({ nazwaFirmy: "", dzienTygodnia: "", godzinyObslugi: "" });
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Błąd podczas edycji planu");
      }
    } catch (error) {
      console.error("Błąd podczas edycji planu:", error);
      alert("Błąd podczas edycji planu");
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!confirm("Czy na pewno chcesz usunąć ten plan?")) {
      return;
    }

    try {
      const response = await fetch(`/api/weekly-plan/${planId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchPlans();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Błąd podczas usuwania planu");
      }
    } catch (error) {
      console.error("Błąd podczas usuwania planu:", error);
      alert("Błąd podczas usuwania planu");
    }
  };

  const handleCleanupAll = async () => {
    if (
      !confirm(
        "Czy na pewno chcesz usunąć WSZYSTKIE plany? Ta operacja jest nieodwracalna!"
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/weekly-plan?cleanup=all");
      if (response.ok) {
        await fetchPlans();
        alert("Wszystkie plany zostały usunięte");
      }
    } catch (error) {
      console.error("Błąd podczas czyszczenia bazy:", error);
      alert("Błąd podczas czyszczenia bazy danych");
    }
  };

  const openAddModal = (day) => {
    setFormData({ nazwaFirmy: "", dzienTygodnia: day, godzinyObslugi: "" });
    setShowAddModal(true);
  };

  const openEditModal = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      nazwaFirmy: plan.nazwaFirmy,
      dzienTygodnia: plan.dzienTygodnia,
      godzinyObslugi: plan.godzinyObslugi,
    });
    setShowEditModal(true);
  };

  const getPlanForDay = (day) => {
    return plans.find((plan) => plan.dzienTygodnia === day);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">📋 Plan Tygodnia</h2>
        <div className="flex gap-2">
          <button
            onClick={() => fetchPlans()}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            🔄
          </button>
          <button
            onClick={handleCleanupAll}
            className="text-red-600 hover:text-red-800 text-sm"
            title="Usuń wszystkie plany"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-500 mb-3">{currentWeek}</div>

      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-2">
          {daysOfWeek.map((day) => {
            const dayPlan = getPlanForDay(day);
            return (
              <div
                key={day}
                className={`border rounded-lg p-3 ${
                  dayPlan
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{dayIcons[day]}</span>
                    <span className="text-sm font-medium capitalize">
                      {day}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {dayPlan ? (
                      <>
                        <button
                          onClick={() => openEditModal(dayPlan)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeletePlan(dayPlan._id)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          ❌
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => openAddModal(day)}
                        className="text-green-600 hover:text-green-800 text-xs"
                      >
                        ➕
                      </button>
                    )}
                  </div>
                </div>
                {dayPlan && (
                  <div className="mt-2 text-xs">
                    <div className="font-medium text-gray-800">
                      {dayPlan.nazwaFirmy}
                    </div>
                    <div className="text-gray-600">
                      {dayPlan.godzinyObslugi}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4 text-gray-900">
              Dodaj plan na {formData.dzienTygodnia}
            </h3>
            <form onSubmit={handleAddPlan}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nazwa firmy
                </label>
                <input
                  type="text"
                  value={formData.nazwaFirmy}
                  onChange={(e) =>
                    setFormData({ ...formData, nazwaFirmy: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="np. Wesele Kowalskich"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Godziny obsługi
                </label>
                <input
                  type="text"
                  value={formData.godzinyObslugi}
                  onChange={(e) =>
                    setFormData({ ...formData, godzinyObslugi: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="np. 14:00-22:00"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
                >
                  Dodaj
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Anuluj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4 text-gray-900">
              Edytuj plan na {formData.dzienTygodnia}
            </h3>
            <form onSubmit={handleEditPlan}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dzień tygodnia
                </label>
                <select
                  value={formData.dzienTygodnia}
                  onChange={(e) =>
                    setFormData({ ...formData, dzienTygodnia: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nazwa firmy
                </label>
                <input
                  type="text"
                  value={formData.nazwaFirmy}
                  onChange={(e) =>
                    setFormData({ ...formData, nazwaFirmy: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="np. Wesele Kowalskich"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Godziny obsługi
                </label>
                <input
                  type="text"
                  value={formData.godzinyObslugi}
                  onChange={(e) =>
                    setFormData({ ...formData, godzinyObslugi: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="np. 14:00-22:00"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                >
                  Zapisz
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPlan(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Anuluj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
