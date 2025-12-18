import config from "../config.js"

export default async function pingCommand(message, client) {
  const remoteJid = message.key.remoteJid;
  const start = Date.now();

  await client.sendMessage(remoteJid, { text: "_🏓 *Pong!*_" });
  const latency = Date.now() - start;

  await client.sendMessage(remoteJid, {
    text: `_*${config.BotName} latency* : *${latency} ms*_`,
  });
}