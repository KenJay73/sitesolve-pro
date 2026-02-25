import React from 'react'
import Badge from './Badge'

export default function RecentIssues({ problems, setView }) {
  if (problems.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <p className="text-slate-500">No issues reported yet</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Recent Issues</h2>
      </div>
      <div className="divide-y divide-slate-200">
        {problems.map(problem => (
          <div key={problem.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setView('list')}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-slate-900 truncate">{problem.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-2 mt-1">{problem.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge type="priority" value={problem.priority} />
                  <Badge type="status" value={problem.status} />
                  {problem.location && <span className="text-xs text-slate-500">📍 {problem.location}</span>}
                </div>
              </div>
              <span className="text-xs text-slate-500 whitespace-nowrap">
                {new Date(problem.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}