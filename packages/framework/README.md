# @peridot/framework

<div align="center">

[![GitHub](https://img.shields.io/github/license/svemat01/peridotjs)](https://github.com/svemat01/peridotjs/blob/main/LICENSE)
[![npm](https://img.shields.io/npm/v/@peridot/framework)](https://www.npmjs.com/package/@peridot/framework)

The core framework package for PeridotJS, providing a functional and type-safe approach to building Discord bots.

[Installation](#installation) •
[Quick Start](#quick-start) •
[Handlers](#handlers) •
[Container](#container) •
[Examples](examples/)

</div>

## Installation

```bash
# npm
npm install @peridot/framework discord.js

# yarn
yarn add @peridot/framework discord.js

# pnpm
pnpm add @peridot/framework discord.js
```

## Quick Start

```typescript
import { PeridotClient, PermissionLevel } from '@peridot/framework';
import { GatewayIntentBits } from 'discord.js';
import pino from 'pino';

// Create a new client instance
const client = new PeridotClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    logger: pino(),
    permissionConfig: {
        global: {
            'YOUR_USER_ID': PermissionLevel.OWNER,
        },
    },
});

// Load handlers from the handlers directory
await container.handlers.loadHandlerExports(
    new URL('handlers/', import.meta.url).pathname
);

// Login to Discord
client.login('YOUR_BOT_TOKEN');
```

## Container

The container is a central registry that provides access to core framework components. It's inspired by SapphireJS's container system but implemented with a more functional approach.

```typescript
import { container } from '@peridot/framework';

// Access the client instance
const client = container.client;

// Access the handler registry manager
const handlers = container.handlers;

// Access the logger
const logger = container.logger;
```

## Handlers

Handlers are the core building blocks of your bot's functionality. They can be commands, events, or components.

### Creating a Handler

Create a new file in your handlers directory (e.g., `src/handlers/ping.ts`):

```typescript
import { createHandlerExport, type SlashCommand } from '@peridot/framework';

const pingCommand = {
    data: {
        name: 'ping',
        description: 'Replies with pong!',
    },
    guilds: ["MY_GUILD_ID"],
    async run(interaction) {
        await interaction.reply('Pong!');
    },
} satisfies SlashCommand;

export default createHandlerExport({
    slashCommands: [pingCommand],
});
```

### Loading Handlers

Handlers are loaded using the `loadHandlerExports` method from the container:

```typescript
// Load all handlers from the handlers directory
await container.handlers.loadHandlerExports(
    new URL('handlers/', import.meta.url).pathname
);
```

### Handler Types

- **Commands**
  - Text Commands
  - Slash Commands
  - Context Menu Commands
- **Components**
  - Button Components
  - Modal Components
  - Select Menu Components
- **Events**
  - Client Events

## Features

- 🎯 **Type-Safe**: Built with TypeScript for excellent type safety
- 🔌 **Plugin System**: Extensible plugin architecture
- 🛡️ **Permission System**: Built-in hierarchical permission system
- 🌍 **i18n Support**: Internationalization support using i18next
- 🎮 **Full Discord.js Support**: Complete support for all Discord.js features
- 🔍 **Argument Parsing**: Advanced argument parsing with flags
- 📝 **Logger Integration**: Built-in logging support using Pino

## Contributing

We welcome contributions! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

## Related Packages

- [@peridot/tasks-plugin](../tasks-plugin/README.md) - Plugin for scheduling and managing tasks
