/**
 * Database service for managing todo items in SQLite.
 *
 * This service provides a complete abstraction layer over SQLite database operations
 * for todo management. It handles schema creation, data validation, CRUD operations,
 * and proper error handling with tagged errors.
 *
 * Features:
 * - Automatic schema initialization with sample data
 * - Full CRUD operations (Create, Read, Update, Delete)
 * - Schema validation using Effect Schema
 * - Proper error handling with DatabaseError and TodoNotFound
 * - Support for both individual and batch operations
 * - Automatic timestamp management (created_at, updated_at)
 *
 * @example
 * ```typescript
 * import { Effect } from "effect";
 * import { DatabaseService } from "./service/DatabaseService.js";
 *
 * const program = Effect.gen(function* () {
 *   // Initialize database
 *   yield* DatabaseService.initializeDatabase();
 *
 *   // Create a new todo
 *   const todo = yield* DatabaseService.createTodo({
 *     userId: 1,
 *     title: "Learn Effect",
 *     completed: false
 *   });
 *
 *   // Retrieve it
 *   const retrieved = yield* DatabaseService.getTodoById(todo.id);
 * });
 * ```
 *
 * @since 1.0.0
 */

import { Effect, Schema } from "effect";
import { SqlClient } from "@effect/sql";
import { SqliteClient } from "@effect/sql-sqlite-node";
import { Todo } from "../domain/Todo.js";
import { DatabaseError, TodoNotFound } from "../domain/DatabaseErrors.js";
import * as path from "path";

export class DatabaseService extends Effect.Service<DatabaseService>()(
  "DatabaseService",
  {
    effect: Effect.gen(function* () {
      /**
       * SQL client instance for executing database queries.
       * Provided by the SqliteClient layer with connection to todos.db file.
       */
      const sql = yield* SqlClient.SqlClient;

      /**
       * Initializes the database schema and populates with sample data if empty.
       *
       * This method:
       * - Creates the todos table if it doesn't exist
       * - Sets up proper constraints and indexes
       * - Inserts sample data if the table is empty
       * - Uses proper error handling with DatabaseError
       *
       * The todos table schema includes:
       * - id: Auto-incrementing primary key
       * - user_id: Foreign key reference (not enforced)
       * - title: Non-null text field
       * - completed: Enum constraint ('completed' | 'pending')
       * - created_at/updated_at: Automatic timestamp management
       *
       * @returns Effect that completes when database is initialized
       * @throws {DatabaseError} When schema creation or data insertion fails
       *
       * @since 1.0.0
       */
      const initializeDatabase = Effect.fn("initializeDatabase")(
        function* () {
          yield* sql`
        CREATE TABLE IF NOT EXISTS todos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          completed TEXT NOT NULL CHECK (completed IN ('completed', 'pending')) DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

          // Check if we have any data, if not, insert sample data
          const count = yield* sql<{
            count: number;
          }>`SELECT COUNT(*) as count FROM todos`;
          if (count[0].count === 0) {
            yield* sql`
          INSERT INTO todos (user_id, title, completed) VALUES
            (1, 'Learn Effect', 'pending'),
            (1, 'Build a CLI app', 'completed'),
            (2, 'Master TypeScript', 'pending'),
            (1, 'Use SQLite with Effect', 'pending'),
            (2, 'Write documentation', 'completed')
        `;
          }
        },
        (effect) =>
          Effect.catchAll(
            effect,
            (error) =>
              new DatabaseError({
                message: `Failed to initialize database: ${error.message}`,
              })
          )
      );

      /**
       * Retrieves a single todo by its ID from the database.
       *
       * This method:
       * - Executes a SELECT query for the specific ID
       * - Transforms database row to Todo domain object
       * - Validates the result using Todo schema
       * - Handles both "not found" and database error cases
       *
       * @param id - The ID of the todo to retrieve
       * @returns Effect that resolves to a Todo object
       * @throws {TodoNotFound} When no todo exists with the given ID
       * @throws {DatabaseError} When database query fails or schema validation fails
       *
       * @example
       * ```typescript
       * const todo = yield* DatabaseService.getTodoById(42);
       * console.log(todo.title); // "Learn Effect"
       * ```
       *
       * @since 1.0.0
       */
      const getTodoById = Effect.fn("getTodoById")(function* (id: number) {
        const rows = yield* Effect.catchAll(
          sql<{
            readonly id: number;
            readonly user_id: number;
            readonly title: string;
            readonly completed: string;
          }>`SELECT id, user_id, title, completed FROM todos WHERE id = ${id}`,
          (error) =>
            new DatabaseError({
              message: `Database query error: ${error.message}`,
            })
        );

        if (rows.length === 0) {
          return yield* new TodoNotFound({ id });
        }

        const row = rows[0];
        const todoData = {
          userId: row.user_id,
          id: row.id,
          title: row.title,
          completed: row.completed === "completed",
        };

        return yield* Effect.catchAll(
          Schema.decodeUnknown(Todo)(todoData),
          (error) =>
            new DatabaseError({
              message: `Schema decode error for todo ${id}: ${error.message}`,
            })
        );
      });

      /**
       * Retrieves all todos from the database, ordered by ID.
       *
       * This method:
       * - Fetches all todos with a single query
       * - Transforms each row to a Todo domain object
       * - Validates each todo using the Todo schema
       * - Returns an array of validated Todo objects
       *
       * @returns Effect that resolves to an array of Todo objects
       * @throws {DatabaseError} When database query fails or schema validation fails
       *
       * @example
       * ```typescript
       * const allTodos = yield* DatabaseService.getAllTodos();
       * console.log(`Found ${allTodos.length} todos`);
       * ```
       *
       * @since 1.0.0
       */
      const getAllTodos = Effect.fn("getAllTodos")(
        function* () {
          const rows = yield* sql<{
            readonly id: number;
            readonly user_id: number;
            readonly title: string;
            readonly completed: string;
          }>`SELECT id, user_id, title, completed FROM todos ORDER BY id`;

          const todos = [];
          for (const row of rows) {
            const todoData = {
              userId: row.user_id,
              id: row.id,
              title: row.title,
              completed: row.completed === "completed",
            };
            const todo = yield* Schema.decodeUnknown(Todo)(todoData);
            todos.push(todo);
          }

          return todos;
        },
        (effect) =>
          Effect.catchAll(
            effect,
            (error) =>
              new DatabaseError({
                message: `Failed to fetch todos: ${error.message}`,
              })
          )
      );

      /**
       * Creates a new todo in the database.
       *
       * This method:
       * - Validates input data against Todo schema constraints
       * - Inserts the new todo with auto-generated ID
       * - Returns the complete Todo object with generated ID
       * - Handles completion status conversion (boolean to string)
       *
       * @param data - Todo creation data
       * @param data.userId - ID of the user creating the todo
       * @param data.title - Title of the todo (1-255 characters)
       * @param data.completed - Optional completion status (defaults to false)
       * @returns Effect that resolves to the created Todo object
       * @throws {DatabaseError} When insertion fails or validation fails
       *
       * @example
       * ```typescript
       * const newTodo = yield* DatabaseService.createTodo({
       *   userId: 1,
       *   title: "Learn Effect Framework",
       *   completed: false
       * });
       * console.log(`Created todo with ID: ${newTodo.id}`);
       * ```
       *
       * @since 1.0.0
       */
      const createTodo = Effect.fn("createTodo")(
        function* (data: {
          userId: number;
          title: string;
          completed?: boolean;
        }) {
          const completedStatus = data.completed ? "completed" : "pending";

          const result = yield* sql<{ id: number }>`
          INSERT INTO todos (user_id, title, completed) 
          VALUES (${data.userId}, ${data.title}, ${completedStatus})
          RETURNING id
        `;

          const newId = result[0].id;
          return yield* getTodoById(newId);
        },
        Effect.catchAll(
          (error) =>
            new DatabaseError({
              message: `Failed to create todo: ${error.message}`,
            })
        )
      );

      /**
       * Removes all todos from the database.
       *
       * This method performs a complete truncation of the todos table,
       * removing all records. This operation cannot be undone.
       *
       * @returns Effect that completes when all todos are deleted
       * @throws {DatabaseError} When the delete operation fails
       *
       * @example
       * ```typescript
       * yield* DatabaseService.clearAllTodos();
       * console.log("All todos have been deleted");
       * ```
       *
       * @since 1.0.0
       */
      const clearAllTodos = Effect.fn("clearAllTodos")(
        function* () {
          yield* sql`DELETE FROM todos`;
        },
        Effect.catchAll(
          (error) =>
            new DatabaseError({
              message: `Failed to clear todos: ${error.message}`,
            })
        )
      );

      /**
       * Saves a todo to the database (insert or update).
       *
       * This method handles both insertion of new todos and updates of existing ones:
       * - If a todo with the given ID exists, it updates the record
       * - If no todo exists with the ID, it inserts a new record with that ID
       * - Updates the updated_at timestamp for existing records
       * - Preserves the original created_at timestamp
       *
       * This is primarily used by the sync operation to save todos from the API.
       *
       * @param todo - Complete Todo object to save
       * @returns Effect that resolves to the saved Todo object
       * @throws {DatabaseError} When the save operation fails
       *
       * @example
       * ```typescript
       * // Save a todo from API
       * const apiTodo = yield* TodoService.getTodoById(42);
       * const savedTodo = yield* DatabaseService.saveTodo(apiTodo);
       * console.log(`Saved todo: ${savedTodo.title}`);
       * ```
       *
       * @since 1.0.0
       */
      const saveTodo = Effect.fn("saveTodo")(
        function* (todo: Todo) {
          const completedStatus = todo.completed ? "completed" : "pending";

          // First check if todo already exists
          const existingRows = yield* sql<{ count: number }>`
          SELECT COUNT(*) as count FROM todos WHERE id = ${todo.id}
        `;

          if (existingRows[0].count > 0) {
            // Update existing todo
            yield* sql`
            UPDATE todos 
            SET user_id = ${todo.userId}, title = ${todo.title}, completed = ${completedStatus}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ${todo.id}
          `;
          } else {
            // Insert new todo with specific ID
            yield* sql`
            INSERT INTO todos (id, user_id, title, completed) 
            VALUES (${todo.id}, ${todo.userId}, ${todo.title}, ${completedStatus})
          `;
          }

          return yield* getTodoById(todo.id);
        },
        (effect, todo) =>
          effect.pipe(
            Effect.catchAll(
              (error) =>
                new DatabaseError({
                  message: `Failed to save todo ${todo.id}: ${error.message}`,
                })
            )
          )
      );

      return {
        initializeDatabase,
        getTodoById,
        getAllTodos,
        createTodo,
        clearAllTodos,
        saveTodo,
      };
    }),
    dependencies: [
      SqliteClient.layer({ filename: path.join(process.cwd(), "todos.db") }),
    ],
    accessors: true,
  }
) {}
