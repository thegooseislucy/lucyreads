import { useState, useCallback, useEffect, useRef } from 'react'
import { generateBrief } from './lib/generateBrief.js'
import BookPanel from './components/BookPanel.jsx'
import './App.css'

const BOOKS = [
  {
    id: 1,
    title: 'Tomorrow, and Tomorrow',
    fullTitle: 'Tomorrow, and Tomorrow, and Tomorrow',
    author: 'Gabrielle Zevin',
    year: 2022,
    base: '#1c0f2e',
    band: '#7c3aed',
    text: '#ddd6fe',
    heat: 94,
    sentiment: 'Beloved',
    brief: "A 30-year creative partnership between two game designers — about grief, authorship, and what we make for each other.",
    controversy: "Is Sam and Sadie's relationship romantic love or something that exceeds category? Readers are still fighting.",
    bookClub: ["What does the book say about creative ownership?", "Is their bond love — and does the answer matter?", "How does Ichigo function as a metaphor?"],
    chapters: [{ n: 1, t: "Commence", hook: "The hospital reunification — what does it mean to make something with someone you've hurt?" }, { n: 2, t: "Sadie Emerges", hook: "Her professor relationship raises questions the book never resolves. What did she gain?" }],
    prompts: ["Catch me up to chapter 4", "What are Sam and Sadie actually fighting about?", "What's the book's argument about authorship?"],
    w: 29,
    h: 186,
  },
  {
    id: 2,
    title: 'Intermezzo',
    fullTitle: 'Intermezzo',
    author: 'Sally Rooney',
    year: 2024,
    base: '#071818',
    band: '#9ac6c5',
    text: '#e0f2f1',
    heat: 88,
    sentiment: 'Divisive',
    brief: "Two grieving brothers navigate love and loss after their father dies. Rooney's most formally ambitious novel.",
    controversy: "The punctuation experiments either reveal interiority brilliantly or are an affectation. People feel strongly.",
    bookClub: ["How do the brothers' relationships reflect their approaches to grief?", "Is the Sylvia/Naomi dynamic handled fairly?", "Does Rooney's style clarify or obscure emotion?"],
    chapters: [{ n: 1, t: "Ivan", hook: "Chess as control — what does Ivan's need to win tell us before we know anything else?" }, { n: 2, t: "Peter", hook: "Peter's interior monologue is the most stylistically ambitious section. What is Rooney doing?" }],
    prompts: ["What is Rooney doing with the punctuation?", "Explain the ending", "What's the book club likely arguing about?"],
    w: 25,
    h: 174,
  },
  {
    id: 3,
    title: 'Fourth Wing',
    fullTitle: 'Fourth Wing',
    author: 'Rebecca Yarros',
    year: 2023,
    base: '#1a0808',
    band: '#b91c1c',
    text: '#fecaca',
    heat: 97,
    sentiment: 'Polarizing',
    brief: "Violet enters a war college for dragon riders despite her fragile body. Enemies become lovers. Dragons choose or kill.",
    controversy: "Fantasy with romance or romance with fantasy scaffolding? The distinction matters more than it should.",
    bookClub: ["What does Violet's vulnerability allow the story to do?", "Is Xaden's arc earned or convenient?", "Did the ending stick the landing?"],
    chapters: [{ n: 1, t: "The Parapet", hook: "Every crossing is a sorting. What does Violet's crossing tell us immediately?" }, { n: 2, t: "First Year", hook: "The violence is casual and immediate. What tonal contract is Yarros establishing?" }],
    prompts: ["Is this fantasy or romance?", "Catch me up before my book club", "What's the Xaden controversy?"],
    w: 33,
    h: 194,
  },
  {
    id: 4,
    title: 'Babel',
    fullTitle: 'Babel, or the Necessity of Violence',
    author: 'R.F. Kuang',
    year: 2022,
    base: '#060e1e',
    band: '#2563eb',
    text: '#bfdbfe',
    heat: 91,
    sentiment: 'Essential',
    brief: "Dark academia in 1830s Oxford where translation is literal magic. A colonized student must choose a side.",
    controversy: "Some felt the political argument overwhelmed character. Others say it's a polemic by design — and that's the point.",
    bookClub: ["When does working inside a corrupt system become complicity?", "Which character's choice felt most honest?", "What does the ending argue about reform vs. revolution?"],
    chapters: [{ n: 1, t: "Canton", hook: "Robin's rescue is framed as generosity — but what is Oxford actually taking?" }, { n: 2, t: "Oxford", hook: "The wonder of Babel coexists with its violence. How long does Kuang let you enjoy it?" }],
    prompts: ["What is the silver system actually doing?", "Catch me up to chapter 5", "What does the ending argue?"],
    w: 35,
    h: 200,
  },
  {
    id: 5,
    title: 'Demon Copperhead',
    fullTitle: 'Demon Copperhead',
    author: 'Barbara Kingsolver',
    year: 2022,
    base: '#140e02',
    band: '#b45309',
    text: '#fde68a',
    heat: 89,
    sentiment: 'Devastating',
    brief: "David Copperfield retold in Appalachian Virginia during the opioid crisis. A red-haired boy who will not stop trying to survive.",
    controversy: "Pulitzer winner. The only debate is whether Dickens comparisons are fair to either writer.",
    bookClub: ["How does Demon's voice function as unreliable narrator?", "What does the foster system in this book argue?", "How does Kingsolver update Dickens's social critique?"],
    chapters: [{ n: 1, t: "Born", hook: "Demon narrates his own birth with dry humor. What does that voice signal about how he's learned to cope?" }, { n: 2, t: "Placement", hook: "The first foster home. Kingsolver is methodical about the machinery of the system — why?" }],
    prompts: ["What is this book actually about?", "Who is Demon's Dickens equivalent?", "What's the controversy around the ending?"],
    w: 31,
    h: 190,
  },
  {
    id: 6,
    title: 'Yellowface',
    fullTitle: 'Yellowface',
    author: 'R.F. Kuang',
    year: 2023,
    base: '#130800',
    band: '#c2410c',
    text: '#fed7aa',
    heat: 85,
    sentiment: 'Sharp',
    brief: "A white author steals her Chinese-American friend's manuscript after she dies. A satire of publishing, race, and who gets to tell whose story.",
    controversy: "Is June Hayward a villain or a mirror? Some readers sympathize in ways the book may not endorse.",
    bookClub: ["At what point did you turn on June — or did you?", "What is the book saying about who publishing serves?", "Does the ending feel like justice?"],
    chapters: [{ n: 1, t: "The Party", hook: "The death is casual and immediate. Why does Kuang refuse to make it dramatic?" }, { n: 2, t: "The Manuscript", hook: "June's rationalizations are fluent enough to be almost convincing. What does that say about the reader?" }],
    prompts: ["Is June supposed to be sympathetic?", "What is this saying about publishing?", "Catch me up — my book club is tonight"],
    w: 27,
    h: 177,
  },
  {
    id: 7,
    title: 'All the Light',
    fullTitle: 'All the Light We Cannot See',
    author: 'Anthony Doerr',
    year: 2014,
    base: '#06101c',
    band: '#1d4ed8',
    text: '#dbeafe',
    heat: 82,
    sentiment: 'Adored',
    brief: "A blind French girl and a German boy with a gift for radios converge during the siege of Saint-Malo in WWII.",
    controversy: "The Netflix adaptation reignited debate: is the novel's beauty sentimentality or genuine transcendence?",
    bookClub: ["Is Werner's arc redemption or tragedy?", "What is the Sea of Flames doing — symbol or plot device?", "Did the adaptation change how you read it?"],
    chapters: [{ n: 1, t: "August 1944", hook: "Doerr opens at the end. Why does this make inevitability feel hopeful rather than crushing?" }, { n: 2, t: "1934", hook: "Marie-Laure's world is built through touch. How does Doerr make you see through her?" }],
    prompts: ["Explain the structure to me", "What's the controversy around the ending?", "Is Werner a hero or a coward?"],
    w: 29,
    h: 187,
  },
  {
    id: 8,
    title: 'Covenant of Water',
    fullTitle: 'The Covenant of Water',
    author: 'Abraham Verghese',
    year: 2023,
    base: '#040f0e',
    band: '#0d9488',
    text: '#ccfbf1',
    heat: 86,
    sentiment: 'Sweeping',
    brief: "Three generations of a South Indian family bound by a condition — one member per generation drowns. A century of India at household scale.",
    controversy: "Some found the scope too vast for intimacy. Others say time itself is the subject — and the scope is the argument.",
    bookClub: ["What does the covenant represent across generations?", "How does the medical thread function as metaphor?", "What does the book argue about inherited trauma?"],
    chapters: [{ n: 1, t: "1900", hook: "A 12-year-old married to a stranger. The first line is about water. What does Verghese establish in those first pages?" }, { n: 2, t: "Digby", hook: "The Scottish doctor arrives. How does his outsider gaze change what we're seeing?" }],
    prompts: ["What is the covenant actually?", "Catch me up to chapter 6", "What's the book's argument about family?"],
    w: 33,
    h: 192,
  },
]

const CATEGORIES = ['trending', 'fiction', 'non-fiction', 'book club', 'controversy']

const searchBooks = async (query) => {
  const url = `/api/search-books?q=${encodeURIComponent(query)}`
  const res = await fetch(url)
  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.error ?? `Search API error: ${res.status}`)
  }

  return Array.isArray(data) ? data : []
}

function Book({ book, isSelected, onSelect, bookRef }) {
  const [hovered, setHovered] = useState(false)
  const active = hovered || isSelected

  return (
    <div
      ref={bookRef}
      onClick={() => onSelect(book)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: book.w,
        height: book.h,
        position: 'relative',
        cursor: 'pointer',
        flexShrink: 0,
        borderRadius: '1px 1px 0 0',
        transform: active ? 'translateY(-24px)' : 'translateY(0)',
        transition: 'transform 0.2s cubic-bezier(0.2,0,0,1), box-shadow 0.2s ease',
        boxShadow: active
          ? `0 -14px 28px ${book.band}44, 0 0 0 1px ${book.band}55`
          : '0 0 0 1px #ffffff07',
        overflow: 'hidden',
        background: book.base,
      }}
    >
      {/* fabric grain */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(180deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 3px)',
      }} />

      {/* top band */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 9,
        background: book.band,
        opacity: active ? 1 : 0.7,
        transition: 'opacity 0.2s',
        pointerEvents: 'none',
      }} />

      {/* spine title */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        writingMode: 'vertical-rl', textOrientation: 'mixed',
        transform: 'rotate(180deg)',
        fontFamily: 'var(--font-mono)', fontSize: 9,
        letterSpacing: '0.04em', color: book.text,
        opacity: active ? 0.9 : 0.5,
        transition: 'opacity 0.2s',
        padding: '16px 0 14px',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        zIndex: 1,
      }}>
        {book.title}
      </div>
    </div>
  )
}

function App() {
  const [selectedBook, setSelectedBook] = useState(null)
  const [activeCategory, setActiveCategory] = useState('trending')
  const [anchorX, setAnchorX] = useState(null)
  const [displayBooks, setDisplayBooks] = useState(BOOKS)
  const [isSearching, setIsSearching] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [generationError, setGenerationError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const bookRefs = useRef({})
  const shelfScrollRef = useRef(null)
  const generationRequestRef = useRef(0)

  const handleSelect = useCallback((book) => {
    const isClosing = selectedBook?.id === book.id
    generationRequestRef.current += 1
    setGenerationError('')

    if (isClosing) {
      setSelectedBook(null)
      setGenerating(false)
      return
    }

    setSelectedBook(book)

    if (book.brief) {
      setGenerating(false)
      return
    }

    const requestId = generationRequestRef.current
    setGenerating(true)

    generateBrief({ title: book.title, author: book.author })
      .then(data => {
        if (generationRequestRef.current !== requestId) return
        const updated = { ...book, ...data }
        setSelectedBook(prev => prev?.id === updated.id ? updated : prev)
        setDisplayBooks(prev => prev.map(item => item.id === updated.id ? updated : item))
      })
      .catch(err => {
        console.error('generateBrief failed:', err)
        if (generationRequestRef.current === requestId) {
          setGenerationError('AI brief generation failed. Try selecting the book again in a moment.')
        }
      })
      .finally(() => {
        if (generationRequestRef.current === requestId) {
          setGenerating(false)
        }
      })
  }, [selectedBook?.id])

  const handleClosePanel = useCallback(() => {
    generationRequestRef.current += 1
    setSelectedBook(null)
    setGenerating(false)
    setGenerationError('')
  }, [])

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) return
    setIsSearching(true)
    setSelectedBook(null)
    setGenerating(false)
    generationRequestRef.current += 1
    setSearchError('')
    setGenerationError('')
    try {
      const results = await searchBooks(searchQuery)
      if (results.length > 0) {
        setDisplayBooks(results)
      } else {
        setDisplayBooks(BOOKS)
        setSearchError('Book search is having trouble. Try a title, author, or description.')
      }
    } catch (err) {
      console.error('searchBooks failed:', err)
      setDisplayBooks(BOOKS)
      setSearchError('Book search is having trouble. Try a title, author, or description.')
    } finally {
      setIsSearching(false)
    }
  }

  const updateAnchorX = useCallback(() => {
    if (!selectedBook || !shelfScrollRef.current) {
      setAnchorX(null)
      return
    }

    const selectedRef = bookRefs.current[selectedBook.id]
    if (!selectedRef) {
      setAnchorX(null)
      return
    }

    setAnchorX(selectedRef.offsetLeft + selectedRef.offsetWidth / 2 - shelfScrollRef.current.scrollLeft)
  }, [selectedBook])

  useEffect(() => {
    updateAnchorX()

    const shelfScroll = shelfScrollRef.current
    if (!shelfScroll) return undefined

    shelfScroll.addEventListener('scroll', updateAnchorX)
    window.addEventListener('resize', updateAnchorX)

    return () => {
      shelfScroll.removeEventListener('scroll', updateAnchorX)
      window.removeEventListener('resize', updateAnchorX)
    }
  }, [updateAnchorX])

  return (
    <div style={{ minHeight: '100vh', padding: '0 0 60px', maxWidth: 900, margin: '0 auto' }}>

      {/* header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 40px 16px',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontStyle: 'italic',
          fontSize: 20, fontWeight: 700, color: 'var(--teal)',
          letterSpacing: '-0.01em',
        }}>
          LucyReads
        </h1>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          border: '1px solid var(--border)', background: 'var(--surface)',
          padding: '6px 12px', borderRadius: 6,
          flex: 1, maxWidth: 320, margin: '0 32px',
        }}>
          <svg width={13} height={13} viewBox="0 0 13 13" fill="none" stroke="var(--text-muted)" strokeWidth={1.5}>
            <circle cx={5.5} cy={5.5} r={4} />
            <line x1={8.5} y1={8.5} x2={12} y2={12} />
          </svg>
          <input
            placeholder="search a book or author..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={{
              background: 'none', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
              fontSize: 11, width: '100%',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('')
                setDisplayBooks(BOOKS)
                setSelectedBook(null)
                setGenerating(false)
                generationRequestRef.current += 1
                setSearchError('')
                setGenerationError('')
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                padding: '0 2px',
              }}
            >
              ✕
            </button>
          )}
        </div>

        <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
          {displayBooks.length} on shelf
        </div>
      </div>

      {/* category pills */}
      <div style={{
        display: 'flex', gap: 5, padding: '9px 40px',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              background: activeCategory === cat ? '#9ac6c5' : 'none',
              border: activeCategory === cat ? '1px solid #9ac6c5' : '1px solid var(--border)',
              color: activeCategory === cat ? '#080b14' : 'var(--text-muted)',
              fontFamily: 'var(--font-mono)', fontSize: 9,
              padding: '3px 10px', borderRadius: 20, cursor: 'pointer',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              fontWeight: activeCategory === cat ? 700 : 400,
              transition: 'all 0.15s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* shelf */}
      <div style={{ padding: '28px 40px 0' }}>
        <div style={{
          fontSize: 8, color: 'var(--text-muted)',
          letterSpacing: '0.2em', textTransform: 'uppercase',
          marginBottom: 16, paddingLeft: 4,
        }}>
          {isSearching ? 'searching open library...' : `shelf / ${activeCategory}`}
        </div>

        {searchError && (
          <div style={{
            margin: '-8px 0 14px 4px',
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: '#9ac6c5',
            letterSpacing: '0.04em',
          }}>
            {searchError}
          </div>
        )}

        <div style={{ position: 'relative', padding: '0 4px' }}>
          <div
            ref={shelfScrollRef}
            className="shelf-scroll"
            style={{ overflowX: 'auto', paddingBottom: 0 }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, paddingTop: 28, minWidth: 'max-content' }}>
              {displayBooks.map(book => (
                <Book
                  key={book.id}
                  book={book}
                  isSelected={selectedBook?.id === book.id}
                  onSelect={handleSelect}
                  bookRef={(element) => {
                    bookRefs.current[book.id] = element
                  }}
                />
              ))}
            </div>
          </div>

          {selectedBook && anchorX !== null && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: anchorX,
                width: 1,
                height: 20,
                background: selectedBook.band,
                boxShadow: `0 0 6px ${selectedBook.band}`,
                transition: 'left 0.2s cubic-bezier(0.2,0,0,1)',
                pointerEvents: 'none',
              }}
            />
          )}

          {/* shelf plank */}
          <div style={{
            height: 10, background: 'var(--surface)',
            borderTop: '1px solid var(--border)', position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: '8%', right: '8%', height: 1,
              background: `linear-gradient(90deg, transparent, ${selectedBook ? selectedBook.band : 'var(--teal)'}22, transparent)`,
            }} />
          </div>
        </div>

        {selectedBook ? (
          <BookPanel
            book={selectedBook}
            generating={generating}
            generationError={generationError}
            onClose={handleClosePanel}
          />
        ) : (
          <div style={{
            textAlign: 'center', padding: '24px 0',
            fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.18em',
          }}>
            [ select a book from the shelf ]
          </div>
        )}
      </div>
    </div>
  )
}

export default App
