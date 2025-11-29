const { Events } = require('discord.js');

module.exports = {
	name: Events.InviteCreate,
	async execute(invite) {
		// Delay to allow member join event to process first
		await new Promise(resolve => setTimeout(resolve, 1000));
		
		const guildMemberAddModule = require('./guildMemberAdd.js');
		const invites = guildMemberAddModule.invites;
		
		try {
			const guildInvites = await invite.guild.invites.fetch();
			invites.set(invite.guild.id, new Map(guildInvites.map(inv => [inv.code, inv])));
			console.log(`[LOGGING] Updated invite cache - new invite created: ${invite.code}`);
		}
		catch (error) {
			console.error('[LOGGING] Error updating invite cache on create:', error);
		}
	},
};
