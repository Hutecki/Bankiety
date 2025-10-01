"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import TransactionCleanup from "../../components/TransactionCleanup";
import ZeroQuantities from "../../components/ZeroQuantities";

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      router.push("/login");
      return;
    }

    if (session.user.role !== "admin") {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Sprawdzanie uprawnień...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!session || session.user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">
            🚫 Brak dostępu
          </h1>
          <p className="text-gray-600 mb-6">
            Nie masz uprawnień do przeglądania tej strony.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            Powrót do strony głównej
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-2">
      <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => router.push("/")}
              className="text-gray-600 hover:text-gray-800 text-2xl sm:text-3xl cursor-pointer px-2 py-1 rounded-md"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              ←
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                ⚙️ Administracja
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Panel zarządzania systemem
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right">
              <p className="text-xs sm:text-sm text-gray-600">
                Zalogowany jako
              </p>
              <p className="font-semibold text-gray-800 text-sm sm:text-base">
                {session.user.username}
              </p>
              <p className="text-xs text-blue-600 uppercase">
                {session.user.role}
              </p>
            </div>
            <button
              onClick={() => {
                import("next-auth/react").then(({ signOut }) => {
                  signOut({ callbackUrl: "/login" });
                });
              }}
              className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 cursor-pointer text-xs sm:text-sm"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              Wyloguj
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-1 gap-6">
          {/* Transaction Cleanup Section */}
          <TransactionCleanup />

          {/* Zero Quantities Section */}
          <ZeroQuantities />

          {/* Additional Admin Features can be added here */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              📊 Statystyki Systemu
            </h2>
            <p className="text-gray-600">
              Dodatkowe funkcje administracyjne będą dostępne tutaj w
              przyszłości.
            </p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-blue-800 font-semibold">Szybki dostęp</div>
                <div className="mt-2 space-y-2">
                  <button
                    onClick={() => router.push("/raport")}
                    className="block w-full text-left text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    📊 Raporty
                  </button>
                  <button
                    onClick={() => router.push("/planner")}
                    className="block w-full text-left text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    📅 Planner
                  </button>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-green-800 font-semibold">Magazyn</div>
                <div className="mt-2 space-y-2">
                  <button
                    onClick={() => router.push("/alkohole")}
                    className="block w-full text-left text-green-600 hover:text-green-800 cursor-pointer"
                  >
                    🍷 Alkohole
                  </button>
                  <button
                    onClick={() => router.push("/naciagi")}
                    className="block w-full text-left text-green-600 hover:text-green-800 cursor-pointer"
                  >
                    🥤 Naciągi
                  </button>
                  <button
                    onClick={() => router.push("/suchy")}
                    className="block w-full text-left text-green-600 hover:text-green-800 cursor-pointer"
                  >
                    🥄 Suchy
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-gray-800 font-semibold">Konserwacja</div>
                <div className="mt-2 text-sm text-gray-600">
                  • Czyszczenie transakcji • Optymalizacja bazy danych • Kopie
                  zapasowe
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
