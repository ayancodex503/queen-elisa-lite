//✪⏤͟͞★⃝ꪶAYAN CODEX𖥘✪͜͡➺

import axios from "axios";

export default async function channelSender(message, client, texts, num) {
  const remoteJid = message.key.remoteJid;
  
  // Get sender info
  const sender = message.key.participant || message.key.remoteJid;
  const senderNumber = sender.split('@')[0];

  // Channel invite link (if you have one)
  const channelInviteLink = "https://whatsapp.com/channel/0029Vb65HSyHwXbEQbQjQV26";
  
  // Alternative: Use WhatsApp's direct join link format
  // This requires you to have an invite link from WhatsApp Business

  const imageUrl = `https://files.catbox.moe/x7fi39.jpg`;
  
  let thumbBuffer;
  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    thumbBuffer = Buffer.from(response.data, "binary");
  } catch (err) {
    thumbBuffer = null;
  }

  // Send channel promotion with direct link
  await client.sendMessage(remoteJid, {
    image: { url: imageUrl },
    caption: `📢 *FOLLOW OUR CHANNEL*\n\n@${senderNumber}, click the link below to join automatically:\n\n${channelInviteLink}\n\nOr scan the QR code in the image.`,
    mentions: [sender],
    contextInfo: {
      externalAdReply: {
        title: "📢 JOIN OUR CHANNEL",
        body: "Click to join automatically",
        mediaType: 1,
        thumbnail: thumbBuffer,
        renderLargerThumbnail: true,
        mediaUrl: channelInviteLink,
        sourceUrl: channelInviteLink,
        thumbnailUrl: imageUrl
      }
    }
  });
  
  // Also send a separate message with instructions
  await client.sendMessage(remoteJid, {
    text: `👉 *How to join:*\n1. Click the link above\n2. Tap "Follow"\n3. Done! You're now subscribed.\n\n@${senderNumber}, you'll get updates automatically.`,
    mentions: [sender]
  });
}
