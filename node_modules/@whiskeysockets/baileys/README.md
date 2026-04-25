<div align="center">

# ⚡ baileys

### Librería WebSocket para WhatsApp Web — mensajes interactivos, ricos, canales, grupos y más

[![Versión](https://img.shields.io/badge/versión-1.0.0-0ea5e9?style=for-the-badge)](#)
[![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-22c55e?logo=node.js&logoColor=white&style=for-the-badge)](https://nodejs.org)
[![ESM](https://img.shields.io/badge/ESM-only-f59e0b?logo=javascript&logoColor=black&style=for-the-badge)](#)
[![Licencia](https://img.shields.io/badge/licencia-MIT-6366f1?style=for-the-badge)](LICENSE)

---

Fork de [WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys) con soporte extendido para mensajes interactivos, mensajes ricos tipo Meta AI, canales (newsletter), grupos, autenticación múltiple y más.

</div>

---

## ✨ Características

| Característica | Descripción | Estado |
|---|---|---|
| 🎛️ **Botones Nativos (Flow)** | Botones interactivos nativos de WhatsApp | ✅ |
| 📋 **Botones Interactivos** | Wrapper viewOnce con botones | ✅ |
| 📑 **Menú Lista** | Listas desplegables con secciones | ✅ |
| 💳 **Solicitud de Pago** | Mensajes de cobro con nota o sticker | ✅ |
| 📅 **Evento** | Creación de eventos con RSVP y ubicación | ✅ |
| 📊 **Resultado de Encuesta** | Snapshot de resultados de encuesta | ✅ |
| 📢 **Status con Menciones** | Status que menciona usuarios y grupos | ✅ |
| 🛍️ **Producto** | Catálogo de productos con botones | ✅ |
| 📊 **Tabla Rica** | Tabla con encabezados estilo Meta AI | ✅ |
| 📋 **Lista Rica** | Lista sin encabezado estilo Meta AI | ✅ |
| 💻 **Bloque de Código** | Código con resaltado de sintaxis | ✅ |
| 🔀 **Mensaje Rico Mixto** | Combinación libre de submensajes | ✅ |
| 📰 **Canales (Newsletter)** | Crear, seguir, gestionar canales | ✅ |
| 👥 **Grupos** | Crear, gestionar y administrar grupos | ✅ |
| 🗄️ **Auth MongoDB** | Sesión persistida en MongoDB | ✅ |
| 📁 **Auth Archivo Único** | Sesión en un solo archivo JSON | ✅ |
| 🖼️ **Redimensionar Media** | Resize de imágenes con sharp | ✅ |
| 🏷️ **Etiquetas** | Agregar/quitar etiquetas a chats | ✅ |
| ⭐ **Destacar Mensajes** | Marcar mensajes con estrella | ✅ |

---

## 📦 Instalación

```bash
npm install
```

Asegúrate de tener `"type": "module"` en tu `package.json`:

```json
{
  "type": "module"
}
```

---

## 🚀 Inicio Rápido

```js
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  Browsers
} from './lib/index.js'
import pino from 'pino'

const logger = pino({ level: 'silent' })

async function iniciar() {
  const { state, saveCreds } = await useMultiFileAuthState('./session')

  const sock = makeWASocket({
    auth: state,
    logger,
    printQRInTerminal: true,
    browser: Browsers.ubuntu('Chrome')
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const reconectar = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      if (reconectar) iniciar()
    }
    if (connection === 'open') console.log('✅ Bot conectado')
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg?.message || msg.key.fromMe) return

    const texto = msg.message.conversation
      || msg.message.extendedTextMessage?.text
      || ''

    if (texto === '.ping') {
      await sock.sendMessage(msg.key.remoteJid, { text: '🏓 Pong!' })
    }
  })
}

iniciar()
```

---

## 🔐 Autenticación

### Multi-archivo (recomendado)

```js
import { useMultiFileAuthState } from './lib/index.js'

const { state, saveCreds } = await useMultiFileAuthState('./session')
sock.ev.on('creds.update', saveCreds)
```

### Archivo único

```js
import { useSingleFileAuthState } from './lib/index.js'

const { state, saveState } = useSingleFileAuthState('./session.json', logger)
sock.ev.on('creds.update', saveState)
```

### MongoDB

```js
import { useMongoFileAuthState } from './lib/index.js'
import { MongoClient } from 'mongodb'

const client = new MongoClient('mongodb://localhost:27017')
await client.connect()
const collection = client.db('bot').collection('auth')

const { state, saveCreds } = await useMongoFileAuthState(collection)
sock.ev.on('creds.update', saveCreds)
```

---

## 💬 Mensajes

Todos los tipos especiales se detectan automáticamente dentro de `sock.sendMessage()`.

### Texto simple

```js
await sock.sendMessage(jid, { text: 'Hola mundo 👋' })
```

### Imagen / Video / Audio / Documento

```js
await sock.sendMessage(jid, {
  image: { url: 'https://ejemplo.com/imagen.jpg' },
  caption: 'Mi imagen'
})

await sock.sendMessage(jid, {
  video: { url: './clip.mp4' },
  caption: 'Mi video'
})

await sock.sendMessage(jid, {
  audio: { url: './audio.mp3' },
  mimetype: 'audio/mp4',
  ptt: true
})

await sock.sendMessage(jid, {
  document: { url: './archivo.pdf' },
  mimetype: 'application/pdf',
  fileName: 'documento.pdf'
})
```

### Citar un mensaje

```js
await sock.sendMessage(jid, { text: 'Respondiendo esto ☝️' }, { quoted: msg })
```

---

## 🎛️ Mensajes Interactivos

### Botones Nativos (Flow)

```js
await sock.sendMessage(jid, {
  interactiveMessage: {
    title: '🎉 Bienvenido',
    footer: 'Elige una opción',
    header: 'Menú Principal',
    buttons: [
      {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({ display_text: '📋 Ver Menú', id: 'menu' })
      },
      {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({ display_text: '🌐 Sitio Web', url: 'https://ejemplo.com' })
      },
      {
        name: 'cta_copy',
        buttonParamsJson: JSON.stringify({ display_text: '📋 Copiar Código', copy_code: 'PROMO2024' })
      }
    ]
  }
})
```

### Botones Interactivos (viewOnce)

```js
await sock.sendMessage(jid, {
  text: '¿Confirmas tu pedido?',
  title: 'Confirmación',
  footer: 'Selecciona una opción',
  interactiveButtons: [
    {
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({ display_text: '✅ Confirmar', id: 'confirmar' })
    },
    {
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({ display_text: '❌ Cancelar', id: 'cancelar' })
    }
  ]
})
```

### Menú Lista

```js
await sock.sendMessage(jid, {
  interactiveMessage: {
    title: '📋 Selecciona una categoría',
    footer: 'Bot v1.0',
    header: 'Menú',
    buttons: [
      {
        name: 'single_select',
        buttonParamsJson: JSON.stringify({
          title: 'Opciones disponibles',
          sections: [
            {
              title: '🎮 Juegos',
              rows: [
                { title: 'Trivia', id: '.trivia' },
                { title: 'Adivina la palabra', id: '.adivinanza' }
              ]
            },
            {
              title: '🔧 Utilidades',
              rows: [
                { title: 'Sticker', id: '.sticker' },
                { title: 'Traductor', id: '.traducir' }
              ]
            }
          ]
        })
      }
    ]
  }
})
```

---

## 💳 Solicitud de Pago

```js
await sock.sendMessage(jid, {
  requestPaymentMessage: {
    amount: 50000,
    currency: 'COP',
    note: 'Pago por el pedido #001',
    from: '57300xxxxxxx@s.whatsapp.net'
  }
})
```

---

## 📅 Evento

```js
await sock.sendMessage(jid, {
  eventMessage: {
    name: '🎉 Reunión del equipo',
    description: 'Reunión mensual de seguimiento.',
    startTime: Date.now() + 86400000,
    endTime: Date.now() + 90000000,
    location: {
      name: 'Bogotá, Colombia',
      degreesLatitude: 4.711,
      degreesLongitude: -74.0721
    },
    joinLink: 'https://meet.ejemplo.com/sala'
  }
})
```

---

## 📊 Resultado de Encuesta

```js
await sock.sendMessage(jid, {
  pollResultMessage: {
    name: '¿Cuál es tu lenguaje favorito?',
    pollVotes: [
      { optionName: '🟨 JavaScript', optionVoteCount: 54 },
      { optionName: '🐍 Python', optionVoteCount: 38 },
      { optionName: '☕ Java', optionVoteCount: 12 }
    ]
  }
})
```

---

## 📢 Status con Menciones

```js
await sock.sendStatusMention(
  { text: '🔥 Nueva actualización disponible!' },
  ['57300xxxxxxx@s.whatsapp.net', 'grupoid@g.us']
)
```

---

## 🛍️ Producto

```js
await sock.sendMessage(jid, {
  productMessage: {
    title: '🎧 Audífonos Bluetooth',
    description: 'Inalámbricos con cancelación de ruido.',
    productId: 'AUD-001',
    retailerId: 'mi-tienda',
    url: 'https://ejemplo.com/producto',
    priceAmount1000: 299000,
    currencyCode: 'COP',
    thumbnail: { url: 'https://ejemplo.com/imagen.jpg' },
    body: 'Producto del mes',
    footer: 'Mi Tienda Oficial',
    buttons: [
      {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({ display_text: '🛒 Comprar', id: 'comprar_aud001' })
      }
    ]
  }
})
```

---

## 🤖 Mensajes Ricos (estilo Meta AI)

### Tabla con encabezado

```js
await sock.sendTable(
  jid,
  'Comparativa de lenguajes',
  ['Lenguaje', 'Tipado', 'Uso principal'],
  [
    ['JavaScript', 'Dinámico', 'Web / Full-stack'],
    ['Python',     'Dinámico', 'Data / IA'],
    ['Java',       'Estático', 'Empresarial']
  ],
  quoted,
  {
    headerText: 'Aquí tienes la comparativa:',
    footer: '¡Espero que te sea útil!'
  }
)
```

### Lista sin encabezado

```js
await sock.sendList(
  jid,
  'Info del Bot',
  [
    ['Nombre',    'Mi Bot'],
    ['Versión',   '1.0.0'],
    ['Lenguaje',  'JavaScript']
  ],
  quoted,
  { footer: '© 2024 Mi Bot' }
)
```

### Bloque de código

```js
await sock.sendCodeBlock(
  jid,
  `const sock = makeWASocket({ printQRInTerminal: true })

sock.ev.on('connection.update', ({ connection }) => {
  if (connection === 'open') console.log('Conectado!')
})`,
  quoted,
  {
    language: 'javascript',
    title: '📝 Ejemplo de conexión',
    footer: 'Powered by baileys'
  }
)
```

**Lenguajes soportados:** `javascript`, `typescript`, `python`

### Mensaje Rico Mixto

```js
await sock.sendRichMessage(jid, [
  { messageType: 2, messageText: 'Aquí tienes el resumen:' },
  {
    messageType: 4,
    tableMetadata: {
      title: 'Estadísticas',
      rows: [
        { items: ['Métrica', 'Valor'], isHeading: true },
        { items: ['Usuarios', '1,200'] },
        { items: ['Uptime', '99.9%'] }
      ]
    }
  },
  { messageType: 2, messageText: 'Y el código:' },
  {
    messageType: 5,
    codeMetadata: {
      codeLanguage: 'javascript',
      codeBlocks: [{ highlightType: 0, codeContent: 'console.log("OK ✅")' }]
    }
  }
], quoted)
```

#### Tipos de submensaje

| messageType | Nombre | Campo |
|---|---|---|
| 0 | UNKNOWN | — |
| 1 | GRID_IMAGE | `gridImageMetadata` |
| 2 | TEXT | `messageText` |
| 3 | INLINE_IMAGE | `imageMetadata` |
| 4 | TABLE | `tableMetadata` |
| 5 | CODE | `codeMetadata` |
| 6 | DYNAMIC | `dynamicMetadata` |
| 7 | MAP | `mapMetadata` |
| 8 | LATEX | `latexMetadata` |
| 9 | CONTENT_ITEMS | `contentItemsMetadata` |

#### Tipos de resaltado de código

| highlightType | Tipo |
|---|---|
| 0 | DEFAULT — Texto normal |
| 1 | KEYWORD — `import`, `const`, `function` |
| 2 | METHOD — Llamadas a funciones |
| 3 | STRING — Cadenas de texto |
| 4 | NUMBER — Valores numéricos |
| 5 | COMMENT — Comentarios (`//`, `#`) |

---

## 🖼️ Redimensionar Media

```js
const buffer = await sock.resize(
  { url: 'https://ejemplo.com/foto.jpg' },
  800,
  600
)
await sock.sendMessage(jid, { image: buffer })
```

> Requiere `sharp`: `npm install sharp`

---

## 🔄 Actualizar Mensaje de Media

Para refrescar la URL de descarga de un mensaje multimedia expirado:

```js
const msgActualizado = await sock.updateMediaMessage(msg)
```

---

## 📰 Canales (Newsletter)

### Crear un canal

```js
const canal = await sock.newsletterCreate('Mi Canal', 'Descripción del canal', imagenBuffer)
console.log(canal.id)
```

### Seguir / Dejar de seguir

```js
await sock.newsletterFollow('1234567890@newsletter')
await sock.newsletterUnfollow('1234567890@newsletter')
```

### Silenciar / Activar

```js
await sock.newsletterMute('1234567890@newsletter')
await sock.newsletterUnmute('1234567890@newsletter')
```

### Obtener metadata

```js
const meta = await sock.newsletterMetadata('jid', '1234567890@newsletter')
console.log(meta.name, meta.subscribers)
```

### Todos los canales suscritos

```js
const canales = await sock.newsletterFetchAllParticipating()
```

### Editar canal

```js
await sock.newsletterUpdateName('1234567890@newsletter', 'Nuevo Nombre')
await sock.newsletterUpdateDescription('1234567890@newsletter', 'Nueva descripción')
await sock.newsletterUpdatePicture('1234567890@newsletter', imagenBuffer)
await sock.newsletterRemovePicture('1234567890@newsletter')
```

### Reaccionar a un mensaje del canal

```js
await sock.newsletterReactMessage('1234567890@newsletter', serverId, '❤️')
```

### Administración

```js
const subs = await sock.newsletterSubscribers(jid)
const adminCount = await sock.newsletterAdminCount(jid)
await sock.newsletterChangeOwner(jid, nuevoOwnerJid)
await sock.newsletterDemote(jid, userJid)
await sock.newsletterDelete(jid)
```

### Acción genérica

```js
await sock.newsletterAction('1234567890@newsletter', 'follow')
await sock.newsletterAction('1234567890@newsletter', 'unfollow')
await sock.newsletterAction('1234567890@newsletter', 'mute')
```

---

## 👥 Grupos

### Crear grupo

```js
const grupo = await sock.groupCreate('Nombre del Grupo', [
  '57300xxxxxxx@s.whatsapp.net',
  '57301xxxxxxx@s.whatsapp.net'
])
```

### Salir del grupo

```js
await sock.groupLeave('1234567890@g.us')
```

### Actualizar nombre / descripción

```js
await sock.groupUpdateSubject('1234567890@g.us', 'Nuevo Nombre')
await sock.groupUpdateDescription('1234567890@g.us', 'Nueva descripción')
```

### Gestionar participantes

```js
// action: 'add' | 'remove' | 'promote' | 'demote'
await sock.groupParticipantsUpdate('1234567890@g.us', ['57300xxxxxxx@s.whatsapp.net'], 'add')
await sock.groupParticipantsUpdate('1234567890@g.us', ['57300xxxxxxx@s.whatsapp.net'], 'promote')
await sock.groupParticipantsUpdate('1234567890@g.us', ['57300xxxxxxx@s.whatsapp.net'], 'demote')
await sock.groupParticipantsUpdate('1234567890@g.us', ['57300xxxxxxx@s.whatsapp.net'], 'remove')
```

### Invitaciones

```js
const codigo = await sock.groupInviteCode('1234567890@g.us')
await sock.groupRevokeInvite('1234567890@g.us')
await sock.groupAcceptInvite(codigo)
const info = await sock.groupGetInviteInfo(codigo)
```

### Configuración

```js
// setting: 'announcement' | 'not_announcement' | 'locked' | 'unlocked'
await sock.groupSettingUpdate('1234567890@g.us', 'announcement')

await sock.groupToggleEphemeral('1234567890@g.us', 86400)

// mode: 'all_member_add' | 'admin_add'
await sock.groupMemberAddMode('1234567890@g.us', 'admin_add')

// mode: 'on' | 'off'
await sock.groupJoinApprovalMode('1234567890@g.us', 'on')
```

### Verificar admin

```js
const { isAdmin, isBotAdmin } = await sock.getAdminStatus('1234567890@g.us', participanteJid)
```

### Solicitudes de entrada

```js
const solicitudes = await sock.groupRequestParticipantsList('1234567890@g.us')
// action: 'approve' | 'reject'
await sock.groupRequestParticipantsUpdate('1234567890@g.us', [jid], 'approve')
```

---

## 👤 Perfil y Privacidad

```js
await sock.updateProfilePicture(jid, imagenBuffer)
await sock.removeProfilePicture(jid)
const urlFoto = await sock.profilePictureUrl(jid, 'image')

await sock.updateProfileStatus('🤖 Bot activo')
await sock.updateProfileName('Mi Bot')

await sock.updateBlockStatus(jid, 'block')
await sock.updateBlockStatus(jid, 'unblock')
const bloqueados = await sock.fetchBlocklist()

await sock.updateLastSeenPrivacy('contacts')
await sock.updateOnlinePrivacy('match_last_seen')
await sock.updateProfilePicturePrivacy('contacts')
await sock.updateStatusPrivacy('contacts')
await sock.updateReadReceiptsPrivacy('all')
await sock.updateGroupsAddPrivacy('contacts')
await sock.updateCallPrivacy('all')
```

---

## 💬 Gestión de Chats

```js
await sock.chatModify({ archive: true, lastMessages: [msg] }, jid)
await sock.chatModify({ mute: 8 * 60 * 60 * 1000 }, jid)
await sock.chatModify({ pin: true }, jid)

await sock.clearMessage(jid, msg.key, msg.messageTimestamp)

await sock.readMessages([msg.key])

await sock.sendPresenceUpdate('composing', jid)
await sock.sendPresenceUpdate('recording', jid)
await sock.presenceSubscribe(jid)

await sock.star(jid, [msg.key], true)
await sock.star(jid, [msg.key], false)
```

---

## 🏷️ Etiquetas

```js
await sock.addChatLabel(jid, labelId)
await sock.removeChatLabel(jid, labelId)
await sock.addMessageLabel(jid, msgId, labelId)
await sock.removeMessageLabel(jid, msgId, labelId)
```

---

## 🔧 Utilidades exportadas

```js
import {
  tokenizeCode,
  generateTableContent,
  generateListContent,
  generateCodeBlockContent,
  generateRichMessageContent,
  buildRichContextInfo,
  buildBotForwardedMessage,
  captureUnifiedResponse,
  CodeHighlightType,
  RichSubMessageType,
  useMultiFileAuthState,
  useSingleFileAuthState,
  useMongoFileAuthState,
  generateMessageID,
  generateMessageIDV2,
  delay,
  jidNormalizedUser,
  isJidGroup,
  isJidNewsletter,
  proto,
  Browsers,
  DisconnectReason
} from './lib/index.js'
```

---

## 📋 Resumen de Métodos

| Método | Descripción |
|---|---|
| `sendMessage(jid, { interactiveMessage })` | Botones nativos flow |
| `sendMessage(jid, { interactiveButtons })` | Botones viewOnce |
| `sendMessage(jid, { requestPaymentMessage })` | Solicitud de pago |
| `sendMessage(jid, { productMessage })` | Mensaje de producto |
| `sendMessage(jid, { eventMessage })` | Evento |
| `sendMessage(jid, { pollResultMessage })` | Resultado de encuesta |
| `sendStatusMention(content, jids)` | Status con menciones |
| `sendTable(jid, title, headers, rows, quoted?, opts?)` | Tabla rica |
| `sendList(jid, title, items, quoted?, opts?)` | Lista rica |
| `sendCodeBlock(jid, code, quoted?, opts?)` | Bloque de código |
| `sendRichMessage(jid, submessages, quoted?)` | Mensaje rico mixto |
| `resize(media, width, height)` | Redimensionar imagen |
| `updateMediaMessage(msg)` | Refrescar URL de media |
| `newsletterCreate(name, desc, img?)` | Crear canal |
| `newsletterFollow/Unfollow(jid)` | Seguir/dejar canal |
| `newsletterMute/Unmute(jid)` | Silenciar/activar canal |
| `newsletterMetadata(type, jid)` | Metadata del canal |
| `newsletterFetchAllParticipating()` | Canales suscritos |
| `newsletterAction(jid, action)` | Acción genérica |
| `groupCreate(subject, participants)` | Crear grupo |
| `groupLeave(jid)` | Salir del grupo |
| `groupParticipantsUpdate(jid, jids, action)` | Gestionar participantes |
| `groupSettingUpdate(jid, setting)` | Configuración del grupo |
| `groupToggleEphemeral(jid, seconds)` | Mensajes temporales |
| `groupInviteCode(jid)` | Código de invitación |
| `groupAcceptInvite(code)` | Aceptar invitación |
| `getAdminStatus(groupJid, userJid)` | Verificar si es admin |
| `readMessages(keys)` | Marcar como leídos |
| `sendPresenceUpdate(type, jid)` | Actualizar presencia |
| `profilePictureUrl(jid)` | URL de foto de perfil |
| `updateProfilePicture(jid, img)` | Cambiar foto de perfil |
| `updateBlockStatus(jid, action)` | Bloquear/desbloquear |
| `chatModify(mod, jid)` | Modificar chat |
| `clearMessage(jid, key, timestamp)` | Eliminar mensaje del chat |
| `star(jid, keys, star)` | Destacar mensajes |
| `addChatLabel / removeChatLabel` | Gestionar etiquetas de chat |
| `addMessageLabel / removeMessageLabel` | Gestionar etiquetas de mensaje |

---

## ⚙️ Requisitos

- Node.js `>= 20.0.0`
- `"type": "module"` en `package.json`
- `sharp` instalado para `resize()` (opcional)

---

## 📄 Licencia

MIT © iamDestroy
