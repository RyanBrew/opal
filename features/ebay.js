const Discord = require('discord.js');
const axios = require('axios');

module.exports = {
    name: 'ebay',
    admin: false,
    description: 'This command will increase the view count of your Ebay listing\n!ebay <listing url> <amount of views>',
    async execute(msg) {
        const args = msg.content.split(' ');
        if (args.length < 3) {
            const embed = new Discord.MessageEmbed();
            embed.setTitle('Error');
            embed.setDescription('Command is missing one or more arguments.\nUsage: ``!ebay <listing url> <amount of views>``');
            setBranding(embed);
            msg.channel.send(embed);
            return;
        }

        // For loop for the amount of GET requests to make
        for (let i = 0; i < args[2]; i++) {
            await axios.get(args[1], {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36'
              }
            });
        }

        // Post success embed message
        const embed = new Discord.MessageEmbed();
        embed.setTitle('Success!');
        embed.setDescription(`${args[2]} views successfully sent!`);
        setBranding(embed);
        msg.channel.send(embed);
    }
}