# logging
### Bellatrix - Logging bot for Andromeda Gaming

## Overview
Bellatrix is a Discord bot that monitors and logs server activity for Andromeda Gaming. It tracks member joins/leaves, message edits, and message deletions.

## Features
- 📥 **Member Join Logging** - Logs when members join with detailed user information
- 📤 **Member Leave Logging** - Logs when members leave with role and join date information
- ✏️ **Message Edit Logging** - Logs message edits with before/after content
- 🗑️ **Message Delete Logging** - Logs deleted messages with content and attachments

## Configuration

### Setup Instructions
1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure the bot token:
   - Open `config.json`
   - Replace `YOUR_BOT_TOKEN_HERE` with your actual Discord bot token
   - The bot token can be found in the [Discord Developer Portal](https://discord.com/developers/applications)
   - Navigate to your application → Bot → Token → Reset Token (or Copy if visible)

3. The following values are already configured:
   - **Client ID**: `1444104414364172410`
   - **Guild ID**: `1430038605518077964`
   - **Logging Channel ID**: `1444466700006461564`

### Running the Bot
```bash
npm start
```

## Bot Permissions
The bot requires the following permissions:
- View Channels
- Send Messages
- Embed Links
- Read Message History
- View Server Members

## Bot Intents
The bot uses the following intents:
- `Guilds` - Access to guild information
- `GuildMembers` - Track member joins and leaves
- `GuildMessages` - Monitor message events
- `MessageContent` - Read message content for logging

## Project Structure
```
logging/
├── events/
│   ├── ready.js                 # Bot ready event
│   ├── interactionCreate.js     # Command handler
│   ├── guildMemberAdd.js        # Member join logging
│   ├── guildMemberRemove.js     # Member leave logging
│   ├── messageUpdate.js         # Message edit logging
│   └── messageDelete.js         # Message delete logging
├── config.json                  # Bot configuration (token goes here)
├── index.js                     # Main bot file
├── package.json                 # Dependencies
└── README.md                    # This file
```

## Where to Enter Your Bot Token
**Important**: Open `config.json` and replace `YOUR_BOT_TOKEN_HERE` with your actual bot token:

```json
{
  "clientId": "1444104414364172410",
  "guildId": "1430038605518077964",
  "token": "YOUR_BOT_TOKEN_HERE",  ← Replace this value
  "loggingChannelId": "1444466700006461564"
}
```

⚠️ **Never commit your bot token to version control!** The `.gitignore` file is configured to exclude `config.json`.
Logging bot for Andromeda Gaming
