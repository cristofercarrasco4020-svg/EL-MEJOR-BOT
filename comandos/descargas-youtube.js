import fetch from 'node-fetch';
import axios from 'axios';
import FormData from 'form-data';

const youtubeCommand = {
    name: 'play',
    alias: ['playvideo', 'ytv', 'yta', 'ytaudio'],
    category: 'download',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName) => {
        let text = args.join(' ');
        if (!text) return m.reply(`*❁* \`Falta Texto o Enlace\`\n\nIngresa un nombre o un enlace de YouTube.`);

        const apiKey = "NEX-0868C926ADF94B19A51E18C4";
        const isUrl = text.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}/);

        if (!isUrl) {
            try {
                await m.reply(`*✿︎* \`Buscando en YouTube\`\n> ⏳ Localizando mejor resultado...`);
                const searchUrl = `https://nex-magical.vercel.app/search/youtube?q=${encodeURIComponent(text)}&apikey=${apiKey}`;
                const resSearch = await fetch(searchUrl);
                const dataSearch = await resSearch.json();
                if (!dataSearch.status || !dataSearch.result.length) return m.reply('*❁* `Sin Resultados`');
                text = dataSearch.result[0].link;
            } catch (err) {
                return m.reply('*❁* `Error de Búsqueda`');
            }
        }

        const isVideo = ['playvideo', 'ytv', 'play'].includes(commandName);
        const type = isVideo ? 'video' : 'audio';
        const apiUrl = `https://nex-magical.vercel.app/download/${type}?url=${encodeURIComponent(text)}&apikey=${apiKey}`;

        try {
            await m.reply(`*✿︎* \`Procesando Contenido\`\n> ⏳ Descargando y subiendo a la nube para envío directo...`);

            const res = await fetch(apiUrl);
            const data = await res.json();
            if (!data.status || !data.result.url) return m.reply('*❁* `Error de Descarga`');

            const mediaUrl = data.result.url;
            const thumb = data.result.info.thumbnail;

            const mediaRes = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(mediaRes.data, 'binary');

            const form = new FormData();
            form.append('reqtype', 'fileupload');
            form.append('fileToUpload', buffer, { 
                filename: isVideo ? 'video.mp4' : 'audio.mp3',
                contentType: isVideo ? 'video/mp4' : 'audio/mpeg' 
            });

            const catboxRes = await axios.post('https://catbox.moe/user/api.php', form, {
                headers: { ...form.getHeaders() }
            });

            const finalUrl = catboxRes.data;

            const infoText = `*» (❍ᴥ❍ʋ) \`YOUTUBE DOWNLOAD\` «*\n\n*✿︎ Título:* \`${data.result.info.title}\`\n*✿︎ Calidad:* \`${data.result.quality}\`\n\n> Enviando archivo final...`;
            await conn.sendMessage(m.chat, { image: { url: thumb }, caption: infoText }, { quoted: m });

            if (isVideo) {
                await conn.sendMessage(m.chat, { 
                    video: { url: finalUrl }, 
                    caption: `> Descargado por Kazuma Mister Bot`,
                    mimetype: 'video/mp4',
                    fileName: `video.mp4`
                }, { quoted: m });
            } else {
                await conn.sendMessage(m.chat, { 
                    audio: { url: finalUrl }, 
                    mimetype: 'audio/mpeg',
                    fileName: `audio.mp3`
                }, { quoted: m });
            }

        } catch (err) {
            console.error(err);
            m.reply('*❁* `Error Crítico al procesar el archivo`');
        }
    }
};

export default youtubeCommand;
