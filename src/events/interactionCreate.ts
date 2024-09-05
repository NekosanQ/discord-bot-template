import { Events, Interaction } from 'discord.js';
import { logger } from '../utils/log';

/**
 * インタラクション処理
 */
export = {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction): Promise<void> {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`失敗: コマンド ${interaction.commandName} が見つかりませんでした。`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            logger.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: "失敗: コマンドの実行中にエラーが発生しました", ephemeral: true });
            } else {
                await interaction.reply({ content: "失敗: コマンドの実行中にエラーが発生しました", ephemeral: true });
            }
        }
    }
};
