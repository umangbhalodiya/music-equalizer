import axios from 'axios'
import moment from 'moment'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from 'rizzui/button'
import { Input } from 'rizzui/input'

function Home() {
  const [name, setName] = useState('')
  const [joke, setJoke] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGreet = () => {
    const timestamp = moment().format('MMMM Do YYYY, h:mm:ss a')
    toast.success(`Hello ${name || 'there'}! It's ${timestamp}`)
  }

  const handleFetchJoke = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(
        'https://official-joke-api.appspot.com/random_joke',
      )
      setJoke(`${data.setup} — ${data.punchline}`)
    } catch {
      toast.error('Failed to fetch a joke, try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 24 }}>
      <h1 className="mb-6 text-2xl font-semibold text-text-primary">
        React + Vite + TypeScript
      </h1>

      <div className="flex flex-col gap-4">
        <Input
          label="Your name"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Button onClick={handleGreet}>Greet me</Button>

        <Button variant="outline" onClick={handleFetchJoke} isLoading={loading}>
          Fetch a joke
        </Button>

        {joke && <p className="text-text-secondary">{joke}</p>}
      </div>
    </div>
  )
}

export default Home
