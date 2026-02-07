/**
 * In-memory store for key events. Replace with Database/Key-Value in production.
 */
import type { KeyEvent } from '../types/workflow.types.js'

const events: KeyEvent[] = []
let nextId = 1

export function storeEvent(event: Omit<KeyEvent, 'id'>): KeyEvent {
  const stored: KeyEvent = {
    ...event,
    id: String(nextId++),
  }
  events.push(stored)
  return stored
}

export function getEvents(limit = 50): KeyEvent[] {
  return [...events].reverse().slice(0, limit)
}

export function getEventById(id: string): KeyEvent | undefined {
  return events.find((e) => e.id === id)
}
