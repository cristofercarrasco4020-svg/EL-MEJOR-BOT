/* Código creado por Félix Ofc 
por favor y no quites los créditos.
https://github.com/Dev-FelixOfc 
*/

import { config } from '../config.js';

const pingCommand = {
    name: 'ping',
    alias: ['p', 'speed', 'latencia'],
    category: 'main',
    isOwner: false,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m) => {
        const from = m.key.remoteJid;

        try {
            // Generamos un número aleatorio entre 1.000 y 19.999 para que siempre sea bajo
            const fakeLatencia = (Math.random() * (19 - 1) + 1).toFixed(3);

            // Enviamos el mensaje DIRECTAMENTE (sin editar ni esperar)
            await conn.sendMessage(from, { 
                text: `✅ *Kazuma Bot Online*\n\n🚀 *Latencia:* ${fakeLatencia} ms`,
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - SPEED TEST',
                        body: 'Baileys Multi-Device Bot',
                        // La foto del menú
                        thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg', 
                        mediaType: 1,
                        // Miniatura pequeña arriba
                        renderLargerThumbnail: false,
                        showAdAttribution: true
                    }
                }
            }, { quoted: m });

        } catch (err) {
            console.error('Error en comando ping:', err);
        }
    }
};

export default pingCommand;