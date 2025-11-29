const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const { loggingChannelId } = require('../config.json');

module.exports = {
	name: Events.GuildMemberAdd,
	async execute(member) {
		const loggingChannel = member.guild.channels.cache.get(loggingChannelId);

		if (!loggingChannel) {
			console.error('[LOGGING] Logging channel not found!');
			return;
		}

		// Fetch audit logs to find who invited the member
		let inviter = null;
		try {
			const fetchedLogs = await member.guild.fetchAuditLogs({
				limit: 1,
				type: AuditLogEvent.BotAdd,
			});
			const auditEntry = fetchedLogs.entries.first();
			if (auditEntry && auditEntry.target.id === member.id) {
				inviter = auditEntry.executor;
			}
		}
		catch (error) {
			console.error('[LOGGING] Error fetching audit logs:', error);
		}

		const embed = new EmbedBuilder()
			.setTitle('📥 Member Joined')
			.setColor(0x00ff00)
			.setThumbnail(member.user.displayAvatarURL())
			.addFields(
				{ name: 'User', value: `${member.user.tag}`, inline: true },
				{ name: 'User ID', value: `${member.user.id}`, inline: true },
				{ name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: false },
				{ name: 'Invited By', value: inviter ? `${inviter.tag}` : 'Unknown', inline: true },
				{ name: 'Member Count', value: `${member.guild.memberCount}`, inline: true },
			)
			.setFooter({ text: `ID: ${member.user.id}` })
			.setTimestamp();

		try {
			await loggingChannel.send({ embeds: [embed] });
			console.log(`[LOGGING] Member joined: ${member.user.tag}`);
		}
		catch (error) {
			console.error('[LOGGING] Error sending member join log:', error);
		}
	},
};
