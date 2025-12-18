import fs from "fs";
import path from "path";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, "config.json");

// Load config (or create a default one)
// Change '2250712668494', leave owner:"empty"
let CONFIG = { owner: "258833406646", creator: "258833406646", mode: "public" };
if (fs.existsSync(configPath)) {
  CONFIG = JSON.parse(fs.readFileSync(configPath, "utf-8"));
} else {
  fs.writeFileSync(configPath, JSON.stringify(CONFIG, null, 2));
}

// --- Load commands ---
const commands = new Map();
const commandsPath = path.join(__dirname, "commands");
const files = fs.readdirSync(commandsPath);
for (const file of files) {
  if (file.endsWith(".js")) {
    const commandName = file.replace(".js", "");
    const module = await import(`./commands/${file}`);
    commands.set(commandName, module.default || module[`${commandName}Command`]);
  }
}

// --- Import react module ---
const reactModule = await import("./commands/react.js");
const react = reactModule.default || reactModule.reactCommand;

// --- Automatically set owner ---
export async function setOwnerOnConnect(client) {
  if (!CONFIG.owner) {
    const me = client.user?.id || client.user?.jid;
    if (me) {
      CONFIG.owner = me.replace(/[^0-9]/g, "");
      fs.writeFileSync(configPath, JSON.stringify(CONFIG, null, 2));
      console.log(`✅ Owner automatically set: ${CONFIG.owner}`);
    }
  }
}

// --- Get sender number from a message ---
function getSenderNumber(message) {
  let senderJid = "";

  if (message.key.fromMe) {
    senderJid = CONFIG.owner + "@s.whatsapp.net";
  } else if (message.key.participant) {
    senderJid = message.key.participant;
  } else {
    senderJid = message.key.remoteJid;
  }

  return senderJid.replace(/[^0-9]/g, ""); // normalization
}

// --- Get target user (reply, mention, number) ---
function getTargetUser(message, args) {
  const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

  if (quoted) return message.message.extendedTextMessage.contextInfo.participant.replace(/[^0-9]/g, "");
  if (mentions.length > 0) return mentions[0].replace(/[^0-9]/g, "");
  if (args[0]) return args[0].replace(/[^0-9]/g, "");
  return null;
}

// --- Clear logs ---
function logMessage(message, type = "IN") {
  const remoteJid = message.key.remoteJid;
  const isGroup = remoteJid.endsWith("@g.us");
  const isChannel = remoteJid.endsWith("@broadcast");
  const sender = getSenderNumber(message);
  const senderName = message.pushName || "Unknown";
  const text =
    message.message?.conversation ||
    message.message?.extendedTextMessage?.text ||
    "";

  let logText = `[${type}] `;

  if (isGroup) {
    logText += `GROUP (${remoteJid}) | ${senderName} (${sender}) → ${text}`;
  } else if (isChannel) {
    logText += `CHANNEL | ${senderName} → ${text}`;
  } else {
    logText += `DM | ${senderName} (${sender}) → ${text}`;
  }

  console.log(logText);
}

// --- Main handler ---
export async function handleCommand(message, client) {
  try {
    logMessage(message, "IN");

    const text =
      message.message?.conversation ||
      message.message?.extendedTextMessage?.text ||
      "";
    const prefix = ".";
    if (!text.startsWith(prefix)) return;

    const args = text.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const sender = getSenderNumber(message);

    // Owner and Creator detection
    const isOwner = sender === CONFIG.owner;
    const isCreator = sender === CONFIG.creator;

    // Private mode: only owner can execute
    if (CONFIG.mode === "private" && !isOwner) return;

    // --- Execute command ---
    if (commands.has(command)) {
      // Reaction before execution
      if (react) {
        try {
          await react(message, client);
        } catch (err) {
          console.error("Error in react.js:", err);
        }
      }

      const cmd = commands.get(command);
      const target = getTargetUser(message, args);

      await cmd(message, client, {
        sender,
        target,
        args,
        isOwner,
        isCreator,
        config: CONFIG,
        updateConfig: (newConfig) => {
          CONFIG = { ...CONFIG, ...newConfig };
          fs.writeFileSync(configPath, JSON.stringify(CONFIG, null, 2));
          console.log("⚙️ Config updated:", CONFIG);
        },
      });

      logMessage(
        {
          key: message.key,
          message: { conversation: `Command ${command} executed` },
          pushName: message.pushName,
        },
        "OUT"
      );
    }
  } catch (e) {
    console.error("Error in handleCommand:", e);
  }
}