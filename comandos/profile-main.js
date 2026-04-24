import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const ecoPath = path.resolve('./config/database/economy/economy.json');
const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');

const profileCommand = {
    name: 'profile',
    alias: ['perfil', 'me'],
    category: 'profile',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            let targetJid = m.sender;
            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
                targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (m.quoted) {
                targetJid = m.quoted.key.participant || m.quoted.key.remoteJid;
            }

            const user = targetJid.split('@')[0].split(':')[0];

            let wallet = 0, bank = 0, totalPjs = 0;

            if (fs.existsSync(ecoPath)) {
                const ecoDB = JSON.parse(fs.readFileSync(ecoPath, 'utf-8'));
                if (ecoDB[user]) {
                    wallet = Number(ecoDB[user].wallet) || 0;
                    bank = Number(ecoDB[user].bank) || 0;
                }
            }

            if (fs.existsSync(gachaPath)) {
                const gachaDB = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
                for (let id in gachaDB) {
                    if (gachaDB[id].owner === user) {
                        totalPjs++;
                    }
                }
            }

            let pp;
            try { 
                pp = await conn.profilePictureUrl(targetJid, 'image'); 
            } catch { 
                pp = 'https://i.ibb.co/mJR6NBs/avatar.png'; 
            }

            let txt = `*${config.visuals.emoji3} \`PERFIL DE USUARIO\` ${config.visuals.emoji3}*\n\n`;
            txt += `*✿︎ Usuario:* @${user}\n`;
            txt += `*✿︎ Personajes:* ${totalPjs}\n`;
            txt += `*✿︎ Cartera:* ¥${wallet.toLocaleString()}\n`;
            txt += `*✿︎ Banco:* ¥${bank.toLocaleString()}\n`;
            txt += `*✿︎ Patrimonio:* ¥${(wallet + bank).toLocaleString()}\n\n`;
            txt += `> Kazuma Bot • Sistema de Gacha & Economía`;

            await conn.sendMessage(m.chat, { 
                image: { url: pp }, 
                caption: txt, 
                mentions: [targetJid] 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al cargar el perfil.`);
        }
    }
};

export default profileCommand;
