const { Structure } = require("erela.js");
Structure.extend(
  "Player",
  (Player) =>
    class extends Player {
      constructor(...props) {
        super(...props);
        this.twentyFourSeven = false;
      }
      setNowplayingMessage(message) {
        if (this.nowPlayingMessage)
          this.nowPlayingMessage.delete();
        return (this.nowPlayingMessage = message);
      }
    }
);
