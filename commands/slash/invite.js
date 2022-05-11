const { Embed, ButtonComponent, ActionRow, ButtonStyle } = require("discord.js");
const SlashCommand = require("../../core/SlashCommand");
const command = new SlashCommand()
  .setName("invite")
  .setDescription("Invite me to your server")
  .setRun(async (client, interaction, options) => {
    const embed = new Embed()
      .setColor(client.config.color)
      .setTitle(`Invite me to your server`);
      const row = new ActionRow().addComponents(
        new ButtonComponent()
        .setLabel("Invite me to your server!")
        .setStyle(ButtonStyle.Link)
        .setURL("https://discord.com/api/oauth2/authorize?client_id=953606338527780915&permissions=8&scope=bot%20applications.commands")
    );
    return interaction.reply({ embeds: [embed], components: [row] });
  });
module.exports = command;
