# Effect Todo CLI Application

A powerful command-line todo application built with Effect, demonstrating local SQLite database operations with API synchronization capabilities.

## Features

- 💾 **Local SQLite Database**: Store and manage todos locally using @effect/sql
- 📡 **API Synchronization**: Sync todos from jsonplaceholder.typicode.com
- 🔄 **Batch Operations**: Sync multiple todos with configurable concurrency
- ⚡ **Flexible Concurrency**: Control sync performance with numeric or unbounded concurrency
- 🏷️ **Tagged Error Handling**: Proper error types with TodoNotFound and DatabaseError
- 🎯 **Type-Safe CLI**: Built with @effect/cli for robust command parsing and schema validation
- ✅ **Input Validation**: Todo titles are validated to be non-empty and under 255 characters

## Installation

```sh
pnpm install
```

## Quick Start

1. Initialize the database:

```sh
pnpm dev init
```

2. List all todos:

```sh
pnpm dev list
```

3. Create a new todo:

```sh
pnpm dev create 2 "Learn Effect Framework" false
```

## CLI Help

Effect Todo CLI 0.0.0

### init Command

Initialize the database with schema and sample data.

**Usage:**

```sh
pnpm dev init
```

**Example Output:**

```
✅ Database initialized successfully!
```

### get Command

Retrieve a specific todo by ID from the local database.

**Usage:**

```sh
pnpm dev get <id>
```

**Arguments:**

- `<id>` - Todo ID to fetch from local database (integer)

**Examples:**

```sh
pnpm dev get 1
```

**Example Output:**

```
💾 From Local Database:
Todo({ "userId": 1, "id": 1, "title": "delectus aut autem", "completed": "completed" })
```

### list Command

Display all todos from the local database.

**Usage:**

```sh
pnpm dev list
```

**Example Output:**

```
💾 All Todos from Local Database:
Todo({ "userId": 1, "id": 1, "title": "delectus aut autem", "completed": "completed" })
---
Todo({ "userId": 1, "id": 2, "title": "quis ut nam facilis et officia qui", "completed": "completed" })
---
...
```

### create Command

Create a new todo in the local database.

**Usage:**

```sh
pnpm dev create <user-id> <title> [<completed>]
```

**Arguments:**

- `<user-id>` - User ID for the todo (integer)
- `<title>` - Todo title (text, must be non-empty and less than 255 characters)
- `<completed>` - Whether the todo is completed (true/false, optional, defaults to false)

**Examples:**

```sh
pnpm dev create 2 "Learn Effect Framework" false
pnpm dev create 1 "Master TypeScript" true
pnpm dev create 3 "Build CLI app"  # defaults to false
```

**Example Output:**

```
✅ Created new todo:
Todo({ "userId": 2, "id": 56, "title": "Learn Effect Framework", "completed": "pending" })
```

**Validation:**

- Todo titles must be non-empty
- Todo titles must be less than 255 characters
- Commands will fail if validation constraints are not met

### clear Command

Remove all todos from the local database.

**Usage:**

```sh
pnpm dev clear
```

### sync Command

Fetch todos from the API and sync them to the local database.

**Usage:**

```sh
pnpm dev sync [--concurrency <level>] <id>...
```

**Arguments:**

- `<id>...` - Todo IDs to fetch from API and sync to local database (one or more integers)

**Options:**

- `--concurrency <level>` - Concurrency level: number of todos to sync concurrently or 'unbounded' (default: 1 for sequential)

**Examples:**

```sh
# Sync single todo
pnpm dev sync 10

# Sync multiple todos sequentially (default)
pnpm dev sync 10 11 12

# Sync with controlled concurrency
pnpm dev sync --concurrency 2 10 11 12

# Sync with maximum concurrency
pnpm dev sync --concurrency unbounded 10 11 12 13 14 15
```

**Example Output:**

```
📡 Syncing 3 todo(s) from API (parallel (2))...
⏳ Progress: [██████████████████████████████] 3/3 (100%)
🎉 Successfully synced 3 todo(s) to local database!
```

**Note:** Synced todos from the API are also subject to the same validation rules (255 character title limit).

## Global Options

All commands support these global options:

- `--help` - Show help documentation for a command
- `--version` - Show the version of the application
- `--wizard` - Start wizard mode for a command
- `--log-level <level>` - Set minimum log level (all, trace, debug, info, warning, error, fatal, none)
- `--completions <shell>` - Generate completion script for shell (sh, bash, fish, zsh)

## Data Validation

The application enforces strict data validation:

- **Todo Titles**: Must be non-empty strings with a maximum length of 255 characters
- **User IDs**: Must be positive integers
- **Completion Status**: Must be boolean (true/false) or the string equivalents ("completed"/"pending")
- **Todo IDs**: Must be positive integers

Invalid data will cause commands to fail with descriptive error messages.

## Visual Indicators

- 📡 **API operations**: Commands that interact with the remote API
- 💾 **Database operations**: Commands that work with local SQLite database
- ✅ **Success messages**: Confirmation of successful operations
- ❌ **Error messages**: Clear error reporting with context
- ⏳ **Progress indicators**: Real-time progress for batch operations

## Architecture

The application demonstrates Effect's service composition pattern:

- **TodoService**: HTTP client for jsonplaceholder.typicode.com API
- **DatabaseService**: SQLite operations using @effect/sql
- **Tagged Errors**: `TodoNotFound` and `DatabaseError` for type-safe error handling
- **Effect.fn**: Optimized function definitions throughout the codebase
- **Schema Validation**: Comprehensive data validation using Effect Schema

## Database Schema

The local SQLite database uses the following schema:

```sql
CREATE TABLE todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  completed TEXT NOT NULL CHECK (completed IN ('completed', 'pending')) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Note:** While the database column can technically store longer strings, the application enforces a 255 character limit at the schema validation level for consistency and data integrity.

## Development

**Building**

To build the package:

```sh
pnpm build
```

**Testing**

To test the package:

```sh
pnpm test
```

**Type Checking**

To check TypeScript types:

```sh
pnpm check
```

## Dependencies

- **Effect**: Functional programming library for TypeScript
- **@effect/cli**: Command-line interface framework
- **@effect/sql**: SQL client for Effect
- **@effect/sql-sqlite-node**: SQLite adapter for Effect SQL
- **better-sqlite3**: Fast SQLite3 bindings for Node.js
