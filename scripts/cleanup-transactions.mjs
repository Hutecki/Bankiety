/**
 * Automated Transaction Cleanup Utility
 *
 * This script automatically deletes transaction logs older than 1 month.
 * Product counts are preserved - only transaction history is cleaned up.
 *
 * Usage Examples:
 * - Manual run: node scripts/cleanup-transactions.js
 * - Specific type: node scripts/cleanup-transactions.js --type=alcohol
 * - Dry run: node scripts/cleanup-transactions.js --dry-run
 */

import connectDB from "../config/database.js";
import AlcoholTransaction from "../models/AlcoholTransaction.js";
import NaciagiTransaction from "../models/NaciagiTransaction.js";
import SuchyTransaction from "../models/SuchyTransaction.js";

// Configuration
const CONFIG = {
  MONTHS_TO_KEEP: 1, // Fixed: Keep transactions from last 1 month
  BATCH_SIZE: 500, // Process deletions in batches
  LOG_LEVEL: "INFO",
};

// Logging utility
const logger = {
  debug: (msg) => CONFIG.LOG_LEVEL === "DEBUG" && console.log(`[DEBUG] ${msg}`),
  info: (msg) =>
    ["DEBUG", "INFO"].includes(CONFIG.LOG_LEVEL) &&
    console.log(`[INFO] ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    type: "all", // 'all', 'alcohol', 'naciagi', 'suchy'
    dryRun: false,
  };

  args.forEach((arg) => {
    if (arg.startsWith("--type=")) {
      options.type = arg.split("=")[1];
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    }
  });

  return options;
}

// Calculate cutoff date (fixed 1 month)
function getCutoffDate() {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - CONFIG.MONTHS_TO_KEEP);
  return cutoff;
}

// Cleanup transactions for a specific model
async function cleanupModel(Model, modelName, cutoffDate, dryRun = false) {
  logger.info(`Processing ${modelName} transactions...`);

  try {
    // Get statistics
    const totalCount = await Model.countDocuments();
    const oldCount = await Model.countDocuments({
      dataTransakcji: { $lt: cutoffDate },
    });
    const keepCount = totalCount - oldCount;

    logger.info(
      `${modelName}: Total=${totalCount}, ToDelete=${oldCount}, ToKeep=${keepCount}`
    );

    if (oldCount === 0) {
      logger.info(`${modelName}: No old transactions to delete.`);
      return { deleted: 0, kept: keepCount };
    }

    if (dryRun) {
      logger.info(
        `${modelName}: DRY RUN - Would delete ${oldCount} transactions.`
      );
      return { deleted: oldCount, kept: keepCount };
    }

    // Delete in batches to avoid memory issues
    let deletedTotal = 0;
    while (true) {
      const deleteResult = await Model.deleteMany(
        { dataTransakcji: { $lt: cutoffDate } },
        { limit: CONFIG.BATCH_SIZE }
      );

      deletedTotal += deleteResult.deletedCount;
      logger.debug(
        `${modelName}: Batch deleted ${deleteResult.deletedCount} transactions`
      );

      if (deleteResult.deletedCount < CONFIG.BATCH_SIZE) {
        break; // No more documents to delete
      }
    }

    logger.info(
      `${modelName}: Successfully deleted ${deletedTotal} old transactions.`
    );
    return { deleted: deletedTotal, kept: keepCount };
  } catch (error) {
    logger.error(`${modelName}: Cleanup failed - ${error.message}`);
    throw error;
  }
}

// Get oldest and newest transaction dates for reporting
async function getTransactionDateRange(Model) {
  try {
    const [oldest, newest] = await Promise.all([
      Model.findOne().sort({ dataTransakcji: 1 }).select("dataTransakcji"),
      Model.findOne().sort({ dataTransakcji: -1 }).select("dataTransakcji"),
    ]);

    return {
      oldest: oldest?.dataTransakcji || null,
      newest: newest?.dataTransakcji || null,
    };
  } catch (error) {
    return { oldest: null, newest: null };
  }
}

// Main cleanup function
async function cleanupTransactions(options) {
  const startTime = new Date();
  logger.info(`Starting transaction cleanup (1 month retention)...`);
  logger.info(`Type: ${options.type}, Dry Run: ${options.dryRun}`);

  try {
    await connectDB();
    logger.info("Connected to database.");

    const cutoffDate = getCutoffDate();
    logger.info(
      `Deleting transactions older than: ${cutoffDate.toLocaleDateString()}`
    );

    const results = {
      alcohol: { deleted: 0, kept: 0 },
      naciagi: { deleted: 0, kept: 0 },
      suchy: { deleted: 0, kept: 0 },
    };

    // Cleanup based on type
    if (options.type === "alcohol" || options.type === "all") {
      results.alcohol = await cleanupModel(
        AlcoholTransaction,
        "Alcohol",
        cutoffDate,
        options.dryRun
      );
    }

    if (options.type === "naciagi" || options.type === "all") {
      results.naciagi = await cleanupModel(
        NaciagiTransaction,
        "Naciagi",
        cutoffDate,
        options.dryRun
      );
    }

    if (options.type === "suchy" || options.type === "all") {
      results.suchy = await cleanupModel(
        SuchyTransaction,
        "Suchy",
        cutoffDate,
        options.dryRun
      );
    }

    // Calculate totals
    const totalDeleted =
      results.alcohol.deleted + results.naciagi.deleted + results.suchy.deleted;
    const totalKept =
      results.alcohol.kept + results.naciagi.kept + results.suchy.kept;

    const endTime = new Date();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Final report
    logger.info("=== CLEANUP SUMMARY ===");
    logger.info(`Mode: ${options.dryRun ? "DRY RUN" : "ACTUAL CLEANUP"}`);
    logger.info(`Duration: ${duration} seconds`);
    logger.info(`Cutoff Date: ${cutoffDate.toLocaleDateString()}`);
    logger.info(`Total Deleted: ${totalDeleted}`);
    logger.info(`Total Kept: ${totalKept}`);
    logger.info("By Category:");
    logger.info(
      `  Alcohol: Deleted=${results.alcohol.deleted}, Kept=${results.alcohol.kept}`
    );
    logger.info(
      `  Naciagi: Deleted=${results.naciagi.deleted}, Kept=${results.naciagi.kept}`
    );
    logger.info(
      `  Suchy: Deleted=${results.suchy.deleted}, Kept=${results.suchy.kept}`
    );
    logger.info("=====================");

    return {
      success: true,
      results,
      summary: {
        totalDeleted,
        totalKept,
        cutoffDate: cutoffDate.toISOString(),
        duration,
        dryRun: options.dryRun,
      },
    };
  } catch (error) {
    logger.error(`Cleanup failed: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Interactive confirmation for non-dry-run mode
async function confirmCleanup(options) {
  if (options.dryRun) {
    return true;
  }

  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    const cutoffDate = getCutoffDate();
    console.log(
      `\n⚠️  WARNING: This will delete transactions older than ${cutoffDate.toLocaleDateString()}`
    );
    console.log(`Type: ${options.type}`);
    console.log("This action cannot be undone!");

    readline.question("\nDo you want to continue? (yes/no): ", (answer) => {
      readline.close();
      resolve(answer.toLowerCase() === "yes" || answer.toLowerCase() === "y");
    });
  });
}

// Main execution
async function main() {
  const options = parseArgs();

  // Show help
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Transaction Cleanup Utility (1 Month Retention)

Automatically deletes transaction logs older than 1 month.
Product counts are preserved.

Usage:
  node scripts/cleanup-transactions.js [options]

Options:
  --type=TYPE    Cleanup type: 'all', 'alcohol', 'naciagi', 'suchy' (default: all)
  --dry-run      Preview mode - show what would be deleted without actually deleting
  --help, -h     Show this help message

Examples:
  node scripts/cleanup-transactions.js --dry-run
  node scripts/cleanup-transactions.js --type=alcohol
  node scripts/cleanup-transactions.js --type=all
    `);
    process.exit(0);
  }

  try {
    // Confirm before actual cleanup
    const confirmed = await confirmCleanup(options);
    if (!confirmed) {
      logger.info("Cleanup cancelled by user.");
      process.exit(0);
    }

    // Run cleanup
    const result = await cleanupTransactions(options);

    process.exit(result.success ? 0 : 1);
  } catch (error) {
    logger.error(`Script failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { cleanupTransactions, CONFIG };
