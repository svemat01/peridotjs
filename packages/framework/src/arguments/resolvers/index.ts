import type { ArgType } from '../Parser.js';
import type { IArgument } from '../types.js';
import { CoreBoolean } from './CoreBoolean.js';
import { CoreChannel } from './CoreChannel.js';
import { CoreDate } from './CoreDate.js';
import { CoreDMChannel } from './CoreDMChannel.js';
import { CoreEmoji } from './CoreEmoji.js';
import { CoreEnum } from './CoreEnum.js';
import { CoreFloat } from './CoreFloat.js';
import { CoreGuildCategoryChannel } from './CoreGuildCategoryChannel.js';
import { CoreGuildChannel } from './CoreGuildChannel.js';
import { CoreGuildNewsChannel } from './CoreGuildNewsChannel.js';
import { CoreGuildNewsThreadChannel } from './CoreGuildNewsThreadChannel.js';
import { CoreGuildPrivateThreadChannel } from './CoreGuildPrivateThreadChannel.js';
import { CoreGuildPublicThreadChannel } from './CoreGuildPublicThreadChannel.js';
import { CoreGuildStageVoiceChannel } from './CoreGuildStageVoiceChannel.js';
import { CoreGuildTextChannel } from './CoreGuildTextChannel.js';
import { CoreGuildThreadChannel } from './CoreGuildThreadChannel.js';
import { CoreGuildVoiceChannel } from './CoreGuildVoiceChannel.js';
import { CoreHyperlink } from './CoreHyperlink.js';
import { CoreInteger } from './CoreInteger.js';
import { CoreMember } from './CoreMember.js';
import { CoreMessage } from './CoreMessage.js';
import { CoreNumber } from './CoreNumber.js';
import { CoreRole } from './CoreRole.js';
import { CoreString } from './CoreString.js';
import { CoreUser } from './CoreUser.js';

export const argumentResolvers: Record<keyof ArgType, IArgument<unknown>> = {
    boolean: new CoreBoolean(),
    channel: new CoreChannel(),
    date: new CoreDate(),
    dmChannel: new CoreDMChannel(),
    emoji: new CoreEmoji(),
    float: new CoreFloat(),
    guildCategoryChannel: new CoreGuildCategoryChannel(),
    guildChannel: new CoreGuildChannel(),
    guildNewsChannel: new CoreGuildNewsChannel(),
    guildNewsThreadChannel: new CoreGuildNewsThreadChannel(),
    guildPrivateThreadChannel: new CoreGuildPrivateThreadChannel(),
    guildPublicThreadChannel: new CoreGuildPublicThreadChannel(),
    guildStageVoiceChannel: new CoreGuildStageVoiceChannel(),
    guildTextChannel: new CoreGuildTextChannel(),
    guildThreadChannel: new CoreGuildThreadChannel(),
    guildVoiceChannel: new CoreGuildVoiceChannel(),
    hyperlink: new CoreHyperlink(),
    integer: new CoreInteger(),
    member: new CoreMember(),
    message: new CoreMessage(),
    number: new CoreNumber(),
    role: new CoreRole(),
    string: new CoreString(),
    url: new CoreHyperlink(),
    user: new CoreUser(),
    enum: new CoreEnum(),
};
