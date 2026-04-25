import { config } from '../config.js';

export default {
    name: 'gay',
    alias: ['gaytest', 'esgay', 'medidor'],
    category: 'fun',
    noPrefix: true,
    
    run: async (conn, m) => {
        try {
            // 1. Lógica robusta para detectar el JID (basada en tu comando addcoins)
            let targetJid = null;
            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
                targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (m.quoted) {
                targetJid = m.quoted.sender || m.quoted.key.participant;
            }

            // Si no se menciona a nadie y no hay respuesta, escaneamos al que envió el mensaje
            if (!targetJid) {
                targetJid = m.sender;
            }

            // Preparamos el ID limpio para el texto (sin el dominio de whatsapp)
            const idLimpio = targetJid.split('@')[0].split(':')[0];

            // 2. Calcular porcentaje
            const porcentaje = Math.floor(Math.random() * 501); 

            // 3. Frase según resultado
            let frase;
            if (porcentaje < 100) frase = "🌱 Apenas un toque sutil...";
            else if (porcentaje < 200) frase = "🌈 Con estilo y actitud...";
            else if (porcentaje < 300) frase = "🔥 Brillando con orgullo...";
            else if (porcentaje < 400) frase = "💃 Desbordando energía arcoíris...";
            else frase = "💖 ¡Explosión total de arcoíris, nivel legendario!";

            // 4. ANIMACIÓN DE CARGA
            let { key } = await conn.sendMessage(m.chat, { text: "🏳️‍🌈 *Escaneando...* 0%\n░░░░░░░░░░" }, { quoted: m });

            const pasos = [
                "🏳️‍🌈 *Cargando...* 20%\n██░░░░░░░░",
                "🏳️‍🌈 *Cargando...* 40%\n████░░░░░░",
                "🏳️‍🌈 *Cargando...* 60%\n██████░░░░",
                "🏳️‍🌈 *Cargando...* 80%\n████████░░",
                "🏳️‍🌈 *¡COMPLETADO!* 100%\n██████████"
            ];

            for (let i = 0; i < pasos.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 600)); 
                await conn.sendMessage(m.chat, { text: pasos[i], edit: key });
            }

            // 5. Borrar carga y enviar resultado
            await conn.sendMessage(m.chat, { delete: key });

            await conn.sendMessage(m.chat, { 
                video: { url: 'https://files.catbox.moe/7lvpbf.mp4' }, 
                caption: `🏳️‍🌈 *RESULTADO FINAL*\n\n🧐 @${idLimpio} es *${porcentaje}%* Gay.\n\n${frase}`, 
                mentions: [targetJid] // Aquí pasamos el JID real para que la mención funcione
            }, { quoted: m });

        } catch (e) {
            console.error("Error en comando gay:", e);
            m.reply(`⚠️ Hubo un error al procesar el escaneo.`);
        }
    }
};

