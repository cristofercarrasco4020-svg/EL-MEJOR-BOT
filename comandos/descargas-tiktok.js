import fetch from 'node-fetch';

const tiktokCommand = {
    name: 'tt',
    alias: ['tiktok', 'ttdl', 'playtt'],
    category: 'download',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName) => {
        let text = args.join(' ');
        if (!text) return m.reply(`*❁* \`Falta búsqueda o enlace\` *❁*\n\nIngresa un nombre de usuario o enlace de TikTok.`);

        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        const apiKey = "NEX-0868C926ADF94B19A51E18C4";
        const isUrl = text.match(/tiktok.com/gi);
        const headers = { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36' 
        };

        try {
            await m.reply(`*✿︎* \`Buscando videos aleatorios para ti...\` *✿︎*`);

            if (isUrl) {
                const res = await fetch(`https://nex-magical.vercel.app/download/tiktok?url=${encodeURIComponent(text)}&apikey=${apiKey}`, { headers });
                const json = await res.json();
                if (!json.status) throw new Error('Link inválido');
                
                const videoData = json.result.data;
                const finalVideo = videoData.hdplay || videoData.play;

                await conn.sendMessage(m.key.remoteJid, {
                    video: { url: finalVideo },
                    caption: `*» (❍ᴥ❍ʋ) \`TIKTOK DOWNLOAD\` «*\n*✿︎ Autor:* \`${videoData.author.nickname}\`\n> Descargado por Kazuma Bot`,
                    mimetype: 'video/mp4'
                }, { quoted: m });

            } else {
                const res = await fetch(`https://nex-magical.vercel.app/search/tiktok?q=${encodeURIComponent(text)}&apikey=${apiKey}`, { headers });
                const json = await res.json();
                if (!json.status || !json.result.length) return m.reply('*❁* `Sin resultados` *❁*');

                // AQUÍ ESTÁ EL CAMBIO: Barajamos la lista (Shuffle)
                // Usamos sort(() => Math.random() - 0.5) para mezclar los resultados
                const videos = json.result.sort(() => Math.random() - 0.5).slice(0, 8);
                
                for (let i = 0; i < videos.length; i++) {
                    const videoData = videos[i];
                    await conn.sendMessage(m.key.remoteJid, {
                        video: { url: videoData.play },
                        caption: `*» (❍ᴥ❍ʋ) \`RESULTADO ALEATORIO ${i + 1}/8\` «*\n*✿︎ Autor:* \`${videoData.author.nickname}\``,
                        mimetype: 'video/mp4'
                    });
                }
            }

            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (err) {
            console.error(err);
            m.reply('*❁* `Error Crítico` *❁*\n\nNo se pudo obtener el video.');
        }
    }
};

export default tiktokCommand;

