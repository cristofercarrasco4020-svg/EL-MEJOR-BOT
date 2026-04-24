import { config } from '../config.js';

const testBye = {
    name: 'testbye',
    category: 'admins',
    isAdmin: true,
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const user = m.sender;
            let txt = `*${config.visuals.emoji2} \`BYE USER\` ${config.visuals.emoji2}*\n`;
            txt += `› @${user.split('@')[0]}\n\n`;
            txt += `» Un miembro ha abandonado la base. Su rastro se desvanece en la red, pero su paso por aquí ha quedado registrado.\n\n`;
            txt += `> ${config.visuals.emoji} ¡Esperamos no verte en el lado oscuro!\n`;
            txt += `> *${config.visuals.emoji4}* kazuma.giize.com`;

            await conn.sendMessage(m.chat, {
                image: { url: config.img1 },
                caption: txt,
                mentions: [user]
            }, { quoted: m });
        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al enviar la despedida.`);
        }
    }
};

export default testBye;