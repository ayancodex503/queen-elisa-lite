export default async function tagCommand(message, client) {
  try {
    const remoteJid = message.key.remoteJid;

    // Check if it's in a group
    const metadata = await client.groupMetadata(remoteJid).catch(() => null);
    if (!metadata) return client.sendMessage(remoteJid, { text: "❌ This command only works in a group." });

    const participants = metadata.participants.map(p => p.id);
    const text = message.message?.conversation?.split(" ").slice(1).join(" ")
      || message.message?.extendedTextMessage?.text?.split(" ").slice(1).join(" ")
      || message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation
      || "👋 Hello everyone!";

    await client.sendMessage(remoteJid, {
      text,
      mentions: participants
    });

  } catch (err) {
    console.error("Error in tagCommand:", err);
    await client.sendMessage(message.key.remoteJid, { text: "⚠️ Error during tagging." });
  }
}