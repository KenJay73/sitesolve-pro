import React from 'react'

const priorityColors = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700'
}

const statusColors = {
  'open': 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-purple-100 text-purple-700',
  'on-hold': 'bg-slate-100 text-slate-700',
  'resolved': 'bg-green-100 text-green-700'
}

const priorityLabels = {
  critical: '🔴 Critical',
  high: '🟠 High',
  medium: '🟡 Medium',
  low: '🟢 Low'
}

const statusLabels = {
  'open': 'Open',
  'in-progress': 'In Progress',
  'on-hold': 'On Hold',
  'resolved': 'Resolved'
}

export default function Badge({ type, value }) {
  const colors = type === 'priority' ? priorityColors : statusColors
  const labels = type === 'priority' ? priorityLabels : statusLabels
  
  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${colors[value]}`}>
      {labels[value] || value}
    </span>
  )
}