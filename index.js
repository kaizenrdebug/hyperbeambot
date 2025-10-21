const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, AttachmentBuilder, ChannelType, Routes, REST, Colors } = require('discord.js');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildModeration, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const app = express();
app.get('/', (req, res) => res.send('Bot is running!'));
app.listen(process.env.PORT || 8000, () => console.log(`Express server running on port ${process.env.PORT || 8000}`));

const startTime = Date.now();

const DATA_DIR = path.resolve(__dirname, 'data');
const CENSORED_WORDS_FILE = path.join(DATA_DIR, 'censoredWords.json');
const PREFIXES_FILE = path.join(DATA_DIR, 'prefixes.json');

let censoredWordsStore = {};
let prefixesStore = {};

async function initStorage() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        try {
            censoredWordsStore = JSON.parse(await fs.readFile(CENSORED_WORDS_FILE, 'utf8') || '{}');
        } catch (e) {
            console.error('Failed to load censoredWords.json:', e);
            censoredWordsStore = {};
        }
        try {
            prefixesStore = JSON.parse(await fs.readFile(PREFIXES_FILE, 'utf8') || '{}');
        } catch (e) {
            console.error('Failed to load prefixes.json:', e);
            prefixesStore = {};
        }
    } catch (e) {
        console.error('Failed to initialize storage:', e);
    }
}

async function saveCensoredWords() {
    try {
        await fs.writeFile(CENSORED_WORDS_FILE, JSON.stringify(censoredWordsStore, null, 2));
    } catch (e) {
        console.error('Failed to save censoredWords.json:', e);
    }
}

async function savePrefixes() {
    try {
        await fs.writeFile(PREFIXES_FILE, JSON.stringify(prefixesStore, null, 2));
    } catch (e) {
        console.error('Failed to save prefixes.json:', e);
    }
}

const commandHelp = [
    { name: '/tutorials', description: 'Get tutorials on how to beam', usage: 'Use `/tutorials <option: private|yt|dual>` to get beaming tutorials.' },
    { name: '/method', description: 'Get the main method guide', usage: 'Use `/method` to get the main beaming guide.' },
    { name: '/ban', description: 'Ban a user', usage: 'Use `/ban <user> [reason]` to ban a user. Requires Moderator role or Ban Members permission.' },
    { name: '/kick', description: 'Kick a user', usage: 'Use `/kick <user> [reason]` to kick a user. Requires Moderator role or Kick Members permission.' },
    { name: '/mute', description: 'Mute a user', usage: 'Use `/mute <user> <duration_minutes> [reason]` to mute a user. Requires Moderator role or Moderate Members permission.' },
    { name: '/uptime', description: 'Check bot uptime', usage: 'Use `/uptime` to see how long the bot has been running.' },
    { name: '/warn', description: 'Warn a user', usage: 'Use `/warn <user> [reason]` to warn a user. Requires Moderator role or Moderate Members permission.' },
    { name: '/clear', description: 'Clear messages', usage: 'Use `/clear <amount: 1-100>` to delete messages. Requires Moderator role or Manage Messages permission.' },
    { name: '/ping', description: 'Check if bot is alive', usage: 'Use `/ping` to check bot responsiveness.' },
    { name: '/help', description: 'List all commands', usage: 'Use `/help` to see all available commands.' },
    { name: '/invite', description: 'Get bot invite link', usage: 'Use `/invite` to get a link to add the bot to your server.' },
    { name: '/getserver info', description: 'Get server info', usage: 'Use `/getserver info` to see server details like member count.' },
    { name: '/getserver icon', description: 'Get server icon', usage: 'Use `/getserver icon` to get the server’s icon.' },
    { name: '/warnings', description: 'View user warnings', usage: 'Use `/warnings <user>` to see a user’s warnings. Requires Moderator role or Moderate Members permission.' },
    { name: '/clearwarnings', description: 'Clear user warnings', usage: 'Use `/clearwarnings <user>` to clear a user’s warnings. Requires Moderator role or Moderate Members permission.' },
    { name: '/unmute', description: 'Unmute a user', usage: 'Use `/unmute <user>` to unmute a user. Requires Moderator role or Moderate Members permission.' },
    { name: '/cw', description: 'Add censored word', usage: 'Use `/cw <word>` to add a censored word. Requires Moderator role or Manage Guild permission.' },
    { name: '/ucw', description: 'Remove censored word', usage: 'Use `/ucw <word>` to remove a censored word. Requires Moderator role or Manage Guild permission.' },
    { name: '/cwl', description: 'List censored words', usage: 'Use `/cwl` to list all censored words. Requires Moderator role or Manage Guild permission.' },
    { name: '/prefix add', description: 'Add a prefix', usage: 'Use `/prefix add <prefix>` to add a command prefix. Requires Moderator role or Manage Guild permission.' },
    { name: '/prefix remove', description: 'Remove a prefix', usage: 'Use `/prefix remove <prefix>` to remove a prefix. Requires Moderator role or Manage Guild permission.' },
    { name: '/prefix list', description: 'List prefixes', usage: 'Use `/prefix list` to see all prefixes.' },
    { name: '/prefix clear', description: 'Clear all prefixes', usage: 'Use `/prefix clear` to remove all prefixes. Requires Moderator role or Manage Guild permission.' },
    { name: '/usage', description: 'Detailed command usage', usage: 'Use `/usage [command]` for detailed command usage. Example: `/usage ping`.' },
    { name: '/lock', description: 'Lock a channel', usage: 'Use `/lock [channel]` to lock a channel. Defaults to current channel. Requires Moderator role or Manage Channels permission.' },
    { name: '/unlock', description: 'Unlock a channel', usage: 'Use `/unlock [channel]` to unlock a channel. Defaults to current channel. Requires Moderator role or Manage Channels permission.' },
    { name: '/dice', description: 'Roll a dice', usage: 'Use `/dice [sides]` to roll a die. Defaults to 6 sides. Example: `/dice 20`.' },
    { name: '/coin', description: 'Flip a coin', usage: 'Use `/coin` to flip a coin (Heads or Tails).' },
    { name: '/role', description: 'Assign a role', usage: 'Use `/role <user> <role>` to assign a role. Requires Moderator role or Manage Roles permission.' },
    { name: '/audit', description: 'View audit logs', usage: 'Use `/audit [limit]` to view recent audit logs. Defaults to 10 entries. Requires Moderator role or View Audit Log permission.' },
    { name: '/say', description: 'Bot says message', usage: 'Use `/say <message>` to make the bot send a message. Requires Moderator role or Manage Messages permission.' },
    { name: '/poll', description: 'Create a poll', usage: 'Use `/poll <question> <options>` to create a poll. Options are comma-separated. Example: `/poll Favorite color? Red,Blue,Green`.' },
];

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    await initStorage();

    const commands = [
        new SlashCommandBuilder()
            .setName('tutorials')
            .setDescription('Get tutorials on how to beam')
            .addStringOption(option =>
                option.setName('option')
                    .setDescription('Choose a tutorial type')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Private Server Tut', value: 'private' },
                        { name: 'YouTube Tut', value: 'yt' },
                        { name: 'Dual Hook Method', value: 'dual' }
                    )
            ),
        new SlashCommandBuilder()
            .setName('method')
            .setDescription('Get the main method guide'),
        new SlashCommandBuilder()
            .setName('ban')
            .setDescription('Ban a user')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The user to ban')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription('Reason for ban')
                    .setRequired(false)
            ),
        new SlashCommandBuilder()
            .setName('kick')
            .setDescription('Kick a user')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The user to kick')
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
            .setDescription('Clear/purge messages in the channel')
            .addIntegerOption(option =>
                option.setName('amount')
                    .setDescription('Number of messages to delete (1-100)')
                    .setRequired(true)
                    .setMinValue(1)
                    .setMaxValue(100)
            ),
        new SlashCommandBuilder()
            .setName('ping')
            .setDescription('Check if the bot is alive'),
        new SlashCommandBuilder()
            .setName('help')
            .setDescription('List all available commands'),
        new SlashCommandBuilder()
            .setName('invite')
            .setDescription('Get the bot invite link'),
        new SlashCommandBuilder()
            .setName('getserver')
            .setDescription('Get server information or icon')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('info')
                    .setDescription('Display server information')
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('icon')
                    .setDescription('Get the server icon')
            ),
        new SlashCommandBuilder()
            .setName('warnings')
            .setDescription('View warnings for a user')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The user to check warnings for')
                    .setRequired(true)
            ),
        new SlashCommandBuilder()
            .setName('clearwarnings')
            .setDescription('Clear all warnings for a user')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The user to clear warnings for')
                    .setRequired(true)
            ),
        new SlashCommandBuilder()
            .setName('unmute')
            .setDescription('Unmute a user')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The user to unmute')
                    .setRequired(true)
            ),
        new SlashCommandBuilder()
            .setName('cw')
            .setDescription('Add a censored word')
            .addStringOption(option =>
                option.setName('word')
                    .setDescription('The word to censor')
                    .setRequired(true)
            ),
        new SlashCommandBuilder()
            .setName('ucw')
            .setDescription('Remove a censored word')
            .addStringOption(option =>
                option.setName('word')
                    .setDescription('The word to uncensor')
                    .setRequired(true)
            ),
        new SlashCommandBuilder()
            .setName('cwl')
            .setDescription('List censored words'),
        new SlashCommandBuilder()
            .setName('prefix')
            .setDescription('Manage prefixes')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('add')
                    .setDescription('Add a prefix')
                    .addStringOption(option =>
                        option.setName('prefix')
                            .setDescription('The prefix to add')
                            .setRequired(true)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('remove')
                    .setDescription('Remove a prefix')
                    .addStringOption(option =>
                        option.setName('prefix')
                            .setDescription('The prefix to remove')
                            .setRequired(true)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('list')
                    .setDescription('List prefixes')
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('clear')
                    .setDescription('Clear all prefixes')
            ),
        new SlashCommandBuilder()
            .setName('usage')
            .setDescription('Detailed usage for commands')
            .addStringOption(option =>
                option.setName('command')
                    .setDescription('Specific command to get usage for')
                    .setRequired(false)
            ),
        new SlashCommandBuilder()
            .setName('lock')
            .setDescription('Lock a channel')
            .addChannelOption(option =>
                option.setName('channel')
                    .setDescription('The channel to lock')
                    .setRequired(false)
            ),
        new SlashCommandBuilder()
            .setName('unlock')
            .setDescription('Unlock a channel')
            .addChannelOption(option =>
                option.setName('channel')
                    .setDescription('The channel to unlock')
                    .setRequired(false)
            ),
        new SlashCommandBuilder()
            .setName('dice')
            .setDescription('Roll a dice')
            .addIntegerOption(option =>
                option.setName('sides')
                    .setDescription('Number of sides (default 6)')
                    .setRequired(false)
            ),
        new SlashCommandBuilder()
            .setName('coin')
            .setDescription('Flip a coin'),
        new SlashCommandBuilder()
            .setName('role')
            .setDescription('Assign a role to a user')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The user')
                    .setRequired(true)
            )
            .addRoleOption(option =>
                option.setName('role')
                    .setDescription('The role')
                    .setRequired(true)
            ),
        new SlashCommandBuilder()
            .setName('audit')
            .setDescription('View recent audit logs')
            .addIntegerOption(option =>
                option.setName('limit')
                    .setDescription('Number of entries (default 10)')
                    .setRequired(false)
            ),
        new SlashCommandBuilder()
            .setName('say')
            .setDescription('Make the bot say something')
            .addStringOption(option =>
                option.setName('message')
                    .setDescription('The message')
                    .setRequired(true)
            ),
        new SlashCommandBuilder()
            .setName('poll')
            .setDescription('Create a poll')
            .addStringOption(option =>
                option.setName('question')
                    .setDescription('The question')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('options')
                    .setDescription('Comma-separated options')
                    .setRequired(true)
            ),
    ];

    try {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands.map(command => command.toJSON()) });
        console.log(`Synced ${commands.length} command(s)`);
    } catch (error) {
        console.error('Error syncing commands:', error);
    }
});

const warnStore = {};

function addWarning(guildId, userId, reason, moderatorId) {
    if (!warnStore[guildId]) warnStore[guildId] = {};
    if (!warnStore[guildId][userId]) warnStore[guildId][userId] = [];
    const warning = {
        id: Date.now().toString(),
        reason,
        moderatorId,
        timestamp: Date.now()
    };
    warnStore[guildId][userId].push(warning);
    return warning;
}

function getWarnings(guildId, userId) {
    return warnStore[guildId]?.[userId] || [];
}

function clearWarnings(guildId, userId) {
    if (warnStore[guildId]?.[userId]) {
        delete warnStore[guildId][userId];
        return true;
    }
    return false;
}

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    const guildId = message.guild.id;
    const cfg = censoredWordsStore[guildId] || {};

    if (cfg.censoredWords && cfg.censoredWords.some(word => message.content.toLowerCase().includes(word.toLowerCase()))) {
        try {
            await message.delete();
            await message.author.send({
                embeds: [new EmbedBuilder()
                    .setTitle('Message Deleted')
                    .setDescription(`Your message in ${message.guild.name} was deleted due to containing a censored word.`)
                    .setColor(0xff0000)
                    .setFooter({ text: 'HAPPY BEAMING! 🥳' })]
            });
        } catch (e) {
            console.error(`Failed to delete censored message in guild ${guildId}:`, e);
        }
        return;
    }

    const prefixes = prefixesStore[guildId]?.prefixes || [];
    if (prefixes.length === 0) return;
    const prefix = prefixes.find(p => message.content.startsWith(p));
    if (!prefix) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const commandsMap = {
        ping: async () => await message.reply('Pong!'),
        help: async () => {
            const embed = new EmbedBuilder()
                .setTitle('Bot Commands')
                .setDescription('Available commands (use /usage for details):')
                .addFields(commandHelp.slice(0, 10).map(cmd => ({ name: cmd.name, value: cmd.description, inline: true })))
                .setColor(0x00ff00)
                .setFooter({ text: 'HAPPY BEAMING! 🥳' });
            await message.reply({ embeds: [embed] });
        },
        coin: async () => {
            const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
            await message.reply(`The coin landed on ${result}!`);
        },
        dice: async () => {
            const sides = parseInt(args[0]) || 6;
            if (isNaN(sides) || sides < 1) return await message.reply('Please provide a valid number of sides.');
            const roll = Math.floor(Math.random() * sides) + 1;
            await message.reply(`You rolled a ${roll}! (1-${sides})`);
        },
    };

    if (commandsMap[commandName]) {
        try {
            await commandsMap[commandName]();
        } catch (e) {
            console.error(`Prefix command error: ${commandName}`, e);
            await message.reply({ content: 'An error occurred. Try the slash command instead.', ephemeral: true });
        }
    } else {
        await message.reply({ content: `Unknown prefix command: ${commandName}. Use /help for commands.`, ephemeral: true });
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand() && !interaction.isButton()) return;

    if (interaction.isCommand()) {
        const { commandName } = interaction;

        if (['ban', 'kick', 'mute', 'warn', 'clear', 'warnings', 'clearwarnings', 'unmute', 'cw', 'ucw', 'cwl', 'prefix', 'lock', 'unlock', 'role', 'audit', 'say'].includes(commandName)) {
            if (!interaction.member.roles.cache.some(role => role.name === 'Moderator') &&
                !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) &&
                !interaction.member.permissions.has({
                    ban: PermissionsBitField.Flags.BanMembers,
                    kick: PermissionsBitField.Flags.KickMembers,
                    mute: PermissionsBitField.Flags.ModerateMembers,
                    warn: PermissionsBitField.Flags.ModerateMembers,
                    clear: PermissionsBitField.Flags.ManageMessages,
                    warnings: PermissionsBitField.Flags.ModerateMembers,
                    clearwarnings: PermissionsBitField.Flags.ModerateMembers,
                    unmute: PermissionsBitField.Flags.ModerateMembers,
                    cw: PermissionsBitField.Flags.ManageGuild,
                    ucw: PermissionsBitField.Flags.ManageGuild,
                    cwl: PermissionsBitField.Flags.ManageGuild,
                    prefix: PermissionsBitField.Flags.ManageGuild,
                    lock: PermissionsBitField.Flags.ManageChannels,
                    unlock: PermissionsBitField.Flags.ManageChannels,
                    role: PermissionsBitField.Flags.ManageRoles,
                    audit: PermissionsBitField.Flags.ViewAuditLog,
                    say: PermissionsBitField.Flags.ManageMessages
                }[commandName])) {
                return interaction.reply({ content: 'You need Moderator or Admin permissions!', ephemeral: true });
            }
        }

        if (commandName === 'tutorials') {
            const option = interaction.options.getString('option');
            if (option === 'private') {
                const pages = [
                    new EmbedBuilder()
                        .setTitle('Private Server Tutorial <:Verified:1429128618801365113> (1/3)')
                        .setDescription('**Text-based guide:**')
                        .setColor(0x00ff00)
                        .addFields(
                            { name: '1. Go to our page', value: 'Go to our page on https://ptb.discord.com/channels/1406868498772398091/1428706207736270912', inline: false },
                            { name: '2. Log in', value: 'Log in with your Discord account (only asks for username)', inline: false },
                            { name: '3. Configuration', value: 'Go to the icon of configuration and use robiox.tg domain', inline: false },
                            { name: '4. Games section', value: 'Go to the button that says "Games" and click it', inline: false },
                            { name: '5. Select game', value: 'Select the game you want, click it and then click the button that says copy url', inline: false }
                        )
                        .setFooter({ text: 'HAPPY BEAMING! 🥳' }),
                    new EmbedBuilder()
                        .setTitle('Private Server Tutorial <:Verified:1429128618801365113> (2/3)')
                        .setDescription('**Continued:**')
                        .setColor(0x00ff00)
                        .addFields(
                            { name: '6. Shorten URL', value: 'Once you have it go to [tinyurl.com](https://tinyurl.com) and paste the link that you copied before', inline: false },
                            { name: '7. Follow image guide', value: 'Now do what I show in the image below', inline: false },
                            { name: '8. Image Reference', value: '[View Image](https://cdn.discordapp.com/attachments/1429052404405370880/1429053384417218752/image.png?ex=68f7602d&is=68f60ead&hm=a2cad2c738c81ccd83bd5c132c4055be921dd272e81f2db954e1955fd92701a7&)', inline: false }
                        )
                        .setImage('https://cdn.discordapp.com/attachments/1429052404405370880/1429053384417218752/image.png?ex=68f7602d&is=68f60ead&hm=a2cad2c738c81ccd83bd5c132c4055be921dd272e81f2db954e1955fd92701a7&')
                        .setFooter({ text: 'HAPPY BEAMING! 🥳' }),
                    new EmbedBuilder()
                        .setTitle('Private Server Tutorial <:Verified:1429128618801365113> (3/3)')
                        .setDescription('**Final Steps:**')
                        .setColor(0x00ff00)
                        .addFields(
                            { name: '9. Final Input', value: 'Type what I show in the image and then replace "https://tinyurl.com/" with your link\n\n[Test Hyperlink Tool](https://omegabeam-hyperlink.netlify.app/)\n[Main Website](https://shorturl.at/jiifG)', inline: false }
                        )
                        .setFooter({ text: 'That\'s it! HAPPY BEAMING! 🥳' })
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
                    time: 300000
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
            const user = interaction.options.getMember('user');
            const reason = interaction.options.getString('reason') || 'No reason provided';
            try {
                await user.ban({ reason });
                const embed = new EmbedBuilder()
                    .setTitle('User Banned')
                    .setDescription(`Banned ${user} for: ${reason}`)
                    .setColor(0xff0000)
                    .setFooter({ text: 'HAPPY BEAMING! 🥳' });
                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                await interaction.reply({ content: 'Failed to ban user.', ephemeral: true });
            }
        } else if (commandName === 'kick') {
            const user = interaction.options.getMember('user');
            const reason = interaction.options.getString('reason') || 'No reason provided';
            try {
                await user.kick(reason);
                const embed = new EmbedBuilder()
                    .setTitle('User Kicked')
                    .setDescription(`Kicked ${user} for: ${reason}`)
                    .setColor(0xff0000)
                    .setFooter({ text: 'HAPPY BEAMING! 🥳' });
                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                await interaction.reply({ content: 'Failed to kick user.', ephemeral: true });
            }
        } else if (commandName === 'mute') {
            const user = interaction.options.getMember('user');
            const durationMinutes = interaction.options.getInteger('duration_minutes');
            const reason = interaction.options.getString('reason') || 'No reason provided';
            try {
                if (durationMinutes <= 0 || durationMinutes > 40320) {
                    return interaction.reply({ content: 'Duration must be between 1 minute and 28 days (40320 minutes).', ephemeral: true });
                }
                await user.timeout(durationMinutes * 60 * 1000, reason);
                const embed = new EmbedBuilder()
                    .setTitle('User Muted')
                    .setDescription(`Muted ${user} for ${durationMinutes} minutes: ${reason}`)
                    .setColor(0xff0000)
                    .setFooter({ text: 'HAPPY BEAMING! 🥳' });
                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                await interaction.reply({ content: 'Failed to mute user. Ensure bot has permissions and role hierarchy is correct.', ephemeral: true });
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
            await interaction.reply({ embeds: [embed], ephemeral: false });
        } else if (commandName === 'warn') {
            const user = interaction.options.getMember('user');
            const reason = interaction.options.getString('reason') || 'No reason provided';
            const warning = addWarning(interaction.guild.id, user.id, reason, interaction.user.id);
            const warnings = getWarnings(interaction.guild.id, user.id);
            const embed = new EmbedBuilder()
                .setTitle('User Warned')
                .setDescription(`Warned ${user} for: ${reason}\nTotal Warnings: ${warnings.length}`)
                .setColor(0xff0000)
                .setFooter({ text: 'HAPPY BEAMING! 🥳' });
            try {
                await user.send({ embeds: [
                    new EmbedBuilder()
                        .setTitle(`Warned in ${interaction.guild.name}`)
                        .setDescription(`**Reason:** ${reason}`)
                        .setColor(0xff0000)
                        .setFooter({ text: 'HAPPY BEAMING! 🥳' })
                ]});
            } catch (e) {
                embed.addFields({ name: 'Note', value: 'Could not send DM to user.' });
            }
            await interaction.reply({ embeds: [embed] });
        } else if (commandName === 'clear') {
            const amount = interaction.options.getInteger('amount');
            try {
                await interaction.channel.bulkDelete(amount, true);
                const embed = new EmbedBuilder()
                    .setTitle('Messages Cleared')
                    .setDescription(`Deleted ${amount} messages`)
                    .setColor(0x00ff00)
                    .setFooter({ text: 'HAPPY BEAMING! 🝑' });
                await interaction.reply({ embeds: [embed], ephemeral: true });
            } catch (error) {
                await interaction.reply({ content: 'Failed to clear messages.', ephemeral: true });
            }
        } else if (commandName === 'ping') {
            await interaction.reply({ content: 'Pong!', ephemeral: true });
        } else if (commandName === 'help') {
            const embed = new EmbedBuilder()
                .setTitle('Bot Commands')
                .setDescription('Here are all available commands:')
                .addFields(commandHelp.map(cmd => ({ name: cmd.name, value: cmd.description, inline: true })))
                .setColor(0x00ff00)
                .setFooter({ text: 'Use /usage for detailed help! HAPPY BEAMING! 🝑' });
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (commandName === 'invite') {
            const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`;
            const embed = new EmbedBuilder()
                .setTitle('Invite Me!')
                .setDescription(`Add me to your server using [this invite link](${inviteUrl}).`)
                .setColor(0x00ff00)
                .setFooter({ text: 'HAPPY BEAMING! 🝑' });
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (commandName === 'getserver') {
            const subcommand = interaction.options.getSubcommand();
            if (subcommand === 'info') {
                const guild = interaction.guild;
                const embed = new EmbedBuilder()
                    .setTitle(guild.name)
                    .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
                    .addFields(
                        { name: 'Members', value: `${guild.memberCount}`, inline: true },
                        { name: 'Humans', value: `${guild.members.cache.filter(m => !m.user.bot).size}`, inline: true },
                        { name: 'Bots', value: `${guild.members.cache.filter(m => m.user.bot).size}`, inline: true },
                        { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true },
                        { name: 'Roles', value: `${guild.roles.cache.size - 1}`, inline: true },
                        { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true }
                    )
                    .setColor(0x00ff00)
                    .setFooter({ text: `Server ID: ${guild.id} | HAPPY BEAMING! 🝑' });
                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else if (subcommand === 'icon') {
                if (!interaction.guild.iconURL()) {
                    await interaction.reply({ content: 'This server has no icon set.', ephemeral: true });
                } else {
                    const iconUrl = interaction.guild.iconURL({ dynamic: true, size: 1024 });
                    const attachment = new AttachmentBuilder(iconUrl, { name: 'server-icon.png' });
                    await interaction.reply({ files: [attachment], ephemeral: true });
                }
            }
        } else if (commandName === 'warnings') {
            const user = interaction.options.getUser('user');
            const warnings = getWarnings(interaction.guild.id, user.id);
            if (warnings.length === 0) {
                await interaction.reply({ content: `${user.tag} has no warnings.`, ephemeral: true });
                return;
            }
            const embed = new EmbedBuilder()
                .setTitle(`Warnings for ${user.tag}`)
                .setColor(0xff0000)
                .setFooter({ text: `Total: ${warnings.length} warning(s) | HAPPY BEAMING! 🝑' });
            warnings.forEach((warning, index) => {
                const moderator = interaction.guild.members.cache.get(warning.moderatorId)?.user.tag || 'Unknown';
                embed.addFields({
                    name: `Warning #${index + 1}`,
                    value: `**Reason:** ${warning.reason}\n**Moderator:** ${moderator}\n**Date:** <t:${Math.floor(warning.timestamp / 1000)}:R>`,
                    inline: false
                });
            });
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (commandName === 'clearwarnings') {
            const user = interaction.options.getUser('user');
            const cleared = clearWarnings(interaction.guild.id, user.id);
            await interaction.reply({
                content: cleared ? `Cleared all warnings for ${user.tag}.` : `${user.tag} has no warnings to clear.`,
                ephemeral: true
            });
        } else if (commandName === 'unmute') {
            const user = interaction.options.getMember('user');
            if (!user.isCommunicationDisabled()) {
                await interaction.reply({ content: 'This user is not currently muted.', ephemeral: true });
                return;
            }
            try {
                await user.timeout(null, 'Unmuted');
                const embed = new EmbedBuilder()
                    .setTitle('User Unmuted')
                    .setDescription(`Unmuted ${user}.`)
                    .setColor(0x00ff00)
                    .setFooter({ text: 'HAPPY BEAMING! 🝑' });
                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                await interaction.reply({ content: 'Failed to unmute user. Ensure bot has permissions.', ephemeral: true });
            }
        } else if (commandName === 'cw') {
            const word = interaction.options.getString('word');
            censoredWordsStore[interaction.guild.id] = censoredWordsStore[interaction.guild.id] || { censoredWords: [] };
            if (!censoredWordsStore[interaction.guild.id].censoredWords.includes(word)) {
                censoredWordsStore[interaction.guild.id].censoredWords.push(word);
                await saveCensoredWords();
                await interaction.reply({ content: `Added "${word}" to censored words.`, ephemeral: true });
            } else {
                await interaction.reply({ content: `"${word}" is already censored.`, ephemeral: true });
            }
        } else if (commandName === 'ucw') {
            const word = interaction.options.getString('word');
            censoredWordsStore[interaction.guild.id] = censoredWordsStore[interaction.guild.id] || { censoredWords: [] };
            const index = censoredWordsStore[interaction.guild.id].censoredWords.indexOf(word);
            if (index !== -1) {
                censoredWordsStore[interaction.guild.id].censoredWords.splice(index, 1);
                await saveCensoredWords();
                await interaction.reply({ content: `Removed "${word}" from censored words.`, ephemeral: true });
            } else {
                await interaction.reply({ content: `"${word}" is not censored.`, ephemeral: true });
            }
        } else if (commandName === 'cwl') {
            const words = censoredWordsStore[interaction.guild.id]?.censoredWords || [];
            if (words.length === 0) {
                await interaction.reply({ content: 'No censored words.', ephemeral: true });
                return;
            }
            const embed = new EmbedBuilder()
                .setTitle('Censored Words')
                .setDescription(words.join(', '))
                .setColor(0xff0000)
                .setFooter({ text: 'HAPPY BEAMING! 🝑' });
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (commandName === 'prefix') {
            const subcommand = interaction.options.getSubcommand();
            prefixesStore[interaction.guild.id] = prefixesStore[interaction.guild.id] || { prefixes: [] };
            if (subcommand === 'add') {
                const prefix = interaction.options.getString('prefix');
                if (!prefixesStore[interaction.guild.id].prefixes.includes(prefix)) {
                    prefixesStore[interaction.guild.id].prefixes.push(prefix);
                    await savePrefixes();
                    await interaction.reply({ content: `Added prefix "${prefix}".`, ephemeral: true });
                } else {
                    await interaction.reply({ content: `Prefix "${prefix}" already exists.`, ephemeral: true });
                }
            } else if (subcommand === 'remove') {
                const prefix = interaction.options.getString('prefix');
                const index = prefixesStore[interaction.guild.id].prefixes.indexOf(prefix);
                if (index !== -1) {
                    prefixesStore[interaction.guild.id].prefixes.splice(index, 1);
                    await savePrefixes();
                    await interaction.reply({ content: `Removed prefix "${prefix}".`, ephemeral: true });
                } else {
                    await interaction.reply({ content: `Prefix "${prefix}" not found.`, ephemeral: true });
                }
            } else if (subcommand === 'list') {
                const prefixes = prefixesStore[interaction.guild.id].prefixes || [];
                if (prefixes.length === 0) {
                    await interaction.reply({ content: 'No prefixes set.', ephemeral: true });
                    return;
                }
                const embed = new EmbedBuilder()
                    .setTitle('Prefixes')
                    .setDescription(prefixes.join(', '))
                    .setColor(0x00ff00)
                    .setFooter({ text: 'HAPPY BEAMING! 🝑' });
                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else if (subcommand === 'clear') {
                prefixesStore[interaction.guild.id].prefixes = [];
                await savePrefixes();
                await interaction.reply({ content: 'Cleared all prefixes.', ephemeral: true });
            }
        } else if (commandName === 'usage') {
            const specificCommand = interaction.options.getString('command')?.toLowerCase();
            const embed = new EmbedBuilder()
                .setTitle('Command Usage')
                .setColor(0x00ff00)
                .setFooter({ text: 'HAPPY BEAMING! 🝑' });
            if (specificCommand) {
                const cmd = commandHelp.find(c => c.name.toLowerCase() === specificCommand || c.name.toLowerCase().startsWith(specificCommand));
                if (!cmd) {
                    await interaction.reply({ content: `Command "${specificCommand}" not found. Use /usage for all commands.`, ephemeral: true });
                    return;
                }
                embed.setDescription(`**${cmd.name}**\n${cmd.usage}`);
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }
            const perPage = 5;
            let page = 0;
            const totalPages = Math.ceil(commandHelp.length / perPage);
            const updateEmbed = () => {
                embed.setDescription('');
                const start = page * perPage;
                const end = start + perPage;
                commandHelp.slice(start, end).forEach(cmd => {
                    embed.addFields({ name: cmd.name, value: cmd.usage, inline: false });
                });
                embed.setFooter({ text: `Page ${page + 1}/${totalPages} | HAPPY BEAMING! 🝑' });
            };
            updateEmbed();
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId('prev_usage').setLabel('◀️').setStyle(ButtonStyle.Primary).setDisabled(true),
                    new ButtonBuilder().setCustomId('next_usage').setLabel('▶️').setStyle(ButtonStyle.Primary).setDisabled(page === totalPages - 1)
                );
            try {
                const msg = await interaction.reply({ embeds: [embed], components: [row], ephemeral: true, fetchReply: true });
                const collector = msg.createMessageComponentCollector({ time: 300000 });
                collector.on('collect', async i => {
                    if (i.user.id !== interaction.user.id) {
                        return i.reply({ content: 'This button is not for you.', ephemeral: true });
                    }
                    if (i.customId === 'prev_usage') page--;
                    if (i.customId === 'next_usage') page++;
                    updateEmbed();
                    await i.update({
                        embeds: [embed],
                        components: [
                            new ActionRowBuilder().addComponents(
                                new ButtonBuilder().setCustomId('prev_usage').setLabel('◀️').setStyle(ButtonStyle.Primary).setDisabled(page === 0),
                                new ButtonBuilder().setCustomId('next_usage').setLabel('▶️').setStyle(ButtonStyle.Primary).setDisabled(page === totalPages - 1)
                            )
                        ]
                    });
                });
                collector.on('end', () => {
                    msg.edit({ components: [] }).catch(() => {});
                });
            } catch (e) {
                await interaction.reply({ content: 'Failed to display usage. Check bot permissions.', ephemeral: true });
            }
        } else if (commandName === 'lock') {
            let channel = interaction.options.getChannel('channel') || interaction.channel;
            if (channel.type !== ChannelType.GuildText) {
                await interaction.reply({ content: 'Must be a text channel.', ephemeral: true });
                return;
            }
            try {
                await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                    SendMessages: false,
                    AttachFiles: false
                });
                await channel.send({
                    embeds: [new EmbedBuilder()
                        .setTitle('CHANNEL LOCKED')
                        .setColor(0xff0000)
                        .setFooter({ text: 'HAPPY BEAMING! 🝑' })]
                });
                await interaction.reply({ content: `Locked ${channel}.`, ephemeral: true });
            } catch (e) {
                await interaction.reply({ content: 'Failed to lock channel. Check permissions.', ephemeral: true });
            }
        } else if (commandName === 'unlock') {
            let channel = interaction.options.getChannel('channel') || interaction.channel;
            if (channel.type !== ChannelType.GuildText) {
                await interaction.reply({ content: 'Must be a text channel.', ephemeral: true });
                return;
            }
            try {
                await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                    SendMessages: null,
                    AttachFiles: null
                });
                await channel.send({
                    embeds: [new EmbedBuilder()
                        .setTitle('CHANNEL UNLOCKED')
                        .setColor(0x00ff00)
                        .setFooter({ text: 'HAPPY BEAMING! 🝑' })]
                });
                await interaction.reply({ content: `Unlocked ${channel}.`, ephemeral: true });
            } catch (e) {
                await interaction.reply({ content: 'Failed to unlock channel. Check permissions.', ephemeral: true });
            }
        } else if (commandName === 'dice') {
            const sides = interaction.options.getInteger('sides') || 6;
            const roll = Math.floor(Math.random() * sides) + 1;
            const embed = new EmbedBuilder()
                .setTitle('Dice Roll')
                .setDescription(`You rolled a ${roll}! (1-${sides})`)
                .setColor(0x00ff00)
                .setFooter({ text: 'HAPPY BEAMING! 🝑' });
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (commandName === 'coin') {
            const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
            const embed = new EmbedBuilder()
                .setTitle('Coin Flip')
                .setDescription(`The coin landed on ${result}!`)
                .setColor(0x00ff00)
                .setFooter({ text: 'HAPPY BEAMING! 🝑' });
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (commandName === 'role') {
            const user = interaction.options.getMember('user');
            const role = interaction.options.getRole('role');
            try {
                await user.roles.add(role);
                const embed = new EmbedBuilder()
                    .setTitle('Role Assigned')
                    .setDescription(`Assigned ${role.name} to ${user}.`)
                    .setColor(0x00ff00)
                    .setFooter({ text: 'HAPPY BEAMING! 🝑' });
                await interaction.reply({ embeds: [embed] });
            } catch (e) {
                await interaction.reply({ content: 'Failed to assign role. Check role hierarchy.', ephemeral: true });
            }
        } else if (commandName === 'audit') {
            const limit = interaction.options.getInteger('limit') || 10;
            try {
                const logs = await interaction.guild.fetchAuditLogs({ limit });
                const embed = new EmbedBuilder()
                    .setTitle('Audit Logs')
                    .setColor(0x00ff00)
                    .setFooter({ text: 'HAPPY BEAMING! 🝑' });
                logs.entries.forEach((entry) => {
                    embed.addFields({
                        name: `${entry.action} by ${entry.executor.tag}`,
                        value: `Target: ${entry.target?.tag || 'N/A'}\nReason: ${entry.reason || 'N/A'}\nTime: <t:${Math.floor(entry.createdTimestamp / 1000)}:R>`,
                        inline: false
                    });
                });
                await interaction.reply({ embeds: [embed], ephemeral: true });
            } catch (e) {
                await interaction.reply({ content: 'Failed to fetch audit logs. Check permissions.', ephemeral: true });
            }
        } else if (commandName === 'say') {
            const msg = interaction.options.getString('message');
            try {
                await interaction.channel.send({
                    content: msg,
                    allowedMentions: { parse: [] }
                });
                await interaction.reply({ content: 'Message sent.', ephemeral: true });
            } catch (e) {
                await interaction.reply({ content: 'Failed to send message. Check permissions.', ephemeral: true });
            }
        } else if (commandName === 'poll') {
            const question = interaction.options.getString('question');
            const optionsStr = interaction.options.getString('options');
            const options = optionsStr.split(',').map(o => o.trim());
            try {
                const embed = new EmbedBuilder()
                    .setTitle(`Poll: ${question}`)
                    .setDescription(options.map((o, i) => `${i + 1}. ${o}`).join('\n'))
                    .setColor(0x00ff00)
                    .setFooter({ text: 'HAPPY BEAMING! 🝑' });
                const pollMsg = await interaction.reply({ embeds: [embed], fetchReply: true });
                for (let i = 1; i <= Math.min(options.length, 10); i++) {
                    await pollMsg.react(`${i}️⃣`);
                }
            } catch (e) {
                await interaction.reply({ content: 'Failed to create poll. Check permissions.', ephemeral: true });
            }
        }
    } else if (interaction.isButton() && (interaction.customId === 'prev_usage' || interaction.customId === 'next_usage')) {
        // Handled in /usage command
    }
});

client.login(process.env.DISCORD_TOKEN);
