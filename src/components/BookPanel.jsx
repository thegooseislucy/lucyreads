import { useState } from 'react'

const TABS = ['Cultural Brief', 'By Chapter', 'Ask AI']

const labelStyle = {
  fontSize: 9,
  color: 'var(--text-muted)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
}

function BookPanel({ book, generating, onClose }) {
  const [activeTab, setActiveTab] = useState('Cultural Brief')

  return (
    <section
      style={{
        marginTop: 24,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderTop: `2px solid ${book.band}`,
        borderRadius: 2,
        boxShadow: `0 -1px 12px ${book.band}55`,
        animation: 'book-panel-in 0.18s ease both',
      }}
    >
      <style>
        {`
          @keyframes book-panel-in {
            from {
              opacity: 0;
              transform: translateY(8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>

      <div style={{
        position: 'relative',
        padding: '18px 18px 16px',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            background: 'transparent',
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.08em',
            padding: '4px 8px',
            borderRadius: 2,
            cursor: 'pointer',
          }}
        >
          ⎋ esc
        </button>

        <div style={{
          ...labelStyle,
          color: book.band,
          paddingRight: 64,
          marginBottom: 5,
        }}>
          {book.year} / {book.author}
        </div>

        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: 16,
          fontWeight: 500,
          color: '#e2e8f8',
          paddingRight: 64,
          marginBottom: 16,
        }}>
          {book.fullTitle}
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'max-content 1fr max-content',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={labelStyle}>Cultural Heat</div>
          <div style={{
            height: 3,
            background: 'var(--border-subtle)',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${book.heat}%`,
              height: '100%',
              background: book.band,
              boxShadow: `0 0 8px ${book.band}88`,
            }} />
          </div>
          <div style={{
            border: `1px solid ${book.band}`,
            color: '#e2e8f8',
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            padding: '3px 8px',
            borderRadius: 2,
          }}>
            {book.sentiment}
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        {TABS.map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--teal)' : '2px solid transparent',
              background: 'transparent',
              color: activeTab === tab ? 'var(--teal)' : 'var(--text-muted)',
              textShadow: activeTab === tab ? '0 0 12px currentColor' : 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '10px 14px 8px',
              cursor: 'pointer',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ padding: 18 }}>
        {activeTab === 'Cultural Brief' && (
          generating ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <style>{`
                @keyframes pulse-bar {
                  0%, 100% { opacity: 0.15; }
                  50% { opacity: 0.35; }
                }
              `}</style>
              {[0, 1].map(col => (
                <div key={col} style={{ display: 'grid', gap: 10 }}>
                  {[80, 100, 60, 90, 70].map((w, i) => (
                    <div key={i} style={{
                      height: 9,
                      width: `${w}%`,
                      background: book.band,
                      borderRadius: 2,
                      animation: `pulse-bar 1.6s ease-in-out ${i * 0.12}s infinite`,
                    }} />
                  ))}
                </div>
              ))}
            </div>
          ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 24,
            textAlign: 'left',
          }}>
            <div>
              <div style={{ ...labelStyle, marginBottom: 8 }}>What it is</div>
              <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 13,
                lineHeight: 1.5,
                color: '#6a7a9e',
                marginBottom: 18,
              }}>
                {book.brief}
              </p>
              <div style={{ ...labelStyle, marginBottom: 8 }}>The controversy</div>
              <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 13,
                lineHeight: 1.5,
                color: '#6a7a9e',
              }}>
                {book.controversy}
              </p>
            </div>

            <div>
              <div style={{ ...labelStyle, marginBottom: 10 }}>Book club questions</div>
              <div style={{ display: 'grid', gap: 10 }}>
                {book.bookClub.map(question => (
                  <div
                    key={question}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '14px 1fr',
                      gap: 8,
                      alignItems: 'start',
                    }}
                  >
                    <span style={{ color: book.band }}>—</span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      lineHeight: 1.5,
                      color: '#6a7a9e',
                    }}>
                      {question}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          )
        )}

        {activeTab === 'By Chapter' && (
          <div style={{ display: 'grid', gap: 14, textAlign: 'left' }}>
            {book.chapters.map(chapter => (
              <div
                key={chapter.n}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: 14,
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  color: book.band,
                  marginBottom: 4,
                }}>
                  CH.{String(chapter.n).padStart(2, '0')}
                </div>
                <div style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontSize: 12,
                  color: '#e2e8f8',
                  marginBottom: 5,
                }}>
                  {chapter.t}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  lineHeight: 1.45,
                  color: '#6a7a9e',
                  paddingLeft: 24,
                }}>
                  {chapter.hook}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Ask AI' && (
          <div style={{ display: 'grid', gap: 10 }}>
            {book.prompts.map(prompt => (
              <button
                key={prompt}
                type="button"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: '#6a7a9e',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  lineHeight: 1.4,
                  padding: '9px 10px',
                  borderRadius: 2,
                  cursor: 'pointer',
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.borderColor = 'var(--border-active)'
                  event.currentTarget.style.color = '#e2e8f8'
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.borderColor = 'var(--border)'
                  event.currentTarget.style.color = '#6a7a9e'
                }}
              >
                <span style={{ color: book.band }}>_ </span>
                {prompt}
              </button>
            ))}

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr max-content',
              gap: 8,
              marginTop: 4,
            }}>
              <input
                placeholder="or ask something specific..."
                style={{
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: '#e2e8f8',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  padding: '9px 10px',
                  borderRadius: 2,
                  outline: 'none',
                }}
              />
              <button
                type="button"
                style={{
                  border: `1px solid ${book.band}`,
                  background: book.band,
                  color: '#080b14',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.08em',
                  padding: '9px 14px',
                  borderRadius: 2,
                  cursor: 'pointer',
                }}
              >
                ASK
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default BookPanel
