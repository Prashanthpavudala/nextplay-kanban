import { Search, LayoutGrid, CheckCircle2, Clock, AlertTriangle, X } from 'lucide-react'
import type { Task, TaskPriority, Label } from '../../types'
import type { TeamMember } from '../../lib/teamApi'

interface Props {
  tasks: Task[]
  search: string
  setSearch: (v: string) => void
  filterPriority: TaskPriority | 'all'
  setFilterPriority: (v: TaskPriority | 'all') => void
  filterLabel: string | 'all'
  setFilterLabel: (v: string | 'all') => void
  filterAssignee: string | 'all'
  setFilterAssignee: (v: string | 'all') => void
  labels: Label[]
  members: TeamMember[]
}

export function Header({
  tasks, search, setSearch,
  filterPriority, setFilterPriority,
  filterLabel, setFilterLabel,
  filterAssignee, setFilterAssignee,
  labels, members,
}: Props) {
  const total = tasks.length
  const done = tasks.filter(t => t.status === 'done').length
  const overdue = tasks.filter(t => {
    if (!t.due_date || t.status === 'done') return false
    return new Date(t.due_date) < new Date()
  }).length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length

  const hasFilters = search || filterPriority !== 'all' || filterLabel !== 'all' || filterAssignee !== 'all'

  function clearAll() {
    setSearch('')
    setFilterPriority('all')
    setFilterLabel('all')
    setFilterAssignee('all')
  }

  return (
    <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 40 }}>
      {/* Top row: logo + stats */}
      <div style={{ padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56, gap: 16 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(99,102,241,0.4)' }}>
            <LayoutGrid size={15} color="white" />
          </div>
          <span className="font-display" style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>
            NextPlay <span style={{ color: 'var(--accent)', opacity: 0.8 }}>Board</span>
          </span>
        </div>

        {/* Stats pills */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {[
            { icon: <LayoutGrid size={12} />, label: `${total} tasks`, color: 'var(--text-dim)' },
            { icon: <Clock size={12} />, label: `${inProgress} active`, color: '#f59e0b' },
            { icon: <CheckCircle2 size={12} />, label: `${done} done`, color: '#10b981' },
            overdue > 0 ? { icon: <AlertTriangle size={12} />, label: `${overdue} overdue`, color: '#ef4444' } : null,
          ].filter(Boolean).map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 99, background: 'var(--surface2)', border: '1px solid var(--border)', fontSize: 12, color: s!.color, fontWeight: 500 }}>
              {s!.icon}{s!.label}
            </div>
          ))}
        </div>
      </div>

      {/* Filter row */}
      <div style={{ padding: '0 24px 10px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            className="input"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 30, width: 190, height: 32, fontSize: 12, color: 'var(--text)' }}
          />
        </div>

        {/* Priority filter */}
        <select className="input" value={filterPriority} onChange={e => setFilterPriority(e.target.value as any)}
          style={{ width: 130, height: 32, fontSize: 12, colorScheme: 'dark', color: 'var(--text)' }}>
          <option value="all">All priority</option>
          <option value="high">🔴 High</option>
          <option value="normal">🔵 Normal</option>
          <option value="low">⚪ Low</option>
        </select>

        {/* Label filter */}
        {labels.length > 0 && (
          <select className="input" value={filterLabel} onChange={e => setFilterLabel(e.target.value)}
            style={{ width: 130, height: 32, fontSize: 12, colorScheme: 'dark', color: 'var(--text)' }}>
            <option value="all">All labels</option>
            {labels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        )}

        {/* Assignee filter */}
        {members.length > 0 && (
          <select className="input" value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)}
            style={{ width: 140, height: 32, fontSize: 12, colorScheme: 'dark', color: 'var(--text)' }}>
            <option value="all">All members</option>
            <option value="unassigned">Unassigned</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        )}

        {/* Clear filters */}
        {hasFilters && (
          <button className="btn btn-ghost" onClick={clearAll}
            style={{ height: 32, padding: '0 10px', fontSize: 12, color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
            <X size={12} /> Clear
          </button>
        )}

        {/* Active filter chips */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {filterLabel !== 'all' && (() => {
            const l = labels.find(x => x.id === filterLabel)
            return l ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 500, background: l.color + '22', color: l.color, border: `1px solid ${l.color}44` }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: l.color }} />{l.name}
                <X size={10} style={{ cursor: 'pointer' }} onClick={() => setFilterLabel('all')} />
              </span>
            ) : null
          })()}
          {filterAssignee !== 'all' && filterAssignee !== 'unassigned' && (() => {
            const m = members.find(x => x.id === filterAssignee)
            return m ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 500, background: m.color + '22', color: m.color, border: `1px solid ${m.color}44` }}>
                {m.name}<X size={10} style={{ cursor: 'pointer' }} onClick={() => setFilterAssignee('all')} />
              </span>
            ) : null
          })()}
        </div>
      </div>
    </header>
  )
}
