import config from "../config.js";

export default async function tagallCommand(message, client) {
  try {
    const remoteJid = message.key.remoteJid;
    const metadata = await client.groupMetadata(remoteJid).catch(() => null);
    if (!metadata) return client.sendMessage(remoteJid, { text: "❌ This command only works in a group." });

    const sender = message.key.participant || message.key.remoteJid;
    const ppUrl = await client.profilePictureUrl(sender, "image").catch(() => "https://files.catbox.moe/x7fi39.jpg");

    let i = 1;
    const members = metadata.participants.map(p => `*${i++}.✞︎* @${p.id.split("@")[0]}`).join("\n");

    const caption = `╔═══『 👥 𝐓𝐀𝐆 𝐀𝐋𝐋 』═══╗
${members}
╚══════════════════════╝

> ${config.nameCreator}`;

    await client.sendMessage(remoteJid, {
      image: { url: ppUrl },
      caption,
      mentions: metadata.participants.map(p => p.id)
    });

  } catch (err) {
    console.error("Error in tagall:", err);
    await client.sendMessage(message.key.remoteJid, { text: "⚠️ Error during tagall." });
  }
}

// Tagall command