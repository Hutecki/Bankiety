import { NextResponse } from "next/server";
import connectDB from "../../../config/database.js";
import WeeklyPlan from "../../../models/WeeklyPlan.js";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const cleanup = searchParams.get("cleanup");

    // Handle cleanup operations
    if (cleanup === "old") {
      await WeeklyPlan.cleanupOldWeeks();
      return NextResponse.json({ message: "Stare tygodnie zostały usunięte" });
    }

    if (cleanup === "all") {
      await WeeklyPlan.cleanupAllData();
      return NextResponse.json({ message: "Wszystkie dane zostały usunięte" });
    }

    // Get all plans (no week filtering)
    const plans = await WeeklyPlan.find({}).sort({
      dataUtworzenia: -1, // Show newest first
    });

    return NextResponse.json({
      currentWeek: WeeklyPlan.getCurrentWeek(), // Keep for compatibility
      plans: plans,
    });
  } catch (error) {
    console.error("Błąd podczas pobierania planów:", error);
    return NextResponse.json(
      { error: "Błąd podczas pobierania planów tygodniowych" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const data = await request.json();
    const {
      nazwaFirmy,
      dzienTygodnia,
      godzinyObslugi,
      sala,
      liczbaOsob,
      opiekun,
      uwagi,
    } = data;

    if (!nazwaFirmy || !dzienTygodnia || !godzinyObslugi) {
      return NextResponse.json(
        { error: "Nazwa firmy, dzień tygodnia i godziny obsługi są wymagane" },
        { status: 400 }
      );
    }

    const currentWeek = WeeklyPlan.getCurrentWeek();

    // Multiple companies per day are now allowed - no uniqueness check

    const newPlan = new WeeklyPlan({
      nazwaFirmy,
      dzienTygodnia,
      godzinyObslugi,
      sala,
      liczbaOsob,
      opiekun,
      uwagi,
      rokTydzien: currentWeek,
    });

    await newPlan.save();

    return NextResponse.json(newPlan, { status: 201 });
  } catch (error) {
    console.error("Błąd podczas tworzenia planu:", error);
    return NextResponse.json(
      { error: "Błąd podczas tworzenia planu" },
      { status: 500 }
    );
  }
}
