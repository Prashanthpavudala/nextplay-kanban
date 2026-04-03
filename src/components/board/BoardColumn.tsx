import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { TaskCard } from '../task/TaskCard'
import type { Column, Task } from '../../types'
import type { TeamMember } from '../../lib/teamApi'

interface Props {
  column: Column
  tasks: Task[]
  members: TeamMember[]
  onAddTask: () => void
  onTaskClick: (task: Task) => void
}

export function BoardColumn({ column, tasks, members, onAddTask, onTaskClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      background: 'var(--surface)',
      border: `1px solid ${isOver ? column.color + '99' : 'var(--border)'}`,
      borderRadius: 16, overflow: 'hidden',
      boxShadow: isOver ? `0 0 0 1px ${column.color}55` : 'none',
      transition: 'border-color 0.15s, box-shadow 0.15s',
    }}>
      {/* Column header */}
      <div style={{ padding: '13px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: isOver ? column.color + '0a' : 'transparent' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: column.color, boxShadow: `0 0 6px ${column.color}` }} />
          <span className="font-display" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{column.title}</span>
          <span style={{ background: column.color + '22', color: column.color, fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 99 }}>{tasks.length}</span>
        </div>
        <button className="btn btn-ghost" style={{ padding: '3px 8px', fontSize: 12, height: 26 }} onClick={onAddTask}>
          <Plus size={12} /> Add
        </button>
      </div>

      {/* Droppable task list */}
      <div
        ref={setNodeRef}
        style={{
          flex: 1, padding: '10px 8px 12px',
          overflowY: 'auto',
          minHeight: 140,
          maxHeight: 'calc(100vh - 235px)',
          background: isOver && tasks.length === 0 ? column.color + '0a' : 'transparent',
          transition: 'background 0.15s',
        }}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div style={{
              height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `2px dashed ${isOver ? column.color + 'aa' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 10, color: isOver ? column.color : 'var(--text-muted)',
              fontSize: 13, fontStyle: 'italic', transition: 'all 0.15s',
              background: isOver ? column.color + '08' : 'transparent',
            }}>
              {isOver ? '↓ Drop here' : 'No tasks yet'}
            </div>
          ) : (
            tasks.map(task => (
              <TaskCard key={task.id} task={task} members={members}
                onClick={() => onTaskClick(task)} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}
