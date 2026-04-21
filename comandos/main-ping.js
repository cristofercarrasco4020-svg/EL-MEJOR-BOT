import { config } from '../config.js';

const pingCommand = {
    name: 'ping',
    alias: ['p', 'speed', 'latencia'],
    category: 'main',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m) => {
        try {
            const start = Date.now();
            const { key } = await m.reply(`*${config.visuals.emoji2}* \`Probando...\``);
            const end = Date.now();
            const latencia = end - start;

            // Intentamos enviar con la estructura de ExternalAdReply pero optimizada
            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3}* \`KAZUMA PING\` *${config.visuals.emoji3}*\n\n*${config.visuals.emoji4} Velocidad:* ${latencia} ms\n*${config.visuals.emoji} Estado:* Online`,
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - SPEED TEST',
                        body: `Latencia: ${latencia} ms`,
                        thumbnailUrl: config.visuals.img1,
                        sourceUrl: 'https://www.instagram.com/dev.felixofc', // Pon una URL real siempre
                        mediaType: 1,
                        showAdAttribution: false,
                        renderLargerThumbnail: false // Prueba en false primero
                    }
                }
            }, { edit: key });

        } catch (err) {
            console.error('Error en ping:', err);
        }
    }
};

export default pingCommand;