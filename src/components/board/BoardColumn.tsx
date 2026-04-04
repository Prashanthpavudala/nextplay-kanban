import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { TaskCard } from '../task/TaskCard'
import type { Column, Task } from '../../types'
import type { TeamMember } from '../../lib/teamApi'

interface Props {
  column: Column; tasks: Task[]; members: TeamMember[]
  onAddTask: () => void; onTaskClick: (task: Task) => void
}

export function BoardColumn({ column, tasks, members, onAddTask, onTaskClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      background: 'var(--surface)',
      border: `1px solid ${isOver ? column.color+'99' : 'var(--border)'}`,
      borderRadius: 14, overflow: 'hidden',
      boxShadow: isOver ? `0 0 0 1px ${column.color}44` : 'none',
      transition: 'border-color .15s, box-shadow .15s',
      height: '100%',
    }}>
      {/* Header */}
      <div style={{ padding: '11px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: isOver ? column.color+'0a' : 'transparent' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: column.color, boxShadow: `0 0 6px ${column.color}`, flexShrink: 0 }} />
          <span className="font-display" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{column.title}</span>
          <span style={{ background: column.color+'22', color: column.color, fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 99, flexShrink: 0 }}>{tasks.length}</span>
        </div>
        <button className="btn btn-ghost" style={{ padding: '3px 8px', fontSize: 11, height: 26, flexShrink: 0 }} onClick={onAddTask}>
          <Plus size={11} /> Add
        </button>
      </div>

      {/* Droppable scroll area */}
      <div ref={setNodeRef} className="col-scroll" style={{ background: isOver && tasks.length === 0 ? column.color+'08' : 'transparent', transition: 'background .15s' }}>
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div style={{ height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4, border: `2px dashed ${isOver ? column.color+'aa' : 'rgba(255,255,255,.06)'}`, borderRadius: 10, color: isOver ? column.color : 'var(--text-muted)', fontSize: 12, transition: 'all .15s', background: isOver ? column.color+'06' : 'transparent' }}>
              {isOver ? <><span style={{fontSize:18}}>+</span><span>Drop here</span></> : <span style={{fontStyle:'italic'}}>No tasks yet</span>}
            </div>
          ) : (
            tasks.map(task => <TaskCard key={task.id} task={task} members={members} onClick={() => onTaskClick(task)} />)
          )}
        </SortableContext>
      </div>
    </div>
  )
}
