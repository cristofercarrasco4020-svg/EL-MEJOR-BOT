import { config } from './config.js';
import chalk from 'chalk';

export const pixelHandler = async (conn, m, conf) => {
    try {
        const type = Object.keys(m.message)[0];
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (type === 'imageMessage' || type === 'videoMessage') ? m.message.imageMessage.caption : '';

        if (!body) return;

        const from = m.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = isGroup ? m.key.participant : from;
        const isOwner = config.owner.some(num => sender.includes(num));

        if (!isGroup && !isOwner) return; 

        const prefix = config.prefix;
        const isCmd = body.startsWith(prefix);
        const commandText = isCmd ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : body.trim().split(' ')[0].toLowerCase();
        const args = body.trim().split(/ +/).slice(1);

        const cmd = global.commands.get(commandText) || 
                    Array.from(global.commands.values()).find(c => c.alias && c.alias.includes(commandText));
        
        if (!cmd) return;

        let groupMetadata, participants, groupAdmins;
        let isAdmin = false;
        if (isGroup) {
            groupMetadata = await conn.groupMetadata(from);
            participants = groupMetadata.participants;
            groupAdmins = participants.filter(v => v.admin !== null).map(v => v.id);
            isAdmin = groupAdmins.includes(sender);
        }

        if (cmd.isOwner && !isOwner) {
            return await conn.sendMessage(from, { 
                text: `⚠️ *ACCESO DENEGADO*\n\nEste comando es exclusivo para el **Owner**.` 
            }, { quoted: m });
        }

        if (cmd.isGroup && !isGroup) {
            return await conn.sendMessage(from, { 
                text: `🏢 *SOLO GRUPOS*\n\nEste comando no funciona aquí.` 
            }, { quoted: m });
        }

        if (cmd.isAdmin && !isAdmin && isGroup) {
            return await conn.sendMessage(from, { 
                text: `❌ *ERROR DE RANGO*\n\nSolo **Administradores** pueden usar esto.` 
            }, { quoted: m });
        }

        await cmd.run(conn, m, {
            args,
            prefix,
            command: commandText,
            isOwner,
            isAdmin,
            isGroup,
            participants,
            groupMetadata
        });

    } catch (err) {
        console.error(chalk.red('[ERROR EN PIXEL-HANDLER]:'), err);
    }
};