import { NextResponse } from "next/server";
import connectDB from "../../../config/database";
import AlcoholTransaction from "../../../models/AlcoholTransaction";
import NaciagiTransaction from "../../../models/NaciagiTransaction";
import SuchyTransaction from "../../../models/SuchyTransaction";

export async function DELETE(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // 'alcohol', 'naciagi', 'suchy', or 'all'

    // Fixed 1 month cutoff date (transactions older than 1 month get deleted)
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 1);

    const results = {
      alcohol: { deleted: 0 },
      naciagi: { deleted: 0 },
      suchy: { deleted: 0 },
      cutoffDate: cutoffDate.toISOString(),
    };

    // Helper function to cleanup transactions for a specific model
    const cleanupTransactions = async (Model, category) => {
      try {
        const deleteResult = await Model.deleteMany({
          dataTransakcji: { $lt: cutoffDate },
        });
        results[category].deleted = deleteResult.deletedCount;
        return deleteResult.deletedCount;
      } catch (error) {
        console.error(`Error cleaning ${category} transactions:`, error);
        results[category].deleted = 0;
        return 0;
      }
    };

    // Cleanup based on type parameter
    if (type === "alcohol" || type === "all") {
      await cleanupTransactions(AlcoholTransaction, "alcohol");
    }

    if (type === "naciagi" || type === "all") {
      await cleanupTransactions(NaciagiTransaction, "naciagi");
    }

    if (type === "suchy" || type === "all") {
      await cleanupTransactions(SuchyTransaction, "suchy");
    }

    // Calculate total
    const totalDeleted =
      results.alcohol.deleted + results.naciagi.deleted + results.suchy.deleted;

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${totalDeleted} transactions older than ${cutoffDate.toLocaleDateString()}`,
      results,
      summary: {
        totalDeleted,
        cutoffDate: cutoffDate.toISOString(),
        cutoffDateFormatted: cutoffDate.toLocaleDateString(),
      },
    });
  } catch (error) {
    console.error("Transaction cleanup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to cleanup transactions",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectDB();

    // Fixed 1 month cutoff date
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 1);

    // Get simple statistics
    const stats = {
      alcohol: {
        total: await AlcoholTransaction.countDocuments(),
        toDelete: await AlcoholTransaction.countDocuments({
          dataTransakcji: { $lt: cutoffDate },
        }),
      },
      naciagi: {
        total: await NaciagiTransaction.countDocuments(),
        toDelete: await NaciagiTransaction.countDocuments({
          dataTransakcji: { $lt: cutoffDate },
        }),
      },
      suchy: {
        total: await SuchyTransaction.countDocuments(),
        toDelete: await SuchyTransaction.countDocuments({
          dataTransakcji: { $lt: cutoffDate },
        }),
      },
    };

    // Calculate totals
    const totalTransactions =
      stats.alcohol.total + stats.naciagi.total + stats.suchy.total;
    const totalToDelete =
      stats.alcohol.toDelete + stats.naciagi.toDelete + stats.suchy.toDelete;

    return NextResponse.json({
      success: true,
      stats,
      summary: {
        totalTransactions,
        totalToDelete,
        totalToKeep: totalTransactions - totalToDelete,
        cutoffDate: cutoffDate.toISOString(),
        cutoffDateFormatted: cutoffDate.toLocaleDateString(),
      },
    });
  } catch (error) {
    console.error("Transaction stats error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get transaction statistics",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
