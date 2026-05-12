export async function generateBrief({ title, author }) {
  const response = await fetch('/api/generate-brief', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, author }),
  })

  if (!response.ok) {
    throw new Error(`Generate brief API error: ${response.status}`)
  }

  return response.json()
}
