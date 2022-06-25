const SlashCommand = require("../../core/SlashCommand");
const { EmbedBuilder } = require("discord.js");

const command = new SlashCommand()
  .setName("loopqueue")
  .setDescription("Loops the entire queue")
  .setRun(async (client, interaction, options) => {
    let player = client.manager.players.get(interaction.guild.id);
    if (!player) {
      const queueEmbed = new EmbedBuilder()
        .setColor(client.config.errcolor)
        .setDescription("❌ | **There's nothing playing in the queue**");
      return interaction.reply({ embeds: [queueEmbed], ephemeral: true });
    }

    if (!player.playing) {
      const queueEmbed = new EmbedBuilder()
        .setColor(client.config.errcolor)
        .setDescription("❌ | **There's nothing playing**");
      return interaction.reply({ embeds: [queueEmbed], ephemeral: true });
    }

    if (!interaction.member.voice.channel) {
      const joinEmbed = new EmbedBuilder()
        .setColor(client.config.errcolor)
        .setDescription(
          "❌ | **You must be in a voice channel to use this command!**"
        );
      return interaction.reply({ embeds: [joinEmbed], ephemeral: true });
    }

    if (
      interaction.guild.members.me.voice.channel &&
      !interaction.guild.members.me.voice.channel.equals(
        interaction.member.voice.channel
      )
    ) {
      const sameEmbed = new EmbedBuilder()
        .setColor(client.config.errcolor)
        .setDescription(
          "❌ | **You must be in the same voice channel as me to use this command!**"
        );
      return interaction.reply({ embeds: [sameEmbed], ephemeral: true });
    }
    if (player.setQueueRepeat(!player.queueRepeat));
    const queueRepeat = player.queueRepeat ? "enabled" : "disabled";

    let loopembed = new EmbedBuilder()
      .setColor(client.config.color)
      .setDescription(`:call_me: | **Loop queue is now \`${queueRepeat}\`**`);
    interaction.reply({ embeds: [loopembed] });
  });

module.exports = command;
