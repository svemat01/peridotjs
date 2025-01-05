import { isDMChannel, isGroupChannel } from '@sapphire/discord.js-utilities';
import type { Message } from 'discord.js';
import { PermissionFlagsBits, PermissionsBitField } from 'discord.js';

import { container } from '../../structures/container.js';
import { Events } from '../index.js';

const requiredPermissions = new PermissionsBitField([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]).freeze();

export async function onMessageCreate(message: Message): Promise<void> {
    const { client, logger } = container;

    const canRun = await canRunInChannel(message);
    logger.debug({ content: message.content, author: message.author.id, src: message.id, canRun }, 'Message received');
    if (!canRun) return;

    let prefix: string | null | RegExp = null;
    const mentionPrefix = getMentionPrefix(message);
    const { regexPrefix } = client.options;

    if (mentionPrefix) {
        if (message.content.length === mentionPrefix.length) {
            client.emit(Events.MentionPrefixOnly, message);
            return;
        }

        prefix = mentionPrefix;
    } else if (regexPrefix?.test(message.content)) {
        prefix = regexPrefix;
    } else {
        const prefixes = await client.fetchPrefix(message);
        const parsed = getPrefix(message.content, prefixes);
        if (parsed !== null) prefix = parsed;
    }

    if (prefix === null) client.emit(Events.NonPrefixedMessage, message);
    else client.emit(Events.PrefixedMessage, message, prefix);
}

async function canRunInChannel(message: Message): Promise<boolean> {
    if (isDMChannel(message.channel) || isGroupChannel(message.channel)) return true;

    const me = await message.guild?.members.fetchMe();
    if (!me) return false;

    const { channel } = message;
    const permissionsFor = channel.permissionsFor(me);
    if (!permissionsFor) return false;

    return permissionsFor.has(requiredPermissions, true);
}

function getMentionPrefix(message: Message): string | null {
    // If the content is shorter than 20 characters, or does not start with `<@` then skip early:
    if (message.content.length < 20 || !message.content.startsWith('<@')) return null;

    // Calculate the offset and the ID that is being provided
    const [offset, id] =
        message.content[2] === '&'
            ? [3, message.guild?.roles.botRoleFor(container.client.id!)?.id]
            : [message.content[2] === '!' ? 3 : 2, container.client.id];

    container.logger.debug({ offset, id, content: message.content }, 'Mention prefix');

    if (!id) return null;

    const offsetWithId = offset + id.length;

    // If the mention doesn't end with `>`, skip early:
    if (message.content[offsetWithId] !== '>') return null;

    // Check whether or not the ID is the same as the managed role ID:
    const mentionId = message.content.substring(offset, offsetWithId);

    container.logger.debug({ mentionId, id }, 'Mention prefix');

    if (mentionId === id) return message.content.substring(0, offsetWithId + 1);

    return null;
}

function getPrefix(content: string, prefixes: readonly string[] | string | null): string | null {
    if (prefixes === null) return null;

    if (typeof prefixes === 'string') {
        return content.startsWith(prefixes) ? prefixes : null;
    }

    return prefixes.find((prefix) => content.startsWith(prefix)) ?? null;
}
