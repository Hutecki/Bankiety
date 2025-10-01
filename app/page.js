"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-8">
        {/* Header */}
        <div className="relative mb-12">
          {/* Small Planner Icon - positioned absolutely in top-right */}
          <div className="absolute top-0 right-0">
            <Link href="/planner" className="group cursor-pointer">
              <div className="bg-white rounded-full p-3 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-transparent group-hover:border-slate-300">
                <div className="text-2xl">📋</div>
              </div>
            </Link>
          </div>

          {/* Main Header Content */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              System Bankietowy
            </h1>
            <p className="text-gray-600 text-lg">
              Zarządzanie alkoholami, naciągami i produktami suchymi
            </p>
          </div>
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 max-w-7xl mx-auto">
          {/* Alkohole */}
          <Link href="/alkohole" className="group cursor-pointer">
            <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent group-hover:border-blue-300">
              <div className="text-center">
                <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">🍷</div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                  Alkohole
                </h2>
                <p className="text-gray-600 mb-2 sm:mb-4">
                  Zarządzanie magazynem alkoholi
                </p>
                <div className="text-blue-600 font-medium text-base sm:text-lg">
                  Kliknij aby przejść →
                </div>
              </div>
            </div>
          </Link>

          {/* Naciągi */}
          <Link href="/naciagi" className="group cursor-pointer">
            <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent group-hover:border-green-300">
              <div className="text-center">
                <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">🥤</div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                  Naciągi
                </h2>
                <p className="text-gray-600 mb-2 sm:mb-4">
                  Zarządzanie napojami i mlekiem
                </p>
                <div className="text-green-600 font-medium text-base sm:text-lg">
                  Kliknij aby przejść →
                </div>
              </div>
            </div>
          </Link>

          {/* Suchy */}
          <Link href="/suchy" className="group cursor-pointer">
            <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent group-hover:border-amber-300">
              <div className="text-center">
                <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">☕</div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                  Suchy
                </h2>
                <p className="text-gray-600 mb-2 sm:mb-4">
                  Zarządzanie kawą i cukrem
                </p>
                <div className="text-amber-600 font-medium text-base sm:text-lg">
                  Kliknij aby przejść →
                </div>
              </div>
            </div>
          </Link>

          {/* Raport */}
          <Link href="/raport" className="group cursor-pointer">
            <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent group-hover:border-purple-300">
              <div className="text-center">
                <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">📊</div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                  Raport
                </h2>
                <p className="text-gray-600 mb-2 sm:mb-4">
                  Analiza i statystyki magazynów
                </p>
                <div className="text-purple-600 font-medium text-base sm:text-lg">
                  Kliknij aby przejść →
                </div>
              </div>
            </div>
          </Link>

          {/* Admin - Only for admin users */}
          {session?.user?.role === "admin" && (
            <Link href="/admin" className="group cursor-pointer">
              <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent group-hover:border-gray-300">
                <div className="text-center">
                  <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">⚙️</div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                    Administracja
                  </h2>
                  <p className="text-gray-600 mb-2 sm:mb-4">
                    Zarządzanie systemem i czyszczenie
                  </p>
                  <div className="text-gray-600 font-medium text-base sm:text-lg">
                    Kliknij aby przejść →
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>System zarządzania dla firm bankietowych</p>
        </div>
      </div>
    </div>
  );
}
