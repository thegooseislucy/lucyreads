import { useEffect, useRef, useState } from 'react'
import './AIPicker.css'

const AI_OPTIONS = [
  { name: 'Claude', url: 'https://claude.ai/new' },
  { name: 'ChatGPT', url: 'https://chatgpt.com/' },
]

function buildPrompt(book, question) {
  const lines = [
    `I'm reading "${book.fullTitle}" by ${book.author}.`,
    '',
    question,
  ]

  if (book.brief) {
    lines.push('', `For context: ${book.brief}`)
  }

  return lines.join('\n')
}

function AIPicker({ book, question, onClose }) {
  const [copied, setCopied] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const resetTimer = useRef(null)
  const prompt = buildPrompt(book, question)

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      clearTimeout(resetTimer.current)
    }
  }, [onClose])

  async function handlePick(option) {
    await navigator.clipboard.writeText(prompt)
    clearTimeout(resetTimer.current)
    setSelectedOption(option)
    setCopied(true)
  }

  function handleOpen() {
    if (!selectedOption) return
    window.open(selectedOption.url, '_blank', 'noopener,noreferrer')
    resetTimer.current = setTimeout(() => {
      setCopied(false)
      setSelectedOption(null)
    }, 5000)
  }

  return (
    <div className="ai-picker-backdrop" onClick={onClose}>
      <div
        className="ai-picker-card"
        role="dialog"
        aria-modal="true"
        aria-label="Choose AI"
        onClick={(event) => event.stopPropagation()}
      >
        {copied ? (
          <div className="ai-picker-toast">
            <svg
              className="ai-picker-goose"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path d="M8 31c3 6 13 8 23 5 5-1.5 8-4.5 9-8l-5 1.5 3-4.5c-4 1-7 1-10-1-3-2-3-6-1-10 1.5-3 4-4.5 7-4 2 .4 3.5 1.5 4.5 3l4.5 1.5-4.5 2c-3.5-.5-5.5.3-6.5 2-1.2 2.1-.2 4.9 2.3 6.2 3.3 1.7 6.4 1.1 8.7-.7-.5 5.5-4.3 10.4-10.7 13.1-11.5 4.8-23.7 1.6-24.3-6.1Z" />
            </svg>
            <div className="ai-picker-toast-title">prompt copied. honk.</div>
            <div className="ai-picker-toast-instruction">
              paste with <kbd>Cmd+V</kbd>
            </div>
            {selectedOption && (
              <button
                type="button"
                className="ai-picker-bot"
                onClick={handleOpen}
                style={{ marginTop: '0.35rem', textAlign: 'center' }}
              >
                open {selectedOption.name}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="ai-picker-title">open with</div>
            <div className="ai-picker-preview">
              {prompt}
            </div>
            <div className="ai-picker-options">
              {AI_OPTIONS.map(option => (
                <button
                  key={option.name}
                  type="button"
                  className={`ai-picker-bot ai-picker-bot-${option.name.toLowerCase()}`}
                  onClick={() => handlePick(option)}
                >
                  {option.name}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="ai-picker-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default AIPicker
