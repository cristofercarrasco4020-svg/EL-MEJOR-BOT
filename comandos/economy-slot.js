import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/economy/economy.json');

const slotCommand = {
    name: 'slot',
    alias: ['casino', 'apostar', 'tragamonedas'],
    category: 'economy',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            const apuestaStr = args[0];

            // 1. Cargar base de datos
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            if (!db[user]) db[user] = { wallet: 0, bank: 0 };
            
            let saldo = db[user].wallet;

            // 2. Ayuda y Validaciones
            if (!apuestaStr) {
                return m.reply(`🎰 *CASINO ROYALE*\n\n📝 *Uso:* .slot [cantidad]\n🔥 *Ej:* .slot 1000\n🔥 *Ej:* .slot all (Todo o nada)`);
            }

            let apuesta = 0;
            if (apuestaStr.toLowerCase() === 'all' || apuestaStr.toLowerCase() === 'todo') {
                apuesta = saldo;
            } else {
                apuesta = parseInt(apuestaStr.toLowerCase().replace(/k/g, '000').replace(/m/g, '000000'));
            }

            if (isNaN(apuesta) || apuesta < 100) return m.reply(`⚠️ La apuesta mínima es de $100.`);
            if (saldo < apuesta) return m.reply(`💸 *No tienes fondos suficientes.*\nTu saldo: $${saldo.toLocaleString()}`);

            // 3. Cobro inicial (Importante)
            db[user].wallet -= apuesta;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');

            // 4. Animación de Giro
            const items = ["🍒", "🍋", "🍇", "🍉", "🔔", "💎", "7️⃣"];
            let { key: keySlot } = await conn.sendMessage(m.chat, { text: "🎰 | ⬜ | ⬜ | ⬜ | Girando..." }, { quoted: m });

            for (let i = 0; i < 3; i++) {
                await new Promise(r => setTimeout(r, 400));
                const rAzar = items[Math.floor(Math.random() * items.length)];
                await conn.sendMessage(m.chat, { text: `🎰 | ${rAzar} | ${rAzar} | ${rAzar} | 💫`, edit: keySlot });
            }

            // 5. Resultado
            const r1 = items[Math.floor(Math.random() * items.length)];
            const r2 = items[Math.floor(Math.random() * items.length)];
            const r3 = items[Math.floor(Math.random() * items.length)];

            let ganancia = 0;
            let estado = "";
            let color = "";

            if (r1 === r2 && r2 === r3) {
                // Jackpot: x5 normal, x10 si es 7 o Diamante
                const mult = (r1 === "7️⃣" || r1 === "💎") ? 10 : 5;
                ganancia = apuesta * mult;
                estado = "🏆 ¡JACKPOT MÍTICO!";
            } else if (r1 === r2 || r2 === r3 || r1 === r3) {
                // Par
                ganancia = Math.floor(apuesta * 1.5);
                estado = "🌟 ¡BUENA JUGADA!";
            } else {
                // Perdió
                estado = "📉 PERDISTE";
            }

            // 6. Actualización Final
            db[user].wallet += ganancia;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');

            // 7. Edición Final
            const msgFinal = `🎰 *CASINO ROYALE* 🎰\n────────────────\n       │ ${r1} │ ${r2} │ ${r3} │\n────────────────\n${estado}\n${ganancia > 0 ? `💰 Ganaste: $${ganancia.toLocaleString()}` : `💸 Perdiste $${apuesta.toLocaleString()}`}\n\n🏦 *Saldo actual:* $${db[user].wallet.toLocaleString()}`;

            await conn.sendMessage(m.chat, { text: msgFinal, edit: keySlot });

        } catch (e) {
            console.error(e);
            m.reply(`⚠️ Error en el casino, contacta al admin.`);
        }
    }
};

export default slotCommand;

