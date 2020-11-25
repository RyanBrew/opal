// DEPENDENCIES
require('dotenv').config();
const Discord = require("discord.js");
const { Client, Intents } = require('discord.js');
let intents = new Intents();
intents.add(['GUILDS', 'GUILD_MEMBERS', 'GUILD_BANS', 'GUILD_EMOJIS', 'GUILD_INTEGRATIONS', 'GUILD_WEBHOOKS', 'GUILD_INVITES', 'GUILD_VOICE_STATES', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_MESSAGE_TYPING', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'DIRECT_MESSAGE_TYPING'])
const bot = new Client({ ws: { intents: intents }, partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const DBL = require("dblapi.js");
const dbl = new DBL(process.env.DBL_TOKEN, bot);
const helpers = require('./helpers.js')
// const Group = require('./models/groups.js')

const fs = require('fs');
const { checkUser } = require('./helpers.js');

// Command handler setup
global.PREFIX = '!';
bot.commands = new Discord.Collection();

global.featureFiles = fs.readdirSync('./features').filter(file => file.endsWith('.js')); // made global for help.js
for (const file of featureFiles) {
    const feature = require(`./features/${file}`);
    bot.commands.set(feature.name, feature);
}

// Posts the server count to DBL
dbl.on('posted', () => {
    console.log('Server count posted!');
})

bot.on('message', (msg) => {
    // Sender is a bot and should not be served
    if (msg.author.bot) return;

    // Sender is the bot itself and should not be served
    if (msg.author.id === bot.user.id) return;

    // Message does not start with prefix and should be ignored
    if (!msg.content.startsWith(PREFIX)) return;

    const args = msg.content.split(' ');
    let cmd = args.shift();

    // Strip pure command name, in all lowercase
    cmd = cmd.substring(PREFIX.length).toLowerCase();

    // If command doesn't exist ignore message
    if (!bot.commands.has(cmd)) return;

    // Do not allow user without admin, to use admin commands
    const command = bot.commands.get(cmd);
    const isAdmin = msg.member && msg.member.hasPermission("ADMINISTRATOR");
    if (command.admin && !isAdmin) return;

    // Execute command, if all checks pass
    checkUser(msg.author)
    // if (command.name === 'help' || msg.guild.id === '752301663510986822') {
    command.execute(msg)
    // }
    // else {
    //     // This is gross please help me -- RYAN
    //     dbl.getVotes().then(votes => {
    //         if (votes.find(vote => vote.id == msg.author.id)) {
    //             command.execute(msg)
    //         }
    //         else {
    //             const embed = new Discord.MessageEmbed()
    //             embed.setTitle('Upvote Needed')
    //             embed.setDescription(`It seems like you haven't upvoted yet. You can do so [here](https://top.gg/bot/752293928157446184)`)
    //             setBranding(embed)
    //             msg.channel.send(embed)
    //         }
    //     });
    // }
});

bot.on('ready', () => {
    helpers.updateStatus(bot)
});

bot.on('messageReactionAdd', (reaction, user) => {
    helpers.resendHelp(bot, reaction, user)
})

bot.on('guildMemberAdd', (member) => {
    helpers.updateStatus(bot);
    helpers.checkUser(member);
});

bot.on('guildCreate', (guild) => {
    helpers.updateStatus(bot)
    helpers.welcomeGroup(bot, guild)
})
bot.on('guildDelete', (guild) => {
    helpers.updateStatus(bot)
    helpers.byeGroup(bot, guild)
})

bot.login(process.env.BOT_TOKEN).then(() => {
    console.log('Connected to Mongo and authorized in all servers');
});

// const welcomeUser = (member) => {
//     if (member.guild.id === "752301663510986822") return;

//     const message = ":wave: **Welcome to Opal!** :wave: \n\nIt seems you have joined a server I reside in. Who am I? Well I am a **100% free & open source** Discord bot to make your experience in this group seamless. We provide **over 30 features**, all of which can be tested in our support server! Do you own a group? Opal is perfect for you! Can you code or are you willing to learn? Opal has great resources for anyone looking to contribute! \n\nJoin Support Server: https://discord.gg/p8dzvk7\nFollow Opal on Twitter: https://twitter.com/OpalSource\nInvite Opal Link: https://discord.com/api/oauth2/authorize?client_id=752293928157446184&permissions=8&scope=bot";
//     member.user.send(message);
// }



// bot.on('guildMemberRemove', () => updateStatus())