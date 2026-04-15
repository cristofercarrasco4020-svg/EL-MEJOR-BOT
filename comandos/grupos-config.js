import fs from 'fs';
import path from 'path';

const databasePath = path.resolve('./jsons/grupos.json');

const configOnOff = {
    command: ['detect', 'alerts', 'alertas'], // Puedes añadir más aquí luego
    category: 'grupo',
    isAdmin: true,
    isGroup: true,

    run: async (conn, m, args, usedPrefix, command) => {
        const from = m.key.remoteJid;
        const stateArg = args[0]?.toLowerCase();
        const validStates = ['on', 'off', 'enable', 'disable'];

        // Mapeo de nombres para el JSON y para el texto
        const featureKey = 'detect'; // Por ahora solo manejamos detect
        const featureName = 'las *Alertas de Grupo*';

        if (!fs.existsSync(path.resolve('./jsons'))) fs.mkdirSync(path.resolve('./jsons'));
        let db = fs.existsSync(databasePath) ? JSON.parse(fs.readFileSync(databasePath, 'utf-8')) : {};
        if (!db[from]) db[from] = {};

        const current = db[from][featureKey] === true;
        const estadoActual = current ? '✓ Activado' : '✗ Desactivado';

        if (!stateArg) {
            return conn.sendMessage(from, { 
                text: `*✿︎ Configuración (✿❛◡❛)*\n\nꕥ Un administrador puede activar o desactivar ${featureName} utilizando:\n\n● _Habilitar ›_ *${usedPrefix + command} on*\n● _Deshabilitar ›_ *${usedPrefix + command} off*\n\n❒ *Estado actual ›* ${estadoActual}` 
            }, { quoted: m });
        }

        if (!validStates.includes(stateArg)) {
            return m.reply(`*❁* \`Estado no válido\` *❁*\n\nUsa *on / off*.\nEjemplo: *${usedPrefix + command} on*`);
        }

        const enabled = ['on', 'enable'].includes(stateArg);

        if (db[from][featureKey] === enabled) {
            return m.reply(`*✎* ${featureName} ya estaba *${enabled ? 'activado' : 'desactivado'}*.`);
        }

        db[from][featureKey] = enabled;
        fs.writeFileSync(databasePath, JSON.stringify(db, null, 2));

        return m.reply(`*✿︎* Has *${enabled ? 'activado' : 'desactivado'}* ${featureName} con éxito.`);
    }
};

export default configOnOff;