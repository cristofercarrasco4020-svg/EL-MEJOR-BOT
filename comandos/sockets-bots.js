import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

export default {
    name: 'sockets',
    alias: ['sockets', 'bots'],
    category: 'sockets',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const sessionsPath = path.resolve('./sesiones_subbots');
            const mainBotNumber = config.owner[0].split('@')[0].replace(/\D/g, ''); 
            const currentNumber = conn.user.id.split(':')[0].replace(/\D/g, '');

            let totalSubs = 0;
            let subBotsList = '';

            if (fs.existsSync(sessionsPath)) {
                const folders = fs.readdirSync(sessionsPath).filter(f => {
                    const fullPath = path.join(sessionsPath, f);
                    return fs.statSync(fullPath).isDirectory() && !f.startsWith('.');
                });

                folders.forEach(folder => {
                    const num = folder.replace(/\D/g, '');
                    if (num && num !== mainBotNumber) {
                        subBotsList += `  ➪ *[wa.me/${num}]* » *Sub-Bot*\n`;
                        totalSubs++;
                    }
                });
            }

            let listaFinal = `  ➪ *[wa.me/${mainBotNumber}]* » *Principal*\n${subBotsList}`;

            const texto = `*${config.visuals.emoji3}* \`LISTA DE SOCKETS ACTIVOS\` *${config.visuals.emoji3}*\n\n*❁ Principal » 1*\n*❀ Subs Totales » ${totalSubs}*\n\n*❀ DETALLE:*\n${listaFinal}`;

            await conn.sendMessage(m.chat, { text: texto.trim() }, { quoted: m });

        } catch (e) {
            console.error(e);
        }
    }
};