/* KURAYAMI TEAM - PIXEL HANDLER ENGINE 
   Desarrollado por Félix OFC para Kamuza Mister Bot
*/

import chalk from 'chalk';
import { config } from './config.js';
import { logger } from './config/print.js';
import { syncLid } from './lid/resolver.js'; 

export const pixelHandler = async (conn, m) => {
    try {
        if (!m || !m.message) return;
        
        const chat = m.key.remoteJid;
        if (chat === 'status@broadcast') return;

        // 1. --- MOTOR LID (KURAYAMI) ---
        try {
            m.sender = await syncLid(conn, m, chat);
        } catch (e) {
            m.sender = m.key.participant || m.key.remoteJid;
        }

        // 2. Extraer cuerpo del mensaje
        const type = Object.keys(m.message)[0];
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (m.message[type] && m.message[type].caption) ? m.message[type].caption : 
                     (type === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : 
                     (type === 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : '';

        // 3. --- LÓGICA DE PREFIJO FLEXIBLE ---
        const prefix = config.prefix || '!'; 
        const isCmd = body.startsWith(prefix);
        
        // Si tiene prefijo, lo quitamos; si no, usamos el texto tal cual para buscar el comando
        const commandName = isCmd ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : body.trim().split(/ +/).shift().toLowerCase();
        
        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');
        
        // 4. Validaciones
        const owners = Array.isArray(config.owner) ? config.owner : [];
        const isOwner = [conn.user.id.split(':')[0], ...owners].some(num => m.sender.includes(num));
        const isGroup = chat ? chat.endsWith('@g.us') : false;
        
        logger(m, conn);

        // 5. Búsqueda del comando (Por nombre o por alias)
        const cmd = global.commands.get(commandName) || 
                    Array.from(global.commands.values()).find(c => c.alias && c.alias.includes(commandName));

        if (cmd) {
            // Si el comando NO permite ser usado sin prefijo y el usuario no lo puso, ignoramos
            // (Opcional: puedes quitar '&& !cmd.noPrefix' si quieres que TODOS funcionen sin prefijo siempre)
            if (!isCmd && !cmd.noPrefix) {
                // Si quieres que absolutamente todos funcionen sin prefijo, comenta esta validación.
            }

            // Validaciones de seguridad
            if (cmd.isOwner && !isOwner) return m.reply('❌ Acceso restringido.');
            if (cmd.isGroup && !isGroup) return m.reply('❌ Comando para grupos.');

            // Ejecución
            await cmd.run(conn, m, { 
                prefix, 
                command: commandName, 
                args, 
                text, 
                isOwner, 
                isGroup 
            });
        }

    } catch (err) {
        console.error(chalk.red('\n[❌] ERROR EN HANDLER:'), err);
    }
};
