import { Client, Collection, CommandInteraction, GuildMember, Interaction, Message, VoiceState } from 'discord.js';
import { Command } from './commands/types/Command';

interface Command {
    id: string;
    application_id: string;
    version: string;
    default_member_permissions: string | null;
    type: number;
    name: string;
    name_localizations: any | null;
    description: string;
    description_localizations: any | null;
    guild_id: string;
    nsfw: boolean;
  }

interface CustomCommand {
    default: {
        data: {
            name: string;
            toJSON(): string;
        };
        execute(interaction: CommandInteraction): void;
    };
}

declare module 'discord.js' {
    interface Client {
        commands: Collection<string, CustomCommand>;
    }
}