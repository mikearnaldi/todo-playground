/**
 * Main CLI configuration and command structure definition.
 *
 * This module defines the command hierarchy and structure for the Effect Todo CLI.
 * It imports all individual command implementations and organizes them under
 * a main command structure for the CLI framework.
 *
 * The CLI is structured as a single main command with multiple subcommands:
 * - init: Initialize database with schema and sample data
 * - get: Retrieve a specific todo by ID
 * - list: Display all todos from the database
 * - create: Create a new todo item
 * - clear: Remove all todos from the database
 * - sync: Synchronize todos from the external API
 *
 * @since 1.0.0
 */

import { Command } from "@effect/cli";
import { initDbCommand } from "./cmd/initDb.js";
import { getLocalTodoCommand } from "./cmd/getLocalTodo.js";
import { listLocalTodosCommand } from "./cmd/listLocalTodos.js";
import { createTodoCommand } from "./cmd/createTodo.js";
import { clearTodosCommand } from "./cmd/clearTodos.js";
import { syncTodoCommand } from "./cmd/syncTodos.js";

/**
 * Main database command that groups all todo-related subcommands.
 *
 * This command serves as the root command for all database operations.
 * All subcommands are registered under this main command to provide
 * a consistent CLI interface.
 *
 * @since 1.0.0
 */
const dbCommand = Command.make("db").pipe(
  Command.withSubcommands([
    initDbCommand,
    getLocalTodoCommand,
    listLocalTodosCommand,
    createTodoCommand,
    clearTodosCommand,
    syncTodoCommand,
  ])
);

/**
 * The main command for the entire CLI application.
 * Currently aliases to the database command, but can be extended
 * to include other top-level commands in the future.
 *
 * @since 1.0.0
 */
const mainCommand = dbCommand;

/**
 * CLI runner configuration with application metadata.
 *
 * This function creates the CLI runner with:
 * - Application name: "Effect Todo CLI"
 * - Version: "0.0.0"
 * - Command structure and argument parsing
 *
 * @param args - Command line arguments (typically process.argv)
 * @returns Effect that runs the CLI application
 *
 * @example
 * ```typescript
 * import { run } from "./Cli.js";
 *
 * // Run the CLI with process arguments
 * run(process.argv).pipe(
 *   Effect.provide(MainLayer),
 *   NodeRuntime.runMain()
 * );
 * ```
 *
 * @since 1.0.0
 */
export const run = Command.run(mainCommand, {
  name: "Effect Todo CLI",
  version: "0.0.0",
});
