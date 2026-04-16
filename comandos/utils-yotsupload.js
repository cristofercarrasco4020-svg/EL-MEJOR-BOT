/* KAZUMA MISTER BOT - YOTSUBA UPLOAD (SCRAPER EDITION) 
   Desarrollado por Félix OFC
   Optimizado para la API Scraper de Yotsuba
*/
import fetch from 'node-fetch';
import FormData from 'form-data';

const yotsubaUploadCommand = {
    name: 'upload',
    alias: ['tourl', 'yupload', 'toimg'],
    category: 'utils',
    noPrefix: true,

    run: async (conn, m, { usedPrefix, command }) => {
        // Detectar si es un mensaje citado o el mensaje actual
        const quoted = m.quoted ? m.quoted : m;
        
        // Forma más robusta de detectar el tipo de archivo (Mime)
        const mime = (quoted.msg || quoted).mimetype || '';

        // Si no hay mime, el usuario no envió/respondió a un archivo
        if (!mime) {
            return m.reply(`*❁* \`Falta Archivo\` *❁*\n\nDebes responder a una imagen, video, sticker o audio.\n\n> Ejemplo: Responde a algo y pon *${usedPrefix}${command}*`);
        }

        try {
            // Notificar que Kazuma está trabajando
            await m.reply(`*✿︎* \`Subiendo vía Scraper\` *✿︎*\n\nConectando con la API de Yotsuba...`);

            // Descargar el archivo binario
            const media = await quoted.download();
            if (!media) return m.reply('*❁* `Error de Descarga` *❁*\n\nNo pude procesar el archivo. Intenta de nuevo.');

            // Preparar el envío a la API del amigo (Scraper)
            const formData = new FormData();
            formData.append('file', media, { 
                filename: `kazuma_${Date.now()}.${mime.split('/')[1] || 'bin'}`,
                contentType: mime 
            });

            // IMPORTANTE: Aquí usamos la URL del scraper de tu amigo que redirige a tu web
            const res = await fetch('https://upload.yotsuba.giize.com/upload', {
                method: 'POST',
                body: formData,
                headers: formData.getHeaders()
            });

            if (!res.ok) throw new Error(`Server status: ${res.status}`);

            const data = await res.json();
            
            // Extraer la URL (buscando en los campos comunes que devuelven los scrapers)
            const finalUrl = data.fileUrl || data.url || data.result || data.link;

            if (!finalUrl) {
                return m.reply('*❁* `Error de Respuesta` *❁*\n\nLa API no devolvió un enlace. Verifica el Scraper.');
            }

            const successText = `*» (❍ᴥ❍ʋ) \`YOTSUBA UPLOAD\` «*
> ꕥ Convertido exitosamente por el Scraper.

*✿︎ Enlace:* \`${finalUrl}\`
*✿︎ Formato:* \`${mime}\`

> ¡Enlace listo para compartir!`;

            await conn.sendMessage(m.chat, { text: successText }, { quoted: m });

        } catch (err) {
            console.error('Error en Yotsuba Scraper:', err);
            m.reply(`*❁* \`Error en API\` *❁*\n\nNo se pudo conectar con el servidor de carga.`);
        }
    }
};

export default yotsubaUploadCommand;