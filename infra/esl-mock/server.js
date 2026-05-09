/**
 * FreeSWITCH ESL Mock Server — strict protocol compliance for modesl
 *
 * modesl wire format:
 *   OUTER_HEADERS \n\n [BODY (if Content-Length set)]
 *
 * For command/reply: headers only, no body
 * For api/response:  headers + body (Content-Length bytes)
 * For text/event-plain: headers (Content-Type + Content-Length) + body
 *   Body = event key:value pairs terminated by \n\n
 */
'use strict'
const net = require('net')
const crypto = require('crypto')

const ESL_PORT = 8021
const PASSWORD = process.env.FREESWITCH_ESL_PASSWORD || 'ClueCon'
const CORE_UUID = 'voxora-mock-' + crypto.randomBytes(4).toString('hex')

let subscribers = []
const activeCalls = new Map()

// ─── Low-level framing ────────────────────────────────────────────────────────

function writeHeaders(socket, headers) {
  const msg = Object.entries(headers).map(([k, v]) => `${k}: ${v}`).join('\n') + '\n\n'
  try { socket.write(msg) } catch (_) {}
}

function writeCommandReply(socket, text) {
  writeHeaders(socket, {
    'Content-Type': 'command/reply',
    'Reply-Text': text,
  })
}

function writeApiResponse(socket, body) {
  const buf = Buffer.from(body)
  const outer = `Content-Type: api/response\nContent-Length: ${buf.length}\n\n`
  try { socket.write(outer); socket.write(buf) } catch (_) {}
}

function writePlainEvent(socket, eventHeaders) {
  // The body is the event headers encoded as plain text
  const body = Object.entries(eventHeaders)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n') + '\n\n'
  const buf = Buffer.from(body)
  const outer = `Content-Type: text/event-plain\nContent-Length: ${buf.length}\n\n`
  try { socket.write(outer); socket.write(buf) } catch (_) {}
}

function broadcast(eventHeaders) {
  const live = []
  for (const s of subscribers) {
    if (!s.destroyed) {
      writePlainEvent(s, eventHeaders)
      live.push(s)
    }
  }
  subscribers = live
}

// ─── Command handling ─────────────────────────────────────────────────────────

function baseEvent(extra = {}) {
  return {
    'Core-UUID': CORE_UUID,
    'FreeSWITCH-Hostname': 'voxora-dev',
    'FreeSWITCH-Version': '1.10.11-mock',
    'Event-Date-Timestamp': Date.now() + '000',
    ...extra,
  }
}

function simulateCall(phone) {
  const uuid = crypto.randomUUID()
  activeCalls.set(uuid, { uuid, phone, status: 'ringing' })

  // CHANNEL_CREATE
  setTimeout(() => {
    broadcast(baseEvent({
      'Event-Name': 'CHANNEL_CREATE',
      'Unique-ID': uuid,
      'Caller-Destination-Number': phone,
      'Caller-Direction': 'outbound',
      'Channel-Call-State': 'RINGING',
    }))
  }, 200)

  // CHANNEL_ANSWER or CHANNEL_HANGUP (no answer)
  const willAnswer = Math.random() > 0.25
  const ringDuration = 2000 + Math.random() * 4000

  setTimeout(() => {
    if (willAnswer) {
      const isHuman = Math.random() > 0.45
      activeCalls.set(uuid, { ...activeCalls.get(uuid), status: 'answered' })

      broadcast(baseEvent({
        'Event-Name': 'CHANNEL_ANSWER',
        'Unique-ID': uuid,
        'Caller-Destination-Number': phone,
        'Caller-Direction': 'outbound',
        'Channel-Call-State': 'ACTIVE',
        'variable_amd_result': isHuman ? 'HUMAN' : 'MACHINE',
        'variable_amd_result_text': isHuman ? 'HUMAN' : 'MACHINE',
      }))

      // Hang up after call duration
      const callDuration = Math.floor(8 + Math.random() * 55)
      setTimeout(() => {
        broadcast(baseEvent({
          'Event-Name': 'CHANNEL_HANGUP',
          'Unique-ID': uuid,
          'Caller-Destination-Number': phone,
          'Caller-Direction': 'outbound',
          'Hangup-Cause': 'NORMAL_CLEARING',
          'variable_duration': callDuration.toString(),
          'variable_billsec': callDuration.toString(),
          'variable_amd_result': isHuman ? 'HUMAN' : 'MACHINE',
        }))
        broadcast(baseEvent({
          'Event-Name': 'CHANNEL_DESTROY',
          'Unique-ID': uuid,
          'Hangup-Cause': 'NORMAL_CLEARING',
          'variable_duration': callDuration.toString(),
        }))
        activeCalls.delete(uuid)
      }, callDuration * 1000)
    } else {
      broadcast(baseEvent({
        'Event-Name': 'CHANNEL_HANGUP',
        'Unique-ID': uuid,
        'Caller-Destination-Number': phone,
        'Hangup-Cause': 'NO_ANSWER',
        'variable_duration': '0',
        'variable_billsec': '0',
      }))
      broadcast(baseEvent({
        'Event-Name': 'CHANNEL_DESTROY',
        'Unique-ID': uuid,
        'Hangup-Cause': 'NO_ANSWER',
      }))
      activeCalls.delete(uuid)
    }
  }, ringDuration)

  return uuid
}

function handleLine(socket, line) {
  line = line.trim()
  if (!line) return

  // AUTH
  if (line.startsWith('auth')) {
    const pass = line.replace(/^auth\s+/, '')
    if (pass === PASSWORD) {
      writeCommandReply(socket, '+OK accepted')
      console.log('[ESL] Client authenticated ✓')
      subscribers.push(socket)
    } else {
      writeCommandReply(socket, '-ERR invalid')
      socket.end()
    }
    return
  }

  // EVENT subscription
  if (/^event\s+/.test(line)) {
    writeCommandReply(socket, '+OK event listener enabled plain')
    return
  }

  if (line === 'noevents') {
    writeCommandReply(socket, '+OK no events')
    return
  }

  if (line === 'nolog') {
    writeCommandReply(socket, '+OK')
    return
  }

  if (line.startsWith('filter')) {
    writeCommandReply(socket, '+OK')
    return
  }

  // LINGER
  if (line === 'linger') {
    writeCommandReply(socket, '+OK')
    return
  }

  // API commands
  if (line.startsWith('api ') || line.startsWith('bgapi ')) {
    const isBackground = line.startsWith('bgapi ')
    const cmd = line.replace(/^(api|bgapi)\s+/, '')

    if (cmd.startsWith('sofia status')) {
      writeApiResponse(socket,
        'Profile: external\n  State: RUNNING\n  Outbound Calls: 0\n' +
        'Profile: internal\n  State: RUNNING\n  Inbound Calls: 0\n'
      )
      return
    }

    if (cmd.startsWith('status')) {
      writeApiResponse(socket,
        `UP ${Math.floor(process.uptime())} secs\nSession(s) since startup: 0\nSession(s) - peak 0, last 5min 0\n` +
        `Active: ${activeCalls.size}\n`
      )
      return
    }

    if (cmd.startsWith('show channels')) {
      const rows = Array.from(activeCalls.values())
        .map(c => `${c.uuid},sofia/gateway/voxora/${c.phone},active`)
        .join('\n')
      writeApiResponse(socket, rows + `\n${activeCalls.size} total.\n`)
      return
    }

    if (cmd.startsWith('originate')) {
      const match = cmd.match(/[\d+]{7,}/)
      const phone = match ? match[0] : '+10000000000'
      const uuid = simulateCall(phone)
      console.log(`[ESL] Simulating call to ${phone} (uuid: ${uuid})`)
      writeApiResponse(socket, '+OK ' + uuid + '\n')
      return
    }

    if (cmd.startsWith('uuid_kill') || cmd.startsWith('uuid_bridge')) {
      const parts = cmd.split(/\s+/)
      const uuid = parts[1]
      if (uuid && activeCalls.has(uuid)) {
        broadcast(baseEvent({
          'Event-Name': 'CHANNEL_HANGUP',
          'Unique-ID': uuid,
          'Hangup-Cause': 'MANAGER_REQUEST',
          'variable_duration': '5',
        }))
        activeCalls.delete(uuid)
      }
      writeApiResponse(socket, '+OK\n')
      return
    }

    if (cmd.startsWith('uuid_getvar') || cmd.startsWith('uuid_setvar')) {
      writeApiResponse(socket, '+OK\n')
      return
    }

    if (cmd.startsWith('reloadxml') || cmd.startsWith('reload')) {
      writeApiResponse(socket, '+OK\n')
      return
    }

    // Default API response
    writeApiResponse(socket, '+OK\n')
    return
  }

  // Unknown — just ACK
  writeCommandReply(socket, '+OK')
}

// ─── Server ───────────────────────────────────────────────────────────────────

const server = net.createServer((socket) => {
  console.log(`[ESL] New connection from ${socket.remoteAddress}:${socket.remotePort}`)

  // Send auth challenge immediately
  writeHeaders(socket, { 'Content-Type': 'auth/request' })

  let buf = ''
  socket.on('data', (data) => {
    buf += data.toString()
    // Commands delimited by \n\n
    const parts = buf.split('\n\n')
    buf = parts.pop() // incomplete tail
    for (const part of parts) {
      const trimmed = part.trim()
      if (trimmed) handleLine(socket, trimmed)
    }
  })

  socket.on('close', () => {
    subscribers = subscribers.filter(s => s !== socket)
    console.log(`[ESL] Client disconnected`)
  })

  socket.on('error', (e) => {
    subscribers = subscribers.filter(s => s !== socket)
    if (e.code !== 'ECONNRESET') console.error('[ESL] Socket error:', e.message)
  })
})

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`[ESL] Port ${ESL_PORT} already in use`)
    process.exit(1)
  }
})

server.listen(ESL_PORT, '0.0.0.0', () => {
  console.log(`╔══════════════════════════════════════════╗`)
  console.log(`║  FreeSWITCH ESL Mock  — port ${ESL_PORT}      ║`)
  console.log(`║  Password: ${PASSWORD.padEnd(30)}║`)
  console.log(`║  Simulates: calls, AMD, hangup, events   ║`)
  console.log(`╚══════════════════════════════════════════╝`)
})

// Periodic heartbeat
setInterval(() => {
  broadcast(baseEvent({
    'Event-Name': 'HEARTBEAT',
    'Event-Info': 'System Ready',
    'Up-Time': Math.floor(process.uptime()) + ' seconds',
    'Session-Count': activeCalls.size.toString(),
    'Max-Sessions': '1000',
    'Session-Per-Sec': '30',
    'Session-Since-Startup': '0',
    'Idle-CPU': '98.000000',
  }))
}, 20000)

process.on('SIGINT', () => { server.close(); process.exit(0) })
process.on('SIGTERM', () => { server.close(); process.exit(0) })
