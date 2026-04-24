import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const dbDir = './config/database/profile';
const dbPath = path.resolve(dbDir, 'profiles.json');

const profileSettings = {
    name: 'profile-set',
    alias: ['setbirth', 'delbirth', 'setgenre', 'delgenre', 'setpjfavorite', 'setage', 'delage'],
    category: 'profile',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }

            if (!fs.existsSync(dbPath)) {
                fs.writeFileSync(dbPath, JSON.stringify({}, null, 2));
            }

            const user = m.sender.split('@')[0].split(':')[0];
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            if (!db[user]) db[user] = {};

            const cmd = m.body.split(' ')[0].toLowerCase().replace('#', '');

            if (cmd === 'setbirth') {
                if (!args[0]) return m.reply(`*${config.visuals.emoji2}* Indica tu fecha (Ej: 15/05).`);
                db[user].birth = args[0];
                m.reply(`*${config.visuals.emoji3}* Cumpleaños guardado: *${args[0]}*`);
            } 
            else if (cmd === 'setage') {
                const age = parseInt(args[0]);
                if (isNaN(age)) return m.reply(`*${config.visuals.emoji2}* Indica una edad válida en números.`);
                db[user].age = age;
                m.reply(`*${config.visuals.emoji3}* Edad establecida en *${age}* años.`);
            } 
            else if (cmd === 'setgenre') {
                const genre = args[0]?.toLowerCase();
                if (genre !== 'hombre' && genre !== 'mujer') return m.reply(`*${config.visuals.emoji2}* Género no válido. Solo se permite: *Hombre* o *Mujer*.`);
                db[user].genre = genre.charAt(0).toUpperCase() + genre.slice(1);
                m.reply(`*${config.visuals.emoji3}* Género establecido como *${db[user].genre}*.`);
            } 
            else if (cmd === 'setpjfavorite') {
                if (!args[0]) return m.reply(`*${config.visuals.emoji2}* ¿Cuál es tu personaje favorito?`);
                db[user].favPj = args.join(' ');
                m.reply(`*${config.visuals.emoji3}* Ahora *${db[user].favPj}* es tu favorito.`);
            } 
            else if (cmd.startsWith('del')) {
                const key = cmd.replace('del', '').replace('pjfavorite', 'favPj');
                delete db[user][key];
                m.reply(`*${config.visuals.emoji3}* Dato eliminado.`);
            }

            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al guardar ajustes. Revisa los permisos de la carpeta.`);
        }
    }
};

export default profileSettings;
