import { CommandInteraction, EmbedBuilder, SlashCommandBuilder, Message } from "discord.js";
import { config } from "../../utils/config";

export = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("pingを表示"),
    async execute(interaction: CommandInteraction) {
        const initialEmbed = createPingEmbed("Pingを測定中", "測定中...", interaction);

        await interaction.reply({
            embeds: [initialEmbed],
            allowedMentions: { repliedUser: false }
        });

        const message = await interaction.fetchReply() as Message;

        const finalEmbed = createPingEmbed("Pingを測定しました", null, interaction)
            .setFields(
                { name: "WebSocket Ping", value: `${interaction.client.ws.ping}ms` },
                { name: "APIレイテンシ", value: `${message.createdTimestamp - interaction.createdTimestamp}ms` }
            );

        await interaction.editReply({
            embeds: [finalEmbed]
        });
    }
};

/**
 * 埋め込みメッセージを生成する関数
 * @returns 埋め込みメッセージ
 */
function createPingEmbed(title: string, description: string | null, interaction: CommandInteraction): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(Number(config.botColor))
        .setTimestamp()
        .setFooter({ text: "コマンド送信日時", iconURL: interaction.user.avatarURL() || undefined });
}
