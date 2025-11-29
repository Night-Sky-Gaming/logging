const { Events, EmbedBuilder } = require('discord.js');
const { loggingChannelId } = require('../config.json');

// Store invites to track who used which invite
const invites = new Map();

// Store member join data (timestamps and roles) for when they leave
const memberJoinData = new Map();

module.exports = {
	name: Events.GuildMemberAdd,
	invites, // Export invites Map for ready.js to initialize
	memberJoinData, // Export for guildMemberRemove to access
	async execute(member) {
		const loggingChannel = member.guild.channels.cache.get(loggingChannelId);

		if (!loggingChannel) {
			console.error('[LOGGING] Logging channel not found!');
			return;
		}

		// Find who invited the member by comparing invite uses
		let inviter = null;
		let inviteCode = null;
		try {
			const newInvites = await member.guild.invites.fetch();
			const oldInvites = invites.get(member.guild.id);
			
			console.log(`[LOGGING] Checking invites - Old cache has ${oldInvites?.size || 0} invites, New fetch has ${newInvites.size} invites`);
			
			if (oldInvites) {
				const usedInvite = newInvites.find(inv => {
					const oldInv = oldInvites.get(inv.code);
					if (oldInv && inv.uses > oldInv.uses) {
						console.log(`[LOGGING] Found used invite: ${inv.code} (${oldInv.uses} -> ${inv.uses})`);
						return true;
					}
					return false;
				});
				
				if (usedInvite) {
					inviter = usedInvite.inviter;
					inviteCode = usedInvite.code;
					console.log(`[LOGGING] Inviter: ${inviter?.tag}, Code: ${inviteCode}`);
				}
				else {
					console.log(`[LOGGING] No matching invite found with increased uses`);
				}
			}
			else {
				console.log(`[LOGGING] No old invite cache found for guild ${member.guild.name}`);
			}
			
			// Update the invite cache
			invites.set(member.guild.id, new Map(newInvites.map(inv => [inv.code, inv])));
		}
		catch (error) {
			console.error('[LOGGING] Error fetching invites:', error);
		}

		// Store member join data for when they leave
		const joinDataKey = `${member.guild.id}-${member.user.id}`;
		memberJoinData.set(joinDataKey, {
			joinedAt: member.joinedAt,
			roles: member.roles.cache.map(role => role.name).filter(name => name !== '@everyone'),
		});

		const inviteInfo = inviter ? `${inviter.tag}${inviteCode ? ` (${inviteCode})` : ''}` : 'Unknown / Vanity URL';
		
		const embed = new EmbedBuilder()
			.setTitle('📥 Member Joined')
			.setColor(0x00ff00)
			.setThumbnail(member.user.displayAvatarURL())
			.addFields(
				{ name: 'User', value: `${member.user.tag}`, inline: true },
				{ name: 'User ID', value: `${member.user.id}`, inline: true },
				{ name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: false },
				{ name: 'Invited By', value: inviteInfo, inline: true },
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
