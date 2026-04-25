import { exec } from 'child_process';

export default {
    name: 'subiractua',
    alias: ['push', 'updatebot'],
    category: 'owner',
    isOwner: true, // Solo tú puedes usar esto
    noPrefix: true,

    run: async (conn, m) => {
        try {
            await m.reply('📤 *Subiendo cambios al repositorio...*');
            await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

            // Ejecutamos la secuencia de comandos Git
            // 1. git add . (Prepara todo)
            // 2. git commit (Guarda el cambio)
            // 3. git push (Sube al servidor)
            exec('git add . && git commit -m "Update from Bot" && git push', async (err, stdout, stderr) => {
                if (err) {
                    console.error("Error Git:", err);
                    return m.reply(`❌ *Error al subir:* \n\n\`\`\`${err.message}\`\`\``);
                }

                await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
                await m.reply(`🚀 *¡Actualización subida con éxito!*\n\n*Logs:*\n\`\`\`${stdout || stderr}\`\`\``);
            });

        } catch (e) {
            console.error(e);
            m.reply(`⚠️ Ocurrió un error inesperado.`);
        }
    }
};

