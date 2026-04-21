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

            // 1. DETECCIÓN DE OBJETIVO (LÓGICA ROB PURA)
            let targetJid = m.quoted ? m.quoted.key.participant || m.quoted.key.remoteJid : m.mentionedJid?.[0];

            if (!targetJid && args[0]) {
                // Si no hay mención ni respuesta, intentamos sacar el número del primer argumento
                let rawNumber = args[0].replace(/[^0-9]/g, '');
                if (rawNumber.length >= 10) targetJid = rawNumber + '@s.whatsapp.net';
            }

            if (!targetJid) return m.reply(`*${config.visuals.emoji2}* \`Error de objetivo\`\n\nDebes mencionar o responder a alguien.\n\n> ¡Indica a quién quieres enviarle dinero!`);

            const receiver = targetJid.split('@')[0];

            // 2. BLOQUEO DE AUTO-ENVÍO
            if (sender === receiver) {
                return m.reply(`*${config.visuals.emoji2}* No puedes enviarte dinero a ti mismo.`);
            }

            // 3. EXTRACCIÓN DE CANTIDAD (SÚPER SIMPLE)
            // Filtramos los argumentos: buscamos el que NO sea el número del receptor y sea un número válido
            let amount = args.map(a => a.replace(/[^0-9]/g, '')).find(a => a.length > 0 && a !== receiver && a.length < 11);
            amount = parseInt(amount);

            if (isNaN(amount) || amount <= 0) {
                return m.reply(`*${config.visuals.emoji2}* \`Cantidad Inválida\`\n\nUso: #pay 5000 @mención`);
            }

            // LÍMITE MÍNIMO
            if (amount < 1000) return m.reply(`*${config.visuals.emoji2}* El monto mínimo es de ¥1,000.`);

            // 4. VALIDACIÓN DE SALDO
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            let senderData = db[sender] || { bank: 0 };
            let senderBank = Number(senderData.bank || 0);

            if (senderBank < amount) {
                return m.reply(`*${config.visuals.emoji2}* \`Fondos Insuficientes\`\n\nTienes ¥${senderBank.toLocaleString()} en tu banco.\n\n> ¡Necesitas más capital para enviar ¥${amount.toLocaleString()}!`);
            }

            // 5. EJECUCIÓN
            if (!db[receiver]) db[receiver] = { wallet: 0, bank: 0, daily: { lastClaim: 0, streak: 0 } };

            db[sender].bank = senderBank - amount;
            db[receiver].bank = Number(db[receiver].bank || 0) + amount;

            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3}* \`TRANSFERENCIA EXITOSA\`\n\n*De:* @${sender}\n*Para:* @${receiver}\n*Monto:* ¥${amount.toLocaleString()}\n\n> ¡Transferencia de banco a banco completada!`,
                mentions: [m.sender, targetJid]
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error en el sistema bancario.`);
        }
    }
};

export default payCommand;
