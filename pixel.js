import { config } from './config.js';
import chalk from 'chalk';

export const pixelHandler = async (conn, m, conf) => {
    try {
        // 1. Extraer el texto del mensaje
        const type = Object.keys(m.message)[0];
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (type === 'imageMessage' || type === 'videoMessage') ? m.message.imageMessage.caption : '';

        if (!body) return;

        // 2. Definir Variables de Entorno y Permisos
        const from = m.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = isGroup ? m.key.participant : from;
        const isOwner = config.owner.some(num => sender.includes(num));

        // --- FILTRO CRÍTICO DE PRIVADO ---
        // Si no es grupo y NO es el owner, ignoramos TODO (Silencio absoluto)
        if (!isGroup && !isOwner) return; 

        // 3. Lógica de Prefijos
        const prefix = config.prefix;
        const isCmd = body.startsWith(prefix);
        const commandText = isCmd ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : body.trim().split(' ')[0].toLowerCase();
        const args = body.trim().split(/ +/).slice(1);

        // 4. Buscar el comando
        const cmd = global.commands.get(commandText);
        if (!cmd) return;

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
        
        // Propiedad: Solo Owner (Aplica en grupos o privado)
        if (cmd.isOwner && !isOwner) {
            return await conn.sendMessage(from, { 
                text: `⚠️ *ACCESO DENEGADO*\n\nEste comando es exclusivo para el **Owner**.` 
            }, { quoted: m });
        }

        // Propiedad: Solo Grupos
        if (cmd.isGroup && !isGroup) {
            // Como ya filtramos que en privado solo entras TÚ, este aviso solo lo verías tú
            // si intentas usar un comando de grupo en tu propio chat privado.
            return await conn.sendMessage(from, { 
                text: `🏢 *SOLO GRUPOS*\n\nEste comando no funciona aquí.` 
            }, { quoted: m });
        }

        // Propiedad: Solo Admins (Solo en grupos)
        if (cmd.isAdmin && !isAdmin && isGroup) {
            return await conn.sendMessage(from, { 
                text: `❌ *ERROR DE RANGO*\n\nSolo **Administradores** pueden usar esto.` 
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