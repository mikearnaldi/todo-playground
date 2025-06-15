/**
 * Todo creation command implementation.
 *
 * This module provides the CLI command for creating new todo items in the local database.
 * It handles user input validation, todo creation, and user feedback.
 *
 * @since 1.0.0
 */

import { Command, Args } from "@effect/cli";
import { Effect, Console, Option } from "effect";
import { DatabaseService } from "../service/DatabaseService.js";
import { Todo } from "../domain/Todo.js";

/**
 * CLI command for creating a new todo item.
 *
 * This command allows users to create new todos with:
 * - Required user ID (integer)
 * - Required title (string, 1-255 characters)
 * - Optional completion status (boolean, defaults to false)
 *
 * The command validates all inputs using the Todo schema, ensuring:
 * - User ID is a valid integer
 * - Title is non-empty and within the 255 character limit
 * - Completion status is a valid boolean
 *
 * @example
 * ```bash
 * # Create a pending todo
 * pnpm dev create 1 "Learn Effect Framework" false
 *
 * # Create a completed todo
 * pnpm dev create 2 "Setup development environment" true
 *
 * # Create a todo with default completion status (false)
 * pnpm dev create 1 "Write documentation"
 * ```
 *
 * Expected output:
 * ```
 * ✅ Created new todo:
 * Todo({ "userId": 1, "id": 42, "title": "Learn Effect Framework", "completed": "pending" })
 * ```
 *
 * @since 1.0.0
 */
export const createTodoCommand = Command.make(
  "create",
  {
    /** User ID for the todo (must be a positive integer) */
    userId: Args.integer({ name: "user-id" }).pipe(
      Args.withDescription("User ID for the todo")
    ),
    /** Todo title (must be non-empty and less than 255 characters) */
    title: Args.text({ name: "title" }).pipe(
      Args.withDescription("Todo title")
    ),
    /** Whether the todo is completed (optional, defaults to false) */
    completed: Args.boolean({ name: "completed" }).pipe(
      Args.withDescription("Whether the todo is completed"),
      Args.optional
    ),
  },
  Effect.fn("createTodoCommand")(function* ({
    userId,
    title,
    completed,
  }: {
    userId: number;
    title: string;
    completed: Option.Option<boolean>;
  }) {
    const todo = yield* DatabaseService.createTodo({
      userId,
      title,
      completed: Option.getOrElse(completed, () => false),
    });
    yield* Console.log("✅ Created new todo:");
    yield* Console.log(Todo.pretty(todo));
  })
);
