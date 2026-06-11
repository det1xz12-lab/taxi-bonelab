const axios = require("axios");
require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    Events,
    REST,
    Routes,
    SlashCommandBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

client.once(Events.ClientReady, async () => {

    console.log(`✅ Бот запущен как ${client.user.tag}`);

    const commands = [
        new SlashCommandBuilder()
            .setName("такси")
            .setDescription("Вызвать RP такси")
            .toJSON()
    ];

    const rest = new REST({
        version: "10"
    }).setToken(process.env.TOKEN);

    try {

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            {
                body: commands
            }
        );

        console.log(
            "✅ Команда /такси зарегистрирована"
        );

    } catch (err) {

        console.error(err);

    }

});

client.on(
    Events.InteractionCreate,
    async interaction => {

        if (
            interaction.isChatInputCommand() &&
            interaction.commandName === "такси"
        ) {

            const modal =
                new ModalBuilder()
                    .setCustomId("taxi_modal")
                    .setTitle("🚕 Вызов такси");

            const nickname =
                new TextInputBuilder()
                    .setCustomId("nickname")
                    .setLabel("Ваш ник в Bonelab")
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            const from =
                new TextInputBuilder()
                    .setCustomId("from")
                    .setLabel("Откуда забрать?")
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            const to =
                new TextInputBuilder()
                    .setCustomId("to")
                    .setLabel("Куда отвезти?")
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            const comment =
                new TextInputBuilder()
                    .setCustomId("comment")
                    .setLabel("Комментарий")
                    .setStyle(
                        TextInputStyle.Paragraph
                    )
                    .setRequired(false);

            modal.addComponents(
                new ActionRowBuilder()
                    .addComponents(
                        nickname
                    ),

                new ActionRowBuilder()
                    .addComponents(
                        from
                    ),

                new ActionRowBuilder()
                    .addComponents(
                        to
                    ),

                new ActionRowBuilder()
                    .addComponents(
                        comment
                    )
            );

            await interaction.showModal(
                modal
            );

            return;
        }

        if (
            interaction.isModalSubmit() &&
            interaction.customId ===
                "taxi_modal"
        ) {

            const nickname =
                interaction.fields.getTextInputValue(
                    "nickname"
                );

            const from =
                interaction.fields.getTextInputValue(
                    "from"
                );

            const to =
                interaction.fields.getTextInputValue(
                    "to"
                );

            const comment =
                interaction.fields.getTextInputValue(
                    "comment"
                );

            try {

                await axios.post(
                    "http://localhost:3000/new-order",
                    {
                        player:
                            nickname,

                        discord:
                            interaction.user.username,

                        from,
                        to,
                        comment
                    }
                );

                await interaction.reply({
                    content:
`✅ Заказ отправлен

👤 Ник: ${nickname}
📍 Откуда: ${from}
🎯 Куда: ${to}`,
                    ephemeral: true
                });

            } catch (err) {

                console.error(err);

                await interaction.reply({
                    content:
                        "❌ Ошибка отправки заказа",
                    ephemeral: true
                });

            }

        }

    }
);

client.login(
    process.env.TOKEN
);