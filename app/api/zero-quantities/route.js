import connectDB from "../../../config/database.js";
import Alcohol from "../../../models/Alcohol.js";
import Naciagi from "../../../models/Naciagi.js";
import Suchy from "../../../models/Suchy.js";

export async function POST(request) {
  try {
    await connectDB();

    const { category, confirm } = await request.json();

    // Security check - require confirmation
    if (!confirm || confirm !== "ZERO_ALL_QUANTITIES") {
      return Response.json(
        {
          error: "Confirmation required. Set confirm to 'ZERO_ALL_QUANTITIES'",
        },
        { status: 400 }
      );
    }

    const results = {
      alcohol: { updated: 0, error: null },
      naciagi: { updated: 0, error: null },
      suchy: { updated: 0, error: null },
    };

    // Reset Alcohol quantities if no category specified or category is alcohol
    if (!category || category === "alcohol") {
      try {
        const alcoholResult = await Alcohol.updateMany(
          {},
          {
            $set: {
              aktualnaIlosc: 0,
              laczenaDostarczona: 0,
              lacznaUzyta: 0,
              ruchMagazynowy: 0,
            },
          }
        );
        results.alcohol.updated = alcoholResult.modifiedCount;
      } catch (error) {
        results.alcohol.error = error.message;
      }
    }

    // Reset Naciagi quantities if no category specified or category is naciagi
    if (!category || category === "naciagi") {
      try {
        const naciagiResult = await Naciagi.updateMany(
          {},
          { $set: { aktualnaIlosc: 0 } }
        );
        results.naciagi.updated = naciagiResult.modifiedCount;
      } catch (error) {
        results.naciagi.error = error.message;
      }
    }

    // Reset Suchy quantities if no category specified or category is suchy
    if (!category || category === "suchy") {
      try {
        const suchyResult = await Suchy.updateMany(
          {},
          { $set: { aktualnaIlosc: 0 } }
        );
        results.suchy.updated = suchyResult.modifiedCount;
      } catch (error) {
        results.suchy.error = error.message;
      }
    }

    const totalUpdated =
      results.alcohol.updated + results.naciagi.updated + results.suchy.updated;
    const hasErrors =
      results.alcohol.error || results.naciagi.error || results.suchy.error;

    return Response.json({
      success: !hasErrors,
      message: hasErrors
        ? "Some operations failed"
        : `Successfully reset quantities for ${totalUpdated} products`,
      results,
      totalUpdated,
    });
  } catch (error) {
    console.error("Error in zero-quantities API:", error);
    return Response.json(
      { error: "Failed to reset quantities", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({
    message: "Zero Quantities API",
    usage:
      "POST with { confirm: 'ZERO_ALL_QUANTITIES' } to reset all product quantities",
    options: {
      category:
        "Optional: 'alcohol', 'naciagi', or 'suchy' to reset specific category",
    },
  });
}
