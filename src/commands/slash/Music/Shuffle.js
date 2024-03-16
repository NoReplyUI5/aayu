const {ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");

module.exports = {
    structure: new SlashCommandBuilder().setName("shuffle").setDescription("shuffle the queue"),
    options: {
        nsfw: false,
        developers: false
    },
    /**
                 * @param {ExtendedClient} client
                * @param {ChatInputCommandInteraction} interaction
                */
    run: async (client, interaction) => {
            
            const {channel} = interaction.member.voice;
            if (!channel) return interaction.reply('You need to be in a voice channel to use this command.');
            if (channel.id !== interaction.guild.members.me.voice.channel.id) return interaction.reply('You must be in the same voice channel as me to use this command.');
            const player = client.riffy.players.get(interaction.guild.id);
            if (!player) return interaction.reply('No song/s currently playing in this guild.');
            if (!player.playing) return interaction.reply('No song/s currently playing in this guild.');
    
            player.queue.shuffle();
            const embed = new EmbedBuilder()
                .setDescription('Successfully shuffled the queue!')
                .setColor(client.color)
                .setTimestamp()
                .setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL({dynamic: true})})
            interaction.reply({embeds: [embed]})
    }
};
