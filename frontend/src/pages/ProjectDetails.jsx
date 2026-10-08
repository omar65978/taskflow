import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api.js'

const COLUMNS = [
  { key: 'todo', title: 'To do' },
  { key: 'in_progress', title: 'In progress' },
  { key: 'done', title: 'Done' },
]

export default function ProjectDetails() {
  const { id } = useParams()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ title: '', priority: 'medium', due_date: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const data = await api.tasks(id)
      setTasks(data.tasks)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const addTask = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.createTask(id, {
        title: form.title,
        priority: form.priority,
        due_date: form.due_date || null,
      })
      setForm({ title: '', priority: 'medium', due_date: '' })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const move = async (task, status) => {
    // optimistic update
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status } : t)))
    try {
      await api.updateTaskStatus(task.id, status)
    } catch (err) {
      setError(err.message)
      load()
    }
  }

  const remove = async (taskId) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await api.deleteTask(taskId)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <Link to="/" className="back-link">All projects</Link>
          <h1 className="page-title">Tasks board</h1>
        </div>
      </div>

      {error && <div className="alert">{error}</div>}

      <form className="panel task-form" onSubmit={addTask}>
        <input
          className="task-title-input"
          required
          placeholder="Task title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <select
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value })}
          aria-label="Priority"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input
          type="date"
          value={form.due_date}
          onChange={(e) => setForm({ ...form, due_date: e.target.value })}
          aria-label="Due date"
        />
        <button className="btn btn-primary" disabled={saving}>
          {saving ? 'Adding…' : 'Add task'}
        </button>
      </form>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <div className="board">
          {COLUMNS.map((col) => {
            const columnTasks = tasks.filter((t) => t.status === col.key)
            return (
              <section key={col.key} className="board-column">
                <header className="board-column-head">
                  <h2>{col.title}</h2>
                  <span className="board-count">{columnTasks.length}</span>
                </header>
                {columnTasks.length === 0 && <p className="board-empty">Nothing here yet.</p>}
                {columnTasks.map((task) => (
                  <article key={task.id} className={`task-card priority-${task.priority}`}>
                    <h3 className="task-title">{task.title}</h3>
                    {task.due_date && <p className="task-due">due {task.due_date}</p>}
                    <div className="task-actions">
                      <select
                        value={task.status}
                        onChange={(e) => move(task, e.target.value)}
                        aria-label="Move task"
                      >
                        {COLUMNS.map((c) => (
                          <option key={c.key} value={c.key}>{c.title}</option>
                        ))}
                      </select>
                      <button className="btn btn-ghost btn-sm" onClick={() => remove(task.id)}>
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
