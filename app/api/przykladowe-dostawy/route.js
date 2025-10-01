import connectDB from "../../../config/database.js";
import Alcohol from "../../../models/Alcohol.js";
import AlcoholTransaction from "../../../models/AlcoholTransaction.js";

export async function POST() {
  try {
    await connectDB();

    const products = await Alcohol.find({});

    if (products.length === 0) {
      return Response.json(
        { error: "Najpierw zainicjalizuj bazę danych" },
        { status: 400 }
      );
    }

    // Add sample deliveries
    const sampleDeliveries = [
      { nazwa: "Wino Białe", ilosc: 24 },
      { nazwa: "Wino Czerwone", ilosc: 18 },
      { nazwa: "Famous Grouse", ilosc: 6 },
      { nazwa: "Inne Alkohole", ilosc: 12 },
    ];

    const transakcje = [];

    for (const delivery of sampleDeliveries) {
      const product = products.find((p) => p.nazwa === delivery.nazwa);
      if (product) {
        const iloscPrzed = product.aktualnaIlosc;

        // Update product using the model method
        await product.dodajDostawe(delivery.ilosc, "Menedżer Magazynu");

        // Create transaction record
        const transakcja = new AlcoholTransaction({
          alkoholId: product._id,
          nazwaAlkoholu: product.nazwa,
          typTransakcji: "dostawa",
          ilosc: delivery.ilosc,
          iloscPrzed: iloscPrzed,
          iloscPo: iloscPrzed + delivery.ilosc,
          nazwaPracownika: "Menedżer Magazynu",
          notatki: "Przykładowa dostawa testowa",
        });

        await transakcja.save();
        transakcje.push(transakcja);
      }
    }

    return Response.json({
      message: "Dodano przykładowe dostawy",
      transakcje: transakcje.length,
      success: true,
    });
  } catch (error) {
    console.error("Błąd podczas dodawania dostaw:", error);
    return Response.json(
      { error: "Błąd podczas dodawania przykładowych dostaw" },
      { status: 500 }
    );
  }
}
