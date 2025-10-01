"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DayDetailModal from "../../components/DayDetailModal";

export default function PlannerPage() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [currentWeek, setCurrentWeek] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showDayDetail, setShowDayDetail] = useState(false);

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

  const dayColors = {
    poniedziałek: "blue",
    wtorek: "green",
    środa: "purple",
    czwartek: "orange",
    piątek: "red",
    sobota: "pink",
    niedziela: "indigo",
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

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setShowDayDetail(true);
  };

  const handleAddPlan = async (planData) => {
    try {
      const response = await fetch("/api/weekly-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(planData),
      });

      if (response.ok) {
        await fetchPlans();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Błąd podczas dodawania planu");
      }
    } catch (error) {
      console.error("Błąd podczas dodawania planu:", error);
      alert("Błąd podczas dodawania planu");
    }
  };

  const handleEditPlan = async (planId, planData) => {
    try {
      const response = await fetch(`/api/weekly-plan/${planId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(planData),
      });

      if (response.ok) {
        await fetchPlans();
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

  const getPlansForDay = (day) => {
    return plans.filter((plan) => plan.dzienTygodnia === day);
  };

  const getTotalCompaniesCount = () => {
    return plans.length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
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
            <div className="flex items-center gap-3">
              <div className="text-5xl">📋</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Planer Tygodniowy
                </h1>
                <p className="text-gray-600">
                  Zarządzanie harmonogramem firm ({currentWeek}) -{" "}
                  {getTotalCompaniesCount()} firm
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchPlans}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
            >
              🔄 Odśwież
            </button>
            <button
              onClick={handleCleanupAll}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
              title="Usuń wszystkie plany (przydatne przy planowaniu nowego tygodnia)"
            >
              🗑️ Wyczyść wszystko
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie planów...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {daysOfWeek.map((day) => {
              const dayPlans = getPlansForDay(day);
              const color = dayColors[day];
              const hasPlans = dayPlans.length > 0;

              return (
                <div
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                    hasPlans
                      ? `border-${color}-500 bg-${color}-50`
                      : "border-gray-300"
                  } min-h-[200px] flex flex-col cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{dayIcons[day]}</span>
                      <h3 className="text-xl font-bold text-gray-800 capitalize">
                        {day}
                      </h3>
                    </div>
                    <div className={`text-lg font-bold text-${color}-600`}>
                      {dayPlans.length > 0
                        ? `${dayPlans.length} firm`
                        : "Pusty"}
                    </div>
                  </div>

                  {hasPlans ? (
                    <div className="flex-1 space-y-2">
                      {dayPlans.slice(0, 3).map((plan, index) => (
                        <div
                          key={plan._id}
                          className={`bg-${color}-100 rounded-lg p-3 border border-${color}-200`}
                        >
                          <h4 className="font-semibold text-gray-800 text-sm mb-1">
                            {plan.nazwaFirmy}
                          </h4>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div className="flex items-center gap-1">
                              <span>🕐</span>
                              <span>{plan.godzinyObslugi}</span>
                            </div>
                            {plan.sala && (
                              <div className="flex items-center gap-1">
                                <span>🏢</span>
                                <span>{plan.sala}</span>
                              </div>
                            )}
                            {plan.liczbaOsob && (
                              <div className="flex items-center gap-1">
                                <span>👥</span>
                                <span>{plan.liczbaOsob} osób</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {dayPlans.length > 3 && (
                        <div className="text-center text-sm text-gray-500 font-medium">
                          +{dayPlans.length - 3} więcej...
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <div className="text-4xl mb-2">📅</div>
                        <p className="text-sm">Brak planów</p>
                        <p className="text-xs mt-1">Kliknij aby dodać</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>💡 Kliknij na dzień aby zarządzać firmami i szczegółami planów</p>
        </div>
      </div>

      {/* Day Detail Modal */}
      <DayDetailModal
        isOpen={showDayDetail}
        onClose={() => {
          setShowDayDetail(false);
          setSelectedDay(null);
        }}
        day={selectedDay}
        plans={selectedDay ? getPlansForDay(selectedDay) : []}
        onAddPlan={handleAddPlan}
        onEditPlan={handleEditPlan}
        onDeletePlan={handleDeletePlan}
        currentWeek={currentWeek}
      />
    </div>
  );
}
