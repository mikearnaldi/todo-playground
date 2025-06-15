/**
 * Database initialization command implementation.
 *
 * This module provides the CLI command for initializing the SQLite database
 * with the required schema and sample data. It's typically the first command
 * users run when setting up the application.
 *
 * @since 1.0.0
 */

import { Command } from "@effect/cli";
import { Effect, Console } from "effect";
import { DatabaseService } from "../service/DatabaseService.js";

/**
 * CLI command for initializing the database.
 *
 * This command:
 * - Creates the todos table if it doesn't exist
 * - Populates the database with sample data if empty
 * - Provides user feedback on successful initialization
 *
 * The command takes no arguments and can be run multiple times safely
 * (it won't duplicate data if the database already contains todos).
 *
 * @example
 * ```bash
 * pnpm dev init
 * ```
 *
 * Expected output:
 * ```
 * ✅ Database initialized successfully!
 * ```
 *
 * @since 1.0.0
 */
export const initDbCommand = Command.make(
  "init",
  {},
  Effect.fn("initDbCommand")(function* () {
    yield* DatabaseService.initializeDatabase();
    yield* Console.log("✅ Database initialized successfully!");
  })
);
