/* KURAYAMI TEAM - PIXEL HANDLER ENGINE 
   Desarrollado por Félix OFC para Kamuza Mister Bot
*/

import chalk from 'chalk';
import { syncLid } from './lid/resolver.js'; 

/**
 * Handler principal - El corazón del procesamiento de Kazuma
 */
export const pixelHandler = async (conn, m, config) => {
    try {
        if (!m || !m.message) return;
        const chat = m.key.remoteJid;
        if (chat === 'status@broadcast') return;

        // 1. --- MOTOR LID (NORMALIZACIÓN DE IDENTIDAD) ---
        try { 
            m.sender = await syncLid(conn, m, chat); 
        } catch (e) {
            m.sender = m.key.participant || m.key.remoteJid;
        }

        // 2. --- EXTRACCIÓN DE CUERPO DEL MENSAJE ---
        const type = Object.keys(m.message)[0];
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (m.message[type] && m.message[type].caption) ? m.message[type].caption : 
                     (type === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : 
                     (type === 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : '';

        // 3. --- LÓGICA DE COMANDO Y PREFIJOS ---
        const prefix = config.prefix || '!'; 
        const isCmd = body.startsWith(prefix);
        
        // Identificamos el nombre del comando (manejando con y sin prefijo)
        const commandName = isCmd 
            ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() 
            : body.trim().split(/ +/).shift().toLowerCase();
        
        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');

        // 4. --- VALIDACIONES DE PODER (OWNER / GROUP) ---
        const owners = Array.isArray(config.owner) ? config.owner : [];
        const isOwner = [conn.user.id.split(':')[0], ...owners].some(num => m.sender.includes(num));
        const isGroup = chat.endsWith('@g.us');

        // 5. --- BÚSQUEDA Y EJECUCIÓN DEL MÓDULO ---
        const cmd = global.commands.get(commandName) || 
                    Array.from(global.commands.values()).find(c => c.alias && c.alias.includes(commandName));

        if (cmd) {
            // Filtros de Seguridad basados en el comando
            if (cmd.isOwner && !isOwner) {
                return m.reply(`❌ ${config.botName || 'Bot'}: Acceso denegado.`);
            }
            if (cmd.isGroup && !isGroup) {
                return m.reply(`❌ ${config.botName || 'Bot'}: Este comando es exclusivo para grupos.`);
            }

            // Ejecución inyectando todas las herramientas necesarias
            await cmd.run(conn, m, { 
                body, 
                prefix, 
                command: commandName, 
                args, 
                text, 
                isOwner, 
                isGroup, 
                config 
            });
        }

    } catch (err) {
        // Log de error con la estética de Kazuma
        console.error(chalk.red.bold('\n[❌] ERROR CRÍTICO EN PIXEL HANDLER:'));
        console.error(chalk.magenta(err.stack || err));
    }
};