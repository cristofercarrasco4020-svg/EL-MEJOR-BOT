import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const genrePath = path.resolve('./config/database/profile/genres.json');

const setGenreCommand = {
    name: 'setgenre',
    alias: ['genero'],
    category: 'profile',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            const genre = args[0]?.toLowerCase();

            if (genre !== 'hombre' && genre !== 'mujer') {
                return m.reply(`*${config.visuals.emoji2}* Uso: #setgenre hombre o #setgenre mujer`);
            }

            let db = {};
            if (fs.existsSync(genrePath)) {
                db = JSON.parse(fs.readFileSync(genrePath, 'utf-8'));
            }

            db[user] = genre === 'hombre' ? 'Hombre' : 'Mujer';
            
            fs.writeFileSync(genrePath, JSON.stringify(db, null, 2));
            m.reply(`*${config.visuals.emoji3}* Género establecido como: *${db[user]}*`);

        } catch (e) {
            m.reply('Error al guardar el género.');
        }
    }
};

export default setGenreCommand;