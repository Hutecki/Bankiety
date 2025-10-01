import { NextResponse } from "next/server";
import connectDB from "../../../../config/database.js";
import WeeklyPlan from "../../../../models/WeeklyPlan.js";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const plan = await WeeklyPlan.findById(params.id);

    if (!plan) {
      return NextResponse.json(
        { error: "Plan nie został znaleziony" },
        { status: 404 }
      );
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Błąd podczas pobierania planu:", error);
    return NextResponse.json(
      { error: "Błąd podczas pobierania planu" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
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

    const plan = await WeeklyPlan.findById(params.id);

    if (!plan) {
      return NextResponse.json(
        { error: "Plan nie został znaleziony" },
        { status: 404 }
      );
    }

    // Multiple companies per day are now allowed - no uniqueness check

    plan.nazwaFirmy = nazwaFirmy;
    plan.dzienTygodnia = dzienTygodnia;
    plan.godzinyObslugi = godzinyObslugi;
    plan.sala = sala;
    plan.liczbaOsob = liczbaOsob;
    plan.opiekun = opiekun;
    plan.uwagi = uwagi;
    plan.dataModyfikacji = new Date();

    await plan.save();

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Błąd podczas aktualizacji planu:", error);
    return NextResponse.json(
      { error: "Błąd podczas aktualizacji planu" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const plan = await WeeklyPlan.findById(params.id);

    if (!plan) {
      return NextResponse.json(
        { error: "Plan nie został znaleziony" },
        { status: 404 }
      );
    }

    await WeeklyPlan.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Plan został usunięty" });
  } catch (error) {
    console.error("Błąd podczas usuwania planu:", error);
    return NextResponse.json(
      { error: "Błąd podczas usuwania planu" },
      { status: 500 }
    );
  }
}
