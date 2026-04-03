/* Código creado por Félix Ofc 
por favor no quites los créditos.
https://github.com/Dev-FelixOfc 
*/

import { config } from '../config.js';
import axios from 'axios';

const ytsearchCommand = {
    name: 'ytsearch',
    alias: ['yt', 'youtube', 'musica'],
    category: 'descargas',
    isOwner: false,
    noPrefix: false,
    isAdmin: false,
    isGroup: true,

    run: async (conn, m, args) => {
        const from = m.key.remoteJid;
        const text = args.join(' ');

        if (!text) {
            return await conn.sendMessage(from, { 
                text: '❌ *Por favor ingresa el nombre de la canción o video*\n\n📝 *Uso:* .ytsearch Nombre del Video',
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - YouTube Search',
                        body: 'Búsqueda de YouTube',
                        thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg', 
                        sourceUrl: 'https://panel.kurayamihost.ooguy.com',
                        mediaType: 1,
                        renderLargerThumbnail: false,
                        showAdAttribution: false
                    }
                }
            }, { quoted: m });
        }

        try {
            // Mostrar que está buscando
            await conn.sendMessage(from, { 
                text: '🔍 *Buscando en YouTube...*',
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - Buscando',
                        body: 'Procesando búsqueda',
                        thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg', 
                        sourceUrl: 'https://panel.kurayamihost.ooguy.com',
                        mediaType: 1,
                        renderLargerThumbnail: false,
                        showAdAttribution: false
                    }
                }
            }, { quoted: m });

            // Buscar en YouTube usando la API de Stellar
            const response = await axios.get(`https://api.stellarwa.xyz/search/yt?query=${encodeURIComponent(text)}&key=api-Bb1JX`);
            const results = response.data.results || [];
            
            if (results.length === 0) {
                return await conn.sendMessage(from, { 
                    text: '❌ *No se encontraron resultados para tu búsqueda*',
                    contextInfo: {
                        externalAdReply: {
                            title: 'KAZUMA - Sin Resultados',
                            body: 'Intenta con otro término',
                            thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg', 
                            sourceUrl: 'https://panel.kurayamihost.ooguy.com',
                            mediaType: 1,
                            renderLargerThumbnail: false,
                            showAdAttribution: false
                        }
                    }
                }, { quoted: m });
            }

            // Tomar el primer resultado
            const video = results[0];
            const thumbnail = video.thumbnail || 'https://files.catbox.moe/9ssbf9.jpg';

            // Crear mensaje con la información del video
            let messageText = `🎵 *RESULTADO DE BÚSQUEDA*\n\n`;
            messageText += `*Título:* ${video.title}\n`;
            messageText += `*Canal:* ${video.channel || 'No disponible'}\n`;
            messageText += `*Duración:* ${video.duration || 'No disponible'}\n`;
            messageText += `*Visualizaciones:* ${video.views || 'No disponible'}\n\n`;
            messageText += `🔗 _Link:_ ${video.url}\n\n`;
            messageText += `💿 *Para descargar como MP3:*\n`;
            messageText += `_.mp3 ${video.url}_`;

            await conn.sendMessage(from, { 
                text: messageText,
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - YouTube Download',
                        body: video.title.substring(0, 50),
                        thumbnailUrl: thumbnail, 
                        sourceUrl: video.url,
                        mediaType: 1,
                        renderLargerThumbnail: false,
                        showAdAttribution: false
                    }
                }
            }, { quoted: m });

        } catch (err) {
            console.error('Error en comando ytsearch:', err);
            await conn.sendMessage(from, { 
                text: '❌ *Error al buscar en YouTube*\n\nIntenta más tarde.',
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - Error',
                        body: 'Ocurrió un error',
                        thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg', 
                        sourceUrl: 'https://panel.kurayamihost.ooguy.com',
                        mediaType: 1,
                        renderLargerThumbnail: false,
                        showAdAttribution: false
                    }
                }
            }, { quoted: m });
        }
    }
};

export default ytsearchCommand;