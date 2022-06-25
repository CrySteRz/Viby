const { EmbedBuilder } = require("discord.js");
const SlashCommand = require("../../core/SlashCommand");

const command = new SlashCommand()
  .setName("play")
  .setDescription("Plays music in the voice channel")
  .addStringOption((option) =>
    option
      .setName("query")
      .setDescription("Search string to search the music")
      .setRequired(true)
  )
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
    let channel = interaction.member.voice.channel;
    if (!channel) return;
    let query = options.getString("query", true);
    let player = client.createPlayer(interaction);
    if (player.state !== "CONNECTED") {
      player.connect();
    }
    if (channel.type == "GUILD_STAGE_VOICE") {
      setTimeout(() => {
        if (interaction.guild.members.me.voice.suppress == true) {
          try {
            interaction.guild.members.me.voice.setSuppressed(false);
          } catch (e) {
            interaction.guild.members.me.voice.setRequestToSpeak(true);
          }
        }
      }, 2000);
    }
    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(client.config.color)
        .setDescription(":mag_right: **Searching...**")],           
    });

    let res = await player.search(query, interaction.user).catch((err) => {
      client.error(err);
      return {
        loadType: "LOAD_FAILED",
      };
    });

    if (res.loadType === "LOAD_FAILED") {
      if (!player.queue.current) player.destroy();
      return interaction
        .editReply({
          embeds: [new EmbedBuilder()
            .setColor(client.config.errcolor)
            .setDescription("There was an error while searching")],
        })
        .catch(this.error);
    }

    if (res.loadType === "NO_MATCHES") {
      if (!player.queue.current) player.destroy();
      return interaction
        .editReply({
          embeds: [new EmbedBuilder()
            .setColor(client.config.errcolor)
            .setDescription("No result were found")],
        })
        .catch(this.error);
    }

    if (res.loadType === "TRACK_LOADED" || res.loadType === "SEARCH_RESULT") {
      player.queue.add(res.tracks[0]);
      if (!player.playing && !player.paused && !player.queue.size)
        player.play();
      let embed = 
        new EmbedBuilder()
        .setAuthor({name :"Added to queue"})
        .setColor(client.config.color)
        .setDescription(`[${res.tracks[0].title}](${res.tracks[0].uri})` || "No Title")
        .setURL(res.tracks[0].uri)
        .addFields({name: "Author", value:  res.tracks[0].author})
        .addFields({
          name: "Song Duration",
          value: res.tracks[0].isStream
            ? `\`LIVE\``
            : `\`${client.ms(res.tracks[0].duration, {
                colonNotation: true,
              })}\``
            });
      try {
        embed.setThumbnail(res.tracks[0].displayThumbnail("maxresdefault"));
      } catch (err) {
        embed.setThumbnail(res.tracks[0].thumbnail);
      }
      if (player.queue.totalSize > 1)
        embed.addFields({name : "Position in queue", value:  `${player.queue.size - 0}`});
      return interaction.editReply({ embeds: [embed] }).catch(this.error);
    }

    if (res.loadType === "PLAYLIST_LOADED") {
      player.queue.add(res.tracks);
      if (
        !player.playing &&
        !player.paused &&
        player.queue.totalSize === res.tracks.length
      )
        player.play();
      let embed = 
        new EmbedBuilder()
        .setAuthor({name :"Playlist added to queue"})
        .setColor(client.config.color)
        .setThumbnail(res.tracks[0].thumbnail)
        .setDescription(`[${res.playlist.name}](${query})`)
        .addFields({name :"Enqueued", value:  `\`${res.tracks.length}\` songs`})
        .addFields({
          name :"Entire playlist duration",
          value: `\`${client.ms(res.playlist.duration, {
            colonNotation: true,
          })}\``
        });
      return interaction.editReply({ embeds: [embed] }).catch(this.error);
    }
  });

module.exports = command;



