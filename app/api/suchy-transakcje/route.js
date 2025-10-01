import { NextResponse } from "next/server";
import connectDB from "../../../config/database.js";
import SuchyTransaction from "../../../models/SuchyTransaction.js";
import Suchy from "../../../models/Suchy.js";
import mongoose from "mongoose";

// GET - Fetch all suchy transactions
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const suchyId = searchParams.get("suchyId");
    const typTransakcji = searchParams.get("typTransakcji");
    const limit = searchParams.get("limit");
    const sortBy = searchParams.get("sortBy") || "dataTransakcji";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    let query = {};

    if (suchyId && mongoose.Types.ObjectId.isValid(suchyId)) {
      query.suchyId = suchyId;
    }

    if (typTransakcji && ["dostawa", "uzycie"].includes(typTransakcji)) {
      query.typTransakcji = typTransakcji;
    }

    let dbQuery = SuchyTransaction.find(query)
      .populate("suchyId", "nazwa podkategoria jednostka")
      .sort({ [sortBy]: sortOrder });

    if (limit && !isNaN(Number(limit))) {
      dbQuery = dbQuery.limit(Number(limit));
    }

    const transakcje = await dbQuery;

    return NextResponse.json(transakcje);
  } catch (error) {
    console.error(
      "Błąd podczas pobierania transakcji suchych produktów:",
      error
    );
    return NextResponse.json(
      { error: "Błąd podczas pobierania transakcji suchych produktów" },
      { status: 500 }
    );
  }
}

// POST - Create new suchy transaction
export async function POST(request) {
  try {
    await connectDB();

    const data = await request.json();
    const {
      suchyId,
      nazwaSuchy, // Alternative to suchyId lookup
      ilosc,
      typTransakcji,
      opis = "",
      nazwaPracownika,
      dataTransakcji = new Date(),
    } = data;

    // Validate required fields
    if (!ilosc || !typTransakcji || !nazwaPracownika) {
      return NextResponse.json(
        { error: "Ilość, typ transakcji i nazwa pracownika są wymagane" },
        { status: 400 }
      );
    }

    if (!["dostawa", "uzycie"].includes(typTransakcji)) {
      return NextResponse.json(
        { error: "Typ transakcji musi być 'dostawa' lub 'uzycie'" },
        { status: 400 }
      );
    }

    const iloscNum = Number(ilosc);
    if (isNaN(iloscNum) || iloscNum <= 0) {
      return NextResponse.json(
        { error: "Ilość musi być liczbą większą od 0" },
        { status: 400 }
      );
    }

    // Find suchy product
    let suchyProdukt;

    if (suchyId && mongoose.Types.ObjectId.isValid(suchyId)) {
      suchyProdukt = await Suchy.findById(suchyId);
    } else if (nazwaSuchy) {
      suchyProdukt = await Suchy.findOne({ nazwa: nazwaSuchy.trim() });
    }

    if (!suchyProdukt) {
      return NextResponse.json(
        { error: "Nie znaleziono produktu suchego" },
        { status: 404 }
      );
    }

    // Use static method from model
    let nowaTransakcja;

    if (typTransakcji === "dostawa") {
      nowaTransakcja = await SuchyTransaction.stworzDostawe(
        suchyProdukt._id,
        suchyProdukt.nazwa,
        iloscNum,
        nazwaPracownika,
        opis,
        suchyProdukt.kategoria,
        suchyProdukt.podkategoria,
        suchyProdukt.jednostka
      );
    } else if (typTransakcji === "uzycie") {
      nowaTransakcja = await SuchyTransaction.stworzUzycie(
        suchyProdukt._id,
        suchyProdukt.nazwa,
        iloscNum,
        nazwaPracownika,
        opis,
        suchyProdukt.kategoria,
        suchyProdukt.podkategoria,
        suchyProdukt.jednostka
      );
    }

    // Populate the response with suchy details
    await nowaTransakcja.populate("suchyId", "nazwa podkategoria jednostka");

    return NextResponse.json(nowaTransakcja, { status: 201 });
  } catch (error) {
    console.error("Błąd podczas tworzenia transakcji suchego produktu:", error);
    return NextResponse.json(
      { error: "Błąd podczas tworzenia transakcji suchego produktu" },
      { status: 500 }
    );
  }
}
