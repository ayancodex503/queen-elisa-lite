// commands/instagram.js
import axios from 'axios';

export default async function instagramCommand(message, client) {
    try {
        const remoteJid = message.key.remoteJid;
        if (!remoteJid) return;

        const sender = message.key.participant || remoteJid;
        const senderNumber = sender.split('@')[0];
        
        const text = message.message?.extendedTextMessage?.text || 
                    message.message?.conversation || '';
        
        const args = text.split(' ').slice(1);
        
        if (args.length === 0) {
            return await client.sendMessage(remoteJid, {
                text: `📷 *Instagram Downloader*\n\nDownload Instagram photos/videos.\n\nUsage: .instagram <url>\nExample: .instagram https://www.instagram.com/p/ABC123/\n\n@${senderNumber}`,
                mentions: [sender]
            });
        }

        const instagramUrl = args[0];
        
        await client.sendMessage(remoteJid, {
            text: `⏳ @${senderNumber}, downloading from Instagram...`,
            mentions: [sender]
        });

        // Call API
        const encodedUrl = encodeURIComponent(instagramUrl);
        const apiUrl = `https://api.delirius.store/download/instagram?url=${encodedUrl}`;
        
        const response = await axios.get(apiUrl, { timeout: 15000 });
        
        if (!response.data.status) {
            return await client.sendMessage(remoteJid, {
                text: `❌ @${senderNumber}, failed to download.\nLink might be private or invalid.`,
                mentions: [sender]
            });
        }

        const data = response.data;
        
        // Send each media item
        let sentCount = 0;
        
        for (const item of data.data) {
            try {
                if (item.type === 'image') {
                    await client.sendMessage(remoteJid, {
                        image: { url: item.url },
                        caption: `📷 Instagram Photo\n👤 Requested by: @${senderNumber}`,
                        mentions: [sender]
                    });
                    sentCount++;
                }
                else if (item.type === 'video') {
                    await client.sendMessage(remoteJid, {
                        video: { url: item.url },
                        caption: `🎬 Instagram Video\n👤 Requested by: @${senderNumber}`,
                        mentions: [sender]
                    });
                    sentCount++;
                }
                
                // Small delay between sends
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (mediaError) {
                console.log(`Failed to send ${item.type}:`, mediaError.message);
            }
        }

        await client.sendMessage(remoteJid, {
            text: `✅ @${senderNumber}, sent ${sentCount} media item(s) from Instagram!`,
            mentions: [sender]
        });

    } catch (error) {
        console.error('Instagram error:', error.message);
        
        if (message.key.remoteJid) {
            const sender = message.key.participant || message.key.remoteJid;
            const senderNumber = sender.split('@')[0];
            
            let errorMsg = `❌ @${senderNumber}, `;
            
            if (error.response?.status === 404) {
                errorMsg += 'Post not found or private.';
            } else if (error.code === 'ECONNABORTED') {
                errorMsg += 'Timeout. Try again.';
            } else {
                errorMsg += 'Failed to download.';
            }
            
            await client.sendMessage(message.key.remoteJid, {
                text: errorMsg,
                mentions: [sender]
            });
        }
    }
}