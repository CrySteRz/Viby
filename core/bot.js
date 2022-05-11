const {Client,Collection,Partials, GatewayIntentBits, ActionRow, ButtonStyle, ButtonComponent, Embed} = require('discord.js')
const Cluster = require('discord-hybrid-sharding')
const colors = require('colors');
const path = require('path');
const logger = require("./logger");
const fs = require("fs");
const prettyMilliseconds = require("pretty-ms");
const { Manager } = require("erela.js");
const deezer = require("erela.js-deezer");
const facebook = require("erela.js-facebook");
const filters = require("erela.js-filters");
const spotify = require("better-erela.js-spotify").default;
const { default: AppleMusic } = require("better-erela.js-apple");
const conf = require("../conf/config");
const func = require('../utils/functions');
require('./extendPlayer');
class Bot extends Client{
    constructor(
        props = {
            intents: [
              GatewayIntentBits.Guilds,
              GatewayIntentBits.GuildVoiceStates,
              GatewayIntentBits.GuildMessages
            ],
            partials: [
              Partials.Channel
            ],
            shards: Cluster.data.SHARD_LIST,
            shardCount: Cluster.data.TOTAL_SHARDS,
          }
    ){
        super(props);
        this.config = conf;
        this.cluster = new Cluster.Client(this);
        this.slashCommands = new Collection();
        this.logger = new logger(path.join(__dirname, "..", "logs.log"));
        this.ms = prettyMilliseconds;
        this.function = func;
        this.loadCommands();
        this.loadEvents();
        this.build();
    }
    log(text){
      this.logger.log(text);
    }
    error(text){
      this.logger.error(text);
    }
    build() {
      this.log("[LOADING] Bot is starting...");
      this.login(this.config.token);
      process.on("unhandledRejection", (error) => console.log(error));
      process.on("uncaughtException", (error) => console.log(error));
      let client = this;
      this.manager = new Manager({
        plugins: [
          new deezer(),
          new AppleMusic(),
          new spotify(),
          new facebook(),
          new filters(),
        ],
        nodes: this.config.nodes,
        retryAmount: this.config.retryAmount, 
        retryDelay: this.config.retryDelay, 
        send: (id, payload) => {
         if(client.guilds.cache.get(id))
         client.guilds.cache.get(id).shard.send(payload)
        }
      })
      .on("nodeConnect", (node) =>
        this.log(
          `Node: ${node.options.identifier} | Lavalink node is connected.`
        )
      )
      .on("nodeReconnect", (node) =>
        this.error(
          `Node: ${node.options.identifier} | Lavalink node is reconnecting.`
        )
      )
      .on("nodeDestroy", (node) =>
        this.error(
          `Node: ${node.options.identifier} | Lavalink node is destroyed.`
        )
      )
      .on("nodeDisconnect", (node) =>
        this.error(
          `Node: ${node.options.identifier} | Lavalink node is disconnected.`
        )
      )
      .on("nodeError", (node, err) =>
        this.error(
          `Node: ${node.options.identifier} | Lavalink node has an error: ${err.message}`
        )
      )
      .on("trackError", (player, track) =>
        this.error(`Player: ${player.options.guild} | Track had an error.`)
      )
      .on("trackStuck", (player, track, threshold) =>
        this.error(`Player: ${player.options.guild} | Track is stuck.`)
      )
      .on("playerMove", (player, oldChannel, newChannel) => {
        const guild = client.guilds.cache.get(player.guild);
        if (!guild) return;
        const channel = guild.channels.cache.get(player.textChannel);
        if (oldChannel === newChannel) return;
        if (newChannel === null || !newChannel) {
          if (!player) return;
          if (channel)
            channel.send({
              embeds: [
                new Embed()
                  .setColor(client.config.color)
                  .setDescription(`:wave: | Disconnected from <#${oldChannel}>`),
              ],
            });
          return player.destroy();
        } else {
          player.voiceChannel = newChannel;
          setTimeout(() => player.pause(false), 1000);
          return undefined;
        }
      })
      .on("playerCreate", (player) =>
        this.log(
          `Player: ${
            player.options.guild
          } | A wild player has been created in ${
            client.guilds.cache.get(player.options.guild)
              ? client.guilds.cache.get(player.options.guild).name
              : "a guild"
          }`
        )
      )
      .on("playerDestroy", (player) =>
        this.log(
          `Player: ${
            player.options.guild
          } | A wild player has been destroyed in ${
            client.guilds.cache.get(player.options.guild)
              ? client.guilds.cache.get(player.options.guild).name
              : "a guild"
          }`
        )
      )
      .on("loadFailed", (node, type, error) =>
        this.error(
          `Node: ${node.options.identifier} | Failed to load ${type}: ${error.message}`
        )
      )
      .on("trackStart", async (player, track) => {
        this.log(
          `Player: ${
            player.options.guild
          } | Track has been started playing [${colors.blue(track.title)}]`
        );
        this.function.historyInsert(track, player.options.guild);
        let trackStartedEmbed = new Embed()
          .setTitle("Now playing")
          .setColor(client.config.color)
          .setDescription(`[${track.title}](${track.uri})` || "No Descriptions")
          .addFields({
            name: "Requested by",
            value: `${track.requester}`})
          .addFields({
            name: "Duration",
            value: track.isStream
              ? `\`LIVE\``
              : `\`${prettyMilliseconds(track.duration, {
                  colonNotation: true,
                })}\``
          });
        try {
          trackStartedEmbed.setThumbnail(
            track.displayThumbnail("maxresdefault")
          );
        } catch (err) {
          trackStartedEmbed.setThumbnail(track.thumbnail);
        }
        let NowPlaying = await client.channels.cache
          .get(player.textChannel)
          .send({
            embeds: [trackStartedEmbed],
            components: [client.createController(player.options.guild)],
          })
          .catch(this.error);
        player.setNowplayingMessage(NowPlaying);
      })
      .on("queueEnd", (player) => {
        this.log(`Player: ${player.options.guild} | Queue has been ended`);
        let queueEmbed = new Embed()
          .setColor(client.config.color)
          .setTitle("The queue has ended | Bot disconnect in 60s")
          .setFooter({text : 'Queue ended'})
          .setTimestamp();
        client.channels.cache
          .get(player.textChannel)
          .send({ embeds: [queueEmbed] });
        try {
          if (!player.playing && !player.twentyFourSeven) {
            setTimeout(() => {
              if (!player.playing && player.state !== "DISCONNECTED") {
                let disconnectedEmbed = new Embed()
                  .setColor(this.config.color)
                  .setAuthor({name : "Disconnected"})
                  .setDescription(
                    `The player has been disconnected due to inactivity.`
                  );
                client.channels.cache
                  .get(player.textChannel)
                  .send({ embeds: [disconnectedEmbed] });
                player.destroy();
              } else if (player.playing) {
                this.log(`Player: ${player.options.guild} | Still playing`);
              }
            }, this.config.disconnectTime);
          } else if (player.playing || player.twentyFourSeven) {
            this.log(
              `Player: ${player.options.guild} | Still playing and 24/7 is active`
            );
          }
        } catch (err) {
          this.error(err);
        }
      });
    }
    loadEvents() {
      let EventsDir = path.join(__dirname, "..", "events");
      fs.readdir(EventsDir, (err, files) => {
        if (err) throw err;
        else
          files.forEach((file) => {
            const event = require(EventsDir + "/" + file);
            this.on(file.split(".")[0], event.bind(null, this));
            this.log("[LOADING] Event Loaded | " + file.split(".")[0]);
          });
      });
    }
    loadCommands() {
      let SlashCommandsDirectory = path.join(__dirname,"..","commands","slash");
      fs.readdir(SlashCommandsDirectory, (err, files) => {
        if (err) throw err;
        else
          files.forEach((file) => {
            let cmd = require(SlashCommandsDirectory + "/" + file);
            if (!cmd || !cmd.run)
              return this.error(
                "Unable to load the command: " +
                  file.split(".")[0] +
                  ", File doesn't have a runtime"
              );
            this.slashCommands.set(file.split(".")[0].toLowerCase(), cmd);
            this.log("[LOADING] Slash Command Loaded | " + file.split(".")[0]);
          });
      });
    }
    createPlayer(interaction) {
      return this.manager.create({
        guild: interaction.guild.id,
        voiceChannel: interaction.member.voice.channel.id,
        textChannel: interaction.channel.id,
        selfDeafen: true,
        volume: 50,
      });
    }
    createController(guild) {
      return new ActionRow().addComponents(
        //new ButtonComponent()//Da togliere senza premium
          //.setStyle(ButtonStyle.Secondary)
          //.setCustomId(`controller:${guild}:LowVolume`)
          //.setEmoji({
          //  name: "🔉"
          //}),
  
        new ButtonComponent()
          .setStyle(ButtonStyle.Primary)
          .setCustomId(`controller:${guild}:Replay`)
          .setEmoji({
            name: "◀"
          }),
  
        new ButtonComponent()
          .setStyle(ButtonStyle.Danger)
          .setCustomId(`controller:${guild}:PlayAndPause`)
          .setEmoji({
            name: "⏯"
          }),
  
        new ButtonComponent()
          .setStyle(ButtonStyle.Primary)
          .setCustomId(`controller:${guild}:Next`)
          .setEmoji({
            name: "▶"
          }),
  
        //new ButtonComponent()//To remove if user has no premium
        // .setStyle(ButtonStyle.Secondary)
        //  .setCustomId(`controller:${guild}:HighVolume`)
        //  .setEmoji({
        //    name: "🔊"
        //  }),
      );
    }
}
module.exports = Bot;
