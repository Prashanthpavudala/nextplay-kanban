import { Search, LayoutGrid, CheckCircle2, Clock, AlertTriangle, X } from 'lucide-react'
import { CustomSelect } from './CustomSelect'
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
  const overdue = tasks.filter(t => t.due_date && t.status !== 'done' && new Date(t.due_date) < new Date()).length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length

  const hasFilters = search || filterPriority !== 'all' || filterLabel !== 'all' || filterAssignee !== 'all'

  const priorityOptions = [
    { value: 'all', label: 'All priority' },
    { value: 'high', label: '🔴 High' },
    { value: 'normal', label: '🔵 Normal' },
    { value: 'low', label: '⚪ Low' },
  ]

  const labelOptions = [
    { value: 'all', label: 'All labels' },
    ...labels.map(l => ({ value: l.id, label: l.name, color: l.color })),
  ]

  const assigneeOptions = [
    { value: 'all', label: 'All members' },
    { value: 'unassigned', label: 'Unassigned' },
    ...members.map(m => ({ value: m.id, label: m.name, color: m.color })),
  ]

  return (
    <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 40 }}>
      {/* Top row */}
      <div style={{ padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 54, gap: 16 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(99,102,241,0.4)' }}>
            <LayoutGrid size={15} color="white" />
          </div>
          <span className="font-display" style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>
            NextPlay <span style={{ color: 'var(--accent)' }}>Board</span>
          </span>
        </div>

        {/* Stats */}
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
            style={{ paddingLeft: 30, width: 190, height: 32, fontSize: 12 }}
          />
        </div>

        {/* Custom dropdowns — no native select */}
        <CustomSelect
          value={filterPriority}
          onChange={v => setFilterPriority(v as TaskPriority | 'all')}
          options={priorityOptions}
          width={132}
        />

        {labels.length > 0 && (
          <CustomSelect
            value={filterLabel}
            onChange={setFilterLabel}
            options={labelOptions}
            width={132}
          />
        )}

        {members.length > 0 && (
          <CustomSelect
            value={filterAssignee}
            onChange={setFilterAssignee}
            options={assigneeOptions}
            width={145}
          />
        )}

        {/* Clear all */}
        {hasFilters && (
          <button className="btn btn-ghost" onClick={() => { setSearch(''); setFilterPriority('all'); setFilterLabel('all'); setFilterAssignee('all') }}
            style={{ height: 32, padding: '0 10px', fontSize: 12, color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
            <X size={12} /> Clear
          </button>
        )}

        {/* Active filter chips */}
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
    </header>
  )
}
