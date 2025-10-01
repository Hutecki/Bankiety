import connectDB from "../config/database.js";
import Alcohol from "../models/Alcohol.js";

// Initial alcohol products for the banquet company
const initialAlcoholProducts = [
  {
    nazwa: "Wino Białe",
    kategoria: "wino_biale",
    aktualnaIlosc: 0,
    opis: "Białe wino do bankietów",
  },
  {
    nazwa: "Wino Czerwone",
    kategoria: "wino_czerwone",
    aktualnaIlosc: 0,
    opis: "Czerwone wino do bankietów",
  },
  {
    nazwa: "Famous Grouse",
    kategoria: "whiskey",
    aktualnaIlosc: 0,
    opis: "Whiskey szkocka Famous Grouse",
  },
  {
    nazwa: "Inne Alkohole",
    kategoria: "inne",
    aktualnaIlosc: 0,
    opis: "Różne inne alkohole używane podczas bankietów",
  },
];

const seedAlcoholDatabase = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log("Połączono z bazą danych");

    // Check if alcohol products already exist
    const existingProducts = await Alcohol.find({});

    if (existingProducts.length > 0) {
      console.log(
        `Znaleziono ${existingProducts.length} istniejących produktów w bazie danych:`
      );
      existingProducts.forEach((product) => {
        console.log(
          `- ${product.nazwa} (${product.kategoria}): ${product.aktualnaIlosc} butelek`
        );
      });

      console.log(
        "\nJeśli chcesz zresetować bazę danych, usuń wszystkie produkty najpierw."
      );
      return;
    }

    // Insert initial products
    const createdProducts = await Alcohol.insertMany(initialAlcoholProducts);

    console.log("✅ Pomyślnie utworzono początkowe produkty alkoholowe:");
    createdProducts.forEach((product) => {
      console.log(`- ${product.nazwa} (${product.kategoria})`);
      console.log(`  Opis: ${product.opis}`);
      console.log("");
    });

    console.log("🍷 Baza danych została zainicjalizowana pomyślnie!");
    console.log(
      "Możesz teraz rozpocząć dodawanie dostaw i śledzenie użycia alkoholi."
    );
    return createdProducts;
  } catch (error) {
    console.error("❌ Błąd podczas inicjalizacji bazy danych:", error.message);
    throw error;
  }
};

// Utility function to reset database (for development)
const resetAlcoholDatabase = async () => {
  try {
    await connectDB();
    console.log("Połączono z bazą danych");

    const deletedCount = await Alcohol.deleteMany({});
    console.log(
      `🗑️ Usunięto ${deletedCount.deletedCount} produktów z bazy danych`
    );

    // Re-seed with initial data
    const createdProducts = await Alcohol.insertMany(initialAlcoholProducts);
    console.log(`✅ Utworzono ${createdProducts.length} nowych produktów`);
    return createdProducts;
  } catch (error) {
    console.error("❌ Błąd podczas resetowania bazy danych:", error.message);
    throw error;
  }
};

// Function to add sample delivery data (for testing)
const addSampleDeliveries = async () => {
  try {
    await connectDB();
    console.log("Połączono z bazą danych");

    const products = await Alcohol.find({});

    if (products.length === 0) {
      console.log(
        "❌ Nie znaleziono produktów. Uruchom najpierw seedAlcoholDatabase()"
      );
      return;
    }

    // Add sample deliveries
    const sampleDeliveries = [
      { nazwa: "Wino Białe", ilosc: 24 },
      { nazwa: "Wino Czerwone", ilosc: 18 },
      { nazwa: "Famous Grouse", ilosc: 6 },
      { nazwa: "Inne Alkohole", ilosc: 12 },
    ];

    for (const delivery of sampleDeliveries) {
      const product = products.find((p) => p.nazwa === delivery.nazwa);
      if (product) {
        await product.dodajDostawe(delivery.ilosc, "Menedżer Magazynu");
        console.log(`📦 Dodano dostawę: ${delivery.ilosc} x ${delivery.nazwa}`);
      }
    }

    console.log("✅ Dodano przykładowe dostawy do wszystkich produktów");

    // Show current stock levels
    const updatedProducts = await Alcohol.find({});
    console.log("\n📊 Aktualny stan magazynu:");
    updatedProducts.forEach((product) => {
      console.log(`- ${product.nazwa}: ${product.aktualnaIlosc} butelek`);
    });
    return updatedProducts;
  } catch (error) {
    console.error(
      "❌ Błąd podczas dodawania przykładowych dostaw:",
      error.message
    );
    throw error;
  }
};

// Export functions for use in scripts
export { seedAlcoholDatabase, resetAlcoholDatabase, addSampleDeliveries };

// If running this file directly, execute seeding
if (import.meta.url === `file://${process.argv[1]}`) {
  const action = process.argv[2];

  switch (action) {
    case "reset":
      resetAlcoholDatabase();
      break;
    case "sample":
      addSampleDeliveries();
      break;
    default:
      seedAlcoholDatabase();
      break;
  }
}
