/* KAZUMA MISTER BOT - YOUTUBE DOWNLOADER & SEARCH 
   Desarrollado por Félix OFC
*/
import fetch from 'node-fetch';

const youtubeCommand = {
    name: 'play',
    alias: ['playvideo', 'playaudio', 'ytv', 'yta', 'yts', 'search'],
    category: 'download',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName) => {
        const text = args.join(' ');
        if (!text) return m.reply(`*❁* \`Falta Texto o Enlace\` *❁*\n\nIngresa un nombre o un enlace de YouTube para procesar.\n\n> Ejemplo: *${usedPrefix}${commandName} RDJavi*`);

        const isUrl = text.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}/);
        const apiKey = "NEX-0868C926ADF94B19A51E18C4";

        // --- LÓGICA DE BÚSQUEDA (Si no es un enlace) ---
        if (!isUrl) {
            try {
                await m.reply(`*✿︎* \`Buscando en YouTube\` *✿︎*\n\nKazuma está localizando resultados para: *${text}*...\n\n> ⏳ Consultando base de datos...`);

                const searchUrl = `https://nex-magical.vercel.app/search/youtube?q=${encodeURIComponent(text)}&apikey=${apiKey}`;
                const res = await fetch(searchUrl);
                const data = await res.json();

                if (!data.status || !data.result || data.result.length === 0) {
                    return m.reply('*❁* `Sin Resultados` *❁*\n\nNo se encontró nada relacionado con tu búsqueda.');
                }

                let searchMsg = `*» (❍ᴥ❍ʋ) \`Youtube\` «*\n> Resultados para: *${text}*\n\n`;
                
                // Mostramos los primeros 10 resultados para no saturar
                data.result.slice(0, 10).forEach((vid, i) => {
                    searchMsg += `*${i + 1}.* \`${vid.title}\`\n`;
                    searchMsg += `*✿︎ Canal:* ${vid.channel}\n`;
                    searchMsg += `*✿︎ Duración:* ${vid.duration}\n`;
                    searchMsg += `*✿︎ Link:* ${vid.link}\n\n`;
                });

                searchMsg += `> Para descargar, usa el comando con el enlace.`;

                return await conn.sendMessage(m.key.remoteJid, { 
                    image: { url: data.result[0].imageUrl }, 
                    caption: searchMsg 
                }, { quoted: m });

            } catch (err) {
                console.error('Error en Búsqueda YT:', err);
                return m.reply('*❁* `Error de Búsqueda` *❁*\n\nNo se pudo completar la búsqueda en este momento.');
            }
        }

        // --- LÓGICA DE DESCARGA (Si es un enlace) ---
        const isVideo = ['playvideo', 'ytv', 'play'].includes(commandName);
        const type = isVideo ? 'Video' : 'Audio';
        const apiUrl = `https://nex-magical.vercel.app/download/${type.toLowerCase()}?url=${encodeURIComponent(text)}&apikey=${apiKey}`;

        try {
            await m.reply(`*✿︎* \`Buscando Contenido\` *✿︎*\n\nKazuma está extrayendo el ${type} de YouTube. Por favor, espera...\n\n> ⏳ Solicitando a la API...`);

            const res = await fetch(apiUrl);
            const data = await res.json();

            if (!data.status || !data.result.url) {
                return m.reply('*❁* `Error de Descarga` *❁*\n\nLa API no pudo procesar este enlace. Inténtalo de nuevo.');
            }

            const downloadUrl = data.result.url;
            const thumb = data.result.info.thumbnail;

            const infoText = `*» (❍ᴥ❍ʋ) \`YOUTUBE ${type.toUpperCase()}\` «*
> ꕥ Contenido obtenido con éxito.

*✿︎ ID:* \`${data.result.videoId}\`
*✿︎ Formato:* \`${data.result.format}\`
*✿︎ Calidad:* \`${data.result.quality}\`

> En unos instantes recibirás tu archivo...`;

            await conn.sendMessage(m.key.remoteJid, { 
                image: { url: thumb }, 
                caption: infoText 
            }, { quoted: m });

            if (isVideo) {
                await conn.sendMessage(m.key.remoteJid, { 
                    video: { url: downloadUrl }, 
                    caption: `*✿︎ Video:* \`${data.result.videoId}\`\n> Descargado por Kazuma Mister Bot`,
                    mimetype: 'video/mp4',
                    fileName: `${data.result.videoId}.mp4`
                }, { quoted: m });
            } else {
                await conn.sendMessage(m.key.remoteJid, { 
                    audio: { url: downloadUrl }, 
                    mimetype: 'audio/mpeg',
                    fileName: `${data.result.videoId}.mp3`
                }, { quoted: m });
            }

        } catch (err) {
            console.error('Error en Descargas YT:', err);
            m.reply('*❁* `Error Crítico` *❁*\n\nOcurrió un error al intentar conectar con la API de descargas.');
        }
    }
};

export default youtubeCommand;