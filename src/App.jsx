import React, { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import ProblemList from './components/ProblemList'
import ProblemForm from './components/ProblemForm'
import ProblemDetail from './components/ProblemDetail'
import { api } from './services/api'

export default function App() {
  const [view, setView] = useState('dashboard')
  const [problems, setProblems] = useState([])
  const [selectedProblem, setSelectedProblem] = useState(null)
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    search: ''
  })
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)

  // Fetch problems
  useEffect(() => {
    fetchProblems()
    fetchStats()
  }, [filters])

  const fetchProblems = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (filters.status) queryParams.append('status', filters.status)
      if (filters.priority) queryParams.append('priority', filters.priority)
      if (filters.category) queryParams.append('category', filters.category)
      if (filters.search) queryParams.append('search', filters.search)

      const data = await api.get(`/problems?${queryParams}`)
      setProblems(data)
    } catch (error) {
      console.error('Failed to fetch problems:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await api.get('/statistics')
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch statistics:', error)
    }
  }

  const handleCreateProblem = async (formData) => {
    try {
      await api.post('/problems', formData)
      setView('list')
      fetchProblems()
      fetchStats()
    } catch (error) {
      console.error('Failed to create problem:', error)
      alert('Failed to create problem')
    }
  }

  const handleUpdateProblem = async (id, formData) => {
    try {
      await api.put(`/problems/${id}`, formData)
      fetchProblems()
      fetchStats()
      if (selectedProblem?.id === id) {
        const updated = await api.get(`/problems/${id}`)
        setSelectedProblem(updated)
      }
    } catch (error) {
      console.error('Failed to update problem:', error)
      alert('Failed to update problem')
    }
  }

  const handleDeleteProblem = async (id) => {
    if (!confirm('Are you sure you want to delete this problem?')) return

    try {
      await api.delete(`/problems/${id}`)
      fetchProblems()
      fetchStats()
      setSelectedProblem(null)
      setView('list')
    } catch (error) {
      console.error('Failed to delete problem:', error)
      alert('Failed to delete problem')
    }
  }

  const handleAddUpdate = async (problemId, message) => {
    try {
      await api.post(`/problems/${problemId}/updates`, { message })
      const updated = await api.get(`/problems/${problemId}`)
      setSelectedProblem(updated)
    } catch (error) {
      console.error('Failed to add update:', error)
      alert('Failed to add update')
    }
  }

  const handleSelectProblem = async (problem) => {
    try {
      const full = await api.get(`/problems/${problem.id}`)
      setSelectedProblem(full)
      setView('detail')
    } catch (error) {
      console.error('Failed to fetch problem details:', error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Site Issue Tracker</h1>
              <p className="text-sm text-slate-600">On-site Problem Management for Civil Engineers</p>
            </div>
            <nav className="flex gap-2">
              <button
                onClick={() => setView('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'dashboard'
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'list'
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Issues
              </button>
              <button
                onClick={() => setView('create')}
                className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                New Issue
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'dashboard' && stats && (
          <Dashboard stats={stats} problems={problems} setView={setView} />
        )}

        {view === 'list' && (
          <ProblemList
            problems={problems}
            loading={loading}
            filters={filters}
            setFilters={setFilters}
            onSelectProblem={handleSelectProblem}
          />
        )}

        {view === 'create' && (
          <ProblemForm
            onSubmit={handleCreateProblem}
            onCancel={() => setView('list')}
          />
        )}

        {view === 'detail' && selectedProblem && (
          <ProblemDetail
            problem={selectedProblem}
            onUpdate={handleUpdateProblem}
            onDelete={handleDeleteProblem}
            onAddUpdate={handleAddUpdate}
            onBack={() => setView('list')}
          />
        )}
      </main>
    </div>
  )
}