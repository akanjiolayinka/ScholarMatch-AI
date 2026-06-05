import { supabase } from './supabase'

// Same-origin in production; configurable for split deployments.
const API_URL = import.meta.env.VITE_API_URL || ''

// Stream a draft generation. Uses fetch + ReadableStream rather than the
// browser EventSource because EventSource can't send a POST body or
// Authorization header.
//
// onChunk(text)   — called for every token batch as it arrives
// onDone(fullText)
// onError(err)
export async function streamDraft({ type, scholarshipId, instruction, selection }, { onChunk, onDone, onError } = {}) {
  // Empty API_URL is fine in production — same-origin /api/drafts/generate.
  const controller = new AbortController()
  let token = null
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession()
    token = session?.access_token
  }

  try {
    const res = await fetch(`${API_URL}/api/drafts/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ type, scholarshipId, instruction, selection }),
      signal: controller.signal,
    })

    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => '')
      throw new Error(`stream failed: ${res.status} ${text}`)
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let fullText = ''

    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      // SSE events are separated by a blank line.
      let nl
      while ((nl = buffer.indexOf('\n\n')) >= 0) {
        const raw = buffer.slice(0, nl)
        buffer = buffer.slice(nl + 2)
        const parsed = parseSse(raw)
        if (!parsed) continue
        if (parsed.event === 'done') {
          onDone?.(fullText)
          return cancel
        }
        if (parsed.event === 'error') {
          onError?.(new Error(parsed.data?.message || 'stream error'))
          return cancel
        }
        if (parsed.data != null) {
          // Reverse the newline escaping done on the server.
          const chunk = parsed.data.replace(/\\n/g, '\n')
          fullText += chunk
          onChunk?.(chunk, fullText)
        }
      }
    }
    onDone?.(fullText)
  } catch (err) {
    if (err.name !== 'AbortError') onError?.(err)
  }

  function cancel() { controller.abort() }
  return cancel
}

function parseSse(raw) {
  let event = 'message'
  const dataLines = []
  for (const line of raw.split('\n')) {
    if (!line) continue
    if (line.startsWith(':')) continue // comment
    const colon = line.indexOf(':')
    const field = line.slice(0, colon)
    const value = line.slice(colon + 1).replace(/^\s/, '')
    if (field === 'event') event = value
    else if (field === 'data') dataLines.push(value)
  }
  if (dataLines.length === 0) return null
  const raw_ = dataLines.join('\n')
  if (event === 'message') return { event, data: raw_ }
  // For named events, try to JSON-parse the payload.
  try {
    return { event, data: JSON.parse(raw_) }
  } catch {
    return { event, data: raw_ }
  }
}
