import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/economy/economy.json');

const payCommand = {
    name: 'pay',
    alias: ['pagar', 'transferir', 'dar'],
    category: 'economy',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const sender = m.sender.split('@')[0];
            
            let targetJid = m.quoted ? m.quoted.key.participant || m.quoted.key.remoteJid : m.mentionedJid?.[0];

            if (!targetJid && args[0] && args[0].includes('@')) {
                targetJid = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            }

            let amount = args.find(a => {
                const n = a.replace(/[^0-9]/g, '');
                return n.length > 0 && n.length < 10; 
            });
            amount = parseInt(amount?.replace(/[^0-9]/g, ''));

            if (!targetJid || isNaN(amount) || amount <= 0) {
                return m.reply(`*${config.visuals.emoji2}* \`Uso Incorrecto\`\n\nUso: #pay 5000 @mención\n\n> ¡Asegúrate de indicar una cifra válida!`);
            }

            const receiver = targetJid.split('@')[0];
            if (sender === receiver) return m.reply(`*${config.visuals.emoji2}* No puedes enviarte dinero a ti mismo.`);

            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            const senderBank = db[sender]?.bank || 0;

            if (senderBank < amount) {
                return m.reply(`*${config.visuals.emoji2}* \`Fondos Insuficientes\`\n\nTienes ¥${senderBank.toLocaleString()} en tu banco.\n\n> ¡Necesitas más capital para transferir!`);
            }

            if (!db[receiver]) {
                db[receiver] = { wallet: 0, bank: 0, daily: { lastClaim: 0, streak: 0 }, crime: { lastUsed: 0 } };
            }

            db[sender].bank -= amount;
            db[receiver].bank = (db[receiver].bank || 0) + amount;

            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3}* \`TRANSFERENCIA EXITOSA\`\n\n*De:* @${sender}\n*Para:* @${receiver}\n*Monto:* ¥${amount.toLocaleString()}\n\n> ¡El dinero ha sido enviado de banco a banco!`,
                mentions: [m.sender, targetJid]
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error en la transacción.`);
        }
    }
};

export default payCommand;
