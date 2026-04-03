/* Código creado por Félix Ofc 
por favor y no quites los créditos.
https://github.com/Dev-FelixOfc 
*/

import { config } from '../config.js';
import fetch from 'node-fetch';

// Base de datos temporal para guardar los links de la búsqueda
let ytSearchDB = {};

const ytSearchCommand = {
    name: 'ytsearch',
    alias: ['yt', 'yts', 'buscar'],
    category: 'downloads',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, { text, command }) => {
        const from = m.key.remoteJid;
        const e1 = config.visuals.emoji;
        const e2 = config.visuals.emoji2;
        const apiKey = "api-Bb1JX"; 

        if (!text) {
            return await conn.sendMessage(from, { 
                text: `*${e1} Ingresa el nombre del video a buscar.*`,
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - BUSCADOR',
                        body: 'Falta el término de búsqueda',
                        thumbnailUrl: config.visuals.img1, 
                        mediaType: 1,
                        renderLargerThumbnail: false,
                        showAdAttribution: false
                    }
                }
            }, { quoted: m });
        }

        try {
            // 1. Aviso de búsqueda
            await conn.sendMessage(from, { 
                text: `*${e2} Buscando resultados para:* ${text}...`,
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - BUSCANDO',
                        body: 'Consultando servidores de YouTube',
                        thumbnailUrl: config.visuals.img1,
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: m });

            let results = null;

            // INTENTO 1: API STELLAR
            try {
                const res = await fetch(`https://api.stellarwa.xyz/search/yt?query=${encodeURIComponent(text)}&key=${apiKey}`);
                const json = await res.json();
                if (json.status && json.result?.length > 0) {
                    results = json.result.map(v => ({
                        title: v.title,
                        author: v.autor,
                        duration: v.duration,
                        url: v.url
                    }));
                }
            } catch (e) { console.log("Buscador Stellar falló..."); }

            // INTENTO 2: API NEX-MAGICAL (Fallback)
            if (!results) {
                try {
                    const res = await fetch(`https://nex-magical.vercel.app/search/youtube?q=${encodeURIComponent(text)}&apikey=${config.apiYT}`);
                    const json = await res.json();
                    if (json.status && json.result?.length > 0) {
                        results = json.result.map(v => ({
                            title: v.title,
                            author: 'YouTube',
                            duration: v.duration,
                            url: v.link
                        }));
                    }
                } catch (e) { console.log("Buscador Nex-Magical falló."); }
            }

            if (!results) {
                return m.reply(`*${e1} Error:* No se encontraron videos para esa búsqueda.`);
            }

            // Guardamos los links para que el 'before' los use al responder con número
            ytSearchDB[from] = results.map(v => v.url);

            let txt = `*${e2} RESULTADOS DE:* ${text.toUpperCase()}\n${config.visuals.line.repeat(15)}\n\n`;
            
            results.slice(0, 10).forEach((v, i) => {
                txt += `*#${i + 1}* - ${v.title}\n*👤:* ${v.author} | *⌛:* ${v.duration}\n\n`;
            });

            txt += `${config.visuals.line.repeat(15)}\n*${e1} Responde con el número para descargar el video.*`;

            // 2. Envío de la lista con imagen grande
            await conn.sendMessage(from, { 
                image: { url: config.visuals.img2 }, 
                caption: txt,
                contextInfo: {
                    externalAdReply: {
                        title: 'YOUTUBE SEARCH SYSTEM',
                        body: `Resultados encontrados: ${results.length}`,
                        thumbnailUrl: config.visuals.img1,
                        mediaType: 1,
                        renderLargerThumbnail: true, // Imagen grande para la lista
                        showAdAttribution: false
                    }
                }
            }, { quoted: m });

        } catch (error) {
            console.error(error);
            m.reply(`*${e1} Error:* Falló el sistema de búsqueda.`);
        }
    }
};

// ESTA FUNCIÓN DETECTA CUANDO EL USUARIO RESPONDE CON UN NÚMERO
export const before = async (conn, m) => {
    // Solo si el mensaje es una respuesta a un mensaje del bot que diga "RESULTADOS DE:"
    if (!m.quoted || !m.quoted.fromMe || !m.text || isNaN(m.text)) return;
    if (!m.quoted.text || !m.quoted.text.includes('RESULTADOS DE:')) return;

    const from = m.key.remoteJid;
    const chatData = ytSearchDB[from];
    if (!chatData) return;

    const index = parseInt(m.text.trim()) - 1;
    if (index < 0 || index >= chatData.length) return;

    const link = chatData[index];
    
    // Ejecutamos el comando de descarga de video usando el link seleccionado
    // Importante: Asegúrate de que el comando de video se llame 'ytmp4'
    const { default: videoCmd } = await import('./descargas-ytvideo.js');
    await videoCmd.run(conn, m, { text: link, command: 'ytmp4' });
};

export default ytSearchCommand;