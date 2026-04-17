import { config } from '../config.js';

const kickCommand = {
    name: 'kick',
    alias: ['ban', 'remove', 'eliminar', 'sacar'],
    category: 'admin',
    admin: true, 
    botAdmin: true, 
    isGroup: true,
    noPrefix: true,

    run: async (conn, m, { participants }) => {
        if (!m.mentionedJid[0] && !m.quoted) {
            return m.reply(`*${config.visuals.emoji2}* Etiqueta o responde al mensaje de la persona que quieres eliminar.`);
        }

        let victim = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender;
        
        const groupInfo = await conn.groupMetadata(m.chat);
        const ownerGroup = groupInfo.owner || m.chat.split('-')[0] + '@s.whatsapp.net';
        const ownerBot = config.owner[0];
        const botId = conn.decodeJid(conn.user.id);

        const participant = groupInfo.participants.find((p) => p.id === victim || p.lid === victim);

        if (!participant) {
            return m.reply(`*${config.visuals.emoji2}* @${victim.split('@')[0]} ya no está en el grupo.`, null, { mentions: [victim] });
        }

        if (victim === botId) {
            return m.reply(`*${config.visuals.emoji3}* No puedo eliminarme a mí mismo.`);
        }

        if (victim === ownerGroup) {
            return m.reply(`*${config.visuals.emoji6}* No puedo eliminar al propietario del grupo.`);
        }

        if (config.owner.includes(victim)) {
            return m.reply(`*${config.visuals.emoji11}* Error de jerarquía: No tengo permitido eliminar a mi **Owner**.`);
        }

        if (participant.admin) {
            return m.reply(`*${config.visuals.emoji6}* No puedo eliminar a @${victim.split('@')[0]} porque es un **Administrador**.`, null, { mentions: [victim] });
        }

        try {
            await m.reply(`*${config.visuals.emoji7} \`SISTEMA DE MODERACIÓN\` ${config.visuals.emoji7}*\n\nEl usuario @${victim.split('@')[0]} será eliminado del grupo.`, null, { mentions: [victim] });
            
            await new Promise(resolve => setTimeout(resolve, 1000));

            await conn.groupParticipantsUpdate(m.chat, [victim], 'remove');
        } catch (e) {
            return m.reply(`*${config.visuals.emoji2}* Error: ${e.message}`);
        }
    }
};

export default kickCommand;