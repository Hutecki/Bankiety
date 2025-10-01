"use client";

import { useState } from "react";

export default function DayDetailModal({
  isOpen,
  onClose,
  day,
  plans,
  onAddPlan,
  onEditPlan,
  onDeletePlan,
  currentWeek,
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    nazwaFirmy: "",
    godzinyObslugi: "",
    sala: "",
    liczbaOsob: "",
    opiekun: "",
    uwagi: "",
  });

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

  if (!isOpen) return null;

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nazwaFirmy || !formData.godzinyObslugi) {
      alert("Nazwa firmy i godziny obsługi są wymagane");
      return;
    }

    await onAddPlan({
      ...formData,
      dzienTygodnia: day,
      liczbaOsob: formData.liczbaOsob ? parseInt(formData.liczbaOsob) : null,
    });

    setFormData({
      nazwaFirmy: "",
      godzinyObslugi: "",
      sala: "",
      liczbaOsob: "",
      opiekun: "",
      uwagi: "",
    });
    setShowAddForm(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nazwaFirmy || !formData.godzinyObslugi) {
      alert("Nazwa firmy i godziny obsługi są wymagane");
      return;
    }

    await onEditPlan(editingPlan._id, {
      ...formData,
      dzienTygodnia: day,
      liczbaOsob: formData.liczbaOsob ? parseInt(formData.liczbaOsob) : null,
    });

    setFormData({
      nazwaFirmy: "",
      godzinyObslugi: "",
      sala: "",
      liczbaOsob: "",
      opiekun: "",
      uwagi: "",
    });
    setShowEditForm(false);
    setEditingPlan(null);
  };

  const handleEditClick = (plan) => {
    setEditingPlan(plan);
    setFormData({
      nazwaFirmy: plan.nazwaFirmy,
      godzinyObslugi: plan.godzinyObslugi,
      sala: plan.sala || "",
      liczbaOsob: plan.liczbaOsob || "",
      opiekun: plan.opiekun || "",
      uwagi: plan.uwagi || "",
    });
    setShowEditForm(true);
  };

  const color = dayColors[day];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`bg-${color}-100 border-b border-${color}-200 p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{dayIcons[day]}</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 capitalize">
                  {day}
                </h2>
                <p className="text-gray-600">{currentWeek}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddForm(true)}
                className={`bg-${color}-500 text-white px-4 py-2 rounded-lg hover:bg-${color}-600 font-medium cursor-pointer`}
              >
                ➕ Dodaj firmę
              </button>
              <button
                onClick={onClose}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 font-medium cursor-pointer"
              >
                ✕ Zamknij
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {showAddForm && (
            <div
              className={`bg-${color}-50 rounded-lg p-6 mb-6 border border-${color}-200`}
            >
              <h3 className="text-lg font-bold mb-4 text-gray-900">
                Dodaj nową firmę
              </h3>
              <form
                onSubmit={handleAddSubmit}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Nazwa firmy / Wydarzenia *
                  </label>
                  <input
                    type="text"
                    value={formData.nazwaFirmy}
                    onChange={(e) =>
                      setFormData({ ...formData, nazwaFirmy: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 cursor-text"
                    placeholder="np. Wesele Kowalskich"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Godziny obsługi *
                  </label>
                  <input
                    type="text"
                    value={formData.godzinyObslugi}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        godzinyObslugi: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 cursor-text"
                    placeholder="np. 14:00-22:00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sala
                  </label>
                  <input
                    type="text"
                    value={formData.sala}
                    onChange={(e) =>
                      setFormData({ ...formData, sala: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 cursor-text"
                    placeholder="np. Sala Weselna A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Liczba osób
                  </label>
                  <input
                    type="number"
                    value={formData.liczbaOsob}
                    onChange={(e) =>
                      setFormData({ ...formData, liczbaOsob: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 cursor-text"
                    placeholder="np. 120"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opiekun
                  </label>
                  <input
                    type="text"
                    value={formData.opiekun}
                    onChange={(e) =>
                      setFormData({ ...formData, opiekun: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 cursor-text"
                    placeholder="np. Jan Kowalski"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Uwagi
                  </label>
                  <input
                    type="text"
                    value={formData.uwagi}
                    onChange={(e) =>
                      setFormData({ ...formData, uwagi: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 cursor-text"
                    placeholder="Dodatkowe informacje"
                  />
                </div>
                <div className="col-span-2 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 font-medium cursor-pointer"
                  >
                    Dodaj
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 font-medium cursor-pointer"
                  >
                    Anuluj
                  </button>
                </div>
              </form>
            </div>
          )}

          {showEditForm && (
            <div
              className={`bg-yellow-50 rounded-lg p-6 mb-6 border border-yellow-200`}
            >
              <h3 className="text-lg font-bold mb-4 text-gray-900">
                Edytuj firmę
              </h3>
              <form
                onSubmit={handleEditSubmit}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nazwa firmy / Wydarzenia *
                  </label>
                  <input
                    type="text"
                    value={formData.nazwaFirmy}
                    onChange={(e) =>
                      setFormData({ ...formData, nazwaFirmy: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 cursor-text"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Godziny obsługi *
                  </label>
                  <input
                    type="text"
                    value={formData.godzinyObslugi}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        godzinyObslugi: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 cursor-text"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sala
                  </label>
                  <input
                    type="text"
                    value={formData.sala}
                    onChange={(e) =>
                      setFormData({ ...formData, sala: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 cursor-text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Liczba osób
                  </label>
                  <input
                    type="number"
                    value={formData.liczbaOsob}
                    onChange={(e) =>
                      setFormData({ ...formData, liczbaOsob: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 cursor-text"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opiekun
                  </label>
                  <input
                    type="text"
                    value={formData.opiekun}
                    onChange={(e) =>
                      setFormData({ ...formData, opiekun: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 cursor-text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Uwagi
                  </label>
                  <input
                    type="text"
                    value={formData.uwagi}
                    onChange={(e) =>
                      setFormData({ ...formData, uwagi: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 cursor-text"
                  />
                </div>
                <div className="col-span-2 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 font-medium cursor-pointer"
                  >
                    Zapisz
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingPlan(null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 font-medium cursor-pointer"
                  >
                    Anuluj
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Plans List */}
          {plans.length === 0 && !showAddForm ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📅</div>
              <p className="text-gray-600 mb-4">Brak planów na ten dzień</p>
              <button
                onClick={() => setShowAddForm(true)}
                className={`bg-${color}-500 text-white px-6 py-3 rounded-lg hover:bg-${color}-600 font-medium cursor-pointer`}
              >
                Dodaj pierwszą firmę
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Firmy na {day} ({plans.length})
              </h3>
              {plans.map((plan, index) => (
                <div
                  key={plan._id}
                  className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-gray-800 mb-2">
                        {plan.nazwaFirmy}
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span>🕐</span>
                          <span className="font-medium">
                            {plan.godzinyObslugi}
                          </span>
                        </div>
                        {plan.sala && (
                          <div className="flex items-center gap-2">
                            <span>🏢</span>
                            <span>{plan.sala}</span>
                          </div>
                        )}
                        {plan.liczbaOsob && (
                          <div className="flex items-center gap-2">
                            <span>👥</span>
                            <span>{plan.liczbaOsob} osób</span>
                          </div>
                        )}
                        {plan.opiekun && (
                          <div className="flex items-center gap-2">
                            <span>👤</span>
                            <span>{plan.opiekun}</span>
                          </div>
                        )}
                      </div>
                      {plan.uwagi && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-start gap-2">
                            <span>💡</span>
                            <div>
                              <p className="font-medium text-sm text-gray-700">
                                Uwagi:
                              </p>
                              <p className="text-sm text-gray-600">
                                {plan.uwagi}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditClick(plan)}
                        className="text-blue-600 hover:text-blue-800 text-lg cursor-pointer"
                        title="Edytuj"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onDeletePlan(plan._id)}
                        className="text-red-600 hover:text-red-800 text-lg cursor-pointer"
                        title="Usuń"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 border-t border-gray-200 pt-2">
                    Utworzono: {new Date(plan.dataUtworzenia).toLocaleString()}
                    {plan.dataModyfikacji &&
                      plan.dataModyfikacji !== plan.dataUtworzenia && (
                        <span>
                          {" "}
                          | Zmodyfikowano:{" "}
                          {new Date(plan.dataModyfikacji).toLocaleString()}
                        </span>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
