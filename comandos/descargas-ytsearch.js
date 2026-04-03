/* Código creado por Félix Ofc 
por favor y no quites los créditos.
https://github.com/Dev-FelixOfc 
*/

import { config } from '../config.js';
import fetch from 'node-fetch';

let ytSearchDB = {};

const ytSearchCommand = {
    name: 'ytsearch',
    alias: ['yt', 'yts', 'buscar'],
    category: 'downloads',
    run: async (conn, m, { text }) => {
        const from = m.key.remoteJid;
        const e1 = config.visuals.emoji;
        const e2 = config.visuals.emoji2;
        const apiKey = "api-Bb1JX"; 

        if (!text) return m.reply(`*${e1} Ingresa el nombre del video a buscar.*`);

        try {
            // Mensaje de estado rápido
            await m.reply(`*${e2} Buscando resultados para:* ${text}...`);

            // Intentamos obtener resultados de la API Stellar
            const res = await fetch(`https://api.stellarwa.xyz/search/yt?query=${encodeURIComponent(text)}&key=${apiKey}`);
            const json = await res.json();

            // Si Stellar falla o no tiene resultados, intentamos con Nex-Magical (Fallback)
            let results = json.status && json.result ? json.result : null;
            
            if (!results || results.length === 0) {
                const resFallback = await fetch(`https://nex-magical.vercel.app/search/youtube?q=${encodeURIComponent(text)}&apikey=${config.apiYT}`);
                const jsonFallback = await resFallback.json();
                results = jsonFallback.status ? jsonFallback.result.map(v => ({
                    title: v.title,
                    autor: 'YouTube',
                    duration: v.duration,
                    banner: v.thumbnail || config.visuals.img1,
                    url: v.link
                })) : null;
            }

            if (!results || results.length === 0) {
                return m.reply(`*${e1} Error:* No se encontraron videos.`);
            }

            // Guardamos los links para el "before"
            const limitedResults = results.slice(0, 10);
            ytSearchDB[from] = limitedResults.map(v => v.url);

            // Construcción del texto
            let txt = `*✅ Se encontraron ${limitedResults.length} resultados para:* ${text.toUpperCase()}\n\n`;
            limitedResults.forEach((v, i) => {
                txt += `*${i + 1}.* ${v.title}\n*⌛:* ${v.duration} | *👤:* ${v.autor || v.uploader}\n\n`;
            });
            txt += `*${e1} Responde a este mensaje con un número (1-${limitedResults.length}) para descargar el video.*`;

            // Enviamos la miniatura del primer resultado como FOTO REAL
            const firstThumb = limitedResults[0].banner || limitedResults[0].thumb;

            await conn.sendMessage(from, { 
                image: { url: firstThumb }, 
                caption: txt 
            }, { quoted: m });

        } catch (error) {
            console.error('Error en buscador:', error);
            m.reply(`*${e1} Error:* El servidor de búsqueda no responde.`);
        }
    }
};

export const before = async (conn, m) => {
    // Validamos que sea una respuesta numérica al mensaje de resultados
    if (!m.quoted || !m.quoted.fromMe || !m.text || isNaN(m.text)) return;
    if (!m.quoted.text || !m.quoted.text.includes('Se encontraron')) return;

    const from = m.key.remoteJid;
    const chatData = ytSearchDB[from];
    if (!chatData) return;

    const index = parseInt(m.text.trim()) - 1;
    if (index < 0 || index >= chatData.length) return;

    const link = chatData[index];
    
    // Llamamos al descargador de video (asegúrate de que el nombre del archivo sea correcto)
    const { default: videoCmd } = await import('./descargas-ytvideo.js');
    await videoCmd.run(conn, m, { text: link, command: 'ytmp4' });
};

export default ytSearchCommand;
