import { useState } from 'react'
import { Search, LayoutGrid, CheckCircle2, Clock, AlertTriangle, X, SlidersHorizontal } from 'lucide-react'
import { CustomSelect } from './CustomSelect'
import type { Task, TaskPriority, Label } from '../../types'
import type { TeamMember } from '../../lib/teamApi'

interface Props {
  tasks: Task[]
  search: string; setSearch: (v: string) => void
  filterPriority: TaskPriority | 'all'; setFilterPriority: (v: TaskPriority | 'all') => void
  filterLabel: string | 'all'; setFilterLabel: (v: string | 'all') => void
  filterAssignee: string | 'all'; setFilterAssignee: (v: string | 'all') => void
  labels: Label[]; members: TeamMember[]
}

export function Header({ tasks, search, setSearch, filterPriority, setFilterPriority, filterLabel, setFilterLabel, filterAssignee, setFilterAssignee, labels, members }: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false)

  const total      = tasks.length
  const done       = tasks.filter(t => t.status === 'done').length
  const overdue    = tasks.filter(t => t.due_date && t.status !== 'done' && new Date(t.due_date) < new Date()).length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const hasFilters = !!(search || filterPriority !== 'all' || filterLabel !== 'all' || filterAssignee !== 'all')

  function clearAll() { setSearch(''); setFilterPriority('all'); setFilterLabel('all'); setFilterAssignee('all') }

  const priorityOpts = [
    { value: 'all', label: 'All priority' },
    { value: 'high', label: '🔴 High' },
    { value: 'normal', label: '🔵 Normal' },
    { value: 'low', label: '⚪ Low' },
  ]
  const labelOpts = [
    { value: 'all', label: 'All labels' },
    ...labels.map(l => ({ value: l.id, label: l.name, color: l.color })),
  ]
  const assigneeOpts = [
    { value: 'all', label: 'All members' },
    { value: 'unassigned', label: 'Unassigned' },
    ...members.map(m => ({ value: m.id, label: m.name, color: m.color })),
  ]

  const stats = [
    { icon: <LayoutGrid size={11} />, label: `${total}`, title: 'total', color: 'var(--text-dim)' },
    { icon: <Clock size={11} />, label: `${inProgress}`, title: 'active', color: '#f59e0b' },
    { icon: <CheckCircle2 size={11} />, label: `${done}`, title: 'done', color: '#10b981' },
    overdue > 0 ? { icon: <AlertTriangle size={11} />, label: `${overdue}`, title: 'overdue', color: '#ef4444' } : null,
  ].filter(Boolean)

  return (
    <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 40 }}>

      {/* ── Top row: logo + stats + filter toggle ── */}
      <div style={{ padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(99,102,241,.4)', flexShrink: 0 }}>
            <LayoutGrid size={14} color="white" />
          </div>
          <span className="font-display" style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
            NextPlay <span style={{ color: 'var(--accent)' }}>Board</span>
          </span>
        </div>

        {/* Stats — hide labels on small screens */}
        <div style={{ display: 'flex', gap: 5, flex: 1, justifyContent: 'center', flexWrap: 'nowrap', overflow: 'hidden' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 99, background: 'var(--surface2)', border: '1px solid var(--border)', fontSize: 11, color: s!.color, fontWeight: 600, flexShrink: 0 }}>
              {s!.icon}
              <span>{s!.label}</span>
              {/* Hide text label on very small screens via inline clamp */}
              <span style={{ display: 'var(--stat-label-display, inline)' }} className="stat-label">{s!.title}</span>
            </div>
          ))}
        </div>

        {/* Filter toggle button (mobile) + filter indicator */}
        <button
          onClick={() => setFiltersOpen(o => !o)}
          style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 10px', borderRadius: 'var(--radius-sm)',
            background: filtersOpen || hasFilters ? 'rgba(99,102,241,.15)' : 'var(--surface2)',
            border: `1px solid ${filtersOpen || hasFilters ? 'rgba(99,102,241,.4)' : 'var(--border)'}`,
            color: filtersOpen || hasFilters ? 'var(--accent)' : 'var(--text-dim)',
            cursor: 'pointer', fontSize: 12, fontWeight: 500,
          }}
        >
          <SlidersHorizontal size={13} />
          <span className="hide-xs">Filters</span>
          {hasFilters && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />}
        </button>
      </div>

      {/* ── Filter row — collapsible on mobile ── */}
      {filtersOpen && (
        <div style={{ padding: '8px 16px 12px', borderTop: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          {/* Search — full width on mobile */}
          <div style={{ position: 'relative', flex: '1 1 160px', minWidth: 140, maxWidth: 220 }}>
            <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              className="input"
              placeholder="Search tasks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 28, height: 34, fontSize: 12 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: '1 1 auto' }}>
            <CustomSelect value={filterPriority} onChange={v => setFilterPriority(v as any)} options={priorityOpts} width={128} />
            {labels.length > 0 && <CustomSelect value={filterLabel} onChange={setFilterLabel} options={labelOpts} width={128} />}
            {members.length > 0 && <CustomSelect value={filterAssignee} onChange={setFilterAssignee} options={assigneeOpts} width={138} />}
          </div>

          {hasFilters && (
            <button className="btn btn-ghost" onClick={clearAll} style={{ height: 34, padding: '0 10px', fontSize: 12, color: '#ef4444', borderColor: 'rgba(239,68,68,.3)', flexShrink: 0 }}>
              <X size={12} /> Clear
            </button>
          )}

          {/* Active chips */}
          {filterLabel !== 'all' && (() => {
            const l = labels.find(x => x.id === filterLabel)
            return l ? (
              <span className="label-chip" style={{ background: l.color+'22', color: l.color, border: `1px solid ${l.color}44` }}>
                <span style={{ width:6,height:6,borderRadius:'50%',background:l.color }} />{l.name}
                <X size={10} style={{ cursor:'pointer', marginLeft:2 }} onClick={() => setFilterLabel('all')} />
              </span>
            ) : null
          })()}
          {filterAssignee !== 'all' && filterAssignee !== 'unassigned' && (() => {
            const m = members.find(x => x.id === filterAssignee)
            return m ? (
              <span className="label-chip" style={{ background: m.color+'22', color: m.color, border: `1px solid ${m.color}44` }}>
                {m.name}<X size={10} style={{ cursor:'pointer', marginLeft:2 }} onClick={() => setFilterAssignee('all')} />
              </span>
            ) : null
          })()}
        </div>
      )}

      {/* Always-visible search on desktop (≥768px) */}
      <style>{`
        @media (min-width: 768px) {
          .stat-label { display: inline !important; }
          .hide-xs { display: inline; }
        }
        @media (max-width: 767px) {
          .stat-label { display: none; }
          .hide-xs { display: none; }
        }
      `}</style>
    </header>
  )
}
