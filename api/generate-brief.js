const rateLimit = new Map()
const WINDOW_MS = 60 * 1000
const MAX_REQUESTS = 12

function sendJson(response, status, payload) {
  response.status(status).json(payload)
}

function isRateLimited(request) {
  const forwardedFor = request.headers['x-forwarded-for']
  const ip = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(',')[0]?.trim() || request.socket?.remoteAddress || 'unknown'
  const now = Date.now()
  const current = rateLimit.get(ip)

  if (!current || now - current.startedAt > WINDOW_MS) {
    rateLimit.set(ip, { count: 1, startedAt: now })
    return false
  }

  current.count += 1
  return current.count > MAX_REQUESTS
}

function normalizeBookInput(value) {
  return typeof value === 'string' ? value.trim().slice(0, 160) : ''
}

function parseBody(body) {
  if (typeof body !== 'string') return body

  try {
    return JSON.parse(body)
  } catch {
    return null
  }
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return sendJson(response, 405, { error: 'Method not allowed' })
  }

  if (isRateLimited(request)) {
    return sendJson(response, 429, { error: 'Too many requests' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return sendJson(response, 500, { error: 'Brief generation is not configured' })
  }
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'

  const body = parseBody(request.body)
  const title = normalizeBookInput(body?.title)
  const author = normalizeBookInput(body?.author)

  if (!title || !author) {
    return sendJson(response, 400, { error: 'Missing title or author' })
  }

  try {
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1000,
        system: `You are a cultural context engine for a book companion app called LucyReads. Return ONLY valid JSON with no markdown, no explanation, no preamble. Schema: { "brief": string, "controversy": string, "bookClub": [string, string, string], "prompts": [string, string, string] }. brief: 1-2 sentences of cultural context — what the book is and why it matters right now. controversy: 1 sentence on the central debate or most divisive element. bookClub: 3 sharp discussion questions a real book club would actually argue about. prompts: 3 short questions a reader would genuinely want to ask an AI about this book.`,
        messages: [
          { role: 'user', content: `Book: "${title}" by ${author}` },
        ],
      }),
    })

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text().catch(() => '')
      console.error('Anthropic API failed:', anthropicResponse.status, errorText)
      return sendJson(response, anthropicResponse.status, { error: 'Brief generation failed' })
    }

    const data = await anthropicResponse.json()
    const content = data.content?.[0]?.text
    if (!content) {
      return sendJson(response, 502, { error: 'Brief generation returned no content' })
    }

    return sendJson(response, 200, JSON.parse(content))
  } catch (error) {
    console.error('generate-brief failed:', error)
    return sendJson(response, 500, { error: 'Brief generation failed' })
  }
}
