import { Events, Client } from "discord.js";
import { logger } from "../utils/log";
/**
 * 起動した時の処理
 */
export = {
	name: Events.ClientReady,
	once: false,
	async execute(client: Client) {
		setInterval(() => {
			client.user?.setActivity({
				name: `${client.ws.ping}ms`
			});
		  }, 10000);
		logger.info(`[INFO] 起動完了: ${client.user?.tag}`);
	}
};