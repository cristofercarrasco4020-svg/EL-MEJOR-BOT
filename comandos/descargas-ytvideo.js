/* Código creado por Félix Ofc 
por favor y no quites los créditos.
https://github.com/Dev-FelixOfc 
*/

import { config } from '../config.js';
import fetch from 'node-fetch';

// Función para descargar el archivo real
const getBuffer = async (url) => {
    try {
        const res = await fetch(url);
        return await res.buffer();
    } catch (e) {
        return null;
    }
};

const ytVideoCommand = {
    name: 'ytmp4',
    alias: ['play', 'ytvideo', 'video', 'v'],
    category: 'downloads',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, { text, command }) => {
        const from = m.key.remoteJid;
        const e1 = config.visuals.emoji;
        const e2 = config.visuals.emoji2;

        if (!text) {
            return await conn.sendMessage(from, { 
                text: `*${e1} Por favor, menciona el nombre o URL del video.*`,
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - AVISO',
                        body: 'Falta el enlace de video',
                        thumbnailUrl: config.visuals.img1, 
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: m });
        }

        // 1. AVISO DE INICIO (Miniatura pequeña)
        await conn.sendMessage(from, { 
            text: `*${e2} Buscando resultados...*`,
            contextInfo: {
                externalAdReply: {
                    title: 'KAZUMA - STATUS',
                    body: 'Procesando con Multi-API...',
                    thumbnailUrl: config.visuals.img1,
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: m });

        try {
            // --- LÓGICA DE MULTI-API (FALLBACK) ---
            let videoData = null;

            // INTENTO 1: API STELLAR
            try {
                const res = await fetch(`https://api.stellarwa.xyz/dl/ytmp4v2?url=${encodeURIComponent(text)}&key=api-Bb1JX`);
                const json = await res.json();
                if (json.status && json.data?.dl) {
                    videoData = {
                        title: json.data.title,
                        dl: json.data.dl,
                        uploader: json.data.uploader || 'YouTube',
                        views: json.data.views || '---',
                        size: json.data.size || '---',
                        duration: json.data.duration || '---'
                    };
                }
            } catch (e) { console.log("Stellar falló, intentando Nex-Magical..."); }

            // INTENTO 2: API NEX-MAGICAL (Si la primera falló)
            if (!videoData) {
                try {
                    const res = await fetch(`https://nex-magical.vercel.app/download/video?url=${encodeURIComponent(text)}&apikey=${config.apiYT}`);
                    const json = await res.json();
                    if (json.status && json.result?.url) {
                        videoData = {
                            title: json.result.info.title,
                            dl: json.result.url,
                            uploader: 'YouTube',
                            views: '---',
                            size: json.result.info.size,
                            duration: json.result.info.duration
                        };
                    }
                } catch (e) { console.log("Nex-Magical también falló."); }
            }

            // --- RESULTADO FINAL ---
            if (!videoData || !videoData.dl) {
                return m.reply(`*${e1} Error:* No se pudo obtener el video de ninguna de las fuentes.`);
            }

            // Descargamos el buffer para que se envíe como video real
            const videoBuffer = await getBuffer(videoData.dl);

            if (!videoBuffer) {
                return m.reply(`*${e1} Error:* No se pudo descargar el archivo de video.`);
            }

            // 2. ENVÍO DEL VIDEO (Sin miniatura de contexto, directo)
            await conn.sendMessage(from, { 
                video: videoBuffer, 
                caption: `*${e1} TÍTULO:* ${videoData.title}\n*👤 CANAL:* ${videoData.uploader}\n*👁️ VISTAS:* ${videoData.views}\n*⌛ DURACIÓN:* ${videoData.duration}\n*📦 PESO:* ${videoData.size}\n\n> Kazuma-Bot | Félix Ofc`,
                fileName: `${videoData.title}.mp4`,
                mimetype: 'video/mp4'
            }, { quoted: m });

        } catch (error) {
            console.error(error);
            m.reply(`*${e1} Error:* Hubo un problema crítico al procesar la descarga.`);
        }
    }
};

export default ytVideoCommand;