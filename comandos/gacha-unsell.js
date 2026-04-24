import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const shopPath = path.resolve('./config/database/gacha/gacha_shop.json');

const unsellCommand = {
    name: 'unsell',
    alias: ['cancelarsell', 'cancelpj'],
    category: 'gacha',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            const pjId = args[0];

            if (!pjId) return m.reply(`*${config.visuals.emoji2}* Indica el ID del personaje que deseas retirar del mercado.`);
            if (!fs.existsSync(shopPath)) return m.reply(`*${config.visuals.emoji2}* El mercado está vacío. Por el cual no hay personajes para retirar.`);

            let shopDB = JSON.parse(fs.readFileSync(shopPath, 'utf-8'));
            let gachaDB = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));

            if (!shopDB[pjId]) {
                return m.reply(`*${config.visuals.emoji2}* El personaje con ID \`${pjId}\` no está en la lista de ventas.`);
            }

            if (shopDB[pjId].seller !== user) {
                return m.reply(`*${config.visuals.emoji2}* No puedes retirar un personaje que no pusiste a la venta tú.`);
            }

            const pjName = shopDB[pjId].name;

            delete shopDB[pjId];

            if (gachaDB[pjId]) {
                gachaDB[pjId].status = 'domado';
            }

            fs.writeFileSync(shopPath, JSON.stringify(shopDB, null, 2));
            fs.writeFileSync(gachaPath, JSON.stringify(gachaDB, null, 2));

            m.reply(`*${config.visuals.emoji3}* Has retirado a *${pjName}* del mercado exitosamente.\n\n> El personaje vuelve a estar disponible en tu inventario.`);

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al retirar el personaje del mercado.`);
        }
    }
};

export default unsellCommand;