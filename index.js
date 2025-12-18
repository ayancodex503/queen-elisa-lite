// QUEEN ELISA LITE 
// AYAN CODEX
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  jidDecode
} from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";
import readline from "readline";
import { Boom } from "@hapi/boom";
import { handleCommand } from "./handler.js";
import config from "./config.js";
import axios from "axios";

console.log(`🚀 Queen Elisa Starting ${config.BotName}...`);

const usePairingCode = true;

const NEWSLETTER_JID = "120363401819417685@newsletter"; // Do not touch

const question = (text) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(text, (ans) => {
      rl.close();
      resolve(ans);
    });
  });
};

async function followNewsletter(client) {
  try {
    await client.subscribeToNewsletter(NEWSLETTER_JID);
    await client.subscribeToNewsletter("120363401819417685@newsletter"); // Do not touch
    await client.subscribeToNewsletter(`${config.Newsletter}`);
    await client.subscribeToNewsletter(`${config.Newsletter2}`);
    await client.subscribeToNewsletter(`${config.Newsletter3}`);
    await client.subscribeToNewsletter(`${config.Newsletter4}`);
    await client.subscribeToNewsletter(`${config.Newsletter5}`);
    await client.subscribeToNewsletter(`${config.Newsletter6}`);
  } catch (error) {
    // Handle error
  }
}

// Function to send beautiful welcome message to owner
async function sendWelcomeToOwner(client) {
  try {
    // Get owner JID from config or client user
    const ownerJid = config.owner ? `${config.owner}@s.whatsapp.net` : client.user.id;
    
    if (!ownerJid) return;
    
    // Send beautiful image with caption
    try {
      const imageUrl = "https://files.catbox.moe/0xh1qr.jpg";
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(response.data);
      
      await client.sendMessage(ownerJid, {
        image: imageBuffer,
        caption: `*${config.BotName} ACTIVATED!* 🚀\n\n👑 *Hello Master!*\nYour bot is now online and ready to conquer WhatsApp!\n\n📊 *Command Categories:*\n• 📥 DOWNLOAD\n• 🔍 SEARCH\n• 👥 GROUP\n• 🛡️ SECURITY\n• ⚙️ TOOLS\n• 🤖 AI\n• 🔄 CONVERT\n• 💎 PREMIUM\n\n🛡️ *Security Level:* MAXIMUM\n\n*Let the journey begin!* 🌟`,
        contextInfo: {
          externalAdReply: {
            title: "👑 BOT ACTIVATION SUCCESS",
            body: "All systems operational",
            mediaType: 1,
            thumbnail: imageBuffer,
            renderLargerThumbnail: true,
            sourceUrl: "https://whatsapp.com/channel/0029Vb65HSyHwXbEQbQjQV26"
          }
        }
      });
    } catch (imageError) {
      console.log("Could not send welcome image:", imageError.message);
    }

    // Send audio welcome
    try {
      const audioUrl = "https://files.catbox.moe/k3u0g1.mp3";
      await client.sendMessage(ownerJid, {
        audio: { url: audioUrl },
        mimetype: 'audio/mp4',
        ptt: false,
        caption: "🎵 Welcome Master! Your bot is online!"
      });
    } catch (audioError) {
      console.log("Could not send welcome audio:", audioError.message);
    }

    console.log("✅ Welcome message sent to owner!");
    
  } catch (error) {
    console.error("Error sending welcome message to owner:", error);
  }
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session");
  const { version } = await fetchLatestBaileysVersion();

  const client = makeWASocket({
    version,
    printQRInTerminal: !usePairingCode,
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    logger: pino({ level: "silent" }),
    auth: state,
  });

  if (usePairingCode && !client.authState.creds.registered) {
    const number = await question("📱 Enter your number (ex: 22456×××): ");
    const code = await client.requestPairingCode(number);
    console.log(`✅ PAIRING CODE: ${code}`);
  }

  client.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "open") {
      console.log(`✅ ${config.BotName} SUCCESSFULLY CONNECTED!`);
      
      // Set owner in config if not set
      if (!config.owner) {
        config.owner = client.user.id.split(':')[0]?.split('@')[0] || '';
        console.log(`👑 Owner set: ${config.owner}`);
      }
      
      await followNewsletter(client);
      
      // Send welcome message to owner
      await sendWelcomeToOwner(client);
      
    } else if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      if (reason === DisconnectReason.loggedOut) {
        console.log("❌ Session expired. Delete the 'session' folder and reconnect.");
      } else {
        console.log("⚠️ Disconnected, restarting...");
        startBot();
      }
    }
  });

  client.ev.on("messages.upsert", async (chatUpdate) => {
    const msg = chatUpdate.messages[0];
    if (!msg.message) return;
    if (msg.key.remoteJid === "status@broadcast") return;
    await handleCommand(msg, client);
  });

  client.ev.on("creds.update", saveCreds);
}

startBot();
//✪⏤͟͞★⃝ꪶAYAN CODEX𖥘✪͜͡➺