import React from 'react'
import Badge from './Badge'

const categories = [
  'Safety',
  'Structural',
  'Quality Control',
  'Material Shortage',
  'Equipment Failure',
  'Labor',
  'Weather Related',
  'Permits/Compliance',
  'Coordination',
  'Budget/Cost'
]

const priorities = ['critical', 'high', 'medium', 'low']
const statuses = ['open', 'in-progress', 'on-hold', 'resolved']

export default function ProblemList({
  problems,
  loading,
  filters,
  setFilters,
  onSelectProblem
}) {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search issues..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              {priorities.map(p => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {statuses.map(s => (
                <option key={s} value={s}>{s.replace('-', ' ').charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Issues ({problems.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : problems.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No issues found</div>
        ) : (
          <div className="divide-y divide-slate-200">
            {problems.map(problem => (
              <div
                key={problem.id}
                onClick={() => onSelectProblem(problem)}
                className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{problem.title}</h3>
                        <p className="text-sm text-slate-600 line-clamp-2 mt-1">
                          {problem.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <Badge type="priority" value={problem.priority} />
                          <Badge type="status" value={problem.status} />
                          {problem.category && (
                            <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                              {problem.category}
                            </span>
                          )}
                          {problem.location && (
                            <span className="text-xs text-slate-500">📍 {problem.location}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <p className="text-xs text-slate-500">
                      {new Date(problem.createdAt).toLocaleDateString()}
                    </p>
                    {problem.reportedBy && (
                      <p className="text-xs text-slate-500 mt-1">By: {problem.reportedBy}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}