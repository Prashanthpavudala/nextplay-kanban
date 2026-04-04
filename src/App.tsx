import { useState, useMemo, useRef } from 'react'
import {
  DndContext, DragOverlay,
  PointerSensor, KeyboardSensor,
  useSensor, useSensors, closestCorners,
} from '@dnd-kit/core'
import type { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core'
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import { Plus, Tag, Users } from 'lucide-react'

import { useBoard } from './hooks/useBoard'
import { moveTask } from './lib/api'
import { COLUMNS } from './types'
import type { Task, TaskStatus, TaskPriority } from './types'

import { Header } from './components/ui/Header'
import { LoadingScreen } from './components/ui/LoadingScreen'
import { LabelsModal } from './components/ui/LabelsModal'
import { TeamModal } from './components/ui/TeamModal'
import { BoardColumn } from './components/board/BoardColumn'
import { TaskCard } from './components/task/TaskCard'
import { TaskModal } from './components/task/TaskModal'
import { TaskDetailPanel } from './components/task/TaskDetailPanel'

export default function App() {
  const { userId, tasks, setTasks, labels, members, loading, error, reload } = useBoard()

  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all')
  const [filterLabel, setFilterLabel] = useState<string | 'all'>('all')
  const [filterAssignee, setFilterAssignee] = useState<string | 'all'>('all')

  const [showTaskModal, setShowTaskModal] = useState(false)
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [detailTask, setDetailTask] = useState<Task | null>(null)
  const [showLabels, setShowLabels] = useState(false)
  const [showTeam, setShowTeam] = useState(false)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const originalStatusRef = useRef<TaskStatus | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const filteredTasks = useMemo(() => tasks.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false
    if (filterLabel !== 'all' && !t.labels?.some(l => l.id === filterLabel)) return false
    if (filterAssignee === 'unassigned' && t.assignee_id) return false
    if (filterAssignee !== 'all' && filterAssignee !== 'unassigned' && t.assignee_id !== filterAssignee) return false
    return true
  }), [tasks, search, filterPriority, filterLabel, filterAssignee])

  const isFiltering = !!(search || filterPriority !== 'all' || filterLabel !== 'all' || filterAssignee !== 'all')

  function handleDragStart({ active }: DragStartEvent) {
    const task = tasks.find(t => t.id === active.id)
    setActiveTask(task ?? null)
    originalStatusRef.current = task?.status ?? null
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over || active.id === over.id) return
    const activeId = String(active.id), overId = String(over.id)
    setTasks(prev => {
      const activeTask = prev.find(t => t.id === activeId)
      if (!activeTask) return prev
      const overCol = COLUMNS.find(c => c.id === overId)
      if (overCol) return overCol.id === activeTask.status ? prev : prev.map(t => t.id === activeId ? { ...t, status: overCol.id } : t)
      const overTask = prev.find(t => t.id === overId)
      if (!overTask) return prev
      if (activeTask.status !== overTask.status) return prev.map(t => t.id === activeId ? { ...t, status: overTask.status } : t)
      const col = prev.filter(t => t.status === activeTask.status)
      const oi = col.findIndex(t => t.id === activeId), ni = col.findIndex(t => t.id === overId)
      if (oi === ni) return prev
      return [...prev.filter(t => t.status !== activeTask.status), ...arrayMove(col, oi, ni)]
    })
  }

  async function handleDragEnd({ active }: DragEndEvent) {
    const activeId = String(active.id)
    const original = originalStatusRef.current
    originalStatusRef.current = null
    setActiveTask(null)
    if (!userId || !original) return
    const current = tasks.find(t => t.id === activeId)
    if (!current) return
    if (current.status !== original) { await moveTask(activeId, current.status, userId, original); await reload() }
  }

  function handleDragCancel() {
    const original = originalStatusRef.current
    originalStatusRef.current = null
    if (activeTask && original) setTasks(prev => prev.map(t => t.id === activeTask.id ? { ...t, status: original } : t))
    setActiveTask(null)
  }

  if (loading) return <LoadingScreen />
  if (error) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center', color:'#ef4444', padding:32 }}>
        <p style={{ fontSize:17, marginBottom:8 }}>Connection error</p>
        <p style={{ fontSize:13, color:'var(--text-muted)' }}>{error}</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', position:'relative', zIndex:1 }}>
      <Header
        tasks={tasks} search={search} setSearch={setSearch}
        filterPriority={filterPriority} setFilterPriority={setFilterPriority}
        filterLabel={filterLabel} setFilterLabel={setFilterLabel}
        filterAssignee={filterAssignee} setFilterAssignee={setFilterAssignee}
        labels={labels} members={members}
      />

      {/* ── Toolbar ── */}
      <div style={{ padding:'8px 14px', display:'flex', alignItems:'center', gap:6, borderBottom:'1px solid var(--border)', background:'var(--surface)', flexWrap:'wrap' }}>
        <button className="btn btn-primary" style={{ fontSize:12, padding:'6px 12px' }}
          onClick={() => { setEditingTask(null); setDefaultStatus('todo'); setShowTaskModal(true) }}>
          <Plus size={13} /> New Task
        </button>
        <button className="btn btn-ghost" style={{ fontSize:12, padding:'6px 10px' }} onClick={() => setShowTeam(true)}>
          <Users size={13} />
          <span className="hide-xs">Team</span>
          {members.length > 0 && <span style={{ background:'var(--accent)', color:'white', fontSize:10, fontWeight:700, padding:'1px 5px', borderRadius:99 }}>{members.length}</span>}
        </button>
        <button className="btn btn-ghost" style={{ fontSize:12, padding:'6px 10px' }} onClick={() => setShowLabels(true)}>
          <Tag size={13} />
          <span className="hide-xs">Labels</span>
        </button>

        {/* Avatar stack — clickable to filter */}
        {members.length > 0 && (
          <div style={{ display:'flex', alignItems:'center', marginLeft:4 }}>
            {members.slice(0,5).map((m,i) => (
              <div key={m.id} title={m.name} onClick={() => setFilterAssignee(filterAssignee === m.id ? 'all' : m.id)}
                style={{ width:24, height:24, borderRadius:'50%', background:m.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:'white', border: filterAssignee === m.id ? '2px solid white' : '2px solid var(--surface)', marginLeft:i===0?0:-7, cursor:'pointer', zIndex:members.length-i, position:'relative', flexShrink:0, boxShadow:`0 1px 4px ${m.color}55` }}>
                {m.name.split(' ').map((w:string)=>w[0]).join('').toUpperCase().slice(0,2)}
              </div>
            ))}
            {members.length > 5 && (
              <div style={{ width:24, height:24, borderRadius:'50%', background:'var(--surface3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'var(--text-muted)', border:'2px solid var(--surface)', marginLeft:-7, flexShrink:0 }}>
                +{members.length-5}
              </div>
            )}
          </div>
        )}

        {isFiltering && (
          <span style={{ fontSize:11, color:'var(--text-muted)', marginLeft:2 }}>
            {filteredTasks.length}/{tasks.length}
          </span>
        )}
      </div>

      {/* ── Board ── */}
      <DndContext sensors={sensors} collisionDetection={closestCorners}
        onDragStart={handleDragStart} onDragOver={handleDragOver}
        onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>

        <div className="board-outer">
          <div className="board-grid">
            {COLUMNS.map((col, i) => (
              <div key={col.id} style={{ animation:`fadeIn 0.3s ease ${i*0.07}s both`, display:'flex', flexDirection:'column' }}>
                <BoardColumn
                  column={col}
                  tasks={filteredTasks.filter(t => t.status === col.id)}
                  members={members}
                  onAddTask={() => { setEditingTask(null); setDefaultStatus(col.id); setShowTaskModal(true) }}
                  onTaskClick={task => setDetailTask(task)}
                />
              </div>
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeTask && (
            <div style={{ transform:'rotate(2deg)', boxShadow:'0 20px 60px rgba(0,0,0,.6)', borderRadius:12, pointerEvents:'none' }}>
              <TaskCard task={activeTask} members={members} onClick={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {showTaskModal && userId && (
        <TaskModal userId={userId} defaultStatus={defaultStatus} task={editingTask} labels={labels} members={members}
          onClose={() => { setShowTaskModal(false); setEditingTask(null) }}
          onSaved={async () => { setShowTaskModal(false); setEditingTask(null); await reload() }} />
      )}
      {detailTask && userId && (
        <TaskDetailPanel task={tasks.find(t=>t.id===detailTask.id)??detailTask} userId={userId} labels={labels}
          onClose={() => setDetailTask(null)}
          onEdit={() => { setEditingTask(detailTask); setDetailTask(null); setShowTaskModal(true) }}
          onDeleted={async () => { setDetailTask(null); await reload() }}
          onUpdated={async () => { await reload() }} />
      )}
      {showLabels && userId && (
        <LabelsModal userId={userId} labels={labels}
          onClose={() => setShowLabels(false)} onUpdated={async () => { await reload() }} />
      )}
      {showTeam && userId && (
        <TeamModal userId={userId} members={members}
          onClose={() => setShowTeam(false)} onUpdated={async () => { await reload() }} />
      )}
    </div>
  )
}
