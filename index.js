import { 
    makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore, 
    DisconnectReason,
    Browsers
} from '@whiskeysockets/baileys';
import P from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createInterface } from 'readline';
import chalk from 'chalk';
import CFonts from 'cfonts';

import { config } from './config.js';
import { logger } from './config/print.js';
import { pixelHandler } from './pixel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

global.commands = new Map();

const printBanner = () => {
    process.stdout.write('\x1Bc');
    CFonts.say('KAZUMA', {
        font: 'block',
        align: 'center',
        colors: ['cyan', 'magenta', 'yellow'],
        letterSpacing: 1,
        lineHeight: 1,
        space: false,
    });
    console.log(chalk.magenta('┌────────────────────────────────────────────────────────┐'));
    console.log(chalk.magenta('│') + chalk.white('  Seleccione una opción para iniciar el sistema:      ') + chalk.magenta('│'));
    console.log(chalk.magenta('│') + chalk.cyan('  [1] Vincular vía Código de 8 dígitos (Recomendado)  ') + chalk.magenta('│'));
    console.log(chalk.magenta('│') + chalk.red('  [2] Detener y cerrar proceso                        ') + chalk.magenta('│'));
    console.log(chalk.magenta('└────────────────────────────────────────────────────────┘'));
};

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('sesion_bot');
    const { version } = await fetchLatestBaileysVersion();

    if (!state.creds.registered) {
        printBanner();
        const input = await question(chalk.yellowBright(' -> Escribe tu opción: '));
        if (input === '2') process.exit();
        if (input !== '1') return startBot();
    }

    const conn = makeWASocket({
        version,
        printQRInTerminal: false,
        logger: P({ level: 'silent' }),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' })),
        },
        browser: Browsers.ubuntu('Chrome'),
        markOnlineOnConnect: true,
    });

    if (!conn.authState.creds.registered) {
        console.log(chalk.cyan('\n┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓'));
        console.log(chalk.cyan('┃') + chalk.white(' Introduce tu número SIN el símbolo (+).           ') + chalk.cyan('┃'));
        console.log(chalk.cyan('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'));
        
        let phoneNumber = await question(chalk.greenBright(' -> Número: '));
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

        setTimeout(async () => {
            try {
                let code = await conn.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join('-') || code;
                console.log(chalk.black.bgCyan('\n CÓDIGO DE VINCULACIÓN: ') + chalk.bold.white(` ${code} `) + '\n');
            } catch (error) {
                console.error(chalk.red('Error:'), error);
            }
        }, 3000);
    }

    // CARGADOR MEJORADO: Lee subcarpetas de forma recursiva
    const loadCommands = async (dirPath) => {
        const fullDirPath = path.resolve(__dirname, dirPath);
        if (!fs.existsSync(fullDirPath)) return;

        const files = fs.readdirSync(fullDirPath);
        for (const file of files) {
            const filePath = path.join(fullDirPath, file);
            if (fs.statSync(filePath).isDirectory()) {
                await loadCommands(path.join(dirPath, file));
            } else if (file.endsWith('.js')) {
                try {
                    const fileUrl = pathToFileURL(filePath).href;
                    const module = await import(`${fileUrl}?update=${Date.now()}`);
                    if (module.default?.name) {
                        global.commands.set(module.default.name, module.default);
                    }
                } catch (e) {
                    console.log(chalk.red(`Error en ${file}:`), e.message);
                }
            }
        }
    };

    console.log(chalk.blue('⚙️ Cargando módulos...'));
    await loadCommands('comandos');

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log(chalk.green.bold('\n✅ KAZUMA CONECTADO CORRECTAMENTE.'));
        }
    });

    conn.ev.on('messages.upsert', async (chatUpdate) => {
        const m = chatUpdate.messages[0];
        if (!m.message || m.key.fromMe) return;
        logger(m, conn);
        await pixelHandler(conn, m, config);
    });
}

startBot();