// commands/play.js
import axios from 'axios';

export default async function playCommand(message, client) {
    try {
        const remoteJid = message.key.remoteJid;
        
        // Get sender information
        const sender = message.key.participant || message.key.remoteJid;
        const senderNumber = sender.split('@')[0];
        
        // Extract query from message
        const text = message.message?.extendedTextMessage?.text || 
                    message.message?.conversation || '';
        
        const args = text.split(' ').slice(1);
        
        if (args.length === 0) {
            return await client.sendMessage(remoteJid, {
                text: `🎵 *Music Player*\n\nUsage:\n• .play <song name>\n\nExample:\n• .play Happy Nation\n\n@${senderNumber}, please provide a song name.`,
                mentions: [sender]
            });
        }

        const query = args.join(' ');
        
        // Send processing message
        await client.sendMessage(remoteJid, {
            text: `🔍 @${senderNumber}, searching for: *${query}*...`,
            mentions: [sender]
        });

        // Encode query for URL
        const encodedQuery = encodeURIComponent(query);
        const apiUrl = `https://api.vreden.my.id/api/v1/download/play/audio?query=${encodedQuery}`;
        
        const response = await axios.get(apiUrl, { timeout: 15000 });
        
        if (!response.data.status || !response.data.result?.download?.url) {
            return await client.sendMessage(remoteJid, {
                text: `❌ @${senderNumber}, song not found for: *${query}*\nPlease try another song.`,
                mentions: [sender]
            });
        }

        const data = response.data.result;
        
        // Prepare music information
        const musicInfo = `
🎵 *${data.metadata.title}*
👤 *Artist:* ${data.metadata.author.name}
⏱️ *Duration:* ${data.metadata.timestamp}
👁️ *Views:* ${data.metadata.views.toLocaleString()}
📅 *Uploaded:* ${data.metadata.ago}
🎚️ *Quality:* ${data.download.quality}

@${senderNumber}, here's your requested song! 🎧
`;

        // Send music info with thumbnail and mention
        await client.sendMessage(remoteJid, {
            image: { url: data.metadata.image },
            caption: musicInfo,
            mentions: [sender]
        });

        // Prepare audio message with mention in caption
        const audioCaption = `🎵 *${data.metadata.title}*\n👤 Requested by: @${senderNumber}`;
        
        // Send audio with mention in caption
        await client.sendMessage(remoteJid, {
            audio: { url: data.download.url },
            mimetype: 'audio/mpeg',
            fileName: data.download.filename || `${data.metadata.title}.mp3`,
            caption: audioCaption,
            mentions: [sender]
        });

        // Optional: Send completion confirmation
        await client.sendMessage(remoteJid, {
            text: `✅ @${senderNumber}, enjoy your music! 🎶`,
            mentions: [sender]
        });

    } catch (error) {
        console.error('Error in play command:', error);
        
        const sender = message.key.participant || message.key.remoteJid;
        const senderNumber = sender.split('@')[0];
        
        let errorMsg = `❌ @${senderNumber}, `;
        
        if (error.code === 'ECONNABORTED') {
            errorMsg += 'Search timeout. Please try again.';
        } else if (error.response?.status === 404) {
            errorMsg += 'Song not found. Please check the name.';
        } else if (error.response?.status === 429) {
            errorMsg += 'API rate limit exceeded. Please wait a moment.';
        } else {
            errorMsg += 'An error occurred. Please try again later.';
        }
        
        await client.sendMessage(remoteJid, {
            text: errorMsg,
            mentions: [sender]
        });
    }
}