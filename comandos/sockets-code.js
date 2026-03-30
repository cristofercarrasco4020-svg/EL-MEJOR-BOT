import { startSubBot } from '../sockets/index.js';
import { config } from '../config.js';

const cooldowns = new Map();

const codeCommand = {
    name: 'code',
    alias: ['subbot', 'serbot'],
    category: 'sockets',
    isOwner: false,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, { senderNumber }) => {
        const from = m.key.remoteJid;

        // 1. Cooldown
        const now = Date.now();
        if (cooldowns.has(from) && (now < cooldowns.get(from) + 60000)) return;

        try {
            // --- TRUCO ANTI-LID ---
            // Intentamos obtener el número real si lo que recibimos es un LID
            let realNumber = senderNumber; 
            if (from.includes(':') || senderNumber.length > 15) {
                // Si parece un LID, intentamos extraer el número del JID decodificado
                const decoded = conn.decodeJid(m.key.participant || from);
                realNumber = decoded.split('@')[0].split(':')[0];
            }
            // Limpieza final de seguridad
            realNumber = realNumber.replace(/[^0-9]/g, '');

            const msgInstrucciones = await conn.sendMessage(from, { 
                text: `✿︎ \`Vinculación del socket\` ✿︎\n\n*❁* \`Pasos a seguir:\` \nDispositivos vinculados > vincular nuevo dispositivo > Vincular con numero de telefono > ingresa el codigo.\n\n\`Nota\` » El código es válido por *60 segundos*.`,
                contextInfo: {
                    externalAdReply: {
                        title: 'INSTRUCCIONES DE CONEXIÓN',
                        body: 'Sigue los pasos para ser Sub-Bot',
                        thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg',
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: m });

            // Iniciamos el sub-bot usando el JID real para la carpeta
            const jidReal = `${realNumber}@s.whatsapp.net`;
            const sock = await startSubBot(jidReal, conn);

            // IMPORTANTE: Pedimos el código con el número limpio (sin LID)
            let code = await sock.requestPairingCode(realNumber);
            code = code?.match(/.{1,4}/g)?.join('-') || code;

            const msgCodigo = await conn.sendMessage(from, { text: code }, { quoted: msgInstrucciones });

            cooldowns.set(from, now);

            setTimeout(async () => {
                try {
                    await conn.sendMessage(from, { delete: msgInstrucciones.key });
                    await conn.sendMessage(from, { delete: msgCodigo.key });
                } catch (e) {}
            }, 60000);

        } catch (err) {
            console.error('Error en comando code:', err);
            await conn.sendMessage(from, { text: '❌ Ocurrió un error al generar el código. Asegúrate de no tener una sesión activa.' });
        }
    }
};

export default codeCommand;