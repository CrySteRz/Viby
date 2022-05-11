const SlashCommand = require("../../core/SlashCommand");
const { Embed } = require("discord.js");

const command = new SlashCommand()
  .setName("skip")
  .setDescription("Skips to a specific song in the queue")
  .addNumberOption((option) =>
    option
      .setName("number")
      .setDescription("The number of tracks to skipto")
      .setRequired(true)
  )

  .setRun(async (client, interaction, options) => {
    const args = interaction.options.getNumber("number");
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
    await interaction.deferReply();
    const position = Number(args);
    if (!position || position < 0 || position > player.queue.size) {
      let thing = new Embed()
        .setColor(client.config.errcolor)
        .setDescription("❌ | Invalid position!");
      return interaction.editReply({ embeds: [thing] });
    }
    if(position === 1){
      player.stop()
      let thing = new Embed()
    .setColor(client.config.color)
    .setDescription("✅ | Skipped to position " + position);

  return interaction.editReply({ embeds: [thing] });
    }
    player.queue.remove(0, position - 1);
    player.stop();
    let thing = new Embed()
      .setColor(client.config.color)
      .setDescription("✅ | Skipped to position " + position);

    return interaction.editReply({ embeds: [thing] });
  });

module.exports = command;
