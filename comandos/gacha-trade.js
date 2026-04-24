import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const trades = new Map();

const tradeCommand = {
    name: 'trade',
    alias: ['intercambio', 'cambiar'],
    category: 'gacha',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            
            if (args[0] === 'accept') {
                if (!trades.has(m.sender)) return m.reply(`*${config.visuals.emoji2}* No tienes ninguna propuesta de intercambio pendiente.`);
                
                const { from, targetPjId, userPjId } = trades.get(m.sender);
                let gachaDB = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));

                if (gachaDB[targetPjId].owner !== user || gachaDB[userPjId].owner !== from) {
                    trades.delete(m.sender);
                    return m.reply(`*${config.visuals.emoji2}* El intercambio ya no es válido (uno de los personajes cambió de dueño).`);
                }

                gachaDB[targetPjId].owner = from;
                gachaDB[userPjId].owner = user;

                fs.writeFileSync(gachaPath, JSON.stringify(gachaDB, null, 2));
                trades.delete(m.sender);

                return m.reply(`*${config.visuals.emoji3}* ¡Intercambio realizado con éxito!`);
            }

            const targetJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);
            if (!targetJid) return m.reply(`*${config.visuals.emoji2}* Menciona a alguien o cita su mensaje para proponer un intercambio.`);

            const target = targetJid.split('@')[0].split(':')[0];
            const [myPjId, targetPjId] = args;

            if (!myPjId || !targetPjId) return m.reply(`*${config.visuals.emoji2}* \`Uso Incorrecto\`\n\n> #trade (Tu_ID_PJ) (ID_PJ_Otro) @mención`);

            let gachaDB = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            if (!gachaDB[myPjId] || !gachaDB[targetPjId]) return m.reply(`*${config.visuals.emoji2}* Uno de los IDs no existe.`);

            const myPj = gachaDB[myPjId];
            const hisPj = gachaDB[targetPjId];

            if (myPj.owner !== user) return m.reply(`*${config.visuals.emoji2}* El personaje *${myPj.name}* no es tuyo.`);
            if (hisPj.owner !== target) return m.reply(`*${config.visuals.emoji2}* El personaje *${hisPj.name}* no le pertenece a esa persona.`);

            const diferencia = Math.abs(myPj.value - hisPj.value);
            if (diferencia > 1000) {
                return m.reply(`*${config.visuals.emoji2}* Intercambio injusto. La diferencia de valor es de *¥${diferencia.toLocaleString()}* (Máximo permitido: ¥1,000).`);
            }

            trades.set(targetJid, { from: user, targetPjId, userPjId });

            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3} \`PROPUESTA DE INTERCAMBIO\` ${config.visuals.emoji3}*\n\n@${user} ofrece: *${myPj.name}* (¥${myPj.value.toLocaleString()})\nA cambio de tu: *${hisPj.name}* (¥${hisPj.value.toLocaleString()})\n\n> Para aceptar usa: #trade accept`,
                mentions: [m.sender, targetJid]
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error en el sistema de intercambio.`);
        }
    }
};

export default tradeCommand;