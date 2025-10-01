import { NextResponse } from "next/server";
import connectDB from "../../../../config/database.js";
import Naciagi from "../../../../models/Naciagi.js";
import NaciagiTransaction from "../../../../models/NaciagiTransaction.js";

// GET - Fetch single naciagi item
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const naciag = await Naciagi.findById(id);
    if (!naciag) {
      return NextResponse.json(
        { error: "Naciąg nie został znaleziony" },
        { status: 404 }
      );
    }

    return NextResponse.json(naciag);
  } catch (error) {
    console.error("Błąd podczas pobierania naciągu:", error);
    return NextResponse.json(
      { error: "Błąd podczas pobierania naciągu" },
      { status: 500 }
    );
  }
}

// PUT - Update naciagi item
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const data = await request.json();

    const naciag = await Naciagi.findById(id);
    if (!naciag) {
      return NextResponse.json(
        { error: "Naciąg nie został znaleziony" },
        { status: 404 }
      );
    }

    // Handle different types of updates
    const {
      nazwa,
      kategoria,
      podkategoria,
      aktualnaIlosc,
      jednostka,
      opis,
      // For operation-based updates
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
        naciag.aktualnaIlosc += iloscNum;
      } else if (typOperacji === "uzycie") {
        if (naciag.aktualnaIlosc < iloscNum) {
          return NextResponse.json(
            { error: "Niewystarczająca ilość produktu na magazynie" },
            { status: 400 }
          );
        }
        naciag.aktualnaIlosc -= iloscNum;
      } else {
        return NextResponse.json(
          { error: "Nieprawidłowy typ operacji. Dozwolone: dostawa, uzycie" },
          { status: 400 }
        );
      }

      // Only update the timestamp for operations
      naciag.dataModyfikacji = new Date();
    } else {
      // Direct field updates (only when not doing operations)
      if (nazwa !== undefined) naciag.nazwa = nazwa;
      if (kategoria !== undefined) naciag.kategoria = kategoria;
      if (podkategoria !== undefined) naciag.podkategoria = podkategoria;
      if (aktualnaIlosc !== undefined) naciag.aktualnaIlosc = aktualnaIlosc;
      if (jednostka !== undefined) naciag.jednostka = jednostka;
      if (opis !== undefined) naciag.opis = opis;
    }

    await naciag.save();

    return NextResponse.json(naciag);
  } catch (error) {
    console.error("Błąd podczas aktualizacji naciągu:", error);
    return NextResponse.json(
      { error: "Błąd podczas aktualizacji naciągu" },
      { status: 500 }
    );
  }
}

// DELETE - Delete naciagi item
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const naciag = await Naciagi.findById(id);
    if (!naciag) {
      return NextResponse.json(
        { error: "Naciąg nie został znaleziony" },
        { status: 404 }
      );
    }

    // Delete related transactions
    await NaciagiTransaction.deleteMany({ naciagiId: id });

    // Delete the naciagi item
    await Naciagi.findByIdAndDelete(id);

    return NextResponse.json({ message: "Naciąg został usunięty" });
  } catch (error) {
    console.error("Błąd podczas usuwania naciągu:", error);
    return NextResponse.json(
      { error: "Błąd podczas usuwania naciągu" },
      { status: 500 }
    );
  }
}

// POST - Add delivery or usage
export async function POST(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const data = await request.json();
    const { action, ilosc, nazwaPracownika, opis = "" } = data;

    if (!action || !ilosc || !nazwaPracownika) {
      return NextResponse.json(
        { error: "Action, ilość i nazwa pracownika są wymagane" },
        { status: 400 }
      );
    }

    const naciag = await Naciagi.findById(id);
    if (!naciag) {
      return NextResponse.json(
        { error: "Naciąg nie został znaleziony" },
        { status: 404 }
      );
    }

    if (action === "dostawa") {
      await naciag.dodajDostawe(ilosc, nazwaPracownika, opis);
      await NaciagiTransaction.stworzDostawe(
        naciag._id,
        naciag.nazwa,
        ilosc,
        nazwaPracownika,
        opis,
        naciag.kategoria,
        naciag.podkategoria,
        naciag.jednostka
      );
    } else if (action === "uzycie") {
      if (naciag.aktualnaIlosc < ilosc) {
        return NextResponse.json(
          { error: "Niewystarczająca ilość w magazynie" },
          { status: 400 }
        );
      }
      await naciag.uzyj(ilosc, nazwaPracownika, opis);
      await NaciagiTransaction.stworzUzycie(
        naciag._id,
        naciag.nazwa,
        ilosc,
        nazwaPracownika,
        opis,
        naciag.kategoria,
        naciag.podkategoria,
        naciag.jednostka
      );
    } else {
      return NextResponse.json(
        { error: "Nieprawidłowa akcja. Dozwolone: dostawa, uzycie" },
        { status: 400 }
      );
    }

    return NextResponse.json(naciag);
  } catch (error) {
    console.error("Błąd podczas wykonywania operacji:", error);
    return NextResponse.json(
      { error: error.message || "Błąd podczas wykonywania operacji" },
      { status: 500 }
    );
  }
}
