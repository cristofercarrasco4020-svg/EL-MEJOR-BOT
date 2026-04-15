/* KAZUMA MISTER BOT - YOUTUBE DOWNLOADER OPTIMIZADO */
import fetch from 'node-fetch';

const youtubeCommand = {
    name: 'play',
    alias: ['playvideo', 'playaudio', 'ytv', 'yta'],
    category: 'download',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName) => {
        const text = args.join(' ');
        if (!text) return m.reply(`*❁* \`Falta Enlace\` *❁*\n\nIngresa un enlace de YouTube.\n\n> Ejemplo: *${usedPrefix}${commandName} https://youtu.be/...*`);

        const isVideo = ['playvideo', 'ytv', 'play'].includes(commandName);
        const type = isVideo ? 'video' : 'audio';
        const apiKey = "NEX-0868C926ADF94B19A51E18C4";
        const apiUrl = `https://nex-magical.vercel.app/download/${type}?url=${encodeURIComponent(text)}&apikey=${apiKey}`;

        try {
            // 1. Solicitud inmediata a la API
            const res = await fetch(apiUrl);
            const data = await res.json();

            if (!data.status || !data.result.url) {
                return m.reply('*❁* `Error` *❁*\n\nNo se pudo obtener el contenido.');
            }

            const downloadUrl = data.result.url;

            // 2. Enviar la info primero (Esto sale rápido porque es una imagen/texto)
            const infoText = `*» (❍ᴥ❍ʋ) \`YOUTUBE ${type.toUpperCase()}\` «*\n\n*✿︎ ID:* \`${data.result.videoId}\`\n*✿︎ Calidad:* \`${data.result.quality}\`\n\n> Enviando archivo...`;
            
            await conn.sendMessage(m.key.remoteJid, { 
                image: { url: data.result.info.thumbnail }, 
                caption: infoText 
            }, { quoted: m });

            // 3. Envío del archivo SIN esperas artificiales
            // Usamos un pequeño delay de 1.5 segundos solo para que WhatsApp no se sature 
            // al intentar enviar dos mensajes al mismo milisegundo.
            setTimeout(async () => {
                if (isVideo) {
                    await conn.sendMessage(m.key.remoteJid, { 
                        video: { url: downloadUrl }, 
                        caption: `*✿︎ Video:* \`${data.result.videoId}\``,
                        mimetype: 'video/mp4',
                        fileName: `${data.result.videoId}.mp4`
                    }, { quoted: m });
                } else {
                    await conn.sendMessage(m.key.remoteJid, { 
                        audio: { url: downloadUrl }, 
                        mimetype: 'audio/mpeg',
                        fileName: `${data.result.videoId}.mp3`,
                        ptt: false // Cambia a true si quieres que se mande como nota de voz
                    }, { quoted: m });
                }
            }, 1500); 

        } catch (err) {
            console.error(err);
            m.reply('Ocurrió un error.');
        }
    }
};

export default youtubeCommand;