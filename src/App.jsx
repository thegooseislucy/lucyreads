import { useState, useCallback } from 'react'
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
    w: 33,
    h: 192,
  },
]

const CATEGORIES = ['trending', 'fiction', 'non-fiction', 'book club', 'controversy']

function Book({ book, isSelected, onSelect }) {
  const [hovered, setHovered] = useState(false)
  const active = hovered || isSelected

  return (
    <div
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

  const handleSelect = useCallback((book) => {
    setSelectedBook(prev => prev?.id === book.id ? null : book)
  }, [])

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
            style={{
              background: 'none', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
              fontSize: 11, width: '100%',
            }}
          />
        </div>

        <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
          {BOOKS.length} on shelf
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
          shelf / {activeCategory}
        </div>

        <div style={{ position: 'relative', padding: '0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, paddingTop: 28 }}>
            {BOOKS.map(book => (
              <Book
                key={book.id}
                book={book}
                isSelected={selectedBook?.id === book.id}
                onSelect={handleSelect}
              />
            ))}
          </div>

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

        {!selectedBook && (
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
