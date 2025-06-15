import { Effect, Schema, Schedule } from "effect";
import { HttpClient, HttpClientRequest } from "@effect/platform";
import { NodeHttpClient } from "@effect/platform-node";
import { Todo } from "../domain/Todo.js";
import { GetTodoByIdError } from "../domain/TodoServiceErrors.js";

/**
 * Service for interacting with the external Todo API (jsonplaceholder.typicode.com).
 *
 * This service provides methods to fetch todo items from the remote API with built-in
 * retry logic, error handling, and schema validation. It uses Effect's HTTP client
 * with exponential backoff retry strategy for resilient network operations.
 *
 * Features:
 * - Automatic retry with exponential backoff (100ms base, 2x multiplier, max 5s)
 * - HTTP status validation (only 2xx responses are considered successful)
 * - Schema validation of API responses using the Todo domain model
 * - Comprehensive error handling with tagged errors
 *
 * @example
 * ```typescript
 * import { Effect, Console } from "effect";
 * import { TodoService } from "./service/TodoService.js";
 *
 * // Using the service
 * const program = Effect.gen(function* () {
 *   const todo = yield* TodoService.getTodoById(1);
 *   yield* Console.log(`Fetched: ${todo.title}`);
 * });
 * ```
 *
 * @since 1.0.0
 */
export class TodoService extends Effect.Service<TodoService>()("TodoService", {
  effect: Effect.gen(function* () {
    /**
     * HTTP client configured with retry logic and status validation.
     *
     * Configuration:
     * - Retries transient failures (network errors, 5xx responses)
     * - Exponential backoff: starts at 100ms, doubles each retry, max 5 seconds
     * - Only accepts 2xx HTTP status codes as successful
     */
    const httpClient = (yield* HttpClient.HttpClient).pipe(
      HttpClient.retryTransient({
        schedule: Schedule.exponential("100 millis", 2).pipe(
          Schedule.upTo("5 seconds")
        ),
      }),
      HttpClient.filterStatusOk
    );

    /**
     * Fetches a todo item by ID from the external API.
     *
     * This method makes an HTTP GET request to the jsonplaceholder API,
     * validates the response, and decodes it into a Todo domain object.
     *
     * @param id - The ID of the todo to fetch (must be a positive integer)
     * @returns Effect that resolves to a Todo object or fails with GetTodoByIdError
     *
     * @example
     * ```typescript
     * const fetchTodo = Effect.gen(function* () {
     *   const todo = yield* TodoService.getTodoById(42);
     *   return todo;
     * });
     * ```
     *
     * @throws {GetTodoByIdError} When the API request fails, returns non-2xx status,
     *                            or the response doesn't match the Todo schema
     *
     * @since 1.0.0
     */
    const getTodoById = Effect.fn("getTodoById")(
      function* (id: number) {
        const request = HttpClientRequest.get(
          `https://jsonplaceholder.typicode.com/todos/${id}`
        );
        const response = yield* httpClient.execute(request);
        const jsonData = yield* response.json;

        return yield* Schema.decodeUnknown(Todo)(jsonData);
      },
      (effect, id) =>
        Effect.catchAll(
          effect,
          (error) =>
            new GetTodoByIdError({
              id,
              message: `Failed to fetch todo ${id}: ${error.message}`,
            })
        )
    );

    return {
      getTodoById,
    };
  }),
  dependencies: [NodeHttpClient.layer],
  accessors: true,
}) {}
