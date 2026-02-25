import React from 'react'
import StatCard from './StatCard'
import RecentIssues from './RecentIssues'

const PRIORITIES = [
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-900' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-900' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-900' },
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-900' }
]

const STATUSES = [
  { value: 'open', label: 'Open', color: 'bg-blue-100 text-blue-900' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-purple-100 text-purple-900' },
  { value: 'on-hold', label: 'On Hold', color: 'bg-slate-100 text-slate-900' },
  { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-900' }
]

export default function Dashboard({ stats, problems, setView }) {
  const statusMap = (stats.byStatus || []).reduce((acc, s) => {
    acc[s.status] = s.total
    return acc
  }, {})

  const priorityMap = (stats.byPriority || []).reduce((acc, p) => {
    acc[p.priority] = p.total
    return acc
  }, {})

  const totalProblems = Object.values(statusMap).reduce((a, b) => a + b, 0)
  const openProblems = statusMap.open || 0
  const criticalProblems = priorityMap.critical || 0
  const resolvedProblems = statusMap.resolved || 0

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Issues"
          value={totalProblems}
          icon="📊"
          color="blue"
        />
        <StatCard
          title="Open Issues"
          value={openProblems}
          icon="🔴"
          color="red"
          highlight={openProblems > 0}
        />
        <StatCard
          title="Critical"
          value={criticalProblems}
          icon="⚠️"
          color="orange"
          highlight={criticalProblems > 0}
        />
        <StatCard
          title="Resolved"
          value={resolvedProblems}
          icon="✅"
          color="green"
        />
      </div>

      {/* Status Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Status Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STATUSES.map(status => (
            <div key={status.value} className={`rounded-lg p-4 ${status.color}`}>
              <p className="text-sm font-medium opacity-80">{status.label}</p>
              <p className="text-2xl font-bold">{statusMap[status.value] || 0}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Priority Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PRIORITIES.map(priority => (
            <div key={priority.value} className={`rounded-lg p-4 ${priority.color}`}>
              <p className="text-sm font-medium opacity-80">{priority.label}</p>
              <p className="text-2xl font-bold">{priorityMap[priority.value] || 0}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Issues */}
      <RecentIssues problems={problems.slice(0, 5)} setView={setView} />
    </div>
  )
}