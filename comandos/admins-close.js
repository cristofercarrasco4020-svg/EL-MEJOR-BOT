import { config } from '../config.js';

const closeGroup = {
    name: 'close',
    alias: ['cerrargroup', 'cerrardatos', 'cerrar'],
    category: 'admins',
    isAdmin: true,
    isBotAdmin: true,
    noPrefix: true,

    run: async (conn, m) => {
        try {
            await conn.groupSettingUpdate(m.chat, 'announcement');
            
            m.reply(`*${config.visuals.emoji3} \`GRUPO CERRADO\` ${config.visuals.emoji3}*\n\nSe ha activado el modo restrictivo. Solo los administradores pueden enviar mensajes.\n\n> ¡Momento de silencio en el servidor!`);
        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al intentar cerrar el grupo.`);
        }
    }
};

export default closeGroup;