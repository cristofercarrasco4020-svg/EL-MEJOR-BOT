import fs from 'fs';
import path from 'path';

const databasePath = path.resolve('./jsons/grupos.json');

const antiLinkHandler = async (conn, m) => {
    if (!m.key.remoteJid.endsWith('@g.us') || m.key.fromMe) return;

    const from = m.key.remoteJid;
    const sender = m.sender || m.key.participant;

    if (!fs.existsSync(databasePath)) return;
    const db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
    if (!db[from]?.antilink) return;

    const body = m.message?.conversation || 
                 m.message?.extendedTextMessage?.text || 
                 m.message?.imageMessage?.caption || 
                 m.message?.videoMessage?.caption || "";

    const bodyLower = body.toLowerCase();

    const isLink = bodyLower.includes('whatsapp.com') || bodyLower.includes('wa.me');
    
    if (isLink) {
        if (bodyLower.includes('wa.me/')) {
            const pathAfterWa = bodyLower.split('wa.me/')[1]?.split(/[?/\s]/)[0];
            if (pathAfterWa && !isNaN(pathAfterWa.replace(/\+/g, ''))) return;
        }

        if (bodyLower.includes('api.whatsapp.com/send')) return;

        if (bodyLower.includes('github.com/dev-felixofc/kazuma-mr-bot')) return;

        if (bodyLower.includes('whatsapp.com/channel/0029vb6sgwdjkk73qelu0j0n')) return;

        const code = await conn.groupInviteCode(from).catch(() => null);
        if (code && bodyLower.includes(`chat.whatsapp.com/${code}`)) return;

        const groupMetadata = await conn.groupMetadata(from);
        const isAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin;
        if (isAdmin) return;

        await conn.sendMessage(from, { delete: m.key });
        await conn.sendMessage(from, { 
            text: `*❁* \`Anti-Link WhatsApp\` *❁*\n\nEl usuario *@${sender.split('@')[0]}* ha sido eliminado por enviar enlaces de grupos o canales no permitidos.\n\n> Se permiten contactos personales y enlaces oficiales de Dev-FelixOfc/Kazuma-Mr-Bot.`,
            mentions: [sender]
        });

        await conn.groupParticipantsUpdate(from, [sender], 'remove');
    }
};

export default antiLinkHandler;