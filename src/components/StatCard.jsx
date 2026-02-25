import React from 'react'

export default function StatCard({ title, value, icon, color, highlight }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200',
    red: 'bg-red-50 border-red-200',
    orange: 'bg-orange-50 border-orange-200',
    green: 'bg-green-50 border-green-200'
  }

  return (
    <div className={`${colors[color]} border rounded-xl p-6 ${highlight ? 'ring-2 ring-offset-2 ring-red-400' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )
}