import { Schema } from "effect";

/**
 * Tagged error class representing general database operation failures.
 *
 * This error is thrown when database operations fail due to connection issues,
 * SQL syntax errors, constraint violations, or other database-related problems.
 *
 * @example
 * ```typescript
 * // Throwing a database error
 * yield* new DatabaseError({
 *   message: "Failed to connect to database: connection timeout"
 * });
 *
 * // Catching a database error
 * Effect.catchTag("DatabaseError", (error) =>
 *   Console.log(`Database operation failed: ${error.message}`)
 * )
 * ```
 *
 * @since 1.0.0
 */
export class DatabaseError extends Schema.TaggedError<DatabaseError>()(
  "DatabaseError",
  {
    /** Human-readable error message describing what went wrong */
    message: Schema.String,
  }
) {}

/**
 * Tagged error class representing cases where a requested todo item cannot be found.
 *
 * This error is thrown when attempting to retrieve a todo by ID that doesn't exist
 * in the database. It provides the specific ID that was not found for better debugging.
 *
 * @example
 * ```typescript
 * // Throwing a TodoNotFound error
 * yield* new TodoNotFound({ id: 42 });
 *
 * // Catching a TodoNotFound error
 * Effect.catchTag("TodoNotFound", ({ id }) =>
 *   Console.log(`Todo ${id} not found in database`)
 * )
 * ```
 *
 * @since 1.0.0
 */
export class TodoNotFound extends Schema.TaggedError<TodoNotFound>()(
  "TodoNotFound",
  {
    /** The ID of the todo that was not found */
    id: Schema.Number,
  }
) {}
