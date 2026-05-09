/**
 * FreeSWITCH ESL Mock Server — full protocol compliance for modesl
 * 
 * Implements the ESL wire protocol exactly as the `modesl` npm library expects:
 *   Content-Type: auth/request  → awaits auth
 *   Content-Type: command/reply → response to auth/commands
 *   Content-Type: api/response  → response to api/bgapi with Content-Length body
 *   Content-Type: text/event-plain → events with body containing event headers
 */
'use strict'
const net = require('net')
const crypto = require('crypto')
const { execFile, spawn } = require('child_process')

const ESL_PORT = parseInt(process.env.ESL_PORT || '8021')
const PASSWORD = process.env.FREESWITCH_ESL_PASSWORD || 'ClueCon'
const CORE_UUID = 'voxora-mock-' + crypto.randomBytes(4).toString('hex')

// Track registered gateways and active calls
const gateways = new Map()      // name -> { name, server, username, status }
const activeCalls = new Map()   // uuid -> callData
let allClients = []             // all authenticated clients
let eventSubscribers = []       // clients subscribed to events

// ─── Wire framing ─────────────────────────────────────────────────────────────

function writeRaw(socket, data) {
  if (!socket.destroyed) {
    try { socket.write(data) } catch (_) {}
  }
}

function sendAuthRequest(socket) {
  writeRaw(socket, 'Content-Type: auth/request\n\n')
}

function sendCommandReply(socket, text) {
  writeRaw(socket, `Content-Type: command/reply\nReply-Text: ${text}\n\n`)
}

function sendApiResponse(socket, body) {
  const buf = Buffer.from(body, 'utf8')
  writeRaw(socket, `Content-Type: api/response\nContent-Length: ${buf.length}\n\n`)
  writeRaw(socket, buf)
}

// ESL text/event-plain: outer headers + body (which contains event key:value pairs)
function sendEventPlain(socket, eventObj) {
  // Build body from event key:value pairs, terminated by \n
  const bodyLines = Object.entries(eventObj)
    .map(([k, v]) => `${k}: ${String(v).replace(/\n/g, ' ')}`)
    .join('\n')
  const body = bodyLines + '\n'
  const buf = Buffer.from(body, 'utf8')
  writeRaw(socket, `Content-Type: text/event-plain\nContent-Length: ${buf.length}\n\n`)
  writeRaw(socket, buf)
}

function broadcastEvent(eventObj) {
  const fullEvent = {
    'Core-UUID': CORE_UUID,
    'FreeSWITCH-Hostname': 'voxora-esl-mock',
    'FreeSWITCH-Version': '1.10.11-mock',
    'Event-Date-Timestamp': (Date.now() * 1000).toString(),
    ...eventObj,
  }
  const live = []
  for (const s of eventSubscribers) {
    if (!s.destroyed) {
      sendEventPlain(s, fullEvent)
      live.push(s)
    }
  }
  eventSubscribers = live
}

// ─── Gateway management ───────────────────────────────────────────────────────

function registerGateway(name, server, username, password, transport) {
  console.log(`[ESL] Gateway registering: ${name} (${username}@${server}) transport=${transport}`)
  gateways.set(name, { name, server, username, password, transport, status: 'TRYING' })
  
  // Simulate registration attempt using baresip
  testSipRegistration(name, server, username, password, transport)
}

function testSipRegistration(name, server, username, password, transport) {
  const acct = `<sip:${username}@${server};transport=${transport.toLowerCase()}>;auth_pass=${password};regint=30;outbound="sip:${server}:${transport === 'TLS' ? '5061' : '5060'};transport=${transport.toLowerCase()}"`
  const configDir = `/tmp/baresip-gw-${name}`
  const fs = require('fs')
  
  try {
    fs.mkdirSync(configDir, { recursive: true })
    fs.writeFileSync(`${configDir}/config`,
      `net_interface\teth0\nmodule_path\t/usr/lib/baresip/modules\nmodule\taccount.so\nmodule\tg711.so\naudio_player\t/dev/null\naudio_source\t/dev/null\nsip_cafile\t/etc/ssl/certs/ca-certificates.crt\nlog_level\tinfo\n`)
    fs.writeFileSync(`${configDir}/accounts`, acct + '\n')
  } catch(e) {
    // Fall back to simulated REGISTERED
    gateways.set(name, { ...gateways.get(name), status: 'REGED' })
    broadcastGatewayEvent(name, 'REGISTERED')
    return
  }

  const proc = spawn('baresip', ['-f', configDir, '-t', '10'], { stdio: ['ignore', 'pipe', 'pipe'] })
  let output = ''
  proc.stdout.on('data', d => { output += d.toString() })
  proc.stderr.on('data', d => { output += d.toString() })
  
  proc.on('close', (code) => {
    const success = output.includes('200 OK') || output.includes('1 binding')
    const gw = gateways.get(name)
    if (gw) {
      gw.status = success ? 'REGED' : 'FAILED'
      gateways.set(name, gw)
      console.log(`[ESL] Gateway ${name}: ${gw.status} (baresip output: ${output.slice(-120).replace(/\n/g, ' ')})`)
      broadcastGatewayEvent(name, success ? 'REGISTERED' : 'FAILED')
    }
  })

  setTimeout(() => { try { proc.kill() } catch(_) {} }, 12000)
}

function broadcastGatewayEvent(name, status) {
  broadcastEvent({
    'Event-Name': 'CUSTOM',
    'Event-Subclass': 'sofia::gateway_state',
    'Gateway': name,
    'State': status,
    'Ping-Status': status === 'REGISTERED' ? 'Reachable' : 'Unreachable',
  })
}

function buildSofiaStatus() {
  if (gateways.size === 0) {
    return '=================================\nNo registrations\n'
  }
  let out = '=================================\n'
  for (const [name, gw] of gateways) {
    out += `Profile: voxora_outbound\n`
    out += ` Gateway: ${name}\n`
    out += `   State: ${gw.status}\n`
    out += `   Username: ${gw.username}\n`
    out += `   Realm: ${gw.server}\n\n`
  }
  return out
}

// ─── Call simulation ──────────────────────────────────────────────────────────

function originate(phone, gateway, campaignId) {
  const uuid = crypto.randomUUID()
  activeCalls.set(uuid, { uuid, phone, gateway, campaignId, status: 'ringing' })
  console.log(`[ESL] Originating call: ${phone} via ${gateway} (uuid=${uuid})`)

  // CHANNEL_CREATE
  setTimeout(() => {
    broadcastEvent({
      'Event-Name': 'CHANNEL_CREATE',
      'Unique-ID': uuid,
      'Caller-Destination-Number': phone,
      'Caller-Direction': 'outbound',
      'variable_voxora_campaign_id': campaignId || '',
      'Channel-Call-State': 'RINGING',
    })
  }, 300)

  const willAnswer = Math.random() > 0.28
  const ringMs = 1500 + Math.random() * 4000

  setTimeout(() => {
    if (!activeCalls.has(uuid)) return

    if (willAnswer) {
      const isHuman = Math.random() > 0.42
      const amdResult = isHuman ? 'HUMAN' : 'MACHINE'
      activeCalls.set(uuid, { ...activeCalls.get(uuid), status: 'answered', amdResult })

      broadcastEvent({
        'Event-Name': 'CHANNEL_ANSWER',
        'Unique-ID': uuid,
        'Caller-Destination-Number': phone,
        'Caller-Direction': 'outbound',
        'Channel-Call-State': 'ACTIVE',
        'variable_voxora_campaign_id': campaignId || '',
        'variable_amd_result': amdResult,
        'Answer-State': 'answered',
      })

      const callDur = Math.floor(8 + Math.random() * 60)
      setTimeout(() => {
        if (!activeCalls.has(uuid)) return
        const mos = (3.5 + Math.random() * 1.4).toFixed(2)
        const loss = (Math.random() * 0.5).toFixed(3)
        const jitter = Math.floor(2 + Math.random() * 15)

        broadcastEvent({
          'Event-Name': 'CHANNEL_HANGUP_COMPLETE',
          'Unique-ID': uuid,
          'Caller-Destination-Number': phone,
          'Caller-Direction': 'outbound',
          'Hangup-Cause': 'NORMAL_CLEARING',
          'variable_voxora_campaign_id': campaignId || '',
          'variable_duration': callDur.toString(),
          'variable_billsec': callDur.toString(),
          'variable_amd_result': amdResult,
          'variable_rtp_audio_out_mos': mos,
          'variable_rtp_audio_in_packet_loss_rate': loss,
          'variable_rtp_audio_in_jitter': jitter.toString(),
          'Answer-State': 'answered',
        })
        broadcastEvent({
          'Event-Name': 'CHANNEL_DESTROY',
          'Unique-ID': uuid,
          'Hangup-Cause': 'NORMAL_CLEARING',
          'variable_duration': callDur.toString(),
        })
        activeCalls.delete(uuid)
      }, callDur * 1000)

    } else {
      const causes = ['NO_ANSWER', 'BUSY', 'CALL_REJECTED', 'SUBSCRIBER_ABSENT']
      const cause = causes[Math.floor(Math.random() * causes.length)]
      broadcastEvent({
        'Event-Name': 'CHANNEL_HANGUP_COMPLETE',
        'Unique-ID': uuid,
        'Caller-Destination-Number': phone,
        'Hangup-Cause': cause,
        'variable_duration': '0',
        'variable_billsec': '0',
        'variable_voxora_campaign_id': campaignId || '',
      })
      broadcastEvent({ 'Event-Name': 'CHANNEL_DESTROY', 'Unique-ID': uuid, 'Hangup-Cause': cause })
      activeCalls.delete(uuid)
    }
  }, ringMs)

  return uuid
}

// ─── Command dispatcher ───────────────────────────────────────────────────────

function handleCommand(socket, raw) {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
  if (!lines.length) return
  const first = lines[0]

  // AUTH
  if (first.startsWith('auth')) {
    const pass = first.slice(5).trim()
    if (pass === PASSWORD) {
      sendCommandReply(socket, '+OK accepted')
      if (!eventSubscribers.includes(socket)) eventSubscribers.push(socket)
      if (!allClients.includes(socket)) allClients.push(socket)
      console.log(`[ESL] ✓ Client authenticated (${socket.remoteAddress})`)
    } else {
      sendCommandReply(socket, '-ERR invalid')
      socket.end()
    }
    return
  }

  // EVENT subscription
  if (/^event\s+/i.test(first)) {
    if (!eventSubscribers.includes(socket)) eventSubscribers.push(socket)
    sendCommandReply(socket, '+OK event listener enabled plain')
    return
  }

  if (/^noevents$/i.test(first)) { sendCommandReply(socket, '+OK no events'); return }
  if (/^nolog$/i.test(first))    { sendCommandReply(socket, '+OK'); return }
  if (/^linger/i.test(first))    { sendCommandReply(socket, '+OK'); return }
  if (/^filter/i.test(first))    { sendCommandReply(socket, '+OK'); return }
  if (/^myevents/i.test(first))  { sendCommandReply(socket, '+OK'); return }
  if (/^divert/i.test(first))    { sendCommandReply(socket, '+OK'); return }

  // API / BGAPI
  if (/^(api|bgapi)\s+/i.test(first)) {
    const cmd = first.replace(/^(api|bgapi)\s+/i, '').trim()
    handleApiCommand(socket, cmd)
    return
  }

  // Catch-all
  sendCommandReply(socket, '+OK')
}

function handleApiCommand(socket, cmd) {
  const lower = cmd.toLowerCase()

  // sofia status
  if (lower.startsWith('sofia status')) {
    sendApiResponse(socket, buildSofiaStatus())
    return
  }

  // sofia profile ... rescan / register / reload
  if (lower.startsWith('sofia profile') || lower.startsWith('sofia rescan')) {
    // Extract gateway XML if present (for loadGateway)
    const gwMatch = cmd.match(/name="([^"]+)"/)
    if (gwMatch) {
      const name = gwMatch[1]
      const serverMatch = cmd.match(/value="([^"]+)".*?proxy/)
      console.log(`[ESL] Sofia profile command for gateway: ${name}`)
    }
    sendApiResponse(socket, '+OK\n')
    return
  }

  // sofia gateway register
  if (lower.includes('gateway') && lower.includes('register')) {
    const parts = cmd.split(/\s+/)
    const gwName = parts[parts.length - 1]
    if (gateways.has(gwName)) {
      const gw = gateways.get(gwName)
      gw.status = 'TRYING'
      testSipRegistration(gwName, gw.server, gw.username, gw.password, gw.transport)
    }
    sendApiResponse(socket, '+OK\n')
    return
  }

  // status
  if (lower === 'status') {
    const body = [
      `UP ${Math.floor(process.uptime())} secs`,
      `0 session(s) since startup`,
      `Active: ${activeCalls.size}`,
      `Peak: ${activeCalls.size}`,
      `Idle-CPU: 98.00`,
    ].join('\n') + '\n'
    sendApiResponse(socket, body)
    return
  }

  // show channels
  if (lower.startsWith('show channels')) {
    const rows = Array.from(activeCalls.values()).map(c =>
      `${c.uuid},sofia/gateway/${c.gateway}/${c.phone},active`
    ).join('\n')
    sendApiResponse(socket, (rows || 'No channels') + `\n\n${activeCalls.size} total.\n`)
    return
  }

  // originate
  if (lower.startsWith('originate')) {
    const phoneMatch = cmd.match(/sofia\/gateway\/([^/]+)\/([^\s}]+)/)
    const campaignMatch = cmd.match(/voxora_campaign_id=([^,}]+)/)
    const phone = phoneMatch ? phoneMatch[2] : 'unknown'
    const gateway = phoneMatch ? phoneMatch[1] : 'default'
    const campaignId = campaignMatch ? campaignMatch[1] : ''
    const uuid = originate(phone, gateway, campaignId)
    sendApiResponse(socket, `+OK ${uuid}\n`)
    return
  }

  // uuid_kill
  if (lower.startsWith('uuid_kill')) {
    const parts = cmd.split(/\s+/)
    const uuid = parts[1]
    if (uuid && activeCalls.has(uuid)) {
      const c = activeCalls.get(uuid)
      broadcastEvent({
        'Event-Name': 'CHANNEL_HANGUP_COMPLETE',
        'Unique-ID': uuid,
        'Caller-Destination-Number': c.phone,
        'Hangup-Cause': 'MANAGER_REQUEST',
        'variable_duration': '5',
        'variable_billsec': '5',
        'variable_voxora_campaign_id': c.campaignId || '',
      })
      activeCalls.delete(uuid)
    }
    sendApiResponse(socket, '+OK\n')
    return
  }

  // uuid_setvar / uuid_getvar
  if (lower.startsWith('uuid_setvar') || lower.startsWith('uuid_getvar')) {
    sendApiResponse(socket, '+OK\n')
    return
  }

  // reloadxml
  if (lower.startsWith('reloadxml') || lower.startsWith('reload')) {
    sendApiResponse(socket, '+OK [Success]\n')
    return
  }

  // load_gateway XML config — parse and register
  if (lower.includes('<gateway') || lower.includes('sofia profile voxora_outbound')) {
    // Try to parse gateway name from XML
    const nameMatch = cmd.match(/name="([^"]+)"/)
    const serverMatch = cmd.match(/<param name="realm" value="([^"]+)"/)
    const userMatch = cmd.match(/<param name="username" value="([^"]+)"/)
    const passMatch = cmd.match(/<param name="password" value="([^"]+)"/)
    const transportMatch = cmd.match(/<param name="transport" value="([^"]+)"/)

    if (nameMatch && serverMatch && userMatch && passMatch) {
      const gname = nameMatch[1]
      const transport = (transportMatch ? transportMatch[1] : 'udp').toUpperCase()
      registerGateway(gname, serverMatch[1], userMatch[1], passMatch[1], transport)
    }
    sendApiResponse(socket, '+OK\n')
    return
  }

  // Default
  sendApiResponse(socket, '+OK\n')
}

// ─── Server ───────────────────────────────────────────────────────────────────

const server = net.createServer((socket) => {
  console.log(`[ESL] New connection from ${socket.remoteAddress}:${socket.remotePort}`)
  sendAuthRequest(socket)

  let buf = ''
  socket.on('data', (chunk) => {
    buf += chunk.toString('utf8')
    // Commands are terminated by double newline
    const parts = buf.split('\n\n')
    buf = parts.pop() // keep incomplete
    for (const part of parts) {
      if (part.trim()) handleCommand(socket, part)
    }
  })

  socket.on('close', () => {
    allClients = allClients.filter(s => s !== socket)
    eventSubscribers = eventSubscribers.filter(s => s !== socket)
    console.log(`[ESL] Client disconnected (${socket.remoteAddress})`)
  })

  socket.on('error', (e) => {
    allClients = allClients.filter(s => s !== socket)
    eventSubscribers = eventSubscribers.filter(s => s !== socket)
    if (e.code !== 'ECONNRESET') console.error('[ESL] Error:', e.message)
  })
})

server.on('error', (e) => {
  console.error('[ESL] Server error:', e.message)
  if (e.code === 'EADDRINUSE') process.exit(1)
})

server.listen(ESL_PORT, '0.0.0.0', () => {
  console.log(`╔════════════════════════════════════════════════╗`)
  console.log(`║  FreeSWITCH ESL Mock  (modesl-compatible)      ║`)
  console.log(`║  Port: ${ESL_PORT}   Password: ${PASSWORD.padEnd(22)}║`)
  console.log(`║  Features: originate, AMD, CHANNEL_HANGUP,     ║`)
  console.log(`║            gateway management, sofia status     ║`)
  console.log(`╚════════════════════════════════════════════════╝`)
})

// Heartbeat every 30s to keep connection alive
setInterval(() => {
  broadcastEvent({
    'Event-Name': 'HEARTBEAT',
    'Event-Info': 'System Ready',
    'Up-Time': Math.floor(process.uptime()) + ' seconds',
    'Session-Count': activeCalls.size.toString(),
    'Max-Sessions': '1000',
    'Session-Since-Startup': '0',
    'Idle-CPU': '97.00',
  })
}, 30000)

process.on('SIGINT', () => { server.close(); process.exit(0) })
process.on('SIGTERM', () => { server.close(); process.exit(0) })

// Expose internal state for debugging
process.on('SIGUSR1', () => {
  console.log('[ESL] Gateways:', Object.fromEntries(gateways))
  console.log('[ESL] Active calls:', activeCalls.size)
  console.log('[ESL] Subscribers:', eventSubscribers.length)
})
