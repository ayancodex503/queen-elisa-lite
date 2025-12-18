// commands/tiktok.js
import axios from 'axios';

export default async function tiktokCommand(message, client) {
    try {
        const remoteJid = message.key.remoteJid;
        if (!remoteJid) {
            console.log('[TikTok] 錯誤：remoteJid 未定義');
            return;
        }

        const sender = message.key.participant || remoteJid;
        const senderNumber = sender.split('@')[0];
        
        const text = message.message?.extendedTextMessage?.text || 
                    message.message?.conversation || '';
        
        const args = text.split(' ').slice(1);
        
        // 顯示幫助訊息
        if (args.length === 0) {
            return await client.sendMessage(remoteJid, {
                text: `📱 *TikTok 影片下載器*\n\n用法：.tiktok <影片網址>\n\n範例：\n.tiktok https://vm.tiktok.com/ZSHnCTfnocKjS-G1ogy/\n.tiktok https://www.tiktok.com/@user/video/1234567890\n\n@${senderNumber}，請提供 TikTok 影片網址。`,
                mentions: [sender]
            });
        }

        const tiktokUrl = args[0];
        
        // 檢查是否為有效的 TikTok 網址
        if (!tiktokUrl.includes('tiktok.com') && !tiktokUrl.includes('vm.tiktok')) {
            return await client.sendMessage(remoteJid, {
                text: `❌ @${senderNumber}，請提供有效的 TikTok 影片網址。\n網址應包含 tiktok.com 或 vm.tiktok`,
                mentions: [sender]
            });
        }

        // 發送處理中訊息
        const processingMsg = await client.sendMessage(remoteJid, {
            text: `⏳ @${senderNumber}，正在處理 TikTok 影片...`,
            mentions: [sender]
        });

        // 呼叫 API
        const encodedUrl = encodeURIComponent(tiktokUrl);
        const apiUrl = `https://api.vreden.my.id/api/v1/download/tiktok?url=${encodedUrl}`;
        
        console.log(`[TikTok] 呼叫 API: ${apiUrl}`);
        
        const response = await axios.get(apiUrl, { 
            timeout: 20000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
        });
        
        console.log(`[TikTok] API 狀態碼: ${response.status}`);
        
        // 檢查 API 回應
        if (!response.data.status) {
            await client.sendMessage(remoteJid, {
                text: `❌ @${senderNumber}，無法下載此影片。\n可能是影片為私密或網址無效。`,
                mentions: [sender]
            });
            return;
        }

        const data = response.data.result;
        console.log(`[TikTok] 取得影片資料，標題: ${data.title.substring(0, 50)}...`);
        
        // 獲取影片 URL（優先使用 HD）
        let videoUrl = data.data[0].url; // 預設使用第一個
        let quality = '標準';
        
        // 尋找 HD 版本
        const hdVideo = data.data.find(item => item.type === 'nowatermark_hd');
        if (hdVideo) {
            videoUrl = hdVideo.url;
            quality = 'HD';
            console.log(`[TikTok] 使用 HD 畫質`);
        } else {
            console.log(`[TikTok] 使用標準畫質`);
        }
        
        // 發送影片資訊（含封面圖）
        const infoText = `📱 *TikTok 影片資訊*\n\n🎬 ${data.title}\n👤 創作者：${data.author.nickname} (${data.author.fullname})\n⏱️ 時長：${data.duration}\n📅 發布時間：${data.taken_at}\n🌐 地區：${data.region}\n\n📊 統計數據：\n👁️ 觀看：${data.stats.views}\n❤️ 按讚：${data.stats.likes}\n💬 留言：${data.stats.comment}\n🔄 分享：${data.stats.share}\n📥 下載：${data.stats.download}\n\n🎵 音樂：${data.music_info.title}\n👨‍🎤 作者：${data.music_info.author}\n\n畫質：${quality}\n\n@${senderNumber}，正在發送影片...`;
        
        // 嘗試發送封面圖（注意：可能被防盜鏈，需處理錯誤）
        try {
            await client.sendMessage(remoteJid, {
                image: { url: data.cover },
                caption: infoText,
                mentions: [sender]
            });
            console.log(`[TikTok] 封面圖發送成功`);
        } catch (imageError) {
            console.warn(`[TikTok] 無法發送封面圖：${imageError.message}`);
            // 改為發送純文字資訊
            await client.sendMessage(remoteJid, {
                text: infoText,
                mentions: [sender]
            });
        }
        
        // 嘗試發送影片（主要步驟）
        console.log(`[TikTok] 嘗試發送影片，URL: ${videoUrl.substring(0, 100)}...`);
        
        try {
            // 方法 1：直接發送影片 URL
            await client.sendMessage(remoteJid, {
                video: { url: videoUrl },
                caption: `📱 TikTok ${quality} 畫質\n👤 ${data.author.nickname}\n🎵 ${data.music_info.title}\n👤 由 @${senderNumber} 請求`,
                mentions: [sender]
            });
            
            console.log(`[TikTok] ✅ 影片發送成功！`);
            
            // 發送成功訊息
            await client.sendMessage(remoteJid, {
                text: `✅ @${senderNumber}，TikTok 影片下載完成！\n🎬 ${data.title.substring(0, 50)}...\n📊 畫質：${quality}`,
                mentions: [sender]
            });
            
        } catch (videoError) {
            console.error(`[TikTok] ❌ 發送影片失敗：${videoError.message}`);
            
            // 如果直接發送失敗，嘗試下載後發送
            try {
                console.log(`[TikTok] 嘗試下載後發送...`);
                const videoResponse = await axios({
                    method: 'GET',
                    url: videoUrl,
                    responseType: 'arraybuffer',
                    timeout: 60000
                });
                
                const videoBuffer = Buffer.from(videoResponse.data);
                const fileSize = (videoBuffer.length / (1024 * 1024)).toFixed(2);
                
                console.log(`[TikTok] 影片下載完成，大小：${fileSize} MB`);
                
                await client.sendMessage(remoteJid, {
                    video: videoBuffer,
                    caption: `📱 TikTok (本地緩存)\n👤 ${data.author.nickname}\n📊 ${fileSize} MB`,
                    fileName: `tiktok_${data.id}.mp4`
                });
                
                console.log(`[TikTok] ✅ 透過緩存發送成功！`);
                
                await client.sendMessage(remoteJid, {
                    text: `✅ @${senderNumber}，影片已透過緩存發送！`,
                    mentions: [sender]
                });
                
            } catch (downloadError) {
                console.error(`[TikTok] ❌ 下載後發送也失敗：${downloadError.message}`);
                
                // 最後手段：發送直接下載連結
                await client.sendMessage(remoteJid, {
                    text: `⚠️ @${senderNumber}，無法直接發送影片。\n\n🔗 *直接下載連結 (${quality})：*\n${videoUrl}\n\n🎬 *影片資訊：*\n${data.title}\n👤 ${data.author.nickname}\n⏱️ ${data.duration}`,
                    mentions: [sender]
                });
            }
        }

    } catch (error) {
        console.error('[TikTok] 命令執行錯誤：', error.message);
        
        // 確保有 remoteJid 才發送錯誤訊息
        if (message.key?.remoteJid) {
            const sender = message.key.participant || message.key.remoteJid;
            const senderNumber = sender.split('@')[0];
            
            let errorMsg = `❌ @${senderNumber}，`;
            
            if (error.code === 'ECONNABORTED') {
                errorMsg += '請求超時，請稍後再試。';
            } else if (error.response?.status === 404) {
                errorMsg += '找不到影片或網址無效。';
            } else if (error.response?.status === 403) {
                errorMsg += 'API 訪問被拒絕，請嘗試其他影片。';
            } else if (error.message.includes('Network Error')) {
                errorMsg += '網路錯誤，請檢查您的連線。';
            } else {
                errorMsg += `發生錯誤：${error.message}`;
            }
            
            await client.sendMessage(message.key.remoteJid, {
                text: errorMsg,
                mentions: [sender]
            });
        }
    }
}