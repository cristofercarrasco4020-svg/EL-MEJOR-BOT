// Usamos 'export default' en lugar de 'module.exports'
const handler = async (m, { conn }) => {
    // m.sender es el ID que WhatsApp está usando para ti en este momento
    await m.reply(`🆔 *Tu ID/LID actual es:*\n${m.sender}`);
}

handler.help = ['miid', 'getid', 'lid']
handler.tags = ['tools']
handler.command = /^miid|getid|lid$/i

export default handler

