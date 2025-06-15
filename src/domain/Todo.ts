import { Schema, Pretty } from "effect";

/**
 * Branded type for User ID to ensure type safety and prevent mixing with other integer types.
 * @since 1.0.0
 */
const UserId = Schema.Int.pipe(Schema.brand("UserId"));

/**
 * Branded type for Todo ID to ensure type safety and prevent mixing with other integer types.
 * @since 1.0.0
 */
const TodoId = Schema.Int.pipe(Schema.brand("TodoId"));

/**
 * Union type representing the possible completion states of a todo item.
 * @since 1.0.0
 */
const CompletionStatus = Schema.Literal("completed", "pending");

/**
 * Schema transformation that converts between boolean completion status and string representation.
 * This allows the API to use boolean values while the database stores string values.
 * @since 1.0.0
 */
const CompletedField = Schema.transform(Schema.Boolean, CompletionStatus, {
  decode: (completed) =>
    completed ? ("completed" as const) : ("pending" as const),
  encode: (status) => status === "completed",
});

/**
 * Schema for todo titles with validation constraints.
 * Ensures titles are non-empty and do not exceed 255 characters.
 * @since 1.0.0
 */
const TodoTitle = Schema.NonEmptyString.pipe(Schema.maxLength(255));

/**
 * Todo domain model representing a task item with user association and completion status.
 *
 * This class uses Effect Schema for runtime validation and type safety, ensuring that:
 * - User IDs and Todo IDs are properly branded to prevent type confusion
 * - Titles are non-empty and within the 255 character limit
 * - Completion status is properly validated and transformed between boolean and string representations
 *
 * @example
 * ```typescript
 * import { Effect, Schema, Console } from "effect";
 * import { Todo } from "./domain/Todo.js";
 *
 * // Create a Todo using schema decoding (recommended)
 * const todoData = {
 *   userId: 1,
 *   id: 42,
 *   title: "Learn Effect Framework",
 *   completed: false
 * };
 *
 * const program = Effect.gen(function* () {
 *   const todo = yield* Schema.decodeUnknown(Todo)(todoData);
 *   yield* Console.log(Todo.pretty(todo));
 * });
 * ```
 *
 * @since 1.0.0
 */
export class Todo extends Schema.Class<Todo>("Todo")({
  /** The ID of the user who owns this todo */
  userId: UserId,
  /** Unique identifier for this todo item */
  id: TodoId,
  /** The todo's title/description (1-255 characters) */
  title: TodoTitle,
  /** Whether the todo has been completed */
  completed: CompletedField,
}) {
  /**
   * Pretty printer for Todo instances, providing formatted string representation.
   * Used for console output and debugging.
   * @since 1.0.0
   */
  static readonly pretty = Pretty.make(Todo);
}
