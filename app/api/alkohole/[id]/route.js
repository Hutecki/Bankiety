import connectDB from "../../../../config/database.js";
import Alcohol from "../../../../models/Alcohol.js";

export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const data = await request.json();

    const aktualizowanyAlkohol = await Alcohol.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!aktualizowanyAlkohol) {
      return Response.json(
        { error: "Alkohol nie został znaleziony" },
        { status: 404 }
      );
    }

    return Response.json(aktualizowanyAlkohol);
  } catch (error) {
    console.error("Błąd podczas aktualizacji alkoholu:", error);
    return Response.json(
      { error: "Błąd podczas aktualizacji alkoholu" },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const alkohol = await Alcohol.findById(id);

    if (!alkohol) {
      return Response.json(
        { error: "Alkohol nie został znaleziony" },
        { status: 404 }
      );
    }

    return Response.json(alkohol);
  } catch (error) {
    console.error("Błąd podczas pobierania alkoholu:", error);
    return Response.json(
      { error: "Błąd podczas pobierania alkoholu" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const usunietyAlkohol = await Alcohol.findByIdAndDelete(id);

    if (!usunietyAlkohol) {
      return Response.json(
        { error: "Alkohol nie został znaleziony" },
        { status: 404 }
      );
    }

    return Response.json({ message: "Alkohol został usunięty" });
  } catch (error) {
    console.error("Błąd podczas usuwania alkoholu:", error);
    return Response.json(
      { error: "Błąd podczas usuwania alkoholu" },
      { status: 500 }
    );
  }
}
