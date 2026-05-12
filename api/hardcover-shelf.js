const SPINE_COLORS = [
  { base: '#1c0f2e', band: '#7c3aed', text: '#ddd6fe' },
  { base: '#071818', band: '#9ac6c5', text: '#e0f2f1' },
  { base: '#1a0808', band: '#b91c1c', text: '#fecaca' },
  { base: '#060e1e', band: '#2563eb', text: '#bfdbfe' },
  { base: '#140e02', band: '#b45309', text: '#fde68a' },
  { base: '#130800', band: '#c2410c', text: '#fed7aa' },
  { base: '#06101c', band: '#1d4ed8', text: '#dbeafe' },
  { base: '#040f0e', band: '#0d9488', text: '#ccfbf1' },
]

const SPINE_SIZES = [
  { w: 29, h: 186 },
  { w: 25, h: 174 },
  { w: 33, h: 194 },
  { w: 35, h: 200 },
  { w: 31, h: 190 },
  { w: 27, h: 177 },
  { w: 29, h: 187 },
  { w: 33, h: 192 },
]

const GET_LIST_QUERY = `
  query GetList($listId: Int!) {
    lists(where: {id: {_eq: $listId}}) {
      id
      name
      list_books(order_by: {position: asc}, limit: 40) {
        book {
          id
          title
          cached_contributors
          image {
            url
          }
          rating
        }
      }
    }
  }
`

function sendJson(response, status, payload) {
  response.status(status).json(payload)
}

function normalizeListId(value) {
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string' || raw.trim() === '') return null

  const listId = Number(raw)
  return Number.isInteger(listId) ? listId : null
}

function getAuthor(book) {
  return book.cached_contributors?.[0]?.author?.name ?? 'Unknown'
}

function buildAuthorizationHeader(apiKey) {
  const token = apiKey.trim()
  return token.toLowerCase().startsWith('bearer ') ? token : `Bearer ${token}`
}

function normalizeHardcoverBook(book, index) {
  return {
    id: `hardcover:${book.id}`,
    title: book.title,
    fullTitle: book.title,
    author: getAuthor(book),
    year: '',
    coverUrl: book.image?.url ?? '',
    heat: Math.floor(Math.random() * 30) + 65,
    sentiment: '',
    brief: '',
    controversy: '',
    bookClub: [],
    chapters: [],
    prompts: [],
    ...SPINE_COLORS[index % SPINE_COLORS.length],
    ...SPINE_SIZES[index % SPINE_SIZES.length],
  }
}

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return sendJson(response, 405, { error: 'Method not allowed' })
  }

  const listId = normalizeListId(request.query?.listId)
  if (listId === null) {
    return sendJson(response, 400, { error: 'listId must be a number' })
  }

  const apiKey = process.env.HARDCOVER_API_KEY
  if (!apiKey) {
    console.error('Missing HARDCOVER_API_KEY')
    return sendJson(response, 502, { error: 'Hardcover API key is not configured' })
  }

  try {
    const hardcoverResponse = await fetch('https://api.hardcover.app/v1/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // HARDCOVER_API_KEY may be stored as either the raw token or "Bearer <token>".
        authorization: buildAuthorizationHeader(apiKey),
      },
      body: JSON.stringify({
        query: GET_LIST_QUERY,
        variables: { listId },
      }),
    })

    const data = await hardcoverResponse.json().catch(() => null)

    if (!hardcoverResponse.ok) {
      console.error('Hardcover list fetch failed:', hardcoverResponse.status, data)
      return sendJson(response, 502, { error: 'Hardcover request failed' })
    }

    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      console.error('Hardcover GraphQL errors:', data.errors)
      return sendJson(response, 502, { error: 'Hardcover request failed' })
    }

    const listBooks = data?.data?.lists?.[0]?.list_books
    if (!Array.isArray(listBooks)) {
      console.error('Hardcover list response malformed:', data)
      return sendJson(response, 502, { error: 'Hardcover response malformed' })
    }

    const books = listBooks
      .map(item => item.book)
      .filter(book => book?.id && book?.title)
      .map(normalizeHardcoverBook)

    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    return sendJson(response, 200, books)
  } catch (error) {
    console.error('Hardcover list request failed:', error)
    return sendJson(response, 502, { error: 'Hardcover request failed' })
  }
}
