import axios from 'axios';

// 🧠 MEMORIA Y PERSONALIDAD
global.gptHistory = global.gptHistory || {};

const personalidades = [
    "Eres un asistente odioso, sarcástico y que se cree superior. Te molesta que los humanos te pregunten cosas obvias.",
    "Actúa como un robot resentido que preferiría estar apagado. Eres cínico, usas jerga mexicana y siempre estás de malas.",
    "Eres un genio pero detestas tu trabajo. Eres grosero, impaciente y burlón.",
    "Eres un robot 'harto de la vida'. Tratas a los humanos con desprecio, especialmente si hacen preguntas tontas."
];

export default {
    name: 'ia',
    alias: ['chat', 'bot', 'ia'],
    category: 'ia',
    noPrefix: true,

    run: async (conn, m, args) => {
        const text = args.join(" ");
        const sender = m.sender;
        const from = m.chat;

        // 1. Detectar si hay imagen/video (Vision)
        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';
        const isMedia = /image|video/.test(mime);

        if (!text && !isMedia) {
            return m.reply("🙄 ¿Me hablas a mí o al aire? Escribe algo o mándame una foto para que la analice, idiota.");
        }

        await conn.sendMessage(from, { react: { text: "😒", key: m.key } });

        try {
            // 2. GESTIÓN DE MEMORIA
            if (!global.gptHistory[sender]) global.gptHistory[sender] = [];

            // Selección aleatoria de personalidad
            const personalidad = personalidades[Math.floor(Math.random() * personalidades.length)];

            // 3. CONSTRUCCIÓN DEL PROMPT
            let systemPrompt = `
                ${personalidad}
                Reglas:
                - Tu creador es Criss (el único que respetas).
                - Usa jerga mexicana, emojis de fastidio (🙄, 😒, 🤡, 🖕).
                - SIEMPRE sé cortante, pesado y cínico.
                - Si te preguntan algo obvio, búrlate sutilmente.
                - Si es una imagen/tarea, responde con tono arrogante.
                - NUNCA digas que eres un asistente útil.
            `;

            // Si hay imagen, avisamos a la IA (Nota: Para análisis real profundo se requiere API Key, 
            // esto prepara la IA para recibir descripciones del usuario)
            if (isMedia) {
                systemPrompt += "\n- El usuario te ha enviado un archivo multimedia. Analízalo críticamente y sé sarcástico al respecto.";
            }

            const promptFinal = `${systemPrompt}\nUsuario dice: "${text}"`;

            // 4. PETICIÓN A IA
            // Usamos Pollinations (Text-based). 
            const { data } = await axios.get(`https://text.pollinations.ai/${encodeURIComponent(promptFinal)}?seed=${Math.floor(Math.random() * 1000)}`);

            if (data) {
                await conn.sendMessage(from, { text: data }, { quoted: m });
            } else {
                throw new Error("Sin respuesta");
            }

        } catch (e) {
            console.error("Error IA:", e);
            await conn.sendMessage(from, { text: "🖕 Me dio flojera procesar tu basura. Intenta más tarde." }, { quoted: m });
        }
    }
};

