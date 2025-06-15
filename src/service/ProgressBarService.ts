/**
 * Progress bar service for creating terminal progress displays.
 *
 * This service provides methods to generate visual progress indicators
 * for long-running operations like batch synchronization of todos.
 * It encapsulates progress bar creation logic and provides a clean
 * interface for displaying progress in CLI applications.
 *
 * @since 1.0.0
 */

import { Effect } from "effect";
import { Terminal } from "@effect/platform";
import { NodeTerminal } from "@effect/platform-node";

/**
 * Service for creating and managing progress bar displays.
 *
 * This service provides high-level methods for:
 * - Initializing progress displays in the terminal
 * - Updating progress with automatic cursor management
 * - Consistent visual styling across the application
 *
 * The service uses Unicode block characters for visual appeal
 * and handles terminal cursor positioning internally for seamless progress updates.
 * All low-level progress bar creation logic is encapsulated within the service.
 *
 * @example
 * ```typescript
 * import { Effect } from "effect";
 * import { ProgressBarService } from "./utils/ProgressBar.js";
 *
 * const program = Effect.gen(function* () {
 *   const progressBar = yield* ProgressBarService;
 *
 *   // Initialize progress display
 *   yield* progressBar.initializeProgress(0, 10);
 *
 *   // Update progress (handles cursor positioning automatically)
 *   yield* progressBar.updateProgress(3, 10);
 *   yield* progressBar.updateProgress(7, 10);
 *   yield* progressBar.updateProgress(10, 10);
 * });
 * ```
 *
 * @since 1.0.0
 */
export class ProgressBarService extends Effect.Service<ProgressBarService>()(
  "ProgressBarService",
  {
    effect: Effect.gen(function* () {
      const terminal = yield* Terminal.Terminal;

      /**
       * Internal helper: Creates a formatted progress message with a visual progress bar for sync operations.
       *
       * This function generates a string containing:
       * - A visual progress bar using block characters (█)
       * - Current progress as "completed/total (percentage%)"
       * - Consistent formatting for terminal display with sync-specific styling
       *
       * The progress bar has a fixed width of 30 characters and uses:
       * - Filled blocks (█) for completed progress
       * - Empty spaces for remaining progress
       * - Hourglass emoji (⏳) prefix for sync operations
       *
       * This function is not exposed in the public API.
       *
       * @param completed - Number of completed items (must be >= 0)
       * @param total - Total number of items (must be > 0)
       * @returns Effect that resolves to a formatted progress string with visual bar and statistics
       *
       * @internal
       * @since 1.0.0
       */
      const createSyncProgressMessage = Effect.fn("createSyncProgressMessage")(
        function* (completed: number, total: number) {
          const percentage = Math.round((completed / total) * 100);
          const barWidth = 30;
          const filledWidth = Math.round((completed / total) * barWidth);
          const emptyWidth = barWidth - filledWidth;

          const filledBar = "█".repeat(filledWidth);
          const emptyBar = " ".repeat(emptyWidth);

          return `⏳ Progress: [${filledBar}${emptyBar}] ${completed}/${total} (${percentage}%)`;
        }
      );

      /**
       * Initializes the progress display in the terminal.
       *
       * This method displays the initial progress bar at 0% completion
       * and sets up the terminal state for subsequent progress updates.
       * Should be called once before starting progress updates.
       *
       * @param completed - Initial number of completed items (typically 0)
       * @param total - Total number of items to process
       * @returns Effect that completes when the initial progress is displayed
       *
       * @example
       * ```typescript
       * // Initialize progress for 10 items
       * yield* progressBar.initializeProgress(0, 10);
       * // Output: "⏳ Progress: [                              ] 0/10 (0%)"
       * ```
       *
       * @since 1.0.0
       */
      const initializeProgress = Effect.fn("initializeProgress")(function* (
        completed: number,
        total: number
      ) {
        const initialProgress = yield* createSyncProgressMessage(
          completed,
          total
        );
        // Write initial progress without newline using terminal service
        yield* terminal.display(initialProgress);
      });

      /**
       * Updates the progress display in the terminal.
       *
       * This method handles terminal cursor positioning using carriage return:
       * - Uses carriage return (\r) to move cursor to beginning of current line
       * - Overwrites the entire line with new progress information
       * - No newlines are added, keeping the progress on the same line
       * - Automatically adds a newline when progress reaches 100%
       *
       * This creates a smooth, live-updating progress display that stays
       * on the same line without creating multiple lines.
       *
       * @param completed - Current number of completed items
       * @param total - Total number of items to process
       * @returns Effect that completes when the progress is updated
       *
       * @example
       * ```typescript
       * // Update progress to show 7 out of 10 completed
       * yield* progressBar.updateProgress(7, 10);
       * // Terminal shows: "⏳ Progress: [█████████████████████         ] 7/10 (70%)"
       * // Previous progress is overwritten on the same line
       *
       * // When progress reaches 100%, automatically adds newline
       * yield* progressBar.updateProgress(10, 10);
       * // Terminal shows: "⏳ Progress: [██████████████████████████████] 10/10 (100%)"
       * // Followed by automatic newline for subsequent output
       * ```
       *
       * @since 1.0.0
       */
      const updateProgress = Effect.fn("updateProgress")(function* (
        completed: number,
        total: number
      ) {
        const progressMessage = yield* createSyncProgressMessage(
          completed,
          total
        );
        // Use carriage return to go back to beginning of line and overwrite
        yield* terminal.display(`\r${progressMessage}`);

        // Automatically add newline when progress is complete
        if (completed >= total) {
          yield* terminal.display("\n");
        }
      });

      return {
        initializeProgress,
        updateProgress,
      };
    }),
    dependencies: [NodeTerminal.layer],
    accessors: true,
  }
) {}
