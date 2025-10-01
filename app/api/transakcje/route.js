import connectDB from "../../../config/database.js";
import AlcoholTransaction from "../../../models/AlcoholTransaction.js";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 50;
    const alkoholId = searchParams.get("alkoholId");
    const typTransakcji = searchParams.get("typTransakcji");

    let query = {};

    if (alkoholId) {
      query.alkoholId = alkoholId;
    }

    if (typTransakcji) {
      query.typTransakcji = typTransakcji;
    }

    const transakcje = await AlcoholTransaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("alkoholId", "nazwa kategoria");

    return Response.json(transakcje);
  } catch (error) {
    console.error("Błąd podczas pobierania transakcji:", error);
    return Response.json(
      { error: "Błąd podczas pobierania transakcji" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const data = await request.json();
    const {
      alkoholId,
      nazwaAlkoholu,
      typTransakcji,
      ilosc,
      iloscPrzed,
      iloscPo,
      nazwaPracownika,
      bankietId,
      notatki,
      powod,
    } = data;

    const nowaTransakcja = new AlcoholTransaction({
      alkoholId,
      nazwaAlkoholu,
      typTransakcji,
      ilosc,
      iloscPrzed,
      iloscPo,
      nazwaPracownika,
      bankietId,
      notatki: notatki || "",
      powod: powod || "",
    });

    await nowaTransakcja.save();

    return Response.json(nowaTransakcja, { status: 201 });
  } catch (error) {
    console.error("Błąd podczas dodawania transakcji:", error);
    return Response.json(
      { error: "Błąd podczas dodawania transakcji" },
      { status: 500 }
    );
  }
}
