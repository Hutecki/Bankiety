/**
 * Zero Product Quantities Script
 *
 * This script resets the aktualnaIlosc field to 0 for all products in the database.
 * Affects: Alcohol, Naciagi (drinks/milk), and Suchy (dry goods) products.
 *
 * Usage:
 * - Run script: node scripts/zero-quantities.mjs
 * - Dry run: node scripts/zero-quantities.mjs --dry-run
 * - Specific category: node scripts/zero-quantities.mjs --category=alcohol
 */

import connectDB from "../config/database.js";
import Alcohol from "../models/Alcohol.js";
import Naciagi from "../models/Naciagi.js";
import Suchy from "../models/Suchy.js";

// Configuration
const CONFIG = {
  LOG_LEVEL: "INFO",
};

// Logging utility
const logger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
  success: (msg) => console.log(`[SUCCESS] ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${msg}`),
};

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const categoryFilter = args
  .find((arg) => arg.startsWith("--category="))
  ?.split("=")[1];

/**
 * Zero quantities for Alcohol products
 */
async function zeroAlcoholQuantities() {
  try {
    logger.info("Processing Alcohol products...");

    // Get current count
    const totalAlcohol = await Alcohol.countDocuments();
    logger.info(`Found ${totalAlcohol} alcohol products`);

    if (totalAlcohol === 0) {
      logger.warn("No alcohol products found");
      return { updated: 0, errors: 0 };
    }

    if (isDryRun) {
      logger.info(
        "[DRY RUN] Would reset aktualnaIlosc to 0 for all alcohol products"
      );
      return { updated: totalAlcohol, errors: 0 };
    }

    // Reset quantities
    const result = await Alcohol.updateMany(
      {},
      {
        $set: {
          aktualnaIlosc: 0,
          // Also reset calculated fields if they exist
          laczenaDostarczona: 0,
          lacznaUzyta: 0,
          ruchMagazynowy: 0,
        },
      }
    );

    logger.success(`Updated ${result.modifiedCount} alcohol products`);
    return { updated: result.modifiedCount, errors: 0 };
  } catch (error) {
    logger.error(`Error updating alcohol quantities: ${error.message}`);
    return { updated: 0, errors: 1 };
  }
}

/**
 * Zero quantities for Naciagi products (drinks/milk)
 */
async function zeroNaciagiQuantities() {
  try {
    logger.info("Processing Naciagi products (drinks/milk)...");

    // Get current count
    const totalNaciagi = await Naciagi.countDocuments();
    logger.info(`Found ${totalNaciagi} naciagi products`);

    if (totalNaciagi === 0) {
      logger.warn("No naciagi products found");
      return { updated: 0, errors: 0 };
    }

    if (isDryRun) {
      logger.info(
        "[DRY RUN] Would reset aktualnaIlosc to 0 for all naciagi products"
      );
      return { updated: totalNaciagi, errors: 0 };
    }

    // Reset quantities
    const result = await Naciagi.updateMany({}, { $set: { aktualnaIlosc: 0 } });

    logger.success(`Updated ${result.modifiedCount} naciagi products`);
    return { updated: result.modifiedCount, errors: 0 };
  } catch (error) {
    logger.error(`Error updating naciagi quantities: ${error.message}`);
    return { updated: 0, errors: 1 };
  }
}

/**
 * Zero quantities for Suchy products (dry goods)
 */
async function zeroSuchyQuantities() {
  try {
    logger.info("Processing Suchy products (dry goods)...");

    // Get current count
    const totalSuchy = await Suchy.countDocuments();
    logger.info(`Found ${totalSuchy} suchy products`);

    if (totalSuchy === 0) {
      logger.warn("No suchy products found");
      return { updated: 0, errors: 0 };
    }

    if (isDryRun) {
      logger.info(
        "[DRY RUN] Would reset aktualnaIlosc to 0 for all suchy products"
      );
      return { updated: totalSuchy, errors: 0 };
    }

    // Reset quantities
    const result = await Suchy.updateMany({}, { $set: { aktualnaIlosc: 0 } });

    logger.success(`Updated ${result.modifiedCount} suchy products`);
    return { updated: result.modifiedCount, errors: 0 };
  } catch (error) {
    logger.error(`Error updating suchy quantities: ${error.message}`);
    return { updated: 0, errors: 1 };
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    logger.info("=== Zero Product Quantities Script ===");

    if (isDryRun) {
      logger.warn("DRY RUN MODE - No changes will be made");
    }

    if (categoryFilter) {
      logger.info(`Category filter: ${categoryFilter}`);
    }

    // Connect to database
    logger.info("Connecting to database...");
    await connectDB();
    logger.success("Connected to database");

    // Initialize results
    let totalUpdated = 0;
    let totalErrors = 0;

    // Process categories based on filter
    if (!categoryFilter || categoryFilter === "alcohol") {
      const alcoholResult = await zeroAlcoholQuantities();
      totalUpdated += alcoholResult.updated;
      totalErrors += alcoholResult.errors;
    }

    if (!categoryFilter || categoryFilter === "naciagi") {
      const naciagiResult = await zeroNaciagiQuantities();
      totalUpdated += naciagiResult.updated;
      totalErrors += naciagiResult.errors;
    }

    if (!categoryFilter || categoryFilter === "suchy") {
      const suchyResult = await zeroSuchyQuantities();
      totalUpdated += suchyResult.updated;
      totalErrors += suchyResult.errors;
    }

    // Summary
    logger.info("=== SUMMARY ===");
    logger.info(`Total products updated: ${totalUpdated}`);

    if (totalErrors > 0) {
      logger.error(`Total errors: ${totalErrors}`);
      process.exit(1);
    } else {
      logger.success("All operations completed successfully!");

      if (!isDryRun) {
        logger.info("All product quantities have been reset to 0");
        logger.warn("Note: You may want to run transaction cleanup as well");
      }

      process.exit(0);
    }
  } catch (error) {
    logger.error(`Script failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Handle script termination
process.on("SIGINT", () => {
  logger.warn("Script interrupted by user");
  process.exit(1);
});

process.on("SIGTERM", () => {
  logger.warn("Script terminated");
  process.exit(1);
});

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
