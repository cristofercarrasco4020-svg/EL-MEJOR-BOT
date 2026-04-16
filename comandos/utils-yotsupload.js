/* KAZUMA MISTER BOT - YOTSUBA UPLOAD (FULL STYLE) 
   Desarrollado por Félix OFC
*/
import fetch from 'node-fetch';
import FormData from 'form-data';

const yotsubaUploadCommand = {
    name: 'upload',
    alias: ['tourl', 'yupload', 'toimg'],
    category: 'utils',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName) => {
        const quoted = m.quoted ? m.quoted : m;

        const msgContent = quoted.message || m.message || {};
        const mime =
            msgContent.imageMessage?.mimetype ||
            msgContent.videoMessage?.mimetype ||
            msgContent.audioMessage?.mimetype ||
            msgContent.stickerMessage?.mimetype ||
            msgContent.documentMessage?.mimetype ||
            quoted?.mimetype ||
            m?.mimetype || '';

        if (!mime || !/image|video|webp|audio|sticker/.test(mime)) {
            return m.reply(`*❁* \`Falta Archivo\` *❁*\n\nResponde a una imagen o video corto para convertirlo en enlace.\n\n> Ejemplo: Envía una imagen y pon *${usedPrefix}${commandName}*`);
        }

        try {
            await m.reply(`*✿︎* \`Subiendo Archivo\` *✿︎*\n\nKazuma está enviando el archivo a Yotsuba Cloud. Por favor, espera...\n\n> ⏳ Conectando con tu API privada...`);

            const media = await conn.downloadMediaMessage(quoted);
            if (!media) return m.reply('*❁* `Error de Medios` *❁*\n\nNo se pudo descargar el archivo. Intenta de nuevo.');

            const formData = new FormData();
            formData.append('file', media, { 
                filename: `kazuma_${Date.now()}.${mime.split('/')[1] || 'bin'}`,
                contentType: mime 
            });

            const res = await fetch('https://upload.yotsuba.giize.com/upload', {
                method: 'POST',
                body: formData,
                headers: formData.getHeaders()
            });

            const data = await res.json();
            const rawUrl = data.fileUrl || data.url;
            const finalUrl = rawUrl?.startsWith('http') 
                ? rawUrl 
                : rawUrl ? `https://upload.yotsuba.giize.com${rawUrl}` : null;

            if (!finalUrl) {
                return m.reply('*❁* `Error de API` *❁*\n\nTu servidor no devolvió un enlace válido.');
            }

            const successText = `*» (❍ᴥ❍ʋ) \`YOTSUBA CLOUD\` «*
> ꕥ Archivo convertido con éxito.

*✿︎ Enlace:* \`${finalUrl}\`
*✿︎ Tipo:* \`${mime}\`

> ¡Recuerda que este enlace es público, compártelo con cuidado!`;

            await conn.sendMessage(m.chat, { text: successText }, { quoted: m });

        } catch (err) {
            console.error('Error en Yotsuba Upload:', err);
            m.reply(`*❁* \`Error Crítico\` *❁*\n\nOcurrió un error al conectar con tu API.`);
        }
    }
};

export default yotsubaUploadCommand;