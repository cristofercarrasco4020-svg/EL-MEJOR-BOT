import axios from 'axios';
import fs from 'fs';
import { exec } from 'child_process';

// Inicialización de la bolsa de GIFs
global.poolPenetrar = global.poolPenetrar || [
    "https://files.catbox.moe/iy2ur2.gif",
    "https://files.catbox.moe/8sbyqg.gif",
    "https://files.catbox.moe/y8pyzg.gif",
    "https://files.catbox.moe/takpwk.gif",
    "https://files.catbox.moe/8jde6p.gif"
];

export default {
    name: 'penetrar',
    alias: ['penetrar'],
    category: 'fun',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m, args) => {
        try {
            // 1. LÓGICA ROBUSTA DE DETECCIÓN (Basada en tu comando addcoins)
            let targetJid = null;
            
            // Verificamos menciones directas
            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
                targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } 
            // Verificamos si es respuesta a un mensaje
            else if (m.quoted) {
                targetJid = m.quoted.sender || m.quoted.key.participant;
            }

            // Si no detecta nada, detenemos el comando
            if (!targetJid) {
                return m.reply('⚠️ Etiqueta a alguien o responde a su mensaje para usar este comando.');
            }

            // 2. Sistema "Bolsa Mágica"
            if (global.poolPenetrar.length === 0) {
                global.poolPenetrar = [
                    "https://files.catbox.moe/iy2ur2.gif",
                    "https://files.catbox.moe/8sbyqg.gif",
                    "https://files.catbox.moe/y8pyzg.gif",
                    "https://files.catbox.moe/takpwk.gif",
                    "https://files.catbox.moe/8jde6p.gif"
                ];
            }

            const indiceRandom = Math.floor(Math.random() * global.poolPenetrar.length);
            const linkGif = global.poolPenetrar[indiceRandom];
            global.poolPenetrar.splice(indiceRandom, 1);

            // 3. Preparar Texto
            // Limpiamos el JID para el @usuario del texto
            const user = targetJid.split('@')[0].split(':')[0];
            const userName = `@${user}`;
            
            const textoHard = `*TE HAN LLENADO LA CARA DE SEMEN POR PUTA Y ZORRA!*\n\n*Le ha metido el pene a* ${userName} *con todo y condón hasta quedar seco, has dicho "por favor más duroooooo!, ahhhhhhh, ahhhhhh, hazme un hijo que sea igual de pitudo que tú!" mientras te penetraba y luego te ha dejado en silla de ruedas!*\n\n${userName} \n✿ *YA TE HAN PENETRADO!*`;

            await conn.sendMessage(m.chat, { react: { text: "🔥", key: m.key } });

            // 4. Descarga y Conversión
            const { data } = await axios.get(linkGif, { responseType: 'arraybuffer' });
            const uniqueId = Date.now();
            const pathGif = `./temp_pen_${uniqueId}.gif`;
            const pathMp4 = `./temp_pen_${uniqueId}.mp4`;

            fs.writeFileSync(pathGif, data);

            // Conversión con ffmpeg
            exec(`ffmpeg -i ${pathGif} -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${pathMp4}`, async (err) => {
                if (fs.existsSync(pathGif)) fs.unlinkSync(pathGif);

                if (err) {
                    console.error("Error conversión:", err);
                    return conn.sendMessage(m.chat, { text: '❌ Error procesando el video.' }, { quoted: m });
                }

                // 5. Envío
                await conn.sendMessage(m.chat, { 
                    video: fs.readFileSync(pathMp4), 
                    gifPlayback: true, 
                    caption: textoHard, 
                    mentions: [targetJid] // Aquí usamos el targetJid detectado correctamente
                }, { quoted: m });

                if (fs.existsSync(pathMp4)) fs.unlinkSync(pathMp4);
            });

        } catch (e) {
            console.error("Error en comando penetrar:", e);
            m.reply(`❌ Error interno: ${e.message}`);
        }
    }
};

