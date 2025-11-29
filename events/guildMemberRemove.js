const { Events, EmbedBuilder } = require('discord.js');
const { loggingChannelId } = require('../config.json');

module.exports = {
	name: Events.GuildMemberRemove,
	async execute(member) {
		console.log('[LOGGING] GuildMemberRemove event triggered for:', member.user?.tag || member.id);
		
		const loggingChannel = member.guild?.channels.cache.get(loggingChannelId);

		if (!loggingChannel) {
			console.error('[LOGGING] Logging channel not found!');
			return;
		}

		// Get stored member join data
		const guildMemberAddModule = require('./guildMemberAdd.js');
		const memberJoinData = guildMemberAddModule.memberJoinData;
		const joinDataKey = `${member.guild.id}-${member.user.id}`;
		const storedData = memberJoinData.get(joinDataKey);

		// Handle partial members (members not cached)
		const userTag = member.user?.tag || 'Unknown User';
		const userId = member.user?.id || member.id || 'Unknown';
		const avatarURL = member.user?.displayAvatarURL() || null;
		
		// Use stored join data if available, otherwise try member object
		const joinedTime = storedData?.joinedAt 
			? `<t:${Math.floor(storedData.joinedAt.getTime() / 1000)}:R>` 
			: (member.joinedAt ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Unknown');
		
		const rolesList = storedData?.roles?.length 
			? storedData.roles.join(', ') 
			: (member.roles?.cache ? member.roles.cache.filter(role => role.name !== '@everyone').map(role => role.name).join(', ') || 'None' : 'Unknown');

		const embed = new EmbedBuilder()
			.setTitle('📤 Member Left')
			.setColor(0xff0000)
			.addFields(
				{ name: 'User', value: userTag, inline: true },
				{ name: 'User ID', value: userId, inline: true },
				{ name: 'Joined Server', value: joinedTime, inline: false },
				{ name: 'Roles', value: rolesList, inline: false },
				{ name: 'Member Count', value: `${member.guild.memberCount}`, inline: true },
			)
			.setFooter({ text: `ID: ${userId}` })
			.setTimestamp();

		if (avatarURL) {
			embed.setThumbnail(avatarURL);
		}

		try {
			await loggingChannel.send({ embeds: [embed] });
			console.log(`[LOGGING] Member left: ${userTag}`);
			
			// Clean up stored data
			if (storedData) {
				memberJoinData.delete(joinDataKey);
				console.log(`[LOGGING] Cleaned up join data for ${userTag}`);
			}
		}
		catch (error) {
			console.error('[LOGGING] Error sending member leave log:', error);
		}
	},
};
