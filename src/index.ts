import { Client, ClientEvents, Collection, GatewayIntentBits, Partials } from "discord.js"
import dotenv from "dotenv"
import fs from "node:fs"
import path from "node:path"
import { CustomCommand, Event } from "./types/client"

/**
 * .envファイルを読み込む
 */
dotenv.config()

/**
 * Discord Client
 */
export const client: Client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildVoiceStates
    ],
    partials: [
        Partials.Message, 
        Partials.Channel
    ]
});
/**
 * コマンドを格納するためのコレクションを初期化
 */
client.commands = new Collection();

(async (): Promise<void> => {
	/**
	 * コマンドハンドラー
	 */
	const foldersPath: string = path.join(__dirname, 'commands');
	const commandFolders: string[] = fs.readdirSync(foldersPath);

	for (const folder of commandFolders) {
		const commandsPath: string = path.join(foldersPath, folder);
		const commandFiles: string[] = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
		for (const file of commandFiles) {
			const filePath: string = path.join(commandsPath, file);
			const command: CustomCommand = await import(filePath) as CustomCommand;
			if ('data' in command && 'execute' in command) {
				client.commands.set(command.data.name, command);
			} else {
				console.log(`[WARNING] ${filePath}のコマンドには、必須の "data "または "execute "プロパティがありません。`);
			}
		}
	}
	/**
	 * イベントハンドラー
	 */
	const eventsPath: string = path.join(__dirname, 'events');
	const eventFiles: string[] = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

	for (const file of eventFiles) {
		const filePath: string = path.join(eventsPath, file);
		const event: Event<keyof ClientEvents> = await import(filePath);
		if (event.once) {
			client.once(event.name as keyof ClientEvents, (...args) => event.execute(...args));
		} else {
			client.on(event.name as keyof ClientEvents, (...args) => event.execute(...args));
		}
	}
})();

client.login(process.env.DISCORD_TOKEN);