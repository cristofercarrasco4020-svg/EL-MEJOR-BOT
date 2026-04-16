/* KAZUMA MISTER BOT - YOTSUBA UPLOAD SYSTEM
   Desarrollado por Félix OFC
*/
import axios from "axios"
import FormData from "form-data"

// Función para el peso del archivo (Estética limpia)
function formatBytes(bytes) {
  if (bytes === 0) return "0 B"
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`
}

// Generador de nombres para tu API
function generateUniqueFilename(mime) {
  const ext = mime.split("/")[1] || "bin"
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let id = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  return `${id}.${ext}`
}

// --- FUNCIÓN PARA TU API PRIVADA ---
async function uploadYotsuba(buffer, mime) {
  const form = new FormData()
  // Importante: Tu servidor usa el campo 'file'
  form.append("file", buffer, { 
    filename: generateUniqueFilename(mime),
    contentType: mime 
  })

  const res = await axios.post("https://upload.yotsuba.giize.com/upload", form, {
    headers: form.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  })

  // Leemos 'fileUrl' que es lo que devuelve tu Fastify
  const url = res.data?.fileUrl || res.data?.url
  if (!url) throw new Error("API Yotsuba no devolvió URL")
  return url
}

export default {
  command: ["upload", "tourl", "yupload"],
  category: "utils",
  run: async (client, m, args, usedPrefix, command) => {
    // La clave de la detección:
    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || q.mediaType || ""

    if (!mime || !/image|video|webp/.test(mime)) {
      return m.reply(
        `*❁* \`Falta Archivo\` *❁*\n\n` +
        `Responde a una imagen o video corto para convertirlo en enlace.\n\n` +
        `> Ejemplo: Envía una imagen y pon *${usedPrefix + command}*`
      )
    }

    try {
      // Aviso de proceso
      await m.reply(`*✿︎* \`Subiendo Archivo\` *✿︎*\n\nKazuma está enviando el archivo a Yotsuba Cloud. Por favor, espera...\n\n> ⏳ Conectando con tu API privada...`)

      const media = await q.download()
      if (!media) return m.reply("*❁* `Error` *❁*\n\nNo se pudo descargar el archivo de WhatsApp.")

      // Subida a tu servidor
      const link = await uploadYotsuba(media, mime)

      // --- MENSAJE FINAL ESTILO FÉLIX OFC ---
      const successText = `*» (❍ᴥ❍ʋ) \`YOTSUBA CLOUD\` «*
> ꕥ Archivo convertido con éxito.

*✿︎ Enlace:* \`${link}\`
*✿︎ Peso:* \`${formatBytes(media.length)}\`
*✿︎ Tipo:* \`${mime.split("/")[1].toUpperCase()}\`

> ¡Recuerda que este enlace es público, compártelo con cuidado!`

      return m.reply(successText)

    } catch (e) {
      console.error(e)
      await m.reply(`*❁* \`Error Crítico\` *❁*\n\nNo se pudo subir a Yotsuba. Revisa si el VPS está activo.\n\n> Error: ${e.message}`)
    }
  }
}