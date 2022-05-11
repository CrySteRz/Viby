const Controller = require("../utils/controller");
module.exports = async (client, interaction) => {
  if (interaction.isCommand()) {
    let command = client.slashCommands.find(
      (x) => x.name == interaction.commandName
    );
    if (!command || !command.run)
      return interaction.reply(
        "Sorry the command you tried to run does not exist"
      );
    command.run(client, interaction, interaction.options);
    return;
  }

//Daca vreau inapoi context trebuie special interaction case

  if (interaction.isButton()) {
    if (interaction.customId.startsWith("controller"))
      Controller(client, interaction);
  }
};
