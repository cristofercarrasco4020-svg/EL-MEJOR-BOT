import { 
    makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore, 
    DisconnectReason,
    Browsers,
    jidNormalizedUser
} from '@whiskeysockets/baileys';
import P from 'pino';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { socketLogger } from './print.js';
import { pixelHandler } from '../pixel.js';
import { config } from '../config.js';

const sessionsPath = path.resolve('./sesiones_subbots');
if (!fs.existsSync(sessionsPath)) fs.mkdirSync(sessionsPath);

// Mapa global para gestionar los sockets activos
global.subBots = new Map();

/**
 * Inicia o reconecta un Sub-Bot
 * @param {string} userId - ID del usuario (JID real)
 * @param {object} mainConn - Conexión del bot principal para avisos
 */
export const startSubBot = async (userId, mainConn = null) => {
    // Normalizamos el ID para evitar conflictos de LID/JID
    const jid = jidNormalizedUser(userId);
    const userNumber = jid.split('@')[0];
    const userSessionPath = path.join(sessionsPath, userNumber);
    
    const { state, saveCreds } = await useMultiFileAuthState(userSessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        printQRInTerminal: false,
        logger: P({ level: 'silent' }),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' })),
        },
        // Identificador del navegador para que aparezca en WhatsApp
        browser: Browsers.ubuntu('Chrome'),
        markOnlineOnConnect: true,
    });

    // Guardar en el mapa global usando el JID normalizado
    global.subBots.set(jid, sock);

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const code = lastDisconnect.error?.output?.statusCode;
            const shouldReconnect = code !== DisconnectReason.loggedOut;

            if (shouldReconnect) {
                console.log(chalk.yellow(`[SUB-BOT] 🔄 Reconectando: ${userNumber}`));
                // Reintentar conexión
                setTimeout(() => startSubBot(jid, mainConn), 5000);
            } else {
                console.log(chalk.red(`[SUB-BOT] 🚪 Sesión cerrada: ${userNumber}`));
                
                // --- MENSAJE DE DESPEDIDA AL PRIVADO ---
                if (mainConn) {
                    try {
                        const despedida = `[✿︎] Hola *${userNumber}*.\n\nGracias por haber formado parte de nuestros sockets. Si algún día quieres volver a ser SubBot de Kazuma, puedes hacerlo con el comando *${config.prefix}code*.\n\n> ¡Nos vemos la próxima vez!`;
                        
                        // Enviamos el mensaje al JID normalizado (siempre irá al privado)
                        await mainConn.sendMessage(jid, { 
                            text: despedida,
                            contextInfo: {
                                externalAdReply: {
                                    title: 'KAZUMA - SESIÓN FINALIZADA',
                                    body: 'Esperamos verte pronto',
                                    thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg',
                                    mediaType: 1,
                                    renderLargerThumbnail: false
                                }
                            }
                        });
                    } catch (e) {
                        console.error(`[ERROR DESPEDIDA]: No se pudo enviar mensaje a ${userNumber}`);
                    }
                }
                
                // Limpieza de memoria y archivos físicos
                global.subBots.delete(jid);
                if (fs.existsSync(userSessionPath)) {
                    fs.rmSync(userSessionPath, { recursive: true, force: true });
                }
            }
        } else if (connection === 'open') {
            console.log(chalk.green(`[SUB-BOT] ✅ Conectado: ${userNumber}`));
        }
    });

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        const m = chatUpdate.messages[0];
        if (!m.message || m.key.fromMe) return;

        // Logger exclusivo para sub-bots
        socketLogger(m, sock);
        
        // Ejecución de comandos (usando el motor pixel)
        await pixelHandler(sock, m, config);
    });

    return sock;
};

/**
 * Carga masiva de sub-bots al iniciar el servidor
 */
export const loadAllSubBots = async (mainConn) => {
    try {
        const sessions = fs.readdirSync(sessionsPath);
        if (sessions.length === 0) return;

        console.log(chalk.magenta(`[SISTEMA] 🚀 Reanudando ${sessions.length} sub-bots activos...`));
        
        for (const num of sessions) {
            const jid = `${num}@s.whatsapp.net`;
            // Pequeño delay entre reconexiones para evitar baneo de IP
            await new Promise(resolve => setTimeout(resolve, 2000));
            startSubBot(jid, mainConn);
        }
    } catch (err) {
        console.error(chalk.red('[ERROR LOAD-SUBBOTS]:'), err);
    }
};