/* KURAYAMI TEAM - PIXEL HANDLER ENGINE 
   Desarrollado por Félix OFC para Kamuza Mister Bot
*/

import chalk from 'chalk';
import { config } from './config.js';
import { logger } from './config/print.js';
import { syncLid } from './lid/resolver.js'; // Motor LID de Kurayami

/**
 * Handler principal para procesar mensajes entrantes
 */
export const pixelHandler = async (conn, m) => {
    try {
        if (!m || !m.message) return;
        if (m.key && m.key.remoteJid === 'status@broadcast') return;

        // 1. --- NORMALIZACIÓN DE IDENTIDAD (LID ENGINE) ---
        // Sincroniza el ID antes de cualquier validación de mando
        m.sender = await syncLid(conn, m, m.chat);

        // 2. Extracción de cuerpo del mensaje
        const type = Object.keys(m.message)[0];
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (type === 'imageMessage' || type === 'videoMessage') ? m.message.imageMessage.caption : 
                     (type === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : 
                     (type === 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : '';

        // 3. Variables de entorno del mensaje
        const prefix = config.prefix || '!'; 
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');
        
        // 4. --- VALIDACIÓN DE DUEÑOS (Ajustado a tu config.owner) ---
        // Extraemos los números del array 'owner' en tu config.js
        const owners = Array.isArray(config.owner) ? config.owner : [];
        
        // Comprobamos si el sender (ya limpio por syncLid) es el dueño
        const isOwner = [conn.user.id.split(':')[0], ...owners].some(num => m.sender.includes(num));
        const isGroup = m.chat.endsWith('@g.us');
        
        // 5. Registro en consola (Logger)
        logger(m, conn);

        // 6. Ejecución de comandos
        if (isCmd) {
            const cmd = global.commands.get(command) || 
                        Array.from(global.commands.values()).find(c => c.alias && c.alias.includes(command));

            if (cmd) {
                // Validación de jerarquía
                if (cmd.isOwner && !isOwner) {
                    return m.reply('❌ Nivel de acceso insuficiente: Solo el Desarrollador puede ejecutar esto.');
                }

                if (cmd.isGroup && !isGroup) {
                    return m.reply('❌ Error: Este comando requiere un entorno de grupo.');
                }

                // Inyección de parámetros al comando
                await cmd.run(conn, m, { 
                    prefix, 
                    command, 
                    args, 
                    text, 
                    isOwner, 
                    isGroup 
                });
            }
        }

    } catch (err) {
        console.error(chalk.red('\n[❌] CRITICAL ERROR EN PIXEL HANDLER:'), err);
    }
};