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

            const pingMsg = await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji2}* \`Verificando conexión...\`` 
            }, { quoted: m });

            const end = Date.now();
            const latencia = end - start;

            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3}* \`KAZUMA PING\` *${config.visuals.emoji3}*\n\n*${config.visuals.emoji4} Velocidad:* ${latencia} ms\n*${config.visuals.emoji} Estado:* Online\n\n> *${config.visuals.emoji2}* \`SISTEMA OPERATIVO\``,
                edit: pingMsg.key 
            });

        } catch (err) {
            console.error(err);
        }
    }
};

export default pingCommand;
