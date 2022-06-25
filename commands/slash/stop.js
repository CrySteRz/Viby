const SlashCommand = require("../../core/SlashCommand");
const { EmbedBuilder } = require("discord.js");

const command = new SlashCommand()
  .setName("stop")
  .setDescription("Stops the music and leaves the voice channel")
  .setRun(async (client, interaction, options) => {
    if (!interaction.member.voice.channel) {
      const embed = new EmbedBuilder()
        .setColor(client.config.errcolor)
        .setDescription(
          "❌ | **You must be in a voice channel to use this command!**"
        );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  
    if (
      interaction.guild.members.me.voice.channel &&
      !interaction.guild.members.me.voice.channel.equals(interaction.member.voice.channel)
    ) {
      const embed = new EmbedBuilder()
        .setColor(client.config.errcolor)
        .setDescription(
          "❌ | **You must be in the same voice channel as me to use this command!**"
        );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    let player = client.manager.players.get(interaction.guild.id);
    if (!player){
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor(client.config.errcolor)
          .setDescription("**Nothing is playing right now...**")], ephemeral: true });
    }

    
    player.destroy();
    interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(client.config.color)
        .setDescription(`:wave: | **Goodbye ${interaction.user} !**`)],
    });
  });

module.exports = command;
