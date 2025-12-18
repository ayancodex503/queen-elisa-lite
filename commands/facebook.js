// commands/facebook.js
import axios from 'axios';

export default async function facebookCommand(message, client) {
    try {
        const remoteJid = message.key.remoteJid;
        if (!remoteJid) {
            console.log('[Facebook] Error: remoteJid not defined');
            return;
        }

        const sender = message.key.participant || remoteJid;
        const senderNumber = sender.split('@')[0];
        
        const text = message.message?.extendedTextMessage?.text || 
                    message.message?.conversation || '';
        
        const args = text.split(' ').slice(1);
        
        // Show help message
        if (args.length === 0) {
            return await client.sendMessage(remoteJid, {
                text: `📘 *Facebook Video Downloader*\n\nUsage: .facebook <video_url>\n\nExamples:\n.facebook https://www.facebook.com/share/r/16sXMhKi6e/\n.facebook https://fb.watch/abc123/\n\n@${senderNumber}, please provide a Facebook video URL.`,
                mentions: [sender]
            });
        }

        const fbUrl = args[0];
        
        // Check if it's a valid Facebook URL
        if (!fbUrl.includes('facebook.com') && !fbUrl.includes('fb.watch')) {
            return await client.sendMessage(remoteJid, {
                text: `❌ @${senderNumber}, please provide a valid Facebook video URL.\nURL should contain facebook.com or fb.watch`,
                mentions: [sender]
            });
        }

        // Send processing message
        const processingMsg = await client.sendMessage(remoteJid, {
            text: `⏳ @${senderNumber}, processing Facebook video...`,
            mentions: [sender]
        });

        // Call API
        const encodedUrl = encodeURIComponent(fbUrl);
        const apiUrl = `https://api.vreden.my.id/api/v1/download/facebook?url=${encodedUrl}`;
        
        console.log(`[Facebook] Calling API: ${apiUrl}`);
        
        const response = await axios.get(apiUrl, { 
            timeout: 20000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
        });
        
        console.log(`[Facebook] API Status Code: ${response.status}`);
        console.log(`[Facebook] API Response Status: ${response.data.status}`);
        
        // Check API response
        if (!response.data.status) {
            await client.sendMessage(remoteJid, {
                text: `❌ @${senderNumber}, API response failed.\nStatus Code: ${response.data.status_code || 'Unknown'}`,
                mentions: [sender]
            });
            return;
        }

        const data = response.data.result;
        console.log(`[Facebook] Got video data, title: ${data.title}`);
        
        // Get video URL (prefer HD)
        let videoUrl = data.download.sd; // Default to SD
        let quality = 'SD';
        
        // Use HD if available
        if (data.download.hd) {
            videoUrl = data.download.hd;
            quality = 'HD';
            console.log(`[Facebook] Using HD quality`);
        } else {
            console.log(`[Facebook] Using SD quality`);
        }
        
        // Send thumbnail and info
        const infoText = `📘 *Facebook Video Info*\n\n🎬 ${data.title}\n⏱️ Duration: ${data.durasi}\n📊 Quality: ${quality}\n\n@${senderNumber}, sending video...`;
        
        // Try to send thumbnail (may have hotlink protection)
        try {
            await client.sendMessage(remoteJid, {
                image: { url: data.thumbnail },
                caption: infoText,
                mentions: [sender]
            });
            console.log(`[Facebook] Thumbnail sent successfully`);
        } catch (imageError) {
            console.warn(`[Facebook] Could not send thumbnail: ${imageError.message}`);
            // Send text only info
            await client.sendMessage(remoteJid, {
                text: infoText,
                mentions: [sender]
            });
        }
        
        // Try to send video (main step)
        console.log(`[Facebook] Trying to send video, URL: ${videoUrl.substring(0, 100)}...`);
        
        try {
            // Method 1: Send video URL directly
            await client.sendMessage(remoteJid, {
                video: { url: videoUrl },
                caption: `📘 Facebook Video (${quality} Quality)\n🎬 ${data.title}\n⏱️ ${data.durasi}\n👤 Requested by: @${senderNumber}`,
                mentions: [sender]
            });
            
            console.log(`[Facebook] ✅ Video sent successfully!`);
            
            // Send success message
            await client.sendMessage(remoteJid, {
                text: `✅ @${senderNumber}, Facebook video downloaded successfully!\n📊 Quality: ${quality}`,
                mentions: [sender]
            });
            
        } catch (videoError) {
            console.error(`[Facebook] ❌ Failed to send video: ${videoError.message}`);
            
            // If direct send fails, try to download and send
            try {
                console.log(`[Facebook] Trying download and send...`);
                const videoResponse = await axios({
                    method: 'GET',
                    url: videoUrl,
                    responseType: 'arraybuffer',
                    timeout: 60000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                const videoBuffer = Buffer.from(videoResponse.data);
                const fileSize = (videoBuffer.length / (1024 * 1024)).toFixed(2);
                
                console.log(`[Facebook] Video downloaded, size: ${fileSize} MB`);
                
                await client.sendMessage(remoteJid, {
                    video: videoBuffer,
                    caption: `📘 Facebook (Local Cache)\n🎬 ${data.title}\n📊 ${fileSize} MB | ${quality}`,
                    fileName: `facebook_${Date.now()}.mp4`
                });
                
                console.log(`[Facebook] ✅ Sent via cache successfully!`);
                
                await client.sendMessage(remoteJid, {
                    text: `✅ @${senderNumber}, video sent via cache!`,
                    mentions: [sender]
                });
                
            } catch (downloadError) {
                console.error(`[Facebook] ❌ Cache send also failed: ${downloadError.message}`);
                
                // Last resort: send direct download link
                await client.sendMessage(remoteJid, {
                    text: `⚠️ @${senderNumber}, could not send video directly.\n\n🔗 *Direct Download Link (${quality}):*\n${videoUrl}\n\n🎬 *Video Info:*\n${data.title}\n⏱️ ${data.durasi}`,
                    mentions: [sender]
                });
            }
        }

    } catch (error) {
        console.error('[Facebook] Command execution error:', error.message);
        
        // Make sure we have remoteJid before sending error message
        if (message.key?.remoteJid) {
            const sender = message.key.participant || message.key.remoteJid;
            const senderNumber = sender.split('@')[0];
            
            let errorMsg = `❌ @${senderNumber}, `;
            
            if (error.code === 'ECONNABORTED') {
                errorMsg += 'Request timeout, please try again later.';
            } else if (error.response?.status === 404) {
                errorMsg += 'Video not found or invalid URL.';
            } else if (error.response?.status === 403) {
                errorMsg += 'API access denied, try another video.';
            } else if (error.message.includes('Network Error')) {
                errorMsg += 'Network error, check your connection.';
            } else {
                errorMsg += `Error: ${error.message}`;
            }
            
            await client.sendMessage(message.key.remoteJid, {
                text: errorMsg,
                mentions: [sender]
            });
        }
    }
}