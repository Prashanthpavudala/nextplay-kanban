import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, AlertTriangle, Flag } from 'lucide-react'
import { format, isPast, isToday, addDays } from 'date-fns'
import type { Task } from '../../types'
import type { TeamMember } from '../../lib/teamApi'

interface Props {
  task: Task
  members: TeamMember[]
  onClick: () => void
}

const PRIORITY_CONFIG = {
  high:   { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  label: 'High'   },
  normal: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Normal' },
  low:    { color: '#6b7280', bg: 'rgba(107,114,128,0.12)',label: 'Low'    },
}

export function TaskCard({ task, members, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id })

  const priority = PRIORITY_CONFIG[task.priority]
  const assignee = members.find(m => m.id === task.assignee_id)
  const d = task.due_date ? new Date(task.due_date) : null
  const overdue = d && isPast(d) && !isToday(d) && task.status !== 'done'
  const dueSoon = d && !overdue && d <= addDays(new Date(), 2)

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        background: 'var(--surface2)',
        border: `1px solid ${isDragging ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 12,
        padding: '11px 13px 11px 16px',
        marginBottom: 8,
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        touchAction: 'none',
        willChange: 'transform',
        boxShadow: isDragging ? '0 8px 32px rgba(0,0,0,0.5)' : 'none',
      }}
      onClick={onClick}
    >
      {/* Priority accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: priority.color, borderRadius: '12px 0 0 12px', opacity: 0.8,
      }} />

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
          {task.labels.map(l => (
            <span key={l.id} className="label-chip" style={{
              background: l.color + '22', color: l.color, border: `1px solid ${l.color}44`,
            }}>{l.name}</span>
          ))}
        </div>
      )}

      {/* Title */}
      <p style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.4, marginBottom: 8, color: 'var(--text)' }}>
        {task.title}
      </p>

      {/* Description */}
      {task.description && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 500, color: priority.color, background: priority.bg, padding: '2px 7px', borderRadius: 99 }}>
            <Flag size={9} />{priority.label}
          </span>
          {d && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 500,
              color: overdue ? '#ef4444' : dueSoon ? '#f59e0b' : 'var(--text-muted)',
              background: overdue ? 'rgba(239,68,68,0.1)' : dueSoon ? 'rgba(245,158,11,0.1)' : 'transparent',
              padding: '2px 6px', borderRadius: 6 }}>
              {overdue ? <AlertTriangle size={10}/> : <Calendar size={10}/>}
              {overdue ? 'Overdue' : isToday(d) ? 'Today' : format(d, 'MMM d')}
            </span>
          )}
        </div>
        {assignee && (
          <div title={assignee.name} style={{
            width: 22, height: 22, borderRadius: '50%', background: assignee.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 700, color: 'white', flexShrink: 0,
            border: '1.5px solid var(--surface)', boxShadow: `0 1px 4px ${assignee.color}55`,
          }}>
            {assignee.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
          </div>
        )}
      </div>
    </div>
  )
}
