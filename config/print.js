import chalk from 'chalk';

/**
 * Monitor de consola estético para Kazuma-Bot
 * Muestra mensajes, grupos, remitentes y tipos de archivo.
 */
export const logger = (m, conn) => {
    // 1. Obtener la hora actual
    const time = new Date().toLocaleTimeString('es-ES', { hour12: false });

    // 2. Identificar el remitente y el chat
    const from = m.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const sender = isGroup ? m.key.participant : from;
    const pushName = m.pushName || 'Usuario';
    const number = sender.split('@')[0];

    // 3. Identificar el tipo de mensaje y contenido
    const messageType = Object.keys(m.message)[0];
    let content = '';

    // Lógica para extraer texto de diferentes tipos de mensajes
    if (messageType === 'conversation') {
        content = m.message.conversation;
    } else if (messageType === 'extendedTextMessage') {
        content = m.message.extendedTextMessage.text;
    } else if (messageType === 'imageMessage') {
        content = m.message.imageMessage.caption || 'Imagen';
    } else if (messageType === 'videoMessage') {
        content = m.message.videoMessage.caption || 'Video';
    } else if (messageType === 'stickerMessage') {
        content = 'Sticker';
    } else if (messageType === 'documentWithCaptionMessage') {
        content = m.message.documentWithCaptionMessage.message.documentMessage.caption || 'Documento';
    } else {
        content = `Archivo: [${messageType}]`;
    }

    // 4. Formatear la salida para que sea "bonita" y ordenada
    const chatLabel = isGroup ? chalk.black.bgMagenta(' GRUPO ') : chalk.black.bgCyan(' PRIVADO ');
    const timeLabel = chalk.gray(`[${time}]`);
    const userLabel = chalk.yellow(`${pushName} (${number})`);
    const typeLabel = chalk.blueBright(`[${messageType.replace('Message', '').toUpperCase()}]`);

    // Imprimir en consola sin espacios extra abajo para mantener el flujo
    console.log(
        `${timeLabel} ${chatLabel} ${userLabel} ${typeLabel}: ${chalk.white(content.substring(0, 70))}${content.length > 70 ? '...' : ''}`
    );
};