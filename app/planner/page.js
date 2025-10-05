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
        "Czy na pewno chcesz usunąć WSZYSTKIE plany z bazy danych? Ta operacja jest nieodwracalna i usunie wszystkie zapisane firmy ze wszystkich dni!"
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/weekly-plan?cleanup=all");
      if (response.ok) {
        await fetchPlans();
        alert("Wszystkie plany zostały usunięte z bazy danych");
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
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <button
              onClick={() => router.push("/")}
              className="text-gray-600 hover:text-gray-800 text-2xl cursor-pointer flex-shrink-0"
            >
              ←
            </button>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="text-3xl sm:text-5xl flex-shrink-0">📋</div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 truncate">
                  Planer Bankietowy
                </h1>
                <p className="text-sm sm:text-base text-gray-600 truncate">
                  Harmonogram wszystkich firm - {getTotalCompaniesCount()} firm
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons - Mobile Responsive */}
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <button
              onClick={fetchPlans}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors cursor-pointer"
            >
              🔄 Odśwież
            </button>
            <button
              onClick={handleCleanupAll}
              className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors cursor-pointer"
              title="Usuń wszystkie plany z bazy danych"
            >
              🗑️ Usuń Wszystko
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie planów...</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
            {daysOfWeek.map((day) => {
              const dayPlans = getPlansForDay(day);
              const color = dayColors[day];
              const hasPlans = dayPlans.length > 0;

              // Get safe CSS classes based on color
              const getBorderClass = (color, hasPlans) => {
                if (!hasPlans) return "border-gray-300 bg-white";
                const colorMap = {
                  blue: "border-blue-500 bg-blue-50",
                  green: "border-green-500 bg-green-50",
                  purple: "border-purple-500 bg-purple-50",
                  orange: "border-orange-500 bg-orange-50",
                  red: "border-red-500 bg-red-50",
                  pink: "border-pink-500 bg-pink-50",
                  indigo: "border-indigo-500 bg-indigo-50",
                };
                return colorMap[color] || "border-gray-300 bg-white";
              };

              const getTextClass = (color) => {
                const colorMap = {
                  blue: "text-blue-600",
                  green: "text-green-600",
                  purple: "text-purple-600",
                  orange: "text-orange-600",
                  red: "text-red-600",
                  pink: "text-pink-600",
                  indigo: "text-indigo-600",
                };
                return colorMap[color] || "text-gray-600";
              };

              const getPlanBgClass = (color) => {
                const colorMap = {
                  blue: "bg-blue-100 border-blue-200",
                  green: "bg-green-100 border-green-200",
                  purple: "bg-purple-100 border-purple-200",
                  orange: "bg-orange-100 border-orange-200",
                  red: "bg-red-100 border-red-200",
                  pink: "bg-pink-100 border-pink-200",
                  indigo: "bg-indigo-100 border-indigo-200",
                };
                return colorMap[color] || "bg-gray-100 border-gray-200";
              };

              return (
                <div
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`${getBorderClass(
                    color,
                    hasPlans
                  )} rounded-lg shadow-md p-4 sm:p-6 border-l-4 min-h-[180px] sm:min-h-[200px] flex flex-col cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]`}
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <span className="text-xl sm:text-2xl flex-shrink-0">
                        {dayIcons[day]}
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 capitalize truncate">
                        {day}
                      </h3>
                    </div>
                    <div
                      className={`text-sm sm:text-lg font-bold ${getTextClass(
                        color
                      )} flex-shrink-0`}
                    >
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
                          className={`${getPlanBgClass(
                            color
                          )} rounded-lg p-2 sm:p-3 border`}
                        >
                          <h4 className="font-semibold text-gray-800 text-xs sm:text-sm mb-1 truncate">
                            {plan.nazwaFirmy}
                          </h4>
                          <div className="text-xs text-gray-800 space-y-1">
                            <div className="flex items-center gap-1">
                              <span>🕐</span>
                              <span className="truncate">
                                {plan.godzinyObslugi}
                              </span>
                            </div>
                            {plan.sala && (
                              <div className="flex items-center gap-1">
                                <span>🏢</span>
                                <span className="truncate">{plan.sala}</span>
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
                        <div className="text-center text-xs sm:text-sm text-gray-700 font-medium">
                          +{dayPlans.length - 3} więcej...
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center text-gray-600">
                        <div className="text-3xl sm:text-4xl mb-2">📅</div>
                        <p className="text-xs sm:text-sm">Brak planów</p>
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
          <p className="mt-2">
            ℹ️ Plany pozostają w systemie do momentu ręcznego usunięcia
          </p>
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
