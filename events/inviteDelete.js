const { Events } = require('discord.js');

module.exports = {
	name: Events.InviteDelete,
	async execute(invite) {
		const guildMemberAddModule = require('./guildMemberAdd.js');
		const invites = guildMemberAddModule.invites;
		
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
