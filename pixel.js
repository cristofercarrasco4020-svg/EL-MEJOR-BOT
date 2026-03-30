import { config } from './config.js';
import chalk from 'chalk';

export const pixelHandler = async (conn, m, conf) => {
    try {
        // 1. Extraer el texto del mensaje
        const type = Object.keys(m.message)[0];
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (type === 'imageMessage' || type === 'videoMessage') ? m.message.imageMessage.caption : '';

        if (!body) return; // Si no hay texto, no hacemos nada

        // 2. Lógica de Prefijos
        const prefix = config.prefix;
        const isCmd = body.startsWith(prefix);
        const commandText = isCmd ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : body.trim().split(' ')[0].toLowerCase();
        const args = body.trim().split(/ +/).slice(1);

        // 3. Buscar el comando en la colección global
        const cmd = global.commands.get(commandText);
        if (!cmd) return;

        // 4. Definir Variables de Entorno (Contexto)
        const from = m.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = isGroup ? m.key.participant : from;
        const isOwner = config.owner.some(num => sender.includes(num));

        // Obtener datos del grupo si aplica
        let groupMetadata, participants, groupAdmins;
        let isAdmin = false;
        if (isGroup) {
            groupMetadata = await conn.groupMetadata(from);
            participants = groupMetadata.participants;
            groupAdmins = participants.filter(v => v.admin !== null).map(v => v.id);
            isAdmin = groupAdmins.includes(sender);
        }

        // 5. Verificación de Propiedades (Avisos de Pixel)
        
        // Solo Owner
        if (cmd.isOwner && !isOwner) {
            return await conn.sendMessage(from, { 
                text: `⚠️ *ACCESO DENEGADO*\n\nEste comando es exclusivo para el **Owner** del bot.` 
            }, { quoted: m });
        }

        // Solo Admins
        if (cmd.isAdmin && !isAdmin) {
            return await conn.sendMessage(from, { 
                text: `❌ *ERROR DE RANGO*\n\nLo siento, este comando solo puede ser utilizado por los **Administradores** del grupo.` 
            }, { quoted: m });
        }

        // Solo Grupos
        if (cmd.isGroup && !isGroup) {
            return await conn.sendMessage(from, { 
                text: `🏢 *SOLO GRUPOS*\n\nEste comando está diseñado para funcionar únicamente dentro de grupos.` 
            }, { quoted: m });
        }

        // 6. EJECUCIÓN DEL COMANDO
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