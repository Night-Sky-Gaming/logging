const { Events, EmbedBuilder } = require('discord.js');
const { loggingChannelId } = require('../config.json');

module.exports = {
	name: Events.GuildMemberRemove,
	async execute(member) {
		const loggingChannel = member.guild.channels.cache.get(loggingChannelId);

		if (!loggingChannel) {
			console.error('[LOGGING] Logging channel not found!');
			return;
		}

		const embed = new EmbedBuilder()
			.setTitle('📤 Member Left')
			.setColor(0xff0000)
			.setThumbnail(member.user.displayAvatarURL())
			.addFields(
				{ name: 'User', value: `${member.user.tag}`, inline: true },
				{ name: 'User ID', value: `${member.user.id}`, inline: true },
				{ name: 'Joined Server', value: member.joinedAt ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Unknown', inline: false },
				{ name: 'Roles', value: member.roles.cache.filter(role => role.name !== '@everyone').map(role => role.name).join(', ') || 'None', inline: false },
				{ name: 'Member Count', value: `${member.guild.memberCount}`, inline: true },
			)
			.setFooter({ text: `ID: ${member.user.id}` })
			.setTimestamp();

		try {
			await loggingChannel.send({ embeds: [embed] });
			console.log(`[LOGGING] Member left: ${member.user.tag}`);
		}
		catch (error) {
			console.error('[LOGGING] Error sending member leave log:', error);
		}
	},
};
