import { NextResponse } from "next/server";
import connectDB from "../../../../config/database.js";
import Suchy from "../../../../models/Suchy.js";
import mongoose from "mongoose";

// GET - Fetch specific suchy product by ID
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Nieprawidłowe ID produktu" },
        { status: 400 }
      );
    }

    const produkt = await Suchy.findById(id);

    if (!produkt) {
      return NextResponse.json(
        { error: "Produkt nie został znaleziony" },
        { status: 404 }
      );
    }

    return NextResponse.json(produkt);
  } catch (error) {
    console.error("Błąd podczas pobierania suchego produktu:", error);
    return NextResponse.json(
      { error: "Błąd podczas pobierania suchego produktu" },
      { status: 500 }
    );
  }
}

// PUT - Update suchy product by ID
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const data = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Nieprawidłowe ID produktu" },
        { status: 400 }
      );
    }

    const produkt = await Suchy.findById(id);

    if (!produkt) {
      return NextResponse.json(
        { error: "Produkt nie został znaleziony" },
        { status: 404 }
      );
    }

    // Handle different types of updates
    const {
      nazwa,
      podkategoria,
      aktualnaIlosc,
      jednostka,
      opis,
      // For delivery operations
      ilosc,
      typOperacji, // "dostawa" or "uzycie"
      notatki,
    } = data;

    // Operation-based updates (for modal operations) take priority
    if (typOperacji && ilosc !== undefined) {
      const iloscNum = Number(ilosc);

      if (isNaN(iloscNum) || iloscNum <= 0) {
        return NextResponse.json(
          { error: "Ilość musi być liczbą większą od 0" },
          { status: 400 }
        );
      }

      if (typOperacji === "dostawa") {
        produkt.aktualnaIlosc += iloscNum;
      } else if (typOperacji === "uzycie") {
        if (produkt.aktualnaIlosc < iloscNum) {
          return NextResponse.json(
            { error: "Niewystarczająca ilość produktu na magazynie" },
            { status: 400 }
          );
        }
        produkt.aktualnaIlosc -= iloscNum;
      } else {
        return NextResponse.json(
          { error: "Nieprawidłowy typ operacji. Dozwolone: dostawa, uzycie" },
          { status: 400 }
        );
      }

      // Only update the timestamp for operations
      produkt.dataModyfikacji = new Date();
    } else {
      // Direct field updates (only when not doing operations)
      if (nazwa !== undefined) produkt.nazwa = nazwa.trim();
      if (podkategoria !== undefined) produkt.podkategoria = podkategoria;
      if (jednostka !== undefined) produkt.jednostka = jednostka;
      if (opis !== undefined) produkt.opis = opis.trim();
      if (aktualnaIlosc !== undefined)
        produkt.aktualnaIlosc = Number(aktualnaIlosc);
    }

    const zaktualizowanyProdukt = await produkt.save();

    return NextResponse.json(zaktualizowanyProdukt);
  } catch (error) {
    console.error("Błąd podczas aktualizacji suchego produktu:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Produkt o tej nazwie już istnieje w tej kategorii" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Błąd podczas aktualizacji suchego produktu" },
      { status: 500 }
    );
  }
}

// DELETE - Delete suchy product by ID
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Nieprawidłowe ID produktu" },
        { status: 400 }
      );
    }

    const produkt = await Suchy.findByIdAndDelete(id);

    if (!produkt) {
      return NextResponse.json(
        { error: "Produkt nie został znaleziony" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Produkt został usunięty", produkt },
      { status: 200 }
    );
  } catch (error) {
    console.error("Błąd podczas usuwania suchego produktu:", error);
    return NextResponse.json(
      { error: "Błąd podczas usuwania suchego produktu" },
      { status: 500 }
    );
  }
}
