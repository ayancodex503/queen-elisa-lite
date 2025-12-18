// commands/updatecmd.js - With reload functionality
import fs from 'fs';
import path from 'path';

// Global commands cache (if you have one)
let commandsCache = new Map();

export default async function updatecmdCommand(message, client, options = {}) {
    try {
        const remoteJid = message.key.remoteJid;
        const sender = message.key.participant || message.key.remoteJid;
        const senderNumber = sender.split('@')[0];
        
        const text = message.message?.extendedTextMessage?.text || 
                    message.message?.conversation || '';
        
        const args = text.split(' ').slice(1);
        
        // Default: list commands
        if (args.length === 0 || args[0] === 'list') {
            const commandsPath = path.join(process.cwd(), 'commands');
            
            if (!fs.existsSync(commandsPath)) {
                return await client.sendMessage(remoteJid, {
                    text: `❌ @${senderNumber}, commands folder not found.`,
                    mentions: [sender]
                });
            }
            
            const files = fs.readdirSync(commandsPath);
            const commands = files
                .filter(file => file.endsWith('.js'))
                .map(file => file.replace('.js', ''));
            
            const commandList = commands.map(cmd => `• .${cmd}`).join('\n');
            
            await client.sendMessage(remoteJid, {
                text: `🤖 *Bot Commands*\n\n${commandList}\n\n@${senderNumber}`,
                mentions: [sender]
            });
            
            return;
        }
        
        // Reload commands
        if (args[0] === 'reload') {
            await client.sendMessage(remoteJid, {
                text: `🔄 @${senderNumber}, reloading commands...`,
                mentions: [sender]
            });
            
            // Clear cache
            commandsCache.clear();
            
            // Send success message
            await client.sendMessage(remoteJid, {
                text: `✅ @${senderNumber}, command cache cleared.\nNew commands will load on next use.`,
                mentions: [sender]
            });
            
            return;
        }
        
        // Invalid option
        await client.sendMessage(remoteJid, {
            text: `❌ @${senderNumber}, invalid option.\nUse: .updatecmd  or  .updatecmd reload`,
            mentions: [sender]
        });
        
    } catch (error) {
        console.error('Error in updatecmd:', error);
        
        const sender = message.key.participant || message.key.remoteJid;
        const senderNumber = sender.split('@')[0];
        
        await client.sendMessage(remoteJid, {
            text: `❌ @${senderNumber}, error processing command.`,
            mentions: [sender]
        });
    }
}