import axios from 'axios';
import * as cheerio from 'cheerio';

// 🛡️ MEMORIA ANTI-CLON (Caché optimizada)
global.pinHistory = global.pinHistory || new Set();

const pinterestCommand = {
    name: 'pinterest',
    alias: ['pin'],
    category: 'downloads',
    noPrefix: true,

    run: async (conn, m, args) => {
        const text = args.join(" ");
        if (!text) return m.reply(`*❁* \`Falta Texto\` *❁*\n\n> Ingresa un término de búsqueda. Ej: .pin carros`);

        // 🕜 Reacción de inicio (Método seguro para tu base)
        await conn.sendMessage(m.chat, { react: { text: "🕜", key: m.key } });

        await m.reply(`*✿︎* \`Buscando...\` *✿︎*\n\n> ⏳ Procesando su solicitud de Pinterest...`);

        try {
            let seleccionadas = [];

            // 📥 MODO 1: DESCARGA POR LINK
            if (text.startsWith("http")) {
                const result = await downloadPinterest(text);
                if (!result || !result.download) {
                    return m.reply(`*❁* \`Enlace inválido o no soportado\` *❁*`);
                }
                seleccionadas.push({ image_large_url: result.download });
            } else {
                // 🔎 MODO 2: BÚSQUEDA DIRECTA Y FILTRADA
                let results = await searchPinterest(text);

                if (!results || results.length === 0) {
                    return m.reply(`*❁* \`Sin Resultados\` *❁*\n\n> No encontré nada relacionado a esa búsqueda.`);
                }

                // Filtro Anti-Clon: Descarta imágenes ya enviadas
                const nuevas = results.filter(item => !global.pinHistory.has(item.image_large_url));

                if (nuevas.length === 0) {
                    return m.reply(`*❁* \`Imágenes Agotadas\` *❁*\n\n> Ya envié todas las fotos recientes de esta búsqueda. Intenta con otra palabra.`);
                }

                // SELECCIÓN: 8 FOTOS
                seleccionadas = nuevas.sort(() => 0.5 - Math.random()).slice(0, 8);
            }

            // 🚀 MODO TURBO: Enviar todas las imágenes al mismo tiempo (Paralelo)
            const promesasEnvio = seleccionadas.map(async (item) => {
                global.pinHistory.add(item.image_large_url);
                return conn.sendMessage(m.chat, { image: { url: item.image_large_url } }, { quoted: m });
            });

            await Promise.all(promesasEnvio);

            // 📝 TEXTO FINAL ESTILO KAZUMA MISTER BOT
            const infoText = `*» (❍ᴥ❍ʋ) \`PINTEREST\` «*\n> ꕥ *Búsqueda:* ${text}\n> ꕥ *Cantidad:* ${seleccionadas.length} imágenes\n> Descargado por Kazuma Mister Bot`;
            await m.reply(infoText);

            // ✅ Reacción de finalización exitosa
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

            // 🧹 Limpieza automática de RAM para evitar lag
            if (global.pinHistory.size > 200) {
                const iterador = global.pinHistory.values();
                for(let i=0; i<50; i++) global.pinHistory.delete(iterador.next().value);
            }

        } catch (e) {
            console.error("Error Pinterest:", e.message);
            m.reply(`*❁* \`Error Crítico\` *❁*\n\n> No se pudo procesar la solicitud.`);
        }
    }
};

// ========================================================
// ⚙️ MOTORES (Ingeniería Inversa)
// ========================================================

async function searchPinterest(query) {
    const link = `https://id.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(query)}%26rs%3Dtyped&data=%7B%22options%22%3A%7B%22applied_unified_filters%22%3Anull%2C%22appliedProductFilters%22%3A%22---%22%2C%22article%22%3Anull%2C%22auto_correction_disabled%22%3Afalse%2C%22corpus%22%3Anull%2C%22customized_rerank_type%22%3Anull%2C%22domains%22%3Anull%2C%22dynamicPageSizeExpGroup%22%3A%22control%22%2C%22filters%22%3Anull%2C%22journey_depth%22%3Anull%2C%22page_size%22%3Anull%2C%22price_max%22%3Anull%2C%22price_min%22%3Anull%2C%22query_pin_sigs%22%3Anull%2C%22query%22%3A%22${encodeURIComponent(query)}%22%2C%22redux_normalize_feed%22%3Atrue%2C%22request_params%22%3Anull%2C%22rs%22%3A%22typed%22%2C%22scope%22%3A%22pins%22%2C%22selected_one_bar_modules%22%3Anull%2C%22seoDrawerEnabled%22%3Anull%2C%22source_id%22%3Anull%2C%22source_module_id%22%3Anull%2C%22source_url%22%3A%22%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(query)}%22%2C%22top_pin_id%22%3Anull%2C%22top_pin_ids%22%3Anull%7D%2C%22context%22%3A%7B%7D%7D`;

    const headers = {
        'accept': 'application/json, text/javascript, */*; q=0.01',
        'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'referer': 'https://id.pinterest.com/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/133.0.0.0',
        'x-app-version': 'c056fb7',
        'x-pinterest-appstate': 'active',
        'x-pinterest-pws-handler': 'www/index.js',
        'x-requested-with': 'XMLHttpRequest'
    };

    try {
        const res = await axios.get(link, { headers });
        if (res.data?.resource_response?.data?.results) {
            return res.data.resource_response.data.results
                .filter(item => item.images?.orig?.url)
                .map(item => ({ image_large_url: item.images.orig.url }));
        }
        return [];
    } catch (error) {
        return [];
    }
}

async function downloadPinterest(url) {
    try {
        let res = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        let $ = cheerio.load(res.data);
        let tag = $('script[data-test-id="video-snippet"]');
        if (tag.length) {
            let result = JSON.parse(tag.text());
            return { title: result.name, download: result.contentUrl };
        } else {
            let json = JSON.parse($("script[data-relay-response='true']").eq(0).text());
            let result = json.response.data["v3GetPinQuery"].data;
            return { title: result.title, download: result.imageLargeUrl };
        }
    } catch { return { msg: "Error" }; }
}

export default pinterestCommand;

