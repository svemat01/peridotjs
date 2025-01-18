---
"@peridotjs/framework": minor
---

refactor: improve event registration architecture

- Rename `registerEvents` to `registerDefaultEventLoggers` for better clarity on its purpose
- Add new internal `_registerCoreEventHandlers` method to handle system-critical event listeners
- Move essential system event listeners from `registerEvents` to `_registerCoreEventHandlers`
- Automatically call `_registerCoreEventHandlers` during client initialization
