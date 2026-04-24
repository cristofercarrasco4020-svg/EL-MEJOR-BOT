import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const dbPath = path.resolve('./config/database/profile/profiles.json');
const proposals = new Map();

const marryCommand = {
    name: 'marry',
    alias: ['casar', 'divorce', 'divorcio'],
    category: 'profile',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            if (!db[user]) db[user] = {};

            if (m.body.includes('divorce')) {
                if (!db[user].partner) return m.reply(`*${config.visuals.emoji2}* No estás casado.`);
                const ex = db[user].partner;
                db[user].partner = null;
                if (db[ex]) db[ex].partner = null;
                fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
                return m.reply(`*${config.visuals.emoji3}* Te has divorciado de @${ex}.`, { mentions: [ex + '@s.whatsapp.net'] });
            }

            if (args[0] === 'accept') {
                if (!m.quoted || !proposals.has(m.quoted.id)) return m.reply(`*${config.visuals.emoji2}* No hay propuestas.`);
                const prop = proposals.get(m.quoted.id);
                if (m.sender !== prop.to) return m.reply(`*${config.visuals.emoji2}* No es para ti.`);
                
                db[user].partner = prop.fromId;
                if (!db[prop.fromId]) db[prop.fromId] = {};
                db[prop.fromId].partner = user;

                fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
                proposals.delete(m.quoted.id);
                return m.reply(`*${config.visuals.emoji3}* ¡Felicidades! @${user} y @${prop.fromId} ahora están casados.`, { mentions: [m.sender, prop.from] });
            }

            const targetJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);
            if (!targetJid) return m.reply(`*${config.visuals.emoji2}* Menciona a alguien.`);
            if (db[user].partner) return m.reply(`*${config.visuals.emoji2}* Ya estás casado.`);

            const sent = await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3} \`PROPUESTA DE MATRIMONIO\` ${config.visuals.emoji3}*\n\n@${user} te pide matrimonio. ¿Aceptas?\n\n> Responde con: *#marry accept*`,
                mentions: [m.sender, targetJid]
            }, { quoted: m });

            proposals.set(sent.key.id, { from: m.sender, fromId: user, to: targetJid });
            setTimeout(() => proposals.delete(sent.key.id), 300000);

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error en el sistema.`);
        }
    }
};

export default marryCommand;