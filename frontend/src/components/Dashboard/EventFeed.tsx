import { useEffect, useState } from 'react'
import { fetchEvents } from '../../services/api.service.js'
import type { GeopoliticalEvent } from '../../types/index.js'
import { formatDate } from '../../utils/formatters.js'

export function EventFeed() {
  const [events, setEvents] = useState<GeopoliticalEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
      .then(setEvents)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading events...</div>

  return (
    <section>
      <h2>Geopolitical Events</h2>
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <strong>{event.title}</strong> – {event.region} ({event.severity})
            <br />
            <small>{formatDate(event.timestamp)}</small>
          </li>
        ))}
      </ul>
    </section>
  )
}
