/* KURAYAMI TEAM - ECONOMY SYSTEM (DAILY)
   Versión mejorada y adaptada al estilo de Kazuma-Mr-Bot */

import fs from 'fs';
import path from 'path';
import { config } from '../config.js';   // Asegúrate que la ruta sea correcta según tu estructura

const dbPath = './comandos/database/economy/';

const toMs = (h = 0, m = 0, s = 0) => ((h * 3600) + (m * 60) + s) * 1000;

const formatDelta = (ms) => {
    if (!ms || ms <= 0) return '00:00:00';
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
};

const dailyCommand = {
    name: 'daily',
    alias: ['diario'],
    category: 'economy',
    desc: 'Reclama tu recompensa diaria de coins',
    noPrefix: true,

    run: async (conn, m) => {
        // === MEJOR DETECCIÓN DE SENDER (evita errores de split) ===
        let sender = m.sender || 
                     m.key?.participant || 
                     m.key?.remoteJid || 
                     m.participant;

        if (!sender) return console.error('[ERROR] No se pudo obtener el sender');

        // Normalizamos el número (quitamos @s.whatsapp.net)
        const userNumber = sender.split('@')[0];

        const from = m.key.remoteJid;

        const e1 = config.visuals?.emoji || '🌟';
        const e2 = config.visuals?.emoji2 || '✨';
        const eCoins = config.visuals?.emoji5 || '🪙';
        const img = config.visuals?.img1 || 'https://i.imgur.com/default.jpg'; // pon una imagen por defecto si quieres

        const userDir = path.join(dbPath, userNumber);
        const dailyFile = path.join(userDir, 'daily.json');

        // Crear carpeta si no existe
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }

        let data = { lastDaily: 0, nextReward: 1000, totalCoins: 0 };

        if (fs.existsSync(dailyFile)) {
            try {
                data = JSON.parse(fs.readFileSync(dailyFile, 'utf-8'));
            } catch (err) {
                console.error(`[ERROR] Archivo daily.json corrupto para ${userNumber}`);
                // Si está corrupto, usamos datos por defecto
            }
        }

        const now = Date.now();
        const cooldown = toMs(24, 0, 0); // 24 horas

        if (now - (data.lastDaily || 0) < cooldown) {
            const remaining = (data.lastDaily || 0) + cooldown - now;
            return conn.sendMessage(from, {
                image: { url: img },
                caption: `*${e1} ESPERA UN POCO ${e1}*\n\n` +
                         `⏳ Tiempo restante: *${formatDelta(remaining)}*\n\n` +
                         `> ¡No seas ansioso, vuelve mañana!`
            }, { quoted: m });
        }

        // === RECOMPENSA ===
        const coinsGained = data.nextReward || 1000;
        data.totalCoins = (data.totalCoins || 0) + coinsGained;
        data.lastDaily = now;
        data.nextReward = Math.floor(coinsGained * 2); // duplica la próxima

        // Guardar datos
        fs.writeFileSync(dailyFile, JSON.stringify(data, null, 2));

        const pushName = m.pushName || 'Usuario';

        const txt = `*${e1} RECOMPENSA DIARIA ${e1}*\n\n` +
                    `👤 *Usuario:* ${pushName}\n\n` +
                    `\( {eCoins} *Coins obtenidos:* + \){coinsGained.toLocaleString()}\n` +
                    `${e2} *Próxima recompensa:* ${data.nextReward.toLocaleString()} coins\n\n` +
                    `> ¡Sigue viniendo todos los días para maximizar tus ganancias! 🔥`;

        await conn.sendMessage(from, {
            image: { url: img },
            caption: txt
        }, { quoted: m });
    }
};

export default dailyCommand;