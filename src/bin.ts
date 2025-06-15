#!/usr/bin/env node

/**
 * Main entry point for the Effect Todo CLI application.
 *
 * This file serves as the executable entry point that:
 * - Sets up the Effect runtime environment
 * - Configures service dependencies (TodoService, DatabaseService, ProgressBarService)
 * - Runs the CLI with proper error handling
 * - Provides the Node.js context layer for platform-specific operations
 *
 * The application uses Effect's dependency injection system to provide
 * services to the CLI commands, ensuring proper separation of concerns
 * and testability.
 *
 * @since 1.0.0
 */

import { NodeContext, NodeRuntime } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import { run } from "./Cli.js";
import { TodoService } from "./service/TodoService.js";
import { DatabaseService } from "./service/DatabaseService.js";
import { ProgressBarService } from "./service/ProgressBarService.js";

/**
 * Main service layer that combines all required dependencies.
 *
 * This layer merges:
 * - NodeContext.layer: Provides Node.js platform context
 * - TodoService.Default: HTTP client for external API operations
 * - DatabaseService.Default: SQLite database operations
 * - ProgressBarService.Default: Progress bar utilities for CLI feedback
 *
 * All CLI commands will have access to these services through
 * Effect's dependency injection system.
 *
 * @since 1.0.0
 */
const MainLayer = Layer.mergeAll(
  NodeContext.layer,
  TodoService.Default,
  DatabaseService.Default,
  ProgressBarService.Default
);

/**
 * Application bootstrap and execution.
 *
 * This is the main execution flow that:
 * 1. Runs the CLI with command line arguments
 * 2. Provides the service layer to all commands
 * 3. Executes using Node.js runtime with error reporting disabled
 *
 * Error reporting is disabled to provide clean CLI output without
 * internal Effect stack traces for user-facing errors.
 */
run(process.argv).pipe(
  Effect.provide(MainLayer),
  NodeRuntime.runMain({ disableErrorReporting: true })
);
