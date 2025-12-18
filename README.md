🤖 QUEEN ELISA LITE WhatsApp Bot

<div align="center">

https://files.catbox.moe/0xh1qr.jpg

A powerful, feature-rich WhatsApp bot built with @whiskeysockets/baileys

https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js
https://img.shields.io/badge/Baileys-6.0%2B-orange
https://img.shields.io/badge/License-MIT-blue
https://img.shields.io/badge/Version-2.0.0-brightgreen

</div>

✨ Features

📥 Download Media

· TikTok videos (no watermark)
· Facebook videos
· Instagram posts/stories
· YouTube videos/music
· Spotify tracks
· SoundCloud tracks
· Pinterest images

👥 Group Management

· Auto promote/demote
· Welcome/Goodbye messages
· Anti-spam protection
· Link protection
· Member management tools
· Group info display

🎨 Creative Tools

· 20+ fancy text styles
· Sticker creation
· Image editing
· Quote generation
· Text effects
· Font customization

⚙️ Utilities

· AI Chat (GPT/Gemini)
· Weather information
· Calculator
· Reminders
· QR Code generator
· File conversion
· System monitoring

🛡️ Security

· Session encryption
· User verification
· Rate limiting
· Anti-virus scanning
· Owner-only commands
· Private mode option

🚀 Quick Start

Prerequisites

· Node.js 18 or higher
· npm or yarn
· WhatsApp account
· Stable internet connection

Installation

```bash
# Clone the repository
git clone https://github.com/ayancodex503/queen-elisa-lite.git
cd queen-elisa-lite

# Install dependencies
npm install

# Configure the bot
# Edit config.js with your information

# Start the bot
npm start
```

Configuration

Edit config.js:

```javascript
export default {
  BotName: "Queen Elisa Lite",
  owner: "258833406646",  // Your WhatsApp number
  nameCreator: "Ayan Codex",
  mode: "public",  // public or private
  
  // Newsletter channels
  Newsletter: "120363401819417685@newsletter",
  Newsletter2: "120363401819417685@newsletter",
  
  // API configurations
  apiKeys: {
    // Add your API keys here
  }
};
```

📋 Command List

Main Commands

Command Description Example
.menu Show all commands .menu
.ping Check bot latency .ping
.owner Contact owner .owner
.channel Join channel .channel

Download Commands

Command Description Example
.tiktok Download TikTok .tiktok <url>
.facebook Download FB video .facebook <url>
.instagram Download IG post .instagram <url>
.play Download music .play <song>
.video Download YouTube video .video <query>

Group Commands

Command Description Example
.tagall Mention all members .tagall
.tag Tag with message .tag hello
.promote Promote to admin .promote @user
.demote Demote from admin .demote @user

Creative Commands

Command Description Example
.fancy Text styling .fancy 4 Hello
.sticker Create sticker .sticker (reply to image)
.quote Generate quote .quote

Owner Commands

Command Description Example
.mode Change bot mode .mode private
.broadcast Broadcast message .broadcast Hello
.restart Restart bot .restart
.updatecmd Reload commands .updatecmd reload

🏗️ Project Structure

```
queen-elisa-lite/
├── commands/           # All bot commands
│   ├── tiktok.js      # TikTok downloader
│   ├── facebook.js    # Facebook downloader
│   ├── instagram.js   # Instagram downloader
│   ├── menu.js        # Menu command
│   ├── ping.js        # Ping command
│   ├── tag.js         # Tag command
│   ├── tagall.js      # Tag all command
│   ├── fancy.js       # Fancy text
│   ├── play.js        # Music player
│   ├── video.js       # Video downloader
│   ├── updatecmd.js   # Update commands
│   ├── kamui.js       # Security command
│   └── channelsender.js # Channel sender
├── lib/               # Utility libraries
├── session/           # WhatsApp session data
├── config.js          # Configuration file
├── handler.js         # Command handler
├── index.js           # Main bot file
├── package.json       # Dependencies
└── README.md          # This file
```

🔧 Advanced Setup

Environment Variables

Create a .env file:

```env
BOT_NAME="Queen Elisa Lite"
BOT_OWNER="258833406646"
NODE_ENV="production"
PORT=3000
```

Docker Deployment

```bash
# Build Docker image
docker build -t queen-elisa-lite .

# Run container
docker run -d --name queen-bot queen-elisa-lite
```

PM2 Process Manager

```bash
# Install PM2 globally
npm install -g pm2

# Start bot with PM2
pm2 start index.js --name "queen-elisa"

# Monitor bot
pm2 monit

# Auto-start on boot
pm2 startup
pm2 save
```

📊 Performance Monitoring

The bot includes built-in monitoring:

· Real-time logging
· Error tracking
· Performance metrics
· User activity logs
· Command usage statistics

🔒 Security Features

Bot Security

· Encrypted session storage
· Multi-file auth state
· Automatic session backup
· Rate limiting per user
· Command cooldowns

Group Protection

· Anti-link spam
· User verification
· Admin command protection
· Auto-kick malicious users
· Message filtering

🌐 API Integration

Available APIs

· TikTok API: api.vreden.my.id
· Facebook API: api.vreden.my.id
· YouTube API: api.vreden.my.id
· Instagram API: api.delirius.store

Custom API Setup

```javascript
// Example API integration
const apiUrl = `https://api.vreden.my.id/api/v1/download/tiktok?url=${encodedUrl}`;
const response = await axios.get(apiUrl, { 
    timeout: 20000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
    }
});
```

🎨 Customization

Adding New Commands

1. Create a new file in commands/ folder
2. Export a default function
3. Add command logic
4. The bot automatically loads it

Example command template:

```javascript
// commands/example.js
export default async function exampleCommand(message, client) {
    const remoteJid = message.key.remoteJid;
    const text = message.message?.conversation || '';
    
    await client.sendMessage(remoteJid, {
        text: "Hello from new command!"
    });
}
```

Customizing Menu

Edit commands/menu.js to:

· Change categories
· Add/remove commands
· Modify design
· Add custom sections

📱 Supported Platforms

· ✅ WhatsApp Web
· ✅ WhatsApp Desktop
· ✅ WhatsApp Mobile
· ✅ Multi-device beta
· ✅ Newsletter channels

🐛 Troubleshooting

Common Issues

1. Bot not connecting
   · Delete session/ folder
   · Restart the bot
   · Check internet connection
2. Commands not working
   · Check command prefix (.)
   · Verify bot is in group
   · Check command permissions
3. Download failures
   · Check API status
   · Verify URL format
   · Try different quality

Error Logs

Check logs in terminal:

```bash
# View real-time logs
npm start

# Check error logs
tail -f error.log
```

🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch (git checkout -b feature/AmazingFeature)
3. Commit changes (git commit -m 'Add AmazingFeature')
4. Push to branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

Development Guidelines

· Follow existing code style
· Add comments for complex logic
· Test commands before submitting
· Update documentation if needed

📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

👥 Credits

· Developer: Ayan Codex
· Library: @whiskeysockets/baileys
· APIs: Various public APIs
· Contributors: All GitHub contributors

🔗 Links

· GitHub Repository: https://github.com/ayancodex503/queen-elisa-lite
· WhatsApp Channel: https://whatsapp.com/channel/0029Vb65HSyHwXbEQbQjQV26
· Issue Tracker: GitHub Issues
· Discussion: GitHub Discussions

⭐ Support

If you find this project useful, please:

· Give it a star ⭐ on GitHub
· Share with friends
· Contribute improvements
· Report bugs and issues

📞 Contact

For support, questions, or collaboration:

· WhatsApp: +258 83 340 6646
· Email: support@ayancodex503.com
· Telegram: @ayan_codex
· GitHub: ayancodex503

---

<div align="center">

Made with ❤️ by Ayan Codex

If you encounter any issues, please open an issue on GitHub

https://img.shields.io/github/stars/ayancodex503/queen-elisa-lite?style=social
https://img.shields.io/github/forks/ayancodex503/queen-elisa-lite?style=social
https://img.shields.io/github/issues/ayancodex503/queen-elisa-lite

</div>