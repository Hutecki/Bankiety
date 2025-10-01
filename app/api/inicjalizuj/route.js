import connectDB from "../../../config/database.js";
import { seedAlcoholDatabase } from "../../../scripts/seedAlcohol.js";

export async function POST() {
  try {
    await connectDB();

    // Import and use the seeding function
    await new Promise((resolve, reject) => {
      const originalExit = process.exit;
      process.exit = () => resolve(); // Override process.exit temporarily

      seedAlcoholDatabase().catch(reject);
    });

    return Response.json({
      message: "Baza danych została pomyślnie zainicjalizowana",
      success: true,
    });
  } catch (error) {
    console.error("Błąd podczas inicjalizacji bazy:", error);
    return Response.json(
      { error: "Błąd podczas inicjalizacji bazy danych" },
      { status: 500 }
    );
  }
}
