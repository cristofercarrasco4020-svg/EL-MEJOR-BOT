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
            // Asegurar que la carpeta existe
            if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

            // Leer base de datos con manejo de errores total
            let db = {};
            if (fs.existsSync(dbPath)) {
                try {
                    const content = fs.readFileSync(dbPath, 'utf-8');
                    db = content ? JSON.parse(content) : {};
                } catch (e) {
                    db = {}; // Si el JSON está roto, empezamos de cero
                }
            }

            const user = m.sender.split('@')[0].split(':')[0];
            if (!db[user]) db[user] = {};

            const cmd = m.body.split(' ')[0].toLowerCase().replace('#', '');

            // Lógica de Comandos
            if (cmd === 'setage') {
                const age = parseInt(args[0]);
                if (!args[0] || isNaN(age)) return m.reply(`*${config.visuals.emoji2}* ¡Animal! Pon un número.\n> Ejemplo: *#setage 20*`);
                if (age < 8 || age > 85) return m.reply(`*${config.visuals.emoji2}* Rango de edad: 8 a 85 años.`);
                db[user].age = age;
                m.reply(`*${config.visuals.emoji3}* Edad: *${age}* guardada.`);
            } 
            
            else if (cmd === 'setgenre') {
                const genre = args[0]?.toLowerCase();
                if (genre !== 'hombre' && genre !== 'mujer') return m.reply(`*${config.visuals.emoji2}* Solo *hombre* o *mujer*.`);
                db[user].genre = genre.charAt(0).toUpperCase() + genre.slice(1);
                m.reply(`*${config.visuals.emoji3}* Género: *${db[user].genre}*`);
            }

            else if (cmd === 'setbirth') {
                if (!args[0]) return m.reply(`*${config.visuals.emoji2}* Uso: *#setbirth 15/05*`);
                db[user].birth = args[0];
                m.reply(`*${config.visuals.emoji3}* Cumpleaños guardado.`);
            }

            else if (cmd === 'setpjfavorite') {
                if (!args[0]) return m.reply(`*${config.visuals.emoji2}* Escribe el nombre del personaje.`);
                db[user].favPj = args.join(' ');
                m.reply(`*${config.visuals.emoji3}* PJ Favorito guardado.`);
            }

            else if (cmd.startsWith('del')) {
                const key = cmd.replace('del', '').replace('pjfavorite', 'favPj');
                if (db[user] && db[user][key]) {
                    delete db[user][key];
                    m.reply(`*${config.visuals.emoji3}* Borrado.`);
                } else {
                    m.reply(`*${config.visuals.emoji2}* No hay nada que borrar.`);
                }
            }

            // Guardado forzoso
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        } catch (err) {
            console.error(err);
            // Si llega aquí, es un problema de permisos del sistema de archivos
            m.reply(`*${config.visuals.emoji2}* El bot no puede escribir en la carpeta. Revisa los permisos.`);
        }
    }
};

export default profileSettings;
l