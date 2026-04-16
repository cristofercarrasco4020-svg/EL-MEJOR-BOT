/* KAZUMA MISTER BOT - YOTSUBA UPLOAD (FULL STYLE) 
   Desarrollado por Félix OFC
*/
import fetch from 'node-fetch';
import FormData from 'form-data';

const yotsubaUploadCommand = {
    name: 'upload',
    alias: ['tourl', 'yupload', 'toimg'],
    category: 'utils',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName) => {
        const quoted = m.quoted ? m.quoted : m;

        const msgContent = quoted.message || m.message || {};

        // DEBUG EN WHATSAPP
        await m.reply(
            `*[DEBUG]*\n` +
            `*M keys:* ${Object.keys(m).join(', ')}\n\n` +
            `*message:* ${JSON.stringify(m.message).slice(0, 300)}\n\n` +
            `*quoted:* ${JSON.stringify(m.quoted).slice(0, 300)}\n\n` +
            `*msgContent:* ${JSON.stringify(msgContent).slice(0, 300)}`
        );
    }
};

export default yotsubaUploadCommand;