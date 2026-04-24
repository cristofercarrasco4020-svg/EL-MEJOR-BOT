import { config } from '../config.js';

const hidetagCommand = {
    name: 'hidetag',
    alias: ['tag', 'mencionar'],
    category: 'admins',
    isOwner: false,
    noPrefix: false, 
    isAdmin: true,
    isGroup: true,

    run: async (conn, m, { text, participants }) => {
        try {
            // Captura de contenido: prioridad texto del comando > texto de mensaje citado
            let content = text;
            if (!content && m.quoted) {
                content = m.quoted.text || m.quoted.caption || '';
            }

            if (!content && !m.quoted) {
                return m.reply(`*${config.visuals.emoji2}* Por favor, ingresa un mensaje o responde a uno para hacer el hidetag.`);
            }

            const users = participants.map(u => u.id);

            // Si se cita un mensaje multimedia o con formato
            if (m.quoted) {
                await conn.sendMessage(m.chat, { 
                    forward: m.quoted.fakeObj, 
                    mentions: users 
                });
            } else {
                // Si es solo texto directo
                await conn.sendMessage(m.chat, { 
                    text: content, 
                    mentions: users 
                }, { quoted: m });
            }

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al ejecutar el hidetag.`);
        }
    }
};

export default hidetagCommand;
