/* KAZUMA MISTER BOT - YOTSUBA UPLOAD (FULL STYLE) 
   Desarrollado por Félix OFC
*/
import fetch from 'node-fetch';
import FormData from 'form-data';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

const MEDIA_TYPES = ['imageMessage', 'videoMessage', 'stickerMessage', 'audioMessage', 'documentMessage'];

const yotsubaUploadCommand = {
    name: 'upload',
    alias: ['tourl', 'yupload', 'toimg'],
    category: 'utils',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName) => {
        const target = m.quoted || m;
        const msg = target.message || {};
        const unwrapped = msg.documentWithCaptionMessage?.message || msg;
        const type = Object.keys(unwrapped)[0];
        const mediaData = unwrapped[type] || {};
        const mime = mediaData.mimetype || '';

        // DEBUG TEMPORAL
        return m.reply(
            `*type:* ${type}\n` +
            `*mime:* ${mime}\n` +
            `*quoted:* ${m.quoted ? 'SI' : 'NO'}\n` +
            `*msg keys:* ${Object.keys(msg).join(', ')}\n` +
            `*unwrapped keys:* ${Object.keys(unwrapped).join(', ')}`
        );
    }
};

export default yotsubaUploadCommand;