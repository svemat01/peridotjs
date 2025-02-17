# @peridotjs/framework

## 0.3.0

### Minor Changes

- c44b308: Introduce hasFlags, reset & discard methods for Parser
- 5c47f62: refactor: improve event registration architecture

    - Rename `registerEvents` to `registerDefaultEventLoggers` for better clarity on its purpose
    - Add new internal `_registerCoreEventHandlers` method to handle system-critical event listeners
    - Move essential system event listeners from `registerEvents` to `_registerCoreEventHandlers`
    - Automatically call `_registerCoreEventHandlers` during client initialization

- 37fb4b9: Introduce onError handler for text commands
- 8ebb17a: Introduce text subcommand helpers

## 0.2.7

### Patch Changes

- f5397cc: Remove PartialGroupDMChannel from text command types to eliminate redundant type narrowing in command handlers.

## 0.2.6

### Patch Changes

- 3b3b6df: Update deps

## 0.2.5

### Patch Changes

- 214d314: Fix registry types

## 0.2.4

### Patch Changes

- 881118c: Patch createHandler type issue

## 0.2.3

### Patch Changes

- fe93ca3: Introduce handler creator helper function `createHandler`

## 0.2.2

### Patch Changes

- e80bb7c: Fix error logs

## 0.2.1

### Patch Changes

- f52b5ee: Patch types

## 0.2.0

### Minor Changes

- e5aeec4: Reworked internal handler layout and introduce plugin system

## 0.1.4

### Patch Changes

- f93cfba: Add forgetten handler listeners for Select Menus and Modal Submits

## 0.1.3

### Patch Changes

- 9929dd7: Fix i18n getter

## 0.1.2

### Patch Changes

- fe1224c: Make i18n optional

## 0.1.1

### Patch Changes

- af3866d: Fix circular imports for arguments

## 0.1.0

### Minor Changes

- 28f7e62: Breaking Cleanup

## 0.0.3

### Patch Changes

- 409a111: Fix build

## 0.0.2

### Patch Changes

- 1d07c2e: Update exported files

## 0.0.1

### Patch Changes

- c1eaae6: Initial Deploy
