/* KAZUMA MISTER BOT - YOTSUBA UPLOAD (MODO REPARACIÓN TOTAL) 
   Desarrollado por Félix OFC
*/
import fetch from 'node-fetch';
import FormData from 'form-data';

const yotsubaUploadCommand = {
    name: 'upload',
    alias: ['tourl', 'yupload', 'toimg'],
    category: 'utils',
    noPrefix: true,

    run: async (conn, m, { usedPrefix, command }) => {
        // 1. CAPTURA DEL ARCHIVO (Búsqueda exhaustiva)
        const quoted = m.quoted ? m.quoted : m;
        
        // Buscamos el mimetype en todas las posibles ubicaciones de Baileys
        const mime = (quoted.msg || quoted).mimetype || 
                     (quoted.msg || quoted).mediaType || 
                     (m.msg || m).mimetype || 
                     m.mediaType || 
                     '';

        // Log de depuración para que veas en la consola qué está detectando
        console.log(`[DEBUG UPLOAD] Mime detectado: ${mime}`);

        if (!mime) {
            return m.reply(`*❁* \`Error de Detección\` *❁*\n\nKazuma no detecta ningún archivo en este mensaje.\n\n> *Tip:* Asegúrate de responder directamente a la imagen o video.`);
        }

        try {
            await m.reply(`*✿︎* \`Procesando Archivo\` *✿︎*\n\nSubiendo a Yotsuba Cloud vía API Scraper...`);

            // 2. DESCARGA DEL MEDIO
            // Usamos el método de descarga de Baileys más estable
            const media = await quoted.download?.() || await m.download?.();
            
            if (!media) {
                return m.reply('*❁* `Fallo en Descarga` *❁*\n\nEl archivo está ahí, pero no pude descargarlo del servidor de WhatsApp.');
            }

            // 3. ENVÍO AL SCRAPER
            const formData = new FormData();
            // Generamos una extensión basada en el mime
            const extension = mime.split('/')[1] || 'bin';
            
            formData.append('file', media, { 
                filename: `kazuma_${Date.now()}.${extension}`,
                contentType: mime 
            });

            const res = await fetch('https://upload.yotsuba.giize.com/upload', {
                method: 'POST',
                body: formData,
                headers: formData.getHeaders()
            });

            if (!res.ok) throw new Error(`Status: ${res.status}`);

            const data = await res.json();
            
            // Buscamos el link en cualquier campo que el scraper pueda devolver
            const finalUrl = data.fileUrl || data.url || data.result || data.link || data.data?.url;

            if (!finalUrl) {
                console.log('[DEBUG API] Respuesta sin link:', data);
                return m.reply('*❁* `Error: API Vacía` *❁*\n\nEl servidor recibió el archivo pero no devolvió un enlace.');
            }

            const successText = `*» (❍ᴥ❍ʋ) \`YOTSUBA UPLOAD\` «*
> ꕥ ¡Archivo convertido con éxito!

*✿︎ Enlace:* \`${finalUrl}\`
*✿︎ Tipo:* \`${mime}\`

> Desarrollado por Félix OFC`;

            await conn.sendMessage(m.chat, { text: successText }, { quoted: m });

        } catch (err) {
            console.error('Error Crítico en Upload:', err);
            m.reply(`*❁* \`Error de Conexión\` *❁*\n\nHubo un problema con la API o el servidor de carga.`);
        }
    }
};

export default yotsubaUploadCommand;