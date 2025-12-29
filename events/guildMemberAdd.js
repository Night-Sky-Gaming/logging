const { Events, EmbedBuilder } = require('discord.js');

// Store invites to track who used which invite
const invites = new Map();

// Store member join data (timestamps and roles) for when they leave
const memberJoinData = new Map();

// Flag to prevent invite cache updates during member join processing
const processingJoins = new Set();

module.exports = {
	name: Events.GuildMemberAdd,
	invites, // Export invites Map for ready.js to initialize
	memberJoinData, // Export for guildMemberRemove to access
	processingJoins, // Export to prevent concurrent updates
	async execute(member) {
		const loggingChannel = member.guild.channels.cache.get('1450971336200683656');

		if (!loggingChannel) {
			console.error('[LOGGING] Logging channel not found!');
			return;
		}

		// Mark this guild as processing a join
		processingJoins.add(member.guild.id);

		// Store member join data IMMEDIATELY for when they leave
		const joinDataKey = `${member.guild.id}-${member.user.id}`;
		memberJoinData.set(joinDataKey, {
			joinedAt: member.joinedAt,
			roles: member.roles.cache.map(role => role.name).filter(name => name !== '@everyone'),
		});
		console.log(`[LOGGING] Stored join data for ${member.user.tag}`);

		// Find who invited the member by comparing invite uses
		let inviter = null;
		let inviteCode = null;
		let inviteReason = null; // Track why we couldn't find the inviter
		
		try {
			const newInvites = await member.guild.invites.fetch();
			const oldInvites = invites.get(member.guild.id);
			
			console.log(`[LOGGING] Checking invites - Old cache has ${oldInvites?.size || 0} invites, New fetch has ${newInvites.size} invites`);
			
			// Debug: Log all invites in both caches
			if (oldInvites) {
				console.log('[LOGGING] Old cache invites:');
				oldInvites.forEach(inv => console.log(`  - ${inv.code}: ${inv.uses} uses, inviter: ${inv.inviter?.tag || 'Unknown'}`));
			}
			console.log('[LOGGING] New fetch invites:');
			newInvites.forEach(inv => console.log(`  - ${inv.code}: ${inv.uses} uses, inviter: ${inv.inviter?.tag || 'Unknown'}`));
			
			if (oldInvites) {
				// First, check for invites with increased use count
				let usedInvite = newInvites.find(inv => {
					const oldInv = oldInvites.get(inv.code);
					if (oldInv && inv.uses > oldInv.uses) {
						console.log(`[LOGGING] Found used invite: ${inv.code} (${oldInv.uses} -> ${inv.uses})`);
						return true;
					}
					return false;
				});
				
				// If no increased uses found, check for newly created invites that now have 1 use
				if (!usedInvite) {
					usedInvite = newInvites.find(inv => {
						const oldInv = oldInvites.get(inv.code);
						// New invite (not in old cache) with 1 use, OR invite in old cache with 0 uses now has 1
						if ((!oldInv && inv.uses === 1) || (oldInv && oldInv.uses === 0 && inv.uses === 1)) {
							console.log(`[LOGGING] Found newly created invite that was used: ${inv.code} (uses: ${inv.uses})`);
							return true;
						}
						return false;
					});
				}
				
				// If still no match, check for invites that existed in old cache but are now missing (deleted after use)
				if (!usedInvite) {
					for (const [code, oldInv] of oldInvites.entries()) {
						if (!newInvites.has(code)) {
							console.log(`[LOGGING] Found deleted invite that was likely used: ${code} (was in old cache, now deleted)`);
							usedInvite = oldInv;
							break;
						}
					}
				}
				
				if (usedInvite) {
					inviter = usedInvite.inviter;
					inviteCode = usedInvite.code;
					console.log(`[LOGGING] Inviter: ${inviter?.tag}, Code: ${inviteCode}`);
				} else {
					console.log(`[LOGGING] No matching invite found with increased uses`);
					// Check if server has vanity URL
					if (member.guild.vanityURLCode) {
						inviteReason = 'Vanity URL';
					} else {
						inviteReason = 'Unknown (likely pre-existing invite)';
					}
				}
			} else {
				console.log(`[LOGGING] No old invite cache found for guild ${member.guild.name}`);
				inviteReason = 'Cache not initialized';
			}
			
			// Update the invite cache
			invites.set(member.guild.id, new Map(newInvites.map(inv => [inv.code, inv])));
			
			// Clear processing flag
			processingJoins.delete(member.guild.id);
		}
		catch (error) {
			console.error('[LOGGING] Error fetching invites:', error);
			processingJoins.delete(member.guild.id);
			inviteReason = 'Error fetching invites';
		}

		const inviteInfo = inviter ? `${inviter.tag}${inviteCode ? ` (${inviteCode})` : ''}` : inviteReason || 'Unknown';
		
		// Check if account is less than 30 days old
		const accountAge = Date.now() - member.user.createdTimestamp;
		const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
		const isSuspicious = accountAge < thirtyDaysInMs;
		
		const embed = new EmbedBuilder()
			.setTitle('📥 Member Joined')
			.setColor(isSuspicious ? 0xffa500 : 0x00ff00)
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

		// Add warning field if account is suspicious
		if (isSuspicious) {
			const daysOld = Math.floor(accountAge / (24 * 60 * 60 * 1000));
			embed.addFields(
				{ name: '⚠️ Warning', value: `Account is only ${daysOld} day(s) old! Please review before accepting.`, inline: false },
			);
		}

		try {
			await loggingChannel.send({ embeds: [embed] });
			console.log(`[LOGGING] Member joined: ${member.user.tag}${isSuspicious ? ' (SUSPICIOUS - Account < 30 days old)' : ''}`);
		}
		catch (error) {
			console.error('[LOGGING] Error sending member join log:', error);
		}
	},
};
