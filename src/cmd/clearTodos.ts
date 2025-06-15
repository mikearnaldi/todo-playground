/**
 * Todo clearing command implementation.
 *
 * This module provides the CLI command for removing all todo items
 * from the local database. This is a destructive operation that
 * cannot be undone, so it should be used with caution.
 *
 * @since 1.0.0
 */

import { Command } from "@effect/cli";
import { Effect, Console } from "effect";
import { DatabaseService } from "../service/DatabaseService.js";

/**
 * CLI command for clearing all todos from the local database.
 *
 * This command:
 * - Removes all todo records from the database
 * - Provides confirmation message when operation completes
 * - Cannot be undone - all data will be permanently lost
 * - Does not affect the database schema (table structure remains)
 *
 * This is useful for:
 * - Cleaning up test data
 * - Resetting the application state
 * - Preparing for fresh data import
 *
 * @example
 * ```bash
 * pnpm dev clear
 * ```
 *
 * Expected output:
 * ```
 * ✅ Cleared all todos
 * ```
 *
 * @warning This operation permanently deletes all todo data and cannot be undone.
 *
 * @since 1.0.0
 */
export const clearTodosCommand = Command.make(
  "clear",
  {},
  Effect.fn("clearTodosCommand")(function* () {
    yield* DatabaseService.clearAllTodos();
    yield* Console.log("✅ Cleared all todos");
  })
);
