import { REST, Routes } from 'discord.js';
import dotenv from "dotenv"
import { config } from "./utils/config";
import fs from 'node:fs';
import path from 'node:path';
import { Command } from './types/client';
import { logger } from './utils/log';

/**
 * .envファイルを読み込む
 */
dotenv.config();

/**
 * コマンドをデプロイ
 */
(async () => {
	const commands: string[] = [];
	const foldersPath: string = path.join(__dirname, 'commands');
	const commandFolders: string[] = fs.readdirSync(foldersPath);

	for (const folder of commandFolders) {
		const commandsPath: string = path.join(foldersPath, folder);
		const commandFiles: string[] = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
		for (const file of commandFiles) {
			const filePath: string = path.join(commandsPath, file);
			const command = await (import(filePath));
			if ('data' in command && 'execute' in command) {
				commands.push(command.data.toJSON());
			} else {
				logger.info(`[WARNING] ${filePath}のコマンドには、必須の "data "または "execute "プロパティがありません。`);
			}
		}
	}

	const rest = new REST().setToken(process.env.DISCORD_TOKEN || "");

	try {
		logger.info(`${commands.length}アプリケーション（/）コマンドのリフレッシュを開始`);

		const data = (await rest.put(
			Routes.applicationGuildCommands(config.clientId, config.generalGuildId),
			{ body: commands },
		)) as Command[];

		logger.info(`${data.length}アプリケーション（/）コマンドのリロードに成功`);
	} catch (error) {
		logger.error(error);
	}
})();