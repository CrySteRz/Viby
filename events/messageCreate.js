const { EmbedBuilder } = require("discord.js");

module.exports = async (client, message) => {
  const mention = new RegExp(`^<@!?${client.user.id}>( |)$`);

  if (message.content.match(mention)) {
    const mentionEmbed = new EmbedBuilder()
      .setColor(client.config.color)
      .setDescription(
        `My prefix on this server is \`/\` (Slash Command).\nTo get started you can type \`/help\` to see all my commands.\nIf you can't see it, Please [reinvite](https://discord.com/oauth2/authorize?client_id=${client.config.clientId}&permissions=${client.config.permissions}&scope=bot%20applications.commands) me with the correct permissions.`
      );
    message.channel.send({
      embeds: [mentionEmbed],
    });
  }
};
