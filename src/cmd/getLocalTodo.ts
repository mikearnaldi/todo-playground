/**
 * Todo retrieval command implementation.
 *
 * This module provides the CLI command for retrieving a specific todo item
 * by its ID from the local database. It handles user input validation,
 * database queries, and proper error handling for not found cases.
 *
 * @since 1.0.0
 */

import { Command, Args } from "@effect/cli";
import { Effect, Console } from "effect";
import { DatabaseService } from "../service/DatabaseService.js";
import { Todo } from "../domain/Todo.js";

/**
 * CLI command for retrieving a todo by ID from the local database.
 *
 * This command:
 * - Takes a required integer ID argument
 * - Queries the local database for the todo
 * - Displays the todo in a formatted way using the pretty printer
 * - Handles "not found" cases with user-friendly messages
 *
 * @example
 * ```bash
 * # Retrieve todo with ID 1
 * pnpm dev get 1
 *
 * # Try to retrieve non-existent todo
 * pnpm dev get 999
 * ```
 *
 * Expected output (success):
 * ```
 * 💾 From Local Database:
 * Todo({ "userId": 1, "id": 1, "title": "Learn Effect", "completed": "pending" })
 * ```
 *
 * Expected output (not found):
 * ```
 * ❌ Todo 999 not found in local database
 * ```
 *
 * @since 1.0.0
 */
export const getLocalTodoCommand = Command.make(
  "get",
  {
    /** The ID of the todo to retrieve (must be a positive integer) */
    id: Args.integer({ name: "id" }).pipe(
      Args.withDescription("Todo ID to fetch from local database")
    ),
  },
  Effect.fn("getLocalTodoCommand")(
    function* ({ id }) {
      const todo = yield* DatabaseService.getTodoById(id);
      yield* Console.log("💾 From Local Database:");
      yield* Console.log(Todo.pretty(todo));
    },
    Effect.catchTag("TodoNotFound", ({ id }) =>
      Console.log(`❌ Todo ${id} not found in local database`)
    )
  )
);
