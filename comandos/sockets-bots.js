/* KURAYAMI TEAM - SOCKET MONITOR ENGINE 
   Desarrollado por Félix OFC para Kamuza Mister Bot
*/

import fs from 'fs';
import path from 'path';

export default {
    name: 'sockets',
    alias: ['sockets', 'bots'],
    category: 'sockets',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const mainNumber = conn.user.id.split(':')[0];
            const sessionsPath = path.resolve('./sesiones_subbots');
            
            let totalSubs = 0;
            let listaBots = `  ➪ *[https://wa.me/${mainNumber}]* » *Mood*\n`;

            if (fs.existsSync(sessionsPath)) {
                const folders = fs.readdirSync(sessionsPath).filter(f => {
                    const fullPath = path.join(sessionsPath, f);
                    return fs.statSync(fullPath).isDirectory() && !f.startsWith('.');
                });
                
                totalSubs = folders.length;
                
                folders.forEach(folder => {
                    const num = folder.replace(/\D/g, '');
                    if (num && num !== mainNumber) {
                        listaBots += `  ➪ *[https://wa.me/${num}]* » *Sub-Bot*\n`;
                    }
                });
            }

            const texto = `✿︎ \`LISTA DE BOTS ACTIVOS\` ✿︎\n\n*❁ Principal » 1*\n*❀ Subs Totales » ${totalSubs}*\n\n*❀ LISTA DETALLADA:*\n${listaBots}`;

            await conn.sendMessage(m.chat || m.key.remoteJid, { 
                text: texto.trim(),
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - BOTS STATUS',
                        body: 'Lista de bots activos en la red',
                        thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg',
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: m });

        } catch (e) {
            console.error("Error en comando sockets:", e);
        }
    }
};
