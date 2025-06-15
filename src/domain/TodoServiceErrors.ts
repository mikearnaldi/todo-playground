import { Schema } from "effect";

/**
 * Tagged error class representing failures when fetching todos from the external API.
 *
 * This error is thrown when the TodoService fails to retrieve a todo from the
 * jsonplaceholder.typicode.com API due to network issues, HTTP errors, invalid responses,
 * or other API-related problems.
 *
 * @example
 * ```typescript
 * // Throwing a GetTodoByIdError
 * yield* new GetTodoByIdError({
 *   id: 42,
 *   message: "HTTP 404: Todo not found on remote server"
 * });
 *
 * // Catching a GetTodoByIdError
 * Effect.catchTag("GetTodoByIdError", ({ id, message }) =>
 *   Console.log(`Failed to fetch todo ${id} from API: ${message}`)
 * )
 * ```
 *
 * @since 1.0.0
 */
export class GetTodoByIdError extends Schema.TaggedError<GetTodoByIdError>()(
  "GetTodoByIdError",
  {
    /** The ID of the todo that failed to be retrieved */
    id: Schema.Number,
    /** Human-readable error message describing what went wrong */
    message: Schema.String,
  }
) {}
