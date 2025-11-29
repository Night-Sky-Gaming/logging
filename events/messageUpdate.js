const { Events, EmbedBuilder } = require('discord.js');
const { loggingChannelId } = require('../config.json');

module.exports = {
	name: Events.MessageUpdate,
	async execute(oldMessage, newMessage) {
		// Ignore bot messages and messages that weren't actually edited (e.g., embed updates)
		if (newMessage.author.bot) return;
		if (oldMessage.content === newMessage.content) return;

		const loggingChannel = newMessage.guild.channels.cache.get(loggingChannelId);

		if (!loggingChannel) {
			console.error('[LOGGING] Logging channel not found!');
			return;
		}

		const embed = new EmbedBuilder()
			.setTitle('✏️ Message Edited')
			.setColor(0xffa500)
			.setThumbnail(newMessage.author.displayAvatarURL())
			.addFields(
				{ name: 'Author', value: `${newMessage.author.tag}`, inline: true },
				{ name: 'User ID', value: `${newMessage.author.id}`, inline: true },
				{ name: 'Channel', value: `${newMessage.channel}`, inline: true },
				{ name: 'Before', value: oldMessage.content ? (oldMessage.content.length > 1024 ? oldMessage.content.substring(0, 1021) + '...' : oldMessage.content) : '*Empty message*', inline: false },
				{ name: 'After', value: newMessage.content ? (newMessage.content.length > 1024 ? newMessage.content.substring(0, 1021) + '...' : newMessage.content) : '*Empty message*', inline: false },
				{ name: 'Message Link', value: `[Jump to Message](${newMessage.url})`, inline: false },
			)
			.setFooter({ text: `Message ID: ${newMessage.id} | User ID: ${newMessage.author.id}` })
			.setTimestamp();

		try {
			await loggingChannel.send({ embeds: [embed] });
			console.log(`[LOGGING] Message edited by ${newMessage.author.tag} in #${newMessage.channel.name}`);
		}
		catch (error) {
			console.error('[LOGGING] Error sending message edit log:', error);
		}
	},
};
