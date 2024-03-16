const { Message, PermissionFlagBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const Database = require("../../../handlers/xata").getXataClient().db.Level;
const User = require("../../../handlers/xata").getXataClient().db.UserXP;
module.exports = {
    structure: {
        name: 'level-leaderboard',
        description: 'see the leaderboard of the guild',
       aliases: ["lb"],
        permissions: null,
        cooldown: 7000
    },
    /**
     * @param {ExtendedClient} client 
     * @param {Message} message 
     * @param {[String]} args 
     */
    run: async (client, message, args) => {
        const data = await Database.read(`${message.guild.id}`);

        if (!data || data.Toggle === false || !data.Toggle) return message.reply({ embeds: [
            new EmbedBuilder()
            .setTitle("Leveling")
            .setDescription("Bruh! Leveling System is not enabled")
            .setColor(client.color)
        ]})

        const data2 = await User.filter({ Guild: message.guild.id }).sort("Level", "desc").getAll();
        if (!data2.length) return message.reply({ embeds: [
            new EmbedBuilder()
            .setTitle("Leveling")
            .setDescription("No data found")
            .setColor(client.color)
        ]})

        const pageSize = 7;
        const pages = Math.ceil(data2.length / pageSize);

        let currentPage = 1;

        const generateEmbed = (page) => {
          const embed = new EmbedBuilder()
          .setThumbnail(message.guild.iconURL({ dynamic: true }))
              .setTitle('Level Leaderboard')
              .setDescription(data2.slice((page - 1) * pageSize, page * pageSize).map((data, index) => {
                  let rankEmoji;
                  if (index + 1 === 1) {
                      rankEmoji = client.emoji.first; 
                  } else if (index + 1 === 2) {
                      rankEmoji = client.emoji.second; 
                  } else if (index + 1 === 3) {
                      rankEmoji = client.emoji.third;
                  } else {
                      rankEmoji = ` \`#${index + 1}\``;
                  }
                  return `${rankEmoji} ${message.guild.members.cache.get(data.User)?.user || 'Unknown User'} • Level: **${data.Level}** | XP: **${data.XP}**`;
              }).join('\n'))
              .setColor(client.color)
              .setFooter({ text: `Page ${page} of ${pages}` });
      
          return embed;

            };


        const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('prev')
                .setEmoji(client.emoji.previous)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === 1),
            new ButtonBuilder()
                .setCustomId('next')
                .setEmoji(client.emoji.next)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === pages),
        );

        const messageOptions = {
            embeds: [generateEmbed(currentPage)],
            components: [row],
        };

        const msg = await message.reply(messageOptions);
        const filter = (i) => {
            if (i.user.id !== message.author.id) return;
            return true;
        };
        const collector = msg.createMessageComponentCollector({ filter, time: 60000 });
        collector.on('collect', async (i) => {
            if (i.customId === 'prev') {
                if (currentPage !== 1) {
                    currentPage--;
                    row.components[0].setDisabled(currentPage === 1);
                    await i.update({ embeds: [generateEmbed(currentPage)], components: [row] });
                }
            } else if (i.customId === 'next') {
                if (currentPage !== pages) {
                    currentPage++;
                   row.components[1].setDisabled(currentPage === pages);
                    await i.update({ embeds: [generateEmbed(currentPage)], components: [row] });
                }
            }
        });
        collector.on('end', async () => {
            await msg.edit({ components: [] });
        });
        
                                         
    }
};