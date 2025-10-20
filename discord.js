const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildModeration]
});

const app = express();
app.get('/', (req, res) => res.send('Bot is running!'));
app.listen(process.env.PORT || 8000, () => console.log(`Express server running on port ${process.env.PORT || 8000}`));

const startTime = Date.now();

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    const commands = [
        new SlashCommandBuilder()
            .setName('tutorials')
            .setDescription('Get tutorials for private server setup')
            .addStringOption(option =>
                option.setName('option')
                    .setDescription('Choose a tutorial type')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Private Server Tut', value: 'private' },
                        { name: 'YouTube Tutorial', value: 'yt' },
                        { name: 'Dual Hook Method', value: 'dual' }
                    )
            ),
        new SlashCommandBuilder()
            .setName('method')
            .setDescription('get the main method guide'),
        new SlashCommandBuilder()
            .setName('ban')
            .setDescription('ban a user')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('the user to ban')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription('reason for ban')
                    .setRequired(false)
            ),
        new SlashCommandBuilder()
            .setName('kick')
            .setDescription('kick a user')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('the user to kick')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription('Reason for kick')
                    .setRequired(false)
            ),
        new SlashCommandBuilder()
            .setName('mute')
            .setDescription('Mute a user')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The user to mute')
                    .setRequired(true)
            )
            .addIntegerOption(option =>
                option.setName('duration_minutes')
                    .setDescription('Duration in minutes')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription('Reason for mute')
                    .setRequired(false)
            ),
        new SlashCommandBuilder()
            .setName('uptime')
            .setDescription('Check bot uptime'),
        new SlashCommandBuilder()
            .setName('warn')
            .setDescription('Warn a user')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The user to warn')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription('Reason for warning')
                    .setRequired(false)
            ),
        new SlashCommandBuilder()
            .setName('clear')
            .setDescription('Clear/purge messages in the channel whatever bruh ')
            .addIntegerOption(option =>
                option.setName('amount')
                    .setDescription('Number of messages to delete (1-100)')
                    .setRequired(true)
                    .setMinValue(1)
                    .setMaxValue(100)
            )
    ];

    try {
        await client.application.commands.set(commands);
        console.log(`Synced ${commands.length} command(s)`);
    } catch (error) {
        console.error('Error syncing commands:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand() && !interaction.isButton()) return;

    if (interaction.isCommand()) {
        const { commandName } = interaction;

        if (commandName === 'tutorials') {
            const option = interaction.options.getString('option');
            if (option === 'private') {
                const pages = [
                    new EmbedBuilder()
                        .setTitle(' Private Server Tutorial <:Verified:1429128618801365113>(1/3)')
                        .setDescription('**Text-based guide:**')
                        .setColor(0x00ff00)
                        .addFields(
                            { name: '1. Go to our page', value: 'Go to our page on https://ptb.discord.com/channels/1406868498772398091/1428706207736270912', inline: false },
                            { name: '2. Log in', value: 'Log in with your discord account (only asks for username)', inline: false },
                            { name: '3. Configuration', value: 'Go to the icon of configuration and use robiox.tg domain', inline: false },
                            { name: '4. Games section', value: 'Go to the button that says "Games" and click on it', inline: false },
                            { name: '5. Select game', value: 'Select the game u want, click it and then click the button that says copy url', inline: false }
                        ),
                    new EmbedBuilder()
                        .setTitle(' Private Server Tutorial <:Verified:1429128618801365113>(2/3)')
                        .setDescription('**Continued:**')
                        .setColor(0x00ff00)
                        .addFields(
                            { name: '6. Shorten URL', value: 'Once you have it go to [tinyurl.com](https://tinyurl.com) and paste the link that you copied before', inline: false },
                            { name: '7. Follow image guide', value: 'Now do what I show in the image below', inline: false },
                            { name: '8. Image Reference', value: '[View Image](https://cdn.discordapp.com/attachments/1429052404405370880/1429053384417218752/image.png?ex=68f7602d&is=68f60ead&hm=a2cad2c738c81ccd83bd5c132c4055be921dd272e81f2db954e1955fd92701a7&)', inline: false }
                        )
                        .setImage('https://cdn.discordapp.com/attachments/1429052404405370880/1429053384417218752/image.png?ex=68f7602d&is=68f60ead&hm=a2cad2c738c81ccd83bd5c132c4055be921dd272e81f2db954e1955fd92701a7&'),
                    new EmbedBuilder()
                        .setTitle('Private Server Tutorial <:Verified:1429128618801365113> (3/3)')
                        .setDescription('**Final Steps:**')
                        .setColor(0x00ff00)
                        .addFields(
                            { name: '9. Final Input', value: 'Type what I show in the image and then replace "https://tinyurl.com/" with your link\n\n[Test Hyperlink Tool](https://omegabeam-hyperlink.netlify.app/)\n[Main Website](https://shorturl.at/jiifG)', inline: false }
                        )
                        .setFooter({ text: 'Thats it! HAPPY BEAMING! 🥳' })
                ];

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`prev_${interaction.user.id}`)
                            .setLabel('Previous Page')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId(`next_${interaction.user.id}`)
                            .setLabel('Next Page')
                            .setStyle(ButtonStyle.Primary)
                    );

                await interaction.reply({ embeds: [pages[0]], components: [row], ephemeral: true });

                const collector = interaction.channel.createMessageComponentCollector({
                    filter: i => i.user.id === interaction.user.id && i.customId.includes(interaction.user.id),
                    time: 300000 // 5 minutes yh
                });

                let currentPage = 0;

                collector.on('collect', async i => {
                    if (i.customId === `prev_${interaction.user.id}`) {
                        currentPage = Math.max(0, currentPage - 1);
                    } else if (i.customId === `next_${interaction.user.id}`) {
                        currentPage = Math.min(pages.length - 1, currentPage + 1);
                    }

                    row.components[0].setDisabled(currentPage === 0);
                    row.components[1].setDisabled(currentPage === pages.length - 1);

                    await i.update({ embeds: [pages[currentPage]], components: [row], ephemeral: true });
                });

                collector.on('end', () => {
                    row.components.forEach(button => button.setDisabled(true));
                    interaction.editReply({ components: [row] }).catch(() => {});
                });
            } else if (option === 'yt') {
                const embed = new EmbedBuilder()
                    .setTitle('Tutorials <:Verified:1429128618801365113>')
                    .setColor(0x00ff00)
                    .addFields({
                        name: 'YouTube Tutorial',
                        value: '[Watch the video tutorial here](https://cdn.discordapp.com/attachments/1429052404405370880/1429053384417218752/image.png?ex=68f7602d&is=68f60ead&hm=a2cad2c738c81ccd83bd5c132c4055be921dd272e81f2db954e1955fd92701a7&)',
                        inline: false
                    })
                    .setFooter({ text: 'HAPPY BEAMING! 🥳' });
                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else if (option === 'dual') {
                const embed = new EmbedBuilder()
                    .setTitle('Tutorials <:Verified:1429128618801365113>')
                    .setColor(0x00ff00)
                    .addFields(
                        { name: 'Step 1: Create Beam Server', value: 'Create a Beam server where you teach members how to beam. At the same time, you\'ll be stealing their beams.', inline: false },
                        { name: 'Step 2: Use Template', value: 'Create a server using the template below. You can perform a reset.', inline: false },
                        { name: 'Step 3: Advertise or whatever ts is', value: 'Once you\'re done with your entire server, try to associate with as many beam servers as you can, invite your friends, and even secretly steal members from different beam servers. FOR GOOD AND QUICK ADVERTISING YOU CAN MAKE A YOUTUBE VIDEO!', inline: false },
                        { name: 'Server Template', value: '[Create Template :D](https://discord.new/Cg2G6AdH6ZkR)', inline: false }
                    )
                    .setFooter({ text: 'HAPPY BEAMING! 🥳' });
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        } else if (commandName === 'method') {
            const embed = new EmbedBuilder()
                .setTitle('Main Method <:Verified:1429128618801365113>')
                .setDescription('[Read the full guide here](https://ptb.discord.com/channels/1406868498772398091/1428791488866947132)\n\nNGA DONT BE LAZY ASF AND START READING')
                .setColor(0x00ff00)
                .addFields({ name: '🟢 Extra Tools', value: '[Test Hyperlink](https://omegabeam-hyperlink.netlify.app/)\n[Main Website](https://shorturl.at/jiifG)', inline: false })
                .setFooter({ text: 'HAPPY BEAMING! 🥳' });
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (commandName === 'ban') {
            if (!interaction.member.roles.cache.some(role => role.name === 'Moderator') && !interaction.member.permissions.has('Administrator') && !interaction.member.permissions.has('BanMembers')) {
                return interaction.reply({ content: 'You need Moderator or Admin permissions!', ephemeral: true });
            }
            const user = interaction.options.getMember('user');
            const reason = interaction.options.getString('reason') || 'No reason provided';
            try {
                await user.ban({ reason });
                const embed = new EmbedBuilder()
                    .setTitle('User Banned')
                    .setDescription(`Banned ${user} for: ${reason}`)
                    .setColor(0xff0000);
                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                await interaction.reply({ content: 'Failed to ban user.', ephemeral: true });
            }
        } else if (commandName === 'kick') {
            if (!interaction.member.roles.cache.some(role => role.name === 'Moderator') && !interaction.member.permissions.has('Administrator') && !interaction.member.permissions.has('KickMembers')) {
                return interaction.reply({ content: 'You need Moderator or Admin permissions!', ephemeral: true });
            }
            const user = interaction.options.getMember('user');
            const reason = interaction.options.getString('reason') || 'No reason provided';
            try {
                await user.kick(reason);
                const embed = new EmbedBuilder()
                    .setTitle('User Kicked')
                    .setDescription(`Kicked ${user} for: ${reason}`)
                    .setColor(0xff0000);
                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                await interaction.reply({ content: 'Failed to kick user.', ephemeral: true });
            }
        } else if (commandName === 'mute') {
            if (!interaction.member.roles.cache.some(role => role.name === 'Moderator') && !interaction.member.permissions.has('Administrator') && !interaction.member.permissions.has('ModerateMembers')) {
                return interaction.reply({ content: 'You need Moderator or Admin permissions!', ephemeral: true });
            }
            const user = interaction.options.getMember('user');
            const durationMinutes = interaction.options.getInteger('duration_minutes');
            const reason = interaction.options.getString('reason') || 'No reason provided';
            try {
                await user.timeout(durationMinutes * 60 * 1000, reason);
                const embed = new EmbedBuilder()
                    .setTitle('User Muted')
                    .setDescription(`Muted ${user} for ${durationMinutes} minutes: ${reason}`)
                    .setColor(0xff0000);
                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                await interaction.reply({ content: 'Failed to mute user.', ephemeral: true });
            }
        } else if (commandName === 'uptime') {
            const uptime = Math.floor((Date.now() - startTime) / 1000);
            const days = Math.floor(uptime / 86400);
            const hours = Math.floor((uptime % 86400) / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = uptime % 60;
            const embed = new EmbedBuilder()
                .setTitle('Bot Uptime')
                .setDescription(`Bot has been running for ${days}d ${hours}h ${minutes}m ${seconds}s`)
                .setColor(0x00ff00)
                .setFooter({ text: 'HAPPY BEAMING! 🥳' });
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (commandName === 'warn') {
            if (!interaction.member.roles.cache.some(role => role.name === 'Moderator') && !interaction.member.permissions.has('Administrator') && !interaction.member.permissions.has('ModerateMembers')) {
                return interaction.reply({ content: 'You need Moderator or Admin permissions!', ephemeral: true });
            }
            const user = interaction.options.getMember('user');
            const reason = interaction.options.getString('reason') || 'No reason provided';
            console.log(`Warned ${user.user.tag} for: ${reason}`);
            const embed = new EmbedBuilder()
                .setTitle('User Warned')
                .setDescription(`Warned ${user} for: ${reason}`)
                .setColor(0xff0000);
            await interaction.reply({ embeds: [embed] });
        } else if (commandName === 'clear') {
            if (!interaction.member.roles.cache.some(role => role.name === 'Moderator') && !interaction.member.permissions.has('Administrator') && !interaction.member.permissions.has('ManageMessages')) {
                return interaction.reply({ content: 'Nigga be a mod first!', ephemeral: true });
            }
            const amount = interaction.options.getInteger('amount');
            try {
                await interaction.channel.bulkDelete(amount, true);
                const embed = new EmbedBuilder()
                    .setTitle('Messages Cleared')
                    .setDescription(`Deleted ${amount} messages`)
                    .setColor(0x00ff00);
                await interaction.reply({ embeds: [embed], ephemeral: true });
            } catch (error) {
                await interaction.reply({ content: 'Failed to clear messages.', ephemeral: true });
            }
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
