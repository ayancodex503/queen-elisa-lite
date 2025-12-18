// commands/song.js - With file size check
import axios from 'axios';

export default async function songCommand(message, client) {
    try {
        const remoteJid = message.key.remoteJid;
        const sender = message.key.participant || message.key.remoteJid;
        const senderNumber = sender.split('@')[0];
        
        const text = message.message?.extendedTextMessage?.text || 
                    message.message?.conversation || '';
        
        const args = text.split(' ').slice(1);
        
        if (args.length === 0) {
            return await client.sendMessage(remoteJid, {
                text: `📁 *Song as Document*\n\nUsage: .song <song name>\n\nExample: .song Happy Nation\n\n@${senderNumber}, provide a song name.`,
                mentions: [sender]
            });
        }

        const query = args.join(' ');
        
        // Search message
        await client.sendMessage(remoteJid, {
            text: `🔍 @${senderNumber}, searching for: *${query}*...`,
            mentions: [sender]
        });

        const encodedQuery = encodeURIComponent(query);
        const apiUrl = `https://api.vreden.my.id/api/v1/download/play/audio?query=${encodedQuery}`;
        
        const response = await axios.get(apiUrl, { timeout: 15000 });
        
        if (!response.data.status || !response.data.result?.download?.url) {
            return await client.sendMessage(remoteJid, {
                text: `❌ @${senderNumber}, song not found: *${query}*`,
                mentions: [sender]
            });
        }

        const data = response.data.result;
        
        // Check file size before downloading
        await client.sendMessage(remoteJid, {
            text: `📊 @${senderNumber}, checking file size...`,
            mentions: [sender]
        });

        // Get file size with HEAD request
        let fileSize = 'Unknown';
        try {
            const headResponse = await axios.head(data.download.url, { timeout: 10000 });
            const contentLength = headResponse.headers['content-length'];
            if (contentLength) {
                const sizeMB = (contentLength / (1024 * 1024)).toFixed(2);
                fileSize = `${sizeMB} MB`;
                
                // Check if file is too large (WhatsApp limit is ~100MB for documents)
                if (contentLength > 100 * 1024 * 1024) {
                    return await client.sendMessage(remoteJid, {
                        text: `⚠️ @${senderNumber}, file too large (${sizeMB} MB).\nWhatsApp document limit is ~100MB.\n\n🔗 *Download link:*\n${data.download.url}`,
                        mentions: [sender]
                    });
                }
            }
        } catch (sizeError) {
            console.warn('Could not get file size:', sizeError.message);
            fileSize = 'Unknown size';
        }

        // Send song information
        const infoMessage = await client.sendMessage(remoteJid, {
            image: { url: data.metadata.image },
            caption: `📁 *${data.metadata.title}*\n👤 ${data.metadata.author.name}\n⏱️ ${data.metadata.timestamp}\n🎚️ ${data.download.quality}\n📊 ${fileSize}\n\n@${senderNumber}, downloading as document...`,
            mentions: [sender]
        });

        // Download the file
        const downloadMsg = await client.sendMessage(remoteJid, {
            text: `⬇️ @${senderNumber}, downloading ${fileSize}...`,
            mentions: [sender]
        });

        const audioResponse = await axios({
            method: 'GET',
            url: data.download.url,
            responseType: 'arraybuffer',
            timeout: 120000 // 2 minutes for larger files
        });

        // Update download message
        await client.sendMessage(remoteJid, {
            text: `📤 @${senderNumber}, uploading to WhatsApp...`,
            edit: downloadMsg.key,
            mentions: [sender]
        });

        const audioBuffer = Buffer.from(audioResponse.data);
        const actualSize = (audioBuffer.length / (1024 * 1024)).toFixed(2);
        
        // Clean filename
        const cleanTitle = data.metadata.title
            .replace(/[<>:"/\\|?*]/g, '') // Remove invalid chars
            .substring(0, 100); // Limit length
        
        // Send as document
        await client.sendMessage(remoteJid, {
            document: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${cleanTitle}.mp3`,
            caption: `🎵 ${data.metadata.title}\n👤 ${data.metadata.author.name}\n⏱️ ${data.metadata.timestamp}\n📊 ${actualSize} MB\n\nRequested by: @${senderNumber}`,
            mentions: [sender]
        });

        // Delete processing messages
        try {
            await client.sendMessage(remoteJid, {
                delete: downloadMsg.key
            });
            
            await client.sendMessage(remoteJid, {
                delete: infoMessage.key
            });
        } catch (deleteError) {
            console.log('Could not delete messages:', deleteError.message);
        }

        // Final message
        await client.sendMessage(remoteJid, {
            text: `✅ @${senderNumber}, document sent!\n📁 *${cleanTitle}.mp3*\n📊 ${actualSize} MB\n\nSaved as MP3 document.`,
            mentions: [sender]
        });

    } catch (error) {
        console.error('Error in song command:', error);
        
        const sender = message.key.participant || message.key.remoteJid;
        const senderNumber = sender.split('@')[0];
        
        let errorMsg = `❌ @${senderNumber}, `;
        
        if (error.code === 'ECONNABORTED') {
            errorMsg += 'Download timeout. File might be too large.';
        } else if (error.response?.status) {
            errorMsg += `API error: ${error.response.status}`;
        } else if (error.message.includes('Network Error')) {
            errorMsg += 'Network error.';
        } else {
            errorMsg += 'Download failed.';
        }
        
        await client.sendMessage(remoteJid, {
            text: errorMsg + '\n\nTry a different song or try again later.',
            mentions: [sender]
        });
    }
}