/* KAZUMA MISTER BOT - MODERATION SYSTEM 
   Desarrollado por Félix OFC
*/

const kickCommand = {
    name: 'kick',
    alias: ['ban', 'remove', 'eliminar', 'sacar'],
    category: 'admin',
    isAdmin: true, 
    botAdmin: true, 
    isGroup: true,
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        const groupMetadata = await conn.groupMetadata(m.chat);
        const participants = groupMetadata.participants;

        if (!m.mentionedJid[0] && !m.quoted) {
            return m.reply(`*❁* \`Uso Incorrecto\` *❁*\n\nDebes etiquetar a alguien o responder a su mensaje.`);
        }

        let victim = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender;
        const botId = conn.decodeJid(conn.user.id);
        const ownerGroup = groupMetadata.owner || m.chat.split('-')[0] + '@s.whatsapp.net';
        const participant = participants.find((p) => p.id === victim);

        if (!participant) return;

        if (victim === botId) {
            return m.reply(`*✿︎* No puedo eliminarme a mí mismo.`);
        }

        if (victim === ownerGroup) {
            return m.reply(`*✿︎* No puedo eliminar al dueño del grupo.`);
        }

        if (participant.admin || participant.isSuperAdmin) {
            return m.reply(`*❁* \`Acción Denegada\` *❁*\n\nNo puedo eliminar a un Administrador.`, null, { mentions: [victim] });
        }

        try {
            await conn.sendMessage(m.chat, { 
                text: `*✿︎* \`SISTEMA DE MODERACIÓN\` *✿︎*\n\nEl usuario *@${victim.split('@')[0]}* será expulsado.`,
                mentions: [victim]
            }, { quoted: m });
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            await conn.groupParticipantsUpdate(m.chat, [victim], 'remove');
        } catch (e) {
            return m.reply(`*❁* \`Fallo\` *❁*\n\nError al ejecutar la expulsión.`);
        }
    }
};

export default kickCommand;
