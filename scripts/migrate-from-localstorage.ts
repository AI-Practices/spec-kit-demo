import fs from "node:fs";
import path from "node:path";
import { migrateFromLocalStorage } from "../src/lib/migration";
import type { Expense } from "../src/server/types";

async function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error("Usage: npx tsx scripts/migrate-from-localstorage.ts <path-to-json-export>");
    process.exit(1);
  }

  const resolvedPath = path.resolve(filePath);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`File not found: ${resolvedPath}`);
    process.exit(1);
  }

  console.log(`Reading expenses from ${resolvedPath}...`);

  const raw = fs.readFileSync(resolvedPath, "utf-8");
  let expenses: Expense[];

  try {
    expenses = JSON.parse(raw);
    if (!Array.isArray(expenses)) {
      console.error("JSON file must contain an array of expenses");
      process.exit(1);
    }
  } catch {
    console.error("Failed to parse JSON file");
    process.exit(1);
  }

  console.log(`Found ${expenses.length} expenses to migrate.`);

  const result = await migrateFromLocalStorage(expenses);

  console.log("\n--- Migration Results ---");
  console.log(`Total records:    ${result.totalRecords}`);
  console.log(`Imported:         ${result.importedRecords}`);
  console.log(`Skipped:          ${result.skippedRecords}`);

  if (result.errors.length > 0) {
    console.log("\nErrors:");
    result.errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
  }

  console.log("\nMigration complete.");
  process.exit(result.errors.length > 0 ? 1 : 0);
}

main();
