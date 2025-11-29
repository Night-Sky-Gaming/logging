const { Events, EmbedBuilder } = require('discord.js');
const { loggingChannelId } = require('../config.json');

module.exports = {
	name: Events.MessageDelete,
	async execute(message) {
		// Ignore bot messages
		if (message.author?.bot) return;

		const loggingChannel = message.guild.channels.cache.get(loggingChannelId);

		if (!loggingChannel) {
			console.error('[LOGGING] Logging channel not found!');
			return;
		}

		const embed = new EmbedBuilder()
			.setTitle('🗑️ Message Deleted')
			.setColor(0xff0000)
			.setThumbnail(message.author?.displayAvatarURL())
			.addFields(
				{ name: 'Author', value: message.author ? `${message.author.tag}` : 'Unknown', inline: true },
				{ name: 'User ID', value: message.author ? `${message.author.id}` : 'Unknown', inline: true },
				{ name: 'Channel', value: `${message.channel}`, inline: true },
				{ name: 'Content', value: message.content ? (message.content.length > 1024 ? message.content.substring(0, 1021) + '...' : message.content) : '*Empty message or not cached*', inline: false },
			)
			.setFooter({ text: `Message ID: ${message.id}` })
			.setTimestamp();

		// Add attachment info if any
		if (message.attachments.size > 0) {
			const attachmentList = message.attachments.map(att => `[${att.name}](${att.url})`).join('\n');
			embed.addFields({ name: 'Attachments', value: attachmentList, inline: false });
		}

		try {
			await loggingChannel.send({ embeds: [embed] });
			console.log(`[LOGGING] Message deleted by ${message.author?.tag || 'Unknown'} in #${message.channel.name}`);
		}
		catch (error) {
			console.error('[LOGGING] Error sending message delete log:', error);
		}
	},
};
