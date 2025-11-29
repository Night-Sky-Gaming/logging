const { Events } = require('discord.js');

module.exports = {
	name: Events.InviteDelete,
	async execute(invite) {
		const guildMemberAddModule = require('./guildMemberAdd.js');
		const invites = guildMemberAddModule.invites;
		const processingJoins = guildMemberAddModule.processingJoins;
		
		// Wait if a member join is being processed for this guild
		if (processingJoins.has(invite.guild.id)) {
			console.log(`[LOGGING] Delaying invite cache update (join in progress) - invite deleted: ${invite.code}`);
			await new Promise(resolve => setTimeout(resolve, 2000));
		}
		
		try {
			const guildInvites = await invite.guild.invites.fetch();
			invites.set(invite.guild.id, new Map(guildInvites.map(inv => [inv.code, inv])));
			console.log(`[LOGGING] Updated invite cache - invite deleted: ${invite.code}`);
		}
		catch (error) {
			console.error('[LOGGING] Error updating invite cache on delete:', error);
		}
	},
};
