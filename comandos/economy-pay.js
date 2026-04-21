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

            // 1. OBLIGAR A QUE SEA POR RESPUESTA
            let targetJid = m.quoted ? m.quoted.key.participant || m.quoted.key.remoteJid : null;

            if (!targetJid) {
                return m.reply(`*${config.visuals.emoji2}* \`Error de Uso\`\n\nDebes **responder** al mensaje de la persona para enviarle dinero.\n\n> Ejemplo: #pay 5000`);
            }

            // Limpieza del JID para evitar el :0
            const cleanTargetJid = targetJid.split('@')[0] + '@s.whatsapp.net';
            const receiver = cleanTargetJid.split('@')[0];

            // 2. BLOQUEO DE AUTO-ENVÍO
            if (sender === receiver) {
                return m.reply(`*${config.visuals.emoji2}* No puedes enviarte dinero a ti mismo.`);
            }

            // 3. LA CANTIDAD ES EL PRIMER ARGUMENTO
            let amount = parseInt(args[0]?.replace(/[^0-9]/g, ''));

            if (isNaN(amount) || amount <= 0) {
                return m.reply(`*${config.visuals.emoji2}* \`Cantidad Inválida\`\n\nEscribe la cantidad después del comando.\n\n> Ejemplo: #pay 1000`);
            }

            if (amount < 1000) {
                return m.reply(`*${config.visuals.emoji2}* El monto mínimo para enviar es ¥1,000.`);
            }

            // 4. LECTURA Y ACTUALIZACIÓN REAL DE LA BASE DE DATOS
            if (!fs.existsSync(dbPath)) return m.reply('Error: DB no encontrada.');
            
            // Leemos la base de datos justo en este momento para tener los datos frescos
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

            // Aseguramos que el emisor tenga datos
            if (!db[sender]) db[sender] = { wallet: 0, bank: 0 };
            
            let senderBank = Number(db[sender].bank || 0);

            // Verificamos saldo
            if (senderBank < amount) {
                return m.reply(`*${config.visuals.emoji2}* \`Fondos Insuficientes\`\n\nTienes ¥${senderBank.toLocaleString()} en tu banco.`);
            }

            // Aseguramos que el receptor tenga perfil en la base de datos
            if (!db[receiver]) {
                db[receiver] = { 
                    wallet: 0, 
                    bank: 0, 
                    daily: { lastClaim: 0, streak: 0 },
                    crime: { lastUsed: 0 }
                };
            }

            // --- PROCESO DE TRANSFERENCIA ---
            // Restamos al que envía
            db[sender].bank = senderBank - amount;
            
            // Sumamos al que recibe
            db[receiver].bank = Number(db[receiver].bank || 0) + amount;

            // GUARDADO FORZADO: Escribimos los cambios en el archivo JSON
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');

            // 5. NOTIFICACIÓN DE ÉXITO
            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3}* \`TRANSFERENCIA EXITOSA\`\n\n*De:* @${sender}\n*Para:* @${receiver}\n*Monto:* ¥${amount.toLocaleString()}\n\n> ¡El dinero se ha movido correctamente entre bancos!`,
                mentions: [m.sender, cleanTargetJid]
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error crítico al procesar la transferencia.`);
        }
    }
};

export default payCommand;
