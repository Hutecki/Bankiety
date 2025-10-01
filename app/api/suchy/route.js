import { NextResponse } from "next/server";
import connectDB from "../../../config/database.js";
import Suchy from "../../../models/Suchy.js";

// GET - Fetch all suchy products
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const podkategoria = searchParams.get("podkategoria");
    const kategoria = searchParams.get("kategoria");

    let query = {};

    if (kategoria) {
      query.kategoria = kategoria;
    }

    if (podkategoria) {
      query.podkategoria = podkategoria;
    }

    const sucheProdukty = await Suchy.find(query).sort({ nazwa: 1 });

    return NextResponse.json(sucheProdukty);
  } catch (error) {
    console.error("Błąd podczas pobierania suchych produktów:", error);
    return NextResponse.json(
      { error: "Błąd podczas pobierania suchych produktów" },
      { status: 500 }
    );
  }
}

// POST - Create new suchy product
export async function POST(request) {
  try {
    await connectDB();

    const data = await request.json();
    const {
      nazwa,
      podkategoria,
      aktualnaIlosc = 0,
      jednostka = "kg",
      opis = "",
    } = data;

    // Validate required fields
    if (!nazwa || !podkategoria) {
      return NextResponse.json(
        { error: "Nazwa i podkategoria są wymagane" },
        { status: 400 }
      );
    }

    // Check if product already exists
    const istniejacyProdukt = await Suchy.findOne({
      nazwa: nazwa.trim(),
      podkategoria,
    });

    if (istniejacyProdukt) {
      return NextResponse.json(
        { error: "Produkt o tej nazwie już istnieje w tej kategorii" },
        { status: 400 }
      );
    }

    const nowyProdukt = new Suchy({
      nazwa: nazwa.trim(),
      kategoria: "suchy",
      podkategoria,
      aktualnaIlosc: Number(aktualnaIlosc) || 0,
      jednostka,
      opis: opis.trim(),
    });

    await nowyProdukt.save();

    return NextResponse.json(nowyProdukt, { status: 201 });
  } catch (error) {
    console.error("Błąd podczas tworzenia suchego produktu:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Produkt o tej nazwie już istnieje" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Błąd podczas tworzenia suchego produktu" },
      { status: 500 }
    );
  }
}
