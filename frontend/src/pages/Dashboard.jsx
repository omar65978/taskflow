import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const data = await api.projects()
      setProjects(data.projects)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.createProject(form)
      setForm({ name: '', description: '' })
      setShowForm(false)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return
    try {
      await api.deleteProject(id)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="dashboard">
      <div className="page-head">
        <div>
          <h1 className="page-title">Your projects</h1>
          <p className="page-sub">Everything you are working on, in one place.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Close' : 'New project'}
        </button>
      </div>

      {error && <div className="alert">{error}</div>}

      {showForm && (
        <form className="panel form" onSubmit={submit}>
          <label className="field">
            <span>Project name</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Website redesign"
            />
          </label>
          <label className="field">
            <span>Description</span>
            <textarea
              rows="2"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <div>
            <button className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Create project'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : projects.length === 0 ? (
        <div className="empty">
          <p>No projects yet.</p>
          <p className="muted">Create your first project to start adding tasks.</p>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <article key={project.id} className="project-card">
              <Link to={`/projects/${project.id}`} className="project-card-link">
                <h2 className="project-name">{project.name}</h2>
                <p className="project-desc">{project.description || 'No description.'}</p>
                <p className="project-meta">{project.tasks_count} tasks · {project.status}</p>
              </Link>
              <div>
                <button className="btn btn-ghost btn-sm" onClick={() => remove(project.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
