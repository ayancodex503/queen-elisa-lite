// commands/menu.js - VERSÃO SIMPLES
import config from "../config.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function menuCommand(message, client) {
  try {
    const remoteJid = message.key.remoteJid;
    const sender = message.key.participant || remoteJid;
    
    // Read commands
    const commandsPath = path.join(__dirname);
    const commandFiles = fs.readdirSync(commandsPath)
      .filter(file => file.endsWith('.js') && file !== 'menu.js' && file !== 'react.js');
    
    const commands = commandFiles.map(file => file.replace('.js', '')).sort();
    
    // Bot info
    const botName = config.BotName || "QUEEN ELISA LITE";
    const ownerNumber = config.owner || "Not set";
    const ownerName = config.nameCreator || "AYAN CODEX";
    const botMode = config.mode || "public";
    
    // Build menu
    let menuText = `╭─────────────━┈⊷
│ ✪⏤͟͞★⃝ꪶ${botName}𖥘✪͜͡➺
│📍 ᴠᴇʀꜱɪᴏɴ: 2.0.0
│👨‍💻 ᴏᴡɴᴇʀ : *✪⏤͟͞★⃝ꪶ${ownerName}𖥘✪͜͡➺*      
│👤 ɴᴜᴍʙᴇʀ: ${ownerNumber}
│📡 ᴘʟᴀᴛғᴏʀᴍ: *${os.platform()}*
│🛡 ᴍᴏᴅᴇ: *${botMode}*
│💫 ᴘʀᴇғɪx: [ . ]
╰─────────────━┈⊷ `;
    
    // Add available commands
    menuText += `\n╭━❮ ✪⏤͟͞★⃝ꪶAVAILABLE COMMANDS𖥘✪͜͡➺ ❯━╮`;
    commands.forEach(cmd => {
      menuText += `\n┃✰ ${cmd}`;
    });
    menuText += `\n╰━━━━━━━━━━━━━━━⪼`;
    
    // Footer
    menuText += `\n\n📊 *Total:* ${commands.length} commands`;
    menuText += `\n👤 *User:* @${sender.split('@')[0]}`;
    menuText += `\n> *${ownerName}*`;
    
    // Send only menu
    await client.sendMessage(remoteJid, {
      image: { url: "https://files.catbox.moe/k3u0g1.mp3" },
      caption: menuText,
      mentions: [sender]
    });
    
  } catch (err) {
    console.error("Menu error:", err);
  }
}