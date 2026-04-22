import { startSubBot } from '../sockets/index.js';
import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const cooldowns = new Map();

const codeCommand = {
    name: 'code',
    alias: ['subbot', 'serbot'],
    category: 'sockets',
    noPrefix: true,

    run: async (conn, m, args) => {
        const from = m.chat;
        const sessionsPath = path.resolve('./sesiones_subbots');
        
        if (fs.existsSync(sessionsPath)) {
            const totalSubbots = fs.readdirSync(sessionsPath).filter(f => !f.includes('.')).length;
            if (totalSubbots >= 75) {
                return m.reply(`*${config.visuals.emoji2}* \`Límite alcanzado\`\n\nEl sistema está lleno.`);
            }
        }

        let targetNumber = args[0] ? args[0].replace(/\D/g, '') : m.sender.split('@')[0];
        const now = Date.now();
        if (cooldowns.has(m.sender) && (now < cooldowns.get(m.sender) + 60000)) return;

        try {
            const msgEspera = await conn.sendMessage(from, { 
                text: `*${config.visuals.emoji3}* \`Generando Código\`\n\nVinculando a: \`${targetNumber}\`...`,
            }, { quoted: m });

            const jidReal = `${targetNumber}@s.whatsapp.net`;
            const sock = await startSubBot(jidReal, conn);

            let code = await sock.requestPairingCode(targetNumber);
            code = code?.match(/.{1,4}/g)?.join('-') || code;

            const msgInstrucciones = await conn.sendMessage(from, { 
                text: `✿︎ \`CÓDIGO DE VINCULACIÓN\` ✿︎\n\nIngresa este código en tu WhatsApp:\n\n*Código:* \`${code}\`\n\n> Válido por 60 segundos.`
            }, { quoted: m });

            await conn.sendMessage(from, { delete: msgEspera.key });

            sock.ev.on('connection.update', async (update) => {
                const { connection } = update;
                if (connection === 'open') {
                    await conn.sendMessage(from, { 
                        text: `*${config.visuals.emoji3}* \`VINCULACIÓN EXITOSA\`\n\nNúmero: \`${targetNumber}\` conectado correctamente.\n\n> ¡El socket ya está activo!`,
                    }, { quoted: m });
                    try { await conn.sendMessage(from, { delete: msgInstrucciones.key }); } catch (e) {}
                }
            });

            cooldowns.set(m.sender, now);

        } catch (err) {
            m.reply(`*${config.visuals.emoji2}* Error: ${err.message}`);
        }
    }
};

export default codeCommand;