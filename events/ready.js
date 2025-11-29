const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		console.log('[LOGGING] Bellatrix logging bot is now online and monitoring server activity.');
		
		// Cache invites for all guilds
		const guildMemberAddModule = require('./guildMemberAdd.js');
		for (const guild of client.guilds.cache.values()) {
			try {
				const invites = await guild.invites.fetch();
				guildMemberAddModule.invites.set(guild.id, new Map(invites.map(inv => [inv.code, inv])));
				console.log(`[LOGGING] Cached ${invites.size} invites for guild: ${guild.name}`);
			}
			catch (error) {
				console.error(`[LOGGING] Error caching invites for ${guild.name}:`, error.message);
			}
		}
	},
};
