const SlashCommand = require("../../core/SlashCommand");
const { EmbedBuilder } = require("discord.js");
const ms= require("ms");

const command = new SlashCommand()
  .setName("seek")
  .setDescription("Seek to a specific time in the current playing song")
  .addStringOption((option) =>
    option
      .setName("time")
      .setDescription("Seek to the time you want Ex 2m | 10s or just 120s")
      .setRequired(true)
  )

  .setRun(async (client, interaction, options) => {
    const args = interaction.options.getString("time");

    let player = client.manager.players.get(interaction.guild.id);
    if (!player) {
      const queueEmbed = new EmbedBuilder()
        .setColor(client.config.errcolor)
        .setDescription("❌ | **There's nothing playing in the queue**");
      return interaction.reply({ embeds: [queueEmbed], ephemeral: true });
    }

    if (!interaction.member.voice.channel) {
      const joinEmbed = new EmbedBuilder()
        .setColor(client.config.errcolor)
        .setDescription(
          "❌ | **You must be in a voice channel to use this command.**"
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
    await interaction.deferReply();

    const time = ms(args);
    const position = player.position;
    const duration = player.queue.current.duration;

    if (time <= duration) {
      if (time > position) {
        player.seek(time);
        let thing = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(
            `⏩ | **${player.queue.current.title}** has been seeked to **${ms(
              time
            )}**`
          );
        return interaction.editReply({ embeds: [thing] });
      } else {
        player.seek(time);
        let thing = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(
            `:rewind: | **${player.queue.current.title}** has been rewinded to **${ms(
              time
            )}**`
          );
        return interaction.editReply({ embeds: [thing] });
      }
    } else {
      let thing = new EmbedBuilder()
        .setColor(client.config.color)
        .setDescription(
          `Cannot seek current playing track. This may happened because seek duration has exceeded track duration`
        );
      return interaction.editReply({ embeds: [thing] });
    }
  });

module.exports = command;
