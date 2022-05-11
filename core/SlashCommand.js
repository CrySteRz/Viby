const { SlashCommandBuilder } = require("@discordjs/builders");
class SlashCommand extends SlashCommandBuilder {
  constructor() {
    super();
    this.type = 1;
    return this;
  }
  setRun(callback) {
    this.run = callback;
    return this;
  }
}
module.exports = SlashCommand;
