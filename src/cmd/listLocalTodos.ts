/**
 * Todo listing command implementation.
 *
 * This module provides the CLI command for displaying all todo items
 * from the local database. It retrieves all todos and formats them
 * for console display with visual separators.
 *
 * @since 1.0.0
 */

import { Command } from "@effect/cli";
import { Effect, Console } from "effect";
import { DatabaseService } from "../service/DatabaseService.js";
import { Todo } from "../domain/Todo.js";

/**
 * CLI command for listing all todos from the local database.
 *
 * This command:
 * - Retrieves all todos from the database (ordered by ID)
 * - Displays each todo using the pretty printer
 * - Adds visual separators between todos for readability
 * - Shows a header indicating the data source
 *
 * The output includes all todo fields: userId, id, title, and completion status.
 *
 * @example
 * ```bash
 * pnpm dev list
 * ```
 *
 * Expected output:
 * ```
 * 💾 All Todos from Local Database:
 * Todo({ "userId": 1, "id": 1, "title": "Learn Effect", "completed": "pending" })
 * ---
 * Todo({ "userId": 1, "id": 2, "title": "Build a CLI app", "completed": "completed" })
 * ---
 * Todo({ "userId": 2, "id": 3, "title": "Master TypeScript", "completed": "pending" })
 * ---
 * ```
 *
 * @since 1.0.0
 */
export const listLocalTodosCommand = Command.make(
  "list",
  {},
  Effect.fn("listLocalTodosCommand")(function* () {
    const todos = yield* DatabaseService.getAllTodos();
    yield* Console.log("💾 All Todos from Local Database:");
    for (const todo of todos) {
      yield* Console.log(Todo.pretty(todo));
      yield* Console.log("---");
    }
  })
);
