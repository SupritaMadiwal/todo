import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'todo-app-items'
const FILTERS = ['all', 'active', 'completed']

function App() {
  const [text, setText] = useState('')
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setItems(JSON.parse(saved))
    } catch (error) {
      console.error('Failed to load todos', error)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const completed = useMemo(() => items.filter((item) => item.done).length, [items])
  const remaining = items.length - completed

  const visibleItems = useMemo(() => {
    if (filter === 'active') return items.filter((item) => !item.done)
    if (filter === 'completed') return items.filter((item) => item.done)
    return items
  }, [items, filter])

  const addItem = (e) => {
    e.preventDefault()
    const clean = text.trim()
    if (!clean) return
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: clean, done: false, createdAt: Date.now() },
    ])
    setText('')
  }

  const toggleItem = (id) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)))
  }

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const clearCompleted = () => {
    setItems((prev) => prev.filter((item) => !item.done))
  }

  const startEditing = (item) => {
    setEditingId(item.id)
    setEditingText(item.text)
  }

  const applyEdit = (id) => {
    const clean = editingText.trim()
    if (!clean) {
      removeItem(id)
      return
    }
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, text: clean } : item)))
    setEditingId(null)
    setEditingText('')
  }

  return (
    <main className="todo-app">
      <section className="todo-card">
        <h1>Todo App</h1>
        <p className="subtitle">Track tasks with filters, edit, and persistent local storage.</p>

        <form onSubmit={addItem} className="todo-form">
          <input
            aria-label="New todo"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What needs to be done?"
            autoFocus
          />
          <button type="submit">Add</button>
        </form>

        <div className="status-bar">
          <span>{remaining} active / {completed} completed</span>
          <span>{items.length} total</span>
        </div>

        <div className="filters">
          {FILTERS.map((key) => (
            <button
              key={key}
              className={filter === key ? 'active' : ''}
              onClick={() => setFilter(key)}
              type="button"
            >
              {key}
            </button>
          ))}
        </div>

        <ul className="todo-list">
          {visibleItems.length === 0 && (
            <li className="empty">No tasks in this view.</li>
          )}
          {visibleItems.map((item) => (
            <li key={item.id} className={item.done ? 'done' : ''}>
              <label className="item-row">
                <input type="checkbox" checked={item.done} onChange={() => toggleItem(item.id)} />
                {editingId === item.id ? (
                  <input
                    className="edit-input"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onBlur={() => applyEdit(item.id)}
                    onKeyDown={(e) => e.key === 'Enter' && applyEdit(item.id)}
                    autoFocus
                  />
                ) : (
                  <span onDoubleClick={() => startEditing(item)} title="Double-click to edit">
                    {item.text}
                  </span>
                )}
              </label>
              <button className="delete-btn" aria-label="Remove" onClick={() => removeItem(item.id)}>
                ×
              </button>
            </li>
          ))}
        </ul>

        <div className="actions">
          <button className="clear-btn" onClick={clearCompleted} disabled={completed === 0}>
            Clear completed
          </button>
          <button className="all-btn" onClick={() => setItems([])} disabled={items.length === 0}>
            Clear all
          </button>
        </div>

        <p className="hint">Tip: Double-click a todo to edit it.</p>
      </section>
    </main>
  )
}

export default App
