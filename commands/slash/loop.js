const SlashCommand = require("../../core/SlashCommand");
const { Embed } = require("discord.js");

const command = new SlashCommand()
  .setName("loop")
  .setDescription("Loops the current song")
  .setRun(async (client, interaction, options) => {
    let player = client.manager.players.get(interaction.guild.id);
    if (!player) {
      const queueEmbed = new Embed()
        .setColor(client.config.errcolor)
        .setDescription("❌ | **There's nothing playing in the queue**");
      return interaction.reply({ embeds: [queueEmbed], ephemeral: true });
    }

    if (!player.playing) {
      const queueEmbed = new Embed()
        .setColor(client.config.errcolor)
        .setDescription("❌ | **There's nothing playing**");
      return interaction.reply({ embeds: [queueEmbed], ephemeral: true });
    }

    if (!interaction.member.voice.channel) {
      const joinEmbed = new Embed()
        .setColor(client.config.errcolor)
        .setDescription(
          "❌ | **You must be in a voice channel to use this command!**"
        );
      return interaction.reply({ embeds: [joinEmbed], ephemeral: true });
    }

    if (
      interaction.guild.me.voice.channel &&
      !interaction.guild.me.voice.channel.equals(
        interaction.member.voice.channel
      )
    ) {
      const sameEmbed = new Embed()
        .setColor(client.config.errcolor)
        .setDescription(
          "❌ | **You must be in the same voice channel as me to use this command!**"
        );
      return interaction.reply({ embeds: [sameEmbed], ephemeral: true });
    }


    if (player.setTrackRepeat(!player.trackRepeat));
    const trackRepeat = player.trackRepeat ? "enabled" : "disabled";

    let loopembed = new Embed()
      .setColor(client.config.color)
      .setDescription(`:call_me:  | **Loop has been \`${trackRepeat}\`**`);
    interaction.reply({ embeds: [loopembed] });
  });
module.exports = command;
