import { NextResponse } from "next/server";
import connectDB from "../../../config/database.js";
import NaciagiTransaction from "../../../models/NaciagiTransaction.js";

// GET - Fetch naciagi transactions
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 100;
    const kategoria = searchParams.get("kategoria");
    const podkategoria = searchParams.get("podkategoria");
    const typTransakcji = searchParams.get("typTransakcji");

    let query = {};

    if (kategoria) {
      query.kategoria = kategoria;
    }

    if (podkategoria) {
      query.podkategoria = podkategoria;
    }

    if (typTransakcji) {
      query.typTransakcji = typTransakcji;
    }

    const transakcje = await NaciagiTransaction.find(query)
      .sort({ dataTransakcji: -1 })
      .limit(limit)
      .populate("naciagiId", "nazwa kategoria podkategoria jednostka");

    return NextResponse.json(transakcje);
  } catch (error) {
    console.error("Błąd podczas pobierania transakcji naciągów:", error);
    return NextResponse.json(
      { error: "Błąd podczas pobierania transakcji naciągów" },
      { status: 500 }
    );
  }
}

// POST - Create new transaction (usually done through naciagi/[id] endpoint)
export async function POST(request) {
  try {
    await connectDB();

    const data = await request.json();
    const {
      naciagiId,
      nazwaNaciagu,
      typTransakcji,
      ilosc,
      nazwaPracownika,
      opis = "",
      kategoria,
      podkategoria,
      jednostka = "szt",
    } = data;

    // Validate required fields
    if (
      !naciagiId ||
      !nazwaNaciagu ||
      !typTransakcji ||
      !ilosc ||
      !nazwaPracownika ||
      !kategoria ||
      !podkategoria
    ) {
      return NextResponse.json(
        { error: "Wszystkie wymagane pola muszą być wypełnione" },
        { status: 400 }
      );
    }

    const nowaTransakcja = new NaciagiTransaction({
      naciagiId,
      nazwaNaciagu,
      typTransakcji,
      ilosc,
      nazwaPracownika,
      opis,
      kategoria,
      podkategoria,
      jednostka,
    });

    await nowaTransakcja.save();

    return NextResponse.json(nowaTransakcja, { status: 201 });
  } catch (error) {
    console.error("Błąd podczas tworzenia transakcji naciągu:", error);
    return NextResponse.json(
      { error: "Błąd podczas tworzenia transakcji naciągu" },
      { status: 500 }
    );
  }
}
