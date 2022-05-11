const {ActivityType} = require('discord.js')
module.exports = (client) => {
  client.manager.init(client.user.id);
  client.user.setPresence({
    status: "online", 
    activities: [
      {
        name: "music",
        type: ActivityType.Listening, 
      },
    ],
  });
  client.log("[READY] Successfully Logged in as " + client.user.tag);
};
