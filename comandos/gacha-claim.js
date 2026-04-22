import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const ecoPath = path.resolve('./config/database/economy/economy.json');
const claimCooldowns = new Map();

const claimCommand = {
    name: 'claim',
    alias: ['reclamar', 'c'],
    category: 'gacha',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            const chat = global.db.data.chats[m.chat];
            const ahora = Date.now();
            
            if (claimCooldowns.has(user) && (ahora - claimCooldowns.get(user) < 9 * 60 * 1000)) {
                return m.reply(`*${config.visuals.emoji2}* Espera para reclamar.`);
            }

            let gachaDB = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            let ecoDB = JSON.parse(fs.readFileSync(ecoPath, 'utf-8'));
            let pjId = null;

            // 1. Si pusiste ID manual (#claim 24)
            if (args[0] && !isNaN(args[0])) {
                pjId = args[0];
            } 
            // 2. Por respuesta citando el mensaje
            else if (m.quoted) {
                const quotedId = m.quoted.id;
                if (chat.rolls && chat.rolls[quotedId]) {
                    pjId = chat.rolls[quotedId].id;
                }
            }

            if (!pjId || !gachaDB[pjId]) {
                return m.reply(`*${config.visuals.emoji2}* Cita el mensaje original del personaje para reclamarlo.`);
            }
            
            const pj = gachaDB[pjId];
            if (pj.status !== 'libre') return m.reply(`*${config.visuals.emoji2}* ¡Ya tiene dueño!`);

            if (!ecoDB[user]) ecoDB[user] = { wallet: 0, bank: 0 };
            const saldo = ecoDB[user].wallet || 0;

            if (saldo < pj.value) {
                return m.reply(`*${config.visuals.emoji2}* No tienes ¥${pj.value.toLocaleString()} en cartera.`);
            }

            // Realizar transacción
            ecoDB[user].wallet -= pj.value;
            gachaDB[pjId].status = 'domado';
            gachaDB[pjId].owner = user;

            fs.writeFileSync(gachaPath, JSON.stringify(gachaDB, null, 2));
            fs.writeFileSync(ecoPath, JSON.stringify(ecoDB, null, 2));
            
            // Borramos el roll para que no lo reclamen dos veces
            if (m.quoted) delete chat.rolls[m.quoted.id];
            
            claimCooldowns.set(user, ahora);
            m.reply(`*${config.visuals.emoji3}* ¡Lograste domar a *${pj.name}*!`);

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error en el proceso.`);
        }
    }
};

export default claimCommand;
