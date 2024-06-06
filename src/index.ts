// 必要なパッケージをインポートする
import { Client, Collection, Events, GatewayIntentBits, Interaction, Partials, REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { Command, CustomCommand } from './types/client';
import { config } from './utils/config';
import { logger } from './utils/log';

// .envファイルを読み込む
dotenv.config()

/**
 * Discord Client
 */
export const client: Client = new Client({
	// Botで使うGetwayIntents、partials
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
const commands: string[] = [];

export class Bot {
    public readonly prefix = '/';
  
    public constructor(public readonly client: Client) {
        this.client.login(process.env.DISCORD_TOKEN);
    
        this.client.on('ready', () => {
            logger.info(`${this.client.user!.username} ready!`);
    
            this.registerSlashCommands();
        });
    
        this.client.on('warn', (info) => logger.info(info));
        this.client.on('error', logger.error);
    
        this.onInteractionCreate();
    }
    /**
     * スラッシュコマンドの登録
     */
    private async registerSlashCommands() {
        if (process.env.DISCORD_TOKEN) {
            const foldersPath: string = path.join(__dirname, 'commands');
            const commandFolders: string[] = fs.readdirSync(foldersPath);
            for (const folder of commandFolders) {
                const commandsPath: string = path.join(foldersPath, folder);
                const commandFiles: string[] = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
                for (const file of commandFiles) {
                    const filePath: string = path.join(commandsPath, file);
                    const command: CustomCommand = await import(filePath);
                    if ('data' in command.default && 'execute' in command.default) {
                        client.commands.set(command.default.data.name, command);
                        commands.push(command.default.data.toJSON());
                    } else {
                        logger.warn(`${filePath}のコマンドには、必須の "data "または "execute "プロパティがありません。`);
                    }
                }
            }
    
            // RESTモジュールのインスタンスを構築
            const rest = new REST().setToken(process.env.DISCORD_TOKEN || '');

            /**
             * コマンドをデプロイ
             */
            (async () => {
                try {
                    logger.info(`${commands.length}アプリケーション（/）コマンドのリフレッシュを開始`);

                     // サーバー内のコマンドを更新する
                    const data: Command[] = (await rest.put(
                        Routes.applicationGuildCommands(config.clientId, config.generalGuildId),
                        { body: commands },
                    ) as Command[]);
                    
                    logger.info(`${data.length}アプリケーション（/）コマンドのリロードに成功`);
                } catch (error) {
                    logger.error(error);
                }
            })();
        }
    }
    /**
     * インタラクションイベント
     */
    private async onInteractionCreate() {
        this.client.on(Events.InteractionCreate, async (interaction: Interaction): Promise<void> => {
            if (!interaction.isChatInputCommand()) return;
        
            const command = client.commands.get(interaction.commandName);
        
            if (!command) return;
            
            try {
                command.default.execute(interaction);
            } catch (error) {
                logger.error(error);
            }
        });
    }
}

new Bot(client);