const SlashCommand = require("../../core/SlashCommand");
const { Embed, ButtonComponent, ActionRow, ButtonStyle } = require("discord.js");
const load = require("lodash");
const pms = require("pretty-ms");

const command = new SlashCommand()
  .setName("queue")
  .setDescription("Shows the current queue")

  .setRun(async (client, interaction, options) => {
    let player = client.manager.players.get(interaction.guild.id);
    if (!player) {
      const queueEmbed = new Embed()
        .setColor(client.config.errcolor)
        .setDescription("❌ | **There's nothing playing in the queue**");
      return interaction.reply({ embeds: [queueEmbed], ephemeral: true });
    }

    if (!player.playing) {
      const queueEmbed = new Embed()
        .setColor(client.config.errcolor)
        .setDescription("❌ | **There's nothing playing**");
      return interaction.reply({ embeds: [queueEmbed], ephemeral: true });
    }

    if (!interaction.member.voice.channel) {
      const joinEmbed = new Embed()
        .setColor(client.config.errcolor)
        .setDescription(
          "❌ | **You must be in a voice channel to use this command!**"
        );
      return interaction.reply({ embeds: [joinEmbed], ephemeral: true });
    }

    if (
      interaction.guild.me.voice.channel &&
      !interaction.guild.me.voice.channel.equals(
        interaction.member.voice.channel
      )
    ) {
      const sameEmbed = new Embed()
        .setColor(client.config.errcolor)
        .setDescription(
          "❌ | **You must be in the same voice channel as me to use this command!**"
        );
      return interaction.reply({ embeds: [sameEmbed], ephemeral: true });
    }
    await interaction.deferReply().catch(() => {});
    if (!player.queue.size || player.queue.size === 0) {
      let song = player.queue.current;
      const embed = new Embed()
        .setColor(client.config.color)
        .setDescription(`**♪ | Now playing:** [${song.title}](${song.uri})`)
        .addFields(
          {
            name: "Duration",
            value: `\`${pms(player.position, { colonNotation: true })} / ${pms(
              player.queue.current.duration,
              { colonNotation: true }
            )}\``,
            inline: true,
          },
          {
            name: "Volume",
            value: `\`${player.volume}\``,
            inline: true,
          },
          {
            name: "Total Tracks",
            value: `\`${player.queue.totalSize - 1}\``,
            colonNotation: true,
            inline: true,
          }
        );
      await interaction.editReply({
        embeds: [embed],
      });
    } else {
      const mapping = player.queue.map(
        (t, i) => `\` ${++i} \` [${t.title}](${t.uri}) [${t.requester}]`
      );
      const chunk = load.chunk(mapping, 5);
      const pages = chunk.map((s) => s.join("\n"));
      let page = interaction.options.getNumber("page");
      if (!page) page = 0;
      if (page) page = page - 1;
      if (page > pages.length) page = 0;
      if (page < 0) page = 0;

      if (player.queue.size < 5 || player.queue.totalSize < 5) {
        let song = player.queue.current;
        const embedTwo = new Embed()
          .setColor(client.config.color)
          .setDescription(
            `**♪ | Now playing:** [${song.title}](${song.uri}) [${player.queue.current.requester}]\n\n**Queued Tracks**\n${pages[page]}`
          )
          .addFields(
            {
              name: "Track Duration",
              value: `\`${pms(player.position, {
                colonNotation: true,
              })} / ${pms(player.queue.current.duration, {
                colonNotation: true,
              })}\``,
              inline: true,
            },
            {
              name: "Total Tracks Duration",
              value: `\`${pms(player.queue.duration, {
                colonNotation: true,
              })}\``,
              inline: true,
            },
            {
              name: "Total Tracks",
              value: `\`${player.queue.totalSize - 1}\``,
              colonNotation: true,
              inline: true,
            }
          )
          .setFooter({
            text: `Page ${page + 1}/${pages.length}`,
          });

        await interaction
          .editReply({
            embeds: [embedTwo],
          })
          .catch(() => {});
      } else {
        let song = player.queue.current;
        const embedThree = new Embed()
          .setColor(client.config.color)
          .setDescription(
            `**♪ | Now playing:** [${song.title}](${song.uri}) [${player.queue.current.requester}]\n\n**Queued Tracks**\n${pages[page]}`
          )
          .addFields(
            {
              name: "Track Duration",
              value: `\`${pms(player.position, {
                colonNotation: true,
              })} / ${pms(player.queue.current.duration, {
                colonNotation: true,
              })}\``,
              inline: true,
            },
            {
              name: "Total Tracks Duration",
              value: `\`${pms(player.queue.duration, {
                colonNotation: true,
              })}\``,
              inline: true,
            },
            {
              name: "Total Tracks",
              value: `\`${player.queue.totalSize - 1}\``,
              colonNotation: true,
              inline: true,
            }
          )
          .setFooter({
            text: `Page ${page + 1}/${pages.length}`,
          });
        const buttons_page = new ActionRow().addComponents(
        new ButtonComponent()
          .setCustomId("queue_2")
          .setEmoji({name : '⏮️'})
          .setStyle(ButtonStyle.Primary),
          new ButtonComponent()
          .setCustomId("queue_1")
          .setEmoji({name : '⏭️'})
          .setStyle(ButtonStyle.Primary),
          )

        await interaction
          .editReply({
            embeds: [embedThree],
            components: [buttons_page]
          })
          .catch(() => {});

        const collector = interaction.channel.createMessageComponentCollector({
          filter: (b) => {
            if (b.user.id === interaction.user.id) return true;
            else
              return b
                .reply({
                  content: `Only **${interaction.user.tag}** can use this button.`,
                  ephemeral: true,
                })
                .catch(() => {});
          },
          time: 60000 * 5,
          idle: 30e3,
        });

        collector.on("collect", async (button) => {
          if (button.customId === "queue_1") {
            await button.deferUpdate().catch(() => {});
            page = page + 1 < pages.length ? ++page : 0;

            const embedFour = new Embed()
              .setColor(client.config.color)
              .setDescription(
                `**♪ | Now playing:** [${song.title}](${song.uri}) [${player.queue.current.requester}]\n\n**Queued Tracks**\n${pages[page]}`
              )
              .addFields(
                {
                  name: "Track Duration",
                  value: `\`${pms(player.position, {
                    colonNotation: true,
                  })} / ${pms(player.queue.current.duration, {
                    colonNotation: true,
                  })}\``,
                  inline: true,
                },
                {
                  name: "Total Tracks Duration",
                  value: `\`${pms(player.queue.duration, {
                    colonNotation: true,
                  })}\``,
                  inline: true,
                },
                {
                  name: "Total Tracks",
                  value: `\`${player.queue.totalSize - 1}\``,
                  colonNotation: true,
                  inline: true,
                }
              )
              .setFooter({
                text: `Page ${page + 1}/${pages.length}`,
              });

            await interaction.editReply({
              embeds: [embedFour],
              components: [
                buttons_page,
              ],
            });
          } else if (button.customId === "queue_2") {
            await button.deferUpdate().catch(() => {});
            page = page > 0 ? --page : pages.length - 1;

            const embedFive = new Embed()
              .setColor(client.config.color)
              .setDescription(
                `**♪ | Now playing:** [${song.title}](${song.uri}) [${player.queue.current.requester}]\n\n**Queued Tracks**\n${pages[page]}`
              )
              .addFields(
                {
                  name: "Track Duration",
                  value: `\`${pms(player.position, {
                    colonNotation: true,
                  })} / ${pms(player.queue.current.duration, {
                    colonNotation: true,
                  })}\``,
                  inline: true,
                },
                {
                  name: "Total Tracks Duration",
                  value: `\`${pms(player.queue.duration, {
                    colonNotation: true,
                  })}\``,
                  inline: true,
                },
                {
                  name: "Total Tracks",
                  value: `\`${player.queue.totalSize - 1}\``,
                  colonNotation: true,
                  inline: true,
                }
              )
              .setFooter({
                text: `Page ${page + 1}/${pages.length}`,
              });

            await interaction
              .editReply({
                embeds: [embedFive],
                components: [
                  buttons_page,
                ],
              })
              .catch(() => {});
          } else return;
        });
      }
    }
  });
module.exports = command;
