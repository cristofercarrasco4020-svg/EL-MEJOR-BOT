import axios from 'axios';
import { config } from '../config.js';

// 🛡️ MEMORIA HEURÍSTICA (Persistencia global)
global.tetasHistory = global.tetasHistory || new Set();
global.tetasCache = global.tetasCache || [];

export default {
    name: 'tetas',
    alias: ['tits', 'boobs', 'pechos', 'tetitas'],
    category: 'nsfw',
    noPrefix: true,
    isOwner: false,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m) => {
        // 1. Reacción 🔥
        await conn.sendMessage(m.chat, { react: { text: "🔥", key: m.key } });

        try {
            // 2. SISTEMA DE RECARGA: Si el caché está vacío o muy bajo (< 5 fotos), recargamos
            if (global.tetasCache.length < 5) {

                // Lista de fuentes expandida para máxima variedad
                const sources = [
                    'boobs', 'boobies', 'HugeBoobs', 'bigtits', 'stacked', 
                    'TittyDrop', 'TheHangingBoobs', 'naturaltitties', 'homegrown', 
                    'PerfectTits', 'pokies', 'BiggerThanYouThought', 'braless', 
                    'cleavage', 'sweatermeat', 'smallboobs', 'Tinytits', 
                    'PuffyNipples', 'torpedotits', 'RealGirls', 'milf', 
                    'nicehooters', 'bustyasians', 'voluptuous', 'JiggleFuck',
                    'AsiansGoneWild', 'GifsOfBoobs'
                ];

                // Mezclador de fuentes (elige 8 al azar cada vez)
                const mix = sources.sort(() => 0.5 - Math.random()).slice(0, 8).join('+');

                // Pedimos 50 imágenes de golpe
                const { data } = await axios.get(`https://meme-api.com/gimme/${mix}/50`);

                // 3. FILTRO "ANTI-REPETICIÓN" QUIRÚRGICO
                const nuevasFotos = data.memes.filter(img => {
                    const esFoto = ['jpg', 'jpeg', 'png'].includes(img.url.split('.').pop().toLowerCase());
                    const yaExiste = global.tetasHistory.has(img.url);
                    return esFoto && !yaExiste;
                });

                // Sumamos al caché existente
                global.tetasCache.push(...nuevasFotos);
            }

            // 4. EXTRACCIÓN
            if (global.tetasCache.length === 0) throw new Error("No hay contenido nuevo disponible.");

            const imagenGanadora = global.tetasCache.shift(); // Sacamos la primera
            global.tetasHistory.add(imagenGanadora.url);

            // 5. MANTENIMIENTO DE MEMORIA (Historial limitado a 500 para no consumir RAM)
            if (global.tetasHistory.size > 500) {
                const iterador = global.tetasHistory.values();
                global.tetasHistory.delete(iterador.next().value);
            }

            // 6. ENVÍO FINAL
            await conn.sendMessage(m.chat, { 
                image: { url: imagenGanadora.url }, 
                caption: `TETAS 😋\n\n🤖 *KAZUMA BOT*` 
            }, { quoted: m });

        } catch (e) {
            console.error("Error Tetas:", e.message);

            // 7. RESPALDO
            try {
                const backup = await axios.get(`https://nekobot.xyz/api/image?type=boobs`);
                await conn.sendMessage(m.chat, { 
                    image: { url: backup.data.message }, 
                    caption: `TETAS 😋 (Respaldo)\n🤖 *KAZUMA BOT*` 
                }, { quoted: m });
            } catch (e2) {
                await conn.sendMessage(m.chat, { text: "❌ Error: Servidores ocupados, intenta en un momento." }, { quoted: m });
            }
        }
    }
};

