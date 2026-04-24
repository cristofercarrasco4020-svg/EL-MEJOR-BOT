import { config } from '../config.js';

const openGroup = {
    name: 'open',
    alias: ['abrirgroup', 'abrirdatos', 'abrir'],
    category: 'admins',
    isAdmin: true,
    isBotAdmin: true,
    noPrefix: true,

    run: async (conn, m) => {
        try {
            await conn.groupSettingUpdate(m.chat, 'not_announcement');
            
            m.reply(`*${config.visuals.emoji3} \`GRUPO ABIERTO\` ${config.visuals.emoji3}*\n\nLa restricción ha sido levantada. Todos los miembros pueden enviar mensajes ahora.\n\n> ¡Mantengan el orden y respeten las reglas!`);
        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al intentar abrir el grupo.`);
        }
    }
};

export default openGroup;
