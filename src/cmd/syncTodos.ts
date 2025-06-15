/**
 * Todo synchronization command implementation.
 *
 * This module provides the CLI command for synchronizing todos from the external API
 * to the local database. It supports batch operations with configurable concurrency
 * and provides real-time progress feedback to the user.
 *
 * Features:
 * - Batch synchronization of multiple todos
 * - Configurable concurrency (sequential, parallel, or unbounded)
 * - Real-time progress bar with completion percentage
 * - Comprehensive error handling and validation
 * - Schema validation for concurrency parameters
 *
 * @since 1.0.0
 */

import { Command, Args, Options } from "@effect/cli";
import { Effect, Console, Schema } from "effect";
import { TodoService } from "../service/TodoService.js";
import { DatabaseService } from "../service/DatabaseService.js";
import { ProgressBarService } from "../service/ProgressBarService.js";

/**
 * Schema for validating concurrency level input.
 *
 * Accepts either:
 * - The literal string "unbounded" for maximum concurrency
 * - A positive integer string that gets converted to a number
 *
 * This ensures type safety and proper validation of user input.
 *
 * @since 1.0.0
 */
export const ConcurrencySchema = Schema.Union(
  Schema.Literal("unbounded"),
  Schema.compose(Schema.NumberFromString, Schema.Int.pipe(Schema.positive()))
);

/**
 * CLI command for synchronizing todos from the external API to the local database.
 *
 * This command:
 * - Fetches todos from jsonplaceholder.typicode.com API
 * - Saves them to the local database (insert or update)
 * - Supports configurable concurrency for performance tuning
 * - Provides real-time progress feedback with visual progress bar
 * - Validates all inputs and handles errors gracefully
 *
 * Concurrency options:
 * - 1 (default): Sequential processing, one todo at a time
 * - N (where N > 1): Process N todos concurrently
 * - "unbounded": Process all todos concurrently with no limit
 *
 * @example
 * ```bash
 * # Sync single todo (sequential)
 * pnpm dev sync 1
 *
 * # Sync multiple todos sequentially
 * pnpm dev sync 1 2 3 4 5
 *
 * # Sync with controlled concurrency (2 at a time)
 * pnpm dev sync --concurrency 2 10 11 12 13 14
 *
 * # Sync with maximum concurrency
 * pnpm dev sync --concurrency unbounded 1 2 3 4 5 6 7 8 9 10
 * ```
 *
 * Expected output:
 * ```
 * 📡 Syncing 5 todo(s) from API (parallel (2))...
 * ⏳ Progress: [██████████████████████████████] 5/5 (100%)
 * 🎉 Successfully synced 5 todo(s) to local database!
 * ```
 *
 * @since 1.0.0
 */
export const syncTodoCommand = Command.make(
  "sync",
  {
    args: {
      /** Array of todo IDs to fetch from the API and sync to local database */
      ids: Args.repeated(Args.integer({ name: "id" })).pipe(
        Args.withDescription(
          "Todo IDs to fetch from API and sync to local database"
        )
      ),
    },
    options: {
      /**
       * Concurrency level for parallel processing.
       * Can be a positive integer or "unbounded" for maximum concurrency.
       */
      concurrency: Options.text("concurrency").pipe(
        Options.withDescription(
          "Concurrency level: number of todos to sync concurrently or 'unbounded' (default: 1 for sequential)"
        ),
        Options.withSchema(ConcurrencySchema),
        Options.withDefault(1)
      ),
    },
  },
  Effect.fn("syncTodoCommand")(function* ({
    args: { ids },
    options: { concurrency },
  }) {
    if (ids.length === 0) {
      yield* Console.log("❌ Please provide at least one todo ID to sync");
      return;
    }

    const progressBar = yield* ProgressBarService;

    /**
     * Determines the concurrency mode description for user feedback.
     * Converts the concurrency value to a human-readable string.
     */
    const mode =
      concurrency === 1
        ? "sequential"
        : concurrency === "unbounded"
        ? "unbounded"
        : `parallel (${concurrency})`;

    yield* Console.log(
      `📡 Syncing ${ids.length} todo(s) from API (${mode})...`
    );

    /**
     * Progress tracking state.
     * Uses a mutable variable to track completion across concurrent operations.
     */
    let completed = 0;
    const total = ids.length;

    // Initialize progress display
    yield* progressBar.initializeProgress(completed, total);

    /**
     * Synchronizes a single todo from API to database.
     *
     * This function:
     * - Fetches the todo from the external API
     * - Saves it to the local database (insert or update)
     * - Updates the progress counter and display
     * - Uses the ProgressBarService for seamless terminal updates
     *
     * @param id - The ID of the todo to sync
     * @returns Effect that completes when the todo is synced
     */
    const syncTodo = Effect.fn("syncTodo")(function* (id: number) {
      const apiTodo = yield* TodoService.getTodoById(id);
      yield* DatabaseService.saveTodo(apiTodo);

      // Update progress counter and display
      completed++;
      yield* progressBar.updateProgress(completed, total);
    });

    // Execute sync operations with specified concurrency
    yield* Effect.forEach(ids, syncTodo, { concurrency });

    yield* Console.log(
      `🎉 Successfully synced ${ids.length} todo(s) to local database!`
    );
  })
);
