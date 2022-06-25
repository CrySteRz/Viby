const { EmbedBuilder } = require("discord.js");
module.exports = async (client, oldState, newState) => {
  let guildId = newState.guild.id;
  const player = client.manager.get(guildId);

  if (!player || player.state !== "CONNECTED") return;

  const stateChange = {};

  if (oldState.channel === null && newState.channel !== null)
    stateChange.type = "JOIN";
  if (oldState.channel !== null && newState.channel === null)
    stateChange.type = "LEAVE";
  if (oldState.channel !== null && newState.channel !== null)
    stateChange.type = "MOVE";
  if (oldState.channel === null && newState.channel === null) return; // No change
  if (newState.serverMute == true && oldState.serverMute == false)
    return player.pause(true);
  if (newState.serverMute == false && oldState.serverMute == true)
    return player.pause(false);

  if (stateChange.type === "MOVE") {
    if (oldState.channel.id === player.voiceChannel) stateChange.type = "LEAVE";
    if (newState.channel.id === player.voiceChannel) stateChange.type = "JOIN";
  }

  if (stateChange.type === "JOIN") stateChange.channel = newState.channel;
  if (stateChange.type === "LEAVE") stateChange.channel = oldState.channel;


  if (!stateChange.channel || stateChange.channel.id !== player.voiceChannel)
    return;


  stateChange.members = stateChange.channel.members.filter(
    (member) => !member.user.bot
  );

  switch (stateChange.type) {
    case "JOIN":
        if (stateChange.members.size === 1 && player.paused) {
          let playerResumed = new EmbedBuilder()
            .setTitle(`Resumed!`)
            .setColor(client.config.color)
            .setDescription(`**The current song has been resumed**`)
          await client.channels.cache
            .get(player.textChannel)
            .send({ embeds: [playerResumed] });
          let playerPlaying = await client.channels.cache
            .get(player.textChannel)
            .send({
              embeds: [player.nowPlayingMessage.embeds[0]],
              components: [client.createController(player.options.guild)],
            });
          player.setNowplayingMessage(playerPlaying);
          player.pause(false);
        }
      break;
    case "LEAVE":
        if (
          stateChange.members.size === 0 &&
          !player.paused &&
          player.playing
        ) {
          player.pause(true);

          let playerPaused = new EmbedBuilder()
            .setTitle(`Paused!`)
            .setColor(client.config.color)
            .setDescription(`**The current song has been paused because theres no one in the voice channel**`)
          await client.channels.cache
            .get(player.textChannel)
            .send({ embeds: [playerPaused] });
        }
      break;
  }
};
