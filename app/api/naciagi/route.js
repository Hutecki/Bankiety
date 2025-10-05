import { NextResponse } from "next/server";
import connectDB from "../../../config/database.js";
import Naciagi from "../../../models/Naciagi.js";
import NaciagiTransaction from "../../../models/NaciagiTransaction.js";

// GET - Fetch all naciagi
export async function GET() {
  try {
    await connectDB();

    const naciagi = await Naciagi.find({}).sort({ dataUtworzenia: -1 });

    // Calculate usage for each item from transactions
    const naciagiWithUsage = await Promise.all(
      naciagi.map(async (item) => {
        const transactions = await NaciagiTransaction.find({
          naciagiId: item._id,
        });
        const zuzycie = transactions
          .filter((t) => t.typTransakcji === "uzycie")
          .reduce((sum, t) => sum + t.ilosc, 0);

        const itemObj = item.toObject();
        itemObj.zuzycie = zuzycie;
        return itemObj;
      })
    );

    return NextResponse.json(naciagiWithUsage);
  } catch (error) {
    console.error("Błąd podczas pobierania naciągów:", error);
    return NextResponse.json(
      { error: "Błąd podczas pobierania naciągów" },
      { status: 500 }
    );
  }
}

// POST - Create new naciagi item
export async function POST(request) {
  try {
    await connectDB();

    const data = await request.json();
    const {
      nazwa,
      kategoria,
      podkategoria,
      aktualnaIlosc = 0,
      jednostka = "szt",
      opis = "",
    } = data;

    // Validate required fields
    if (!nazwa || !kategoria || !podkategoria) {
      return NextResponse.json(
        { error: "Nazwa, kategoria i podkategoria są wymagane" },
        { status: 400 }
      );
    }

    // Validate enum values
    const validKategorie = ["napoje", "mleko"];
    const validPodkategorie = [
      "pepsi",
      "7up",
      "mirinda",
      "softy",
      "paliwka",
      "mleko_zwykle",
      "mleko_bl",
    ];

    if (!validKategorie.includes(kategoria)) {
      return NextResponse.json(
        { error: "Nieprawidłowa kategoria" },
        { status: 400 }
      );
    }

    if (!validPodkategorie.includes(podkategoria)) {
      return NextResponse.json(
        { error: "Nieprawidłowa podkategoria" },
        { status: 400 }
      );
    }

    const nowyNaciag = new Naciagi({
      nazwa,
      kategoria,
      podkategoria,
      aktualnaIlosc,
      jednostka,
      opis,
    });

    await nowyNaciag.save();

    return NextResponse.json(nowyNaciag, { status: 201 });
  } catch (error) {
    console.error("Błąd podczas tworzenia naciągu:", error);
    return NextResponse.json(
      { error: "Błąd podczas tworzenia naciągu" },
      { status: 500 }
    );
  }
}
