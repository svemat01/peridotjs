import type { Interaction } from 'discord.js';

import { container } from '../../structures/container.js';
import { Events } from '../index.js';

export async function onInteractionCreate(interaction: Interaction): Promise<void> {
    const { client, logger } = container;

    if (interaction.isChatInputCommand()) {
        client.emit(Events.PossibleSlashCommand, interaction);
    } else if (interaction.isContextMenuCommand()) {
        client.emit(Events.PossibleContextMenuCommand, interaction);
    } else if (interaction.isAutocomplete()) {
        client.emit(Events.PossibleAutocompleteInteraction, interaction);
    } else if (interaction.isButton()) {
        client.emit(Events.PossibleButtonInteraction, interaction);
    } else if (interaction.isAnySelectMenu()) {
        client.emit(Events.PossibleSelectMenuInteraction, interaction);
    } else if (interaction.isModalSubmit()) {
        client.emit(Events.PossibleModalSubmitInteraction, interaction);
    } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        logger.warn(`[PeridotJS] Unhandled interaction type: ${(interaction as any).constructor.name}`);
    }
}
