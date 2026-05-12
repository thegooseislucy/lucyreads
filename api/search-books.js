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

const KNOWN_BOOKS = [
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    year: 1925,
    terms: ['gatsby', 'green light', 'rich guy', 'jay gatsby', 'daisy', 'fitzgerald', 'jazz age', 'american dream'],
  },
  {
    title: 'Intermezzo',
    author: 'Sally Rooney',
    year: 2024,
    terms: ['intermezzo', 'sally rooney', 'irish writer', 'chess brothers', 'chess', 'brothers', 'grief', 'ivan', 'peter'],
  },
  {
    title: 'The Goldfinch',
    author: 'Donna Tartt',
    year: 2013,
    terms: ['goldfinch', 'donna tartt', 'painting', 'boy museum', 'museum bombing', 'theo decker', 'art theft'],
  },
  {
    title: 'Fourth Wing',
    author: 'Rebecca Yarros',
    year: 2023,
    terms: ['fourth wing', 'dragon school', 'dragon rider', 'violet', 'xaden', 'war college', 'yarros'],
  },
  {
    title: 'Tomorrow, and Tomorrow, and Tomorrow',
    author: 'Gabrielle Zevin',
    year: 2022,
    terms: ['tomorrow and tomorrow', 'video game designers', 'game designers', 'sam sadie', 'gabrielle zevin'],
  },
  {
    title: 'Babel, or the Necessity of Violence',
    author: 'R.F. Kuang',
    year: 2022,
    terms: ['babel', 'translation magic', 'dark academia oxford', 'rf kuang', 'colonized student'],
  },
  {
    title: 'Demon Copperhead',
    author: 'Barbara Kingsolver',
    year: 2022,
    terms: ['demon copperhead', 'opioid crisis', 'appalachia', 'dickens retelling', 'barbara kingsolver'],
  },
  {
    title: 'Yellowface',
    author: 'R.F. Kuang',
    year: 2023,
    terms: ['yellowface', 'stolen manuscript', 'publishing satire', 'june hayward', 'rf kuang'],
  },
  {
    title: 'All the Light We Cannot See',
    author: 'Anthony Doerr',
    year: 2014,
    terms: ['all the light', 'blind french girl', 'radio german boy', 'saint-malo', 'anthony doerr'],
  },
  {
    title: 'The Covenant of Water',
    author: 'Abraham Verghese',
    year: 2023,
    terms: ['covenant of water', 'south indian family', 'drowning condition', 'abraham verghese'],
  },
]

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'book', 'books', 'but', 'for', 'from',
  'guy', 'i', 'in', 'is', 'it', 'like', 'me', 'novel', 'of', 'on', 'or',
  'read', 'story', 'that', 'the', 'thing', 'to', 'was', 'with',
])

let googleKeyDisabledUntil = 0

function sendJson(response, status, payload) {
  response.status(status).json(payload)
}

function normalizeQuery(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, 180) : ''
}

function cleanText(value) {
  return value
    .normalize('NFKD')
    .replace(/[^\w\s:'"-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function wordsFrom(value) {
  return cleanText(value)
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.replace(/^['"-]+|['":-]+$/g, ''))
    .filter(word => word.length > 1 && !STOP_WORDS.has(word))
}

function addCandidate(candidates, value) {
  const candidate = normalizeQuery(value)
  if (!candidate) return
  const key = candidate.toLowerCase()
  if (!candidates.some(item => item.toLowerCase() === key)) {
    candidates.push(candidate)
  }
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function parseTitleAuthor(query) {
  const match = query.match(/^(.+?)\s+by\s+(.+)$/i)
  if (!match) return null
  return {
    title: cleanText(match[1]),
    author: cleanText(match[2]),
  }
}

function buildDeterministicCandidates(query) {
  const candidates = []
  const cleaned = cleanText(query)
  const words = wordsFrom(query)
  const strongWords = words.filter(word => word.length > 3)
  const titleAuthor = parseTitleAuthor(cleaned)

  addCandidate(candidates, query)
  addCandidate(candidates, cleaned)

  if (strongWords.length > 0) {
    addCandidate(candidates, strongWords.at(-1))
    addCandidate(candidates, `intitle:${strongWords.at(-1)}`)
  }

  if (titleAuthor) {
    addCandidate(candidates, `${titleAuthor.title} ${titleAuthor.author}`)
    addCandidate(candidates, titleAuthor.title)
    addCandidate(candidates, `inauthor:${titleAuthor.author} intitle:${titleAuthor.title}`)
  }

  addCandidate(candidates, words.slice(0, 6).join(' '))
  addCandidate(candidates, strongWords.slice(0, 5).join(' '))

  for (const word of strongWords.slice(0, 5)) {
    addCandidate(candidates, `intitle:${word}`)
  }

  if (strongWords.length > 1) {
    addCandidate(candidates, `intitle:${strongWords.at(-1)}`)
    addCandidate(candidates, `${strongWords.at(-2)} ${strongWords.at(-1)}`)
  }

  return candidates
}

function parseJsonObject(text) {
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    try {
      return JSON.parse(match[0])
    } catch {
      return null
    }
  }
}

async function interpretQueryWithAnthropic(query) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return []

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_SEARCH_MODEL || 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: 'Return ONLY valid JSON. Interpret messy book search text into provider search strings. Schema: {"likelyTitle": string, "likelyAuthor": string, "keywords": string[], "queries": string[]}. queries must contain 3-6 concise Google Books search queries. Include title/author guesses when likely. Examples: "green light rich guy book" means The Great Gatsby by F. Scott Fitzgerald; "irish writer chess brothers" means Intermezzo by Sally Rooney; "goldfinch painting boy museum" means The Goldfinch by Donna Tartt; "dragon school violet" means Fourth Wing by Rebecca Yarros.',
        messages: [
          { role: 'user', content: `Search text: ${query}` },
        ],
      }),
    })

    if (!anthropicResponse.ok) {
      console.error('Anthropic search interpretation failed:', anthropicResponse.status)
      return []
    }

    const data = await anthropicResponse.json()
    const parsed = parseJsonObject(data.content?.[0]?.text)
    const candidates = []

    if (parsed?.likelyTitle) addCandidate(candidates, parsed.likelyTitle)
    if (parsed?.likelyTitle) {
      const titleWords = wordsFrom(parsed.likelyTitle)
      if (titleWords.length > 0) {
        addCandidate(candidates, titleWords.at(-1))
        addCandidate(candidates, `intitle:${titleWords.at(-1)}`)
      }
    }
    if (parsed?.likelyTitle && parsed?.likelyAuthor) {
      addCandidate(candidates, `${parsed.likelyTitle} ${parsed.likelyAuthor}`)
      addCandidate(candidates, `inauthor:${parsed.likelyAuthor} intitle:${parsed.likelyTitle}`)
    }

    for (const keyword of parsed?.keywords ?? []) {
      addCandidate(candidates, keyword)
      addCandidate(candidates, `intitle:${keyword}`)
    }

    for (const candidate of parsed?.queries ?? []) {
      addCandidate(candidates, candidate)
    }

    return candidates
  } catch (error) {
    console.error('Anthropic search interpretation failed:', error)
    return []
  } finally {
    clearTimeout(timeout)
  }
}

function normalizeGoogleBook(item, index, sourceQuery) {
  const info = item.volumeInfo ?? {}
  const coverUrl = info.imageLinks?.thumbnail?.replace(/^http:/, 'https:')

  return {
    id: `google:${item.id}`,
    title: info.title,
    fullTitle: info.title,
    author: info.authors?.[0] ?? 'Unknown',
    year: info.publishedDate?.match(/^\d{4}/)?.[0] ?? '',
    sourceQuery,
    ...SPINE_COLORS[index % SPINE_COLORS.length],
    heat: Math.floor(Math.random() * 30) + 65,
    sentiment: '',
    coverUrl,
    brief: '',
    controversy: '',
    bookClub: [],
    chapters: [],
    prompts: [],
    ...SPINE_SIZES[index % SPINE_SIZES.length],
  }
}

function normalizeKnownBook(book, index) {
  return {
    id: `known:${slugify(book.title)}`,
    title: book.title,
    fullTitle: book.title,
    author: book.author,
    year: book.year,
    ...SPINE_COLORS[index % SPINE_COLORS.length],
    heat: Math.floor(Math.random() * 30) + 65,
    sentiment: '',
    coverUrl: '',
    brief: '',
    controversy: '',
    bookClub: [],
    chapters: [],
    prompts: [],
    ...SPINE_SIZES[index % SPINE_SIZES.length],
  }
}

function scoreKnownBook(book, searchText) {
  const text = searchText.toLowerCase()
  const queryWords = wordsFrom(searchText)
  const bookWords = wordsFrom(`${book.title} ${book.author} ${book.terms.join(' ')}`)
  const matchedWords = queryWords.filter(word => bookWords.includes(word)).length
  const matchedPhrases = book.terms.filter(term => text.includes(term)).length
  const titleMatch = text.includes(book.title.toLowerCase()) ? 8 : 0
  const authorMatch = text.includes(book.author.toLowerCase()) ? 5 : 0

  return matchedWords + matchedPhrases * 4 + titleMatch + authorMatch
}

function searchKnownBooks(query) {
  return KNOWN_BOOKS
    .map((book, index) => ({
      book: normalizeKnownBook(book, index),
      score: scoreKnownBook(book, query),
    }))
    .filter(result => result.score >= 3)
    .sort((a, b) => b.score - a.score)
    .map(result => result.book)
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 3500) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchGoogleBooks(query, includeKey) {
  const url = new URL('https://www.googleapis.com/books/v1/volumes')
  url.searchParams.set('q', query)
  url.searchParams.set('maxResults', '12')
  url.searchParams.set('printType', 'books')
  url.searchParams.set('orderBy', 'relevance')

  if (includeKey && process.env.GOOGLE_BOOKS_API_KEY) {
    url.searchParams.set('key', process.env.GOOGLE_BOOKS_API_KEY)
  }

  return fetchWithTimeout(url, {
    headers: {
      Accept: 'application/json',
    },
  })
}

async function searchGoogleBooks(query) {
  const shouldTryKey = Date.now() > googleKeyDisabledUntil
  let googleResponse = await fetchGoogleBooks(query, shouldTryKey)

  if (googleResponse.status === 403 && shouldTryKey && process.env.GOOGLE_BOOKS_API_KEY) {
    googleKeyDisabledUntil = Date.now() + 10 * 60 * 1000
    console.error('Google Books keyed search failed, retrying without key:', googleResponse.status)
    googleResponse = await fetchGoogleBooks(query, false)
  }

  if (!googleResponse.ok) {
    const error = new Error(`Google Books search failed: ${googleResponse.status}`)
    error.status = googleResponse.status
    throw error
  }

  const data = await googleResponse.json()
  return (data.items ?? [])
    .map((item, index) => normalizeGoogleBook(item, index, query))
    .filter(book => book.title && book.coverUrl)
}

function normalizeOpenLibraryBook(doc, index, sourceQuery) {
  return {
    id: doc.key,
    title: doc.title,
    fullTitle: doc.title,
    author: doc.author_name?.[0] ?? 'Unknown',
    year: doc.first_publish_year ?? '',
    sourceQuery,
    ...SPINE_COLORS[index % SPINE_COLORS.length],
    heat: Math.floor(Math.random() * 30) + 65,
    sentiment: '',
    coverUrl: `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`,
    brief: '',
    controversy: '',
    bookClub: [],
    chapters: [],
    prompts: [],
    ...SPINE_SIZES[index % SPINE_SIZES.length],
  }
}

async function searchOpenLibrary(query) {
  const url = new URL('https://openlibrary.org/search.json')
  url.searchParams.set('q', query)
  url.searchParams.set('limit', '8')
  url.searchParams.set('fields', 'key,title,author_name,first_publish_year,cover_i,subject')

  const openLibraryResponse = await fetchWithTimeout(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'LucyReads/1.0 (https://lucyreads.vercel.app)',
    },
  }, 2500)

  if (!openLibraryResponse.ok) {
    throw new Error(`Open Library search failed: ${openLibraryResponse.status}`)
  }

  const data = await openLibraryResponse.json()
  return (data.docs ?? [])
    .filter(doc => doc.key && doc.title && doc.cover_i)
    .map((doc, index) => normalizeOpenLibraryBook(doc, index, query))
}

function scoreBook(book, originalQuery, index) {
  const haystack = `${book.title} ${book.author}`.toLowerCase()
  const words = wordsFrom(originalQuery)
  const matchedWords = words.filter(word => haystack.includes(word)).length
  const title = book.title.toLowerCase()
  const exactTitle = cleanText(originalQuery).toLowerCase() === title
  const titleStartsWithQuery = title.startsWith(cleanText(originalQuery).toLowerCase())
  const sourceBonus = book.id.startsWith('google:') ? 6 : 2

  return matchedWords * 12
    + (exactTitle ? 60 : 0)
    + (titleStartsWithQuery ? 25 : 0)
    + sourceBonus
    - index
}

function dedupeAndRank(books, originalQuery) {
  const seen = new Map()

  books.forEach((book, index) => {
    const key = `${book.title}|${book.author}`.toLowerCase()
    const scored = {
      ...book,
      score: scoreBook(book, originalQuery, index),
    }
    const current = seen.get(key)
    if (!current || scored.score > current.score) {
      seen.set(key, scored)
    }
  })

  return [...seen.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((book, index) => {
      const styledBook = {
        ...book,
        ...SPINE_COLORS[index % SPINE_COLORS.length],
        ...SPINE_SIZES[index % SPINE_SIZES.length],
      }
      delete styledBook.score
      delete styledBook.sourceQuery
      return styledBook
    })
}

async function buildSearchCandidates(query) {
  const deterministicCandidates = buildDeterministicCandidates(query)
  const interpretedCandidates = await interpretQueryWithAnthropic(query)
  const candidates = []

  for (const candidate of [...interpretedCandidates, ...deterministicCandidates]) {
    addCandidate(candidates, candidate)
  }

  return candidates.slice(0, 10)
}

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return sendJson(response, 405, { error: 'Method not allowed' })
  }

  const query = normalizeQuery(request.query?.q)
  if (query.length < 2) {
    return sendJson(response, 400, { error: 'Search query must be at least 2 characters' })
  }

  const candidates = await buildSearchCandidates(query)
  const knownBooks = searchKnownBooks(query)
  if (knownBooks.length > 0) {
    response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600')
    return sendJson(response, 200, knownBooks.slice(0, 12))
  }

  const books = []

  for (const candidate of candidates.slice(0, 8)) {
    try {
      const googleBooks = await searchGoogleBooks(candidate)
      if (googleBooks.length > 0) {
        books.push(...googleBooks)
        if (books.length >= 8) break
      }
    } catch (error) {
      console.error('Google Books candidate failed:', candidate, error)
      if (error.status === 429) break
    }
  }

  if (books.length < 4) {
    for (const candidate of candidates.slice(0, 5)) {
      try {
        books.push(...await searchOpenLibrary(candidate))
        if (books.length >= 8) break
      } catch (error) {
        console.error('Open Library candidate failed:', candidate, error)
      }
    }
  }

  const rankedBooks = dedupeAndRank(books, query)
  response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600')
  return sendJson(response, 200, rankedBooks)
}
