import { CommandInteraction, EmbedBuilder, SlashCommandBuilder, Message } from "discord.js";
import { config } from "../../utils/config";

export default {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("pingを表示"),
    async execute(interaction: CommandInteraction) {
        const pingEmbed: EmbedBuilder = new EmbedBuilder()
            .setTitle("Pingを測定中")
            .setDescription("測定中...")
            .setColor(Number(config.botColor))
            .setTimestamp()
            .setFooter({ text: "コマンド送信日時", iconURL: interaction.user.avatarURL() || undefined })
            
        await interaction.reply({
            embeds: [pingEmbed],
            allowedMentions: { repliedUser: false }
        });

        const message: Message<boolean> = await interaction.fetchReply();
        
        await interaction.editReply({
            embeds: [pingEmbed.setTitle("Pingを測定しました").setDescription(null).setFields(
                { name: "WebSocket Ping", value: `${interaction.client.ws.ping}ms` },
                { name: "APIレイテンシ", value: `${message.createdTimestamp - interaction.createdTimestamp}ms` }
            )]
        });
    }
};