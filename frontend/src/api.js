const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export function getToken() {
  return localStorage.getItem('taskflow_token')
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('taskflow_token', token)
  } else {
    localStorage.removeItem('taskflow_token')
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const error = new Error(data.message || `Request failed (${res.status})`)
    error.status = res.status
    error.errors = data.errors
    throw error
  }
  return data
}

export const api = {
  register: (payload) => request('/register', { method: 'POST', body: payload }),
  login: (payload) => request('/login', { method: 'POST', body: payload }),
  logout: () => request('/logout', { method: 'POST' }),
  me: () => request('/me'),

  projects: () => request('/projects'),
  createProject: (payload) => request('/projects', { method: 'POST', body: payload }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),

  tasks: (projectId) => request(`/projects/${projectId}/tasks`),
  createTask: (projectId, payload) =>
    request(`/projects/${projectId}/tasks`, { method: 'POST', body: payload }),
  updateTaskStatus: (id, status) =>
    request(`/tasks/${id}/status`, { method: 'PATCH', body: { status } }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
}
