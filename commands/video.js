// commands/video.js
import axios from 'axios';

export default async function videoCommand(message, client) {
    try {
        const remoteJid = message.key.remoteJid;
        
        // Get sender information
        const sender = message.key.participant || message.key.remoteJid;
        const senderNumber = sender.split('@')[0];
        
        // Extract query from message
        const text = message.message?.extendedTextMessage?.text || 
                    message.message?.conversation || '';
        
        const args = text.split(' ').slice(1);
        
        // Show help if no arguments
        if (args.length === 0) {
            return await client.sendMessage(remoteJid, {
                text: `🎬 *Video Downloader*\n\nDownload videos from YouTube.\n\nUsage:\n• .video <query>\n\nExample:\n• .video Happy Nation\n• .video https://youtube.com/watch?v=VIDEO_ID\n\n@${senderNumber}, provide a video name or URL.`,
                mentions: [sender]
            });
        }

        const query = args.join(' ');
        
        // Send processing message
        await client.sendMessage(remoteJid, {
            text: `🔍 @${senderNumber}, searching for video: *${query}*...`,
            mentions: [sender]
        });

        // Encode query for URL
        const encodedQuery = encodeURIComponent(query);
        const apiUrl = `https://api.vreden.my.id/api/v1/download/play/video?query=${encodedQuery}`;
        
        const response = await axios.get(apiUrl, { timeout: 15000 });
        
        // Check if API response is successful
        if (!response.data.status || !response.data.result?.download?.url) {
            return await client.sendMessage(remoteJid, {
                text: `❌ @${senderNumber}, video not found for: *${query}*\nPlease try another search.`,
                mentions: [sender]
            });
        }

        const data = response.data.result;
        
        // Prepare video information
        const videoInfo = `
🎬 *${data.metadata.title}*
👤 *Channel:* ${data.metadata.author.name}
⏱️ *Duration:* ${data.metadata.timestamp}
👁️ *Views:* ${data.metadata.views.toLocaleString()}
📅 *Uploaded:* ${data.metadata.ago}
🎞️ *Quality:* ${data.download.quality}
📊 *Available Qualities:* ${data.download.availableQuality.join('p, ')}p

@${senderNumber}, your video is being prepared... ⏳
`;

        // Send video info with thumbnail
        await client.sendMessage(remoteJid, {
            image: { url: data.metadata.image },
            caption: videoInfo,
            mentions: [sender]
        });

        // Send video directly from URL (WhatsApp will process it)
        await client.sendMessage(remoteJid, {
            video: { url: data.download.url },
            caption: `🎬 ${data.metadata.title}\n👤 Requested by: @${senderNumber}`,
            mentions: [sender]
        });

        // Send completion message
        await client.sendMessage(remoteJid, {
            text: `✅ @${senderNumber}, video sent successfully!\n\n*${data.metadata.title}*\nhas been downloaded in ${data.download.quality} quality.`,
            mentions: [sender]
        });

    } catch (error) {
        console.error('Error in video command:', error);
        
        const sender = message.key.participant || message.key.remoteJid;
        const senderNumber = sender.split('@')[0];
        
        let errorMsg = `❌ @${senderNumber}, `;
        
        if (error.code === 'ECONNABORTED') {
            errorMsg += 'Search timeout. Please try again.';
        } else if (error.response?.status === 404) {
            errorMsg += 'Video not found. Please check the name or URL.';
        } else if (error.response?.status === 429) {
            errorMsg += 'Too many requests. Please wait a moment.';
        } else if (error.message.includes('Network Error')) {
            errorMsg += 'Network error. Check your connection.';
        } else {
            errorMsg += 'Failed to process request.';
        }
        
        await client.sendMessage(remoteJid, {
            text: errorMsg,
            mentions: [sender]
        });
    }
}