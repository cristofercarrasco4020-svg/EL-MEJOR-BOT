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
            // Marca de tiempo inicial
            const start = Date.now();

            // Enviamos el mensaje primero para medir el tiempo de respuesta
            const pingMsg = await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji2}* \`Verificando conexión...\`` 
            }, { quoted: m });

            // Marca de tiempo final tras el envío
            const end = Date.now();
            const latencia = end - start;

            // Editamos el mensaje con el diseño final y el ping real
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
