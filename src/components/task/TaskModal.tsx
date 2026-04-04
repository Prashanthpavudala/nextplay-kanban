import { useState, useEffect } from 'react'
import { X, Flag, Calendar, Tag, Loader2, Users } from 'lucide-react'
import { createTask, updateTask, addLabelToTask, removeLabelFromTask } from '../../lib/api'
import { Avatar } from '../ui/TeamModal'
import type { Task, TaskStatus, TaskPriority, Label } from '../../types'
import type { TeamMember } from '../../lib/teamApi'

interface Props {
  userId: string
  defaultStatus?: TaskStatus
  task?: Task | null
  labels: Label[]
  members: TeamMember[]
  onClose: () => void
  onSaved: () => void
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done',
}
const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low', normal: 'Normal', high: 'High',
}

export function TaskModal({ userId, defaultStatus = 'todo', task, labels, members, onClose, onSaved }: Props) {
  const editing = !!task
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? defaultStatus)
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'normal')
  const [dueDate, setDueDate] = useState(task?.due_date ?? '')
  const [assigneeId, setAssigneeId] = useState<string>(task?.assignee_id ?? '')
  const [selectedLabels, setSelectedLabels] = useState<string[]>(task?.labels?.map(l => l.id) ?? [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    document.getElementById('task-title-input')?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSave() {
    if (!title.trim()) { setError('Title is required'); return }
    setSaving(true); setError('')
    try {
      const taskData = {
        title: title.trim(), description, status, priority,
        due_date: dueDate || undefined,
        assignee_id: assigneeId || undefined,
      }

      if (editing) {
        // Build specific activity messages for each change
        const changes: string[] = []
        if (task!.title !== title.trim()) changes.push(`Renamed to "${title.trim()}"`)
        if (task!.status !== status) changes.push(`Status changed: ${STATUS_LABELS[task!.status]} → ${STATUS_LABELS[status]}`)
        if (task!.priority !== priority) changes.push(`Priority set to ${PRIORITY_LABELS[priority]}`)
        if ((task!.due_date ?? '') !== dueDate) {
          if (dueDate) changes.push(`Due date set to ${dueDate}`)
          else changes.push('Due date removed')
        }
        if ((task!.assignee_id ?? '') !== assigneeId) {
          const newAssignee = members.find(m => m.id === assigneeId)
          if (newAssignee) changes.push(`Assigned to ${newAssignee.name}`)
          else changes.push('Assignee removed')
        }
        const logMsg = changes.length > 0 ? changes.join(' · ') : undefined

        await updateTask(task!.id, taskData, userId, logMsg)

        // Sync labels
        const oldIds = task!.labels?.map(l => l.id) ?? []
        const toAdd = selectedLabels.filter(id => !oldIds.includes(id))
        const toRemove = oldIds.filter(id => !selectedLabels.includes(id))
        if (toAdd.length || toRemove.length) {
          await Promise.all([
            ...toAdd.map(id => addLabelToTask(task!.id, id)),
            ...toRemove.map(id => removeLabelFromTask(task!.id, id)),
          ])
        }
      } else {
        const newTask = await createTask({ ...taskData, user_id: userId })
        await Promise.all(selectedLabels.map(id => addLabelToTask(newTask.id, id)))
      }
      onSaved()
    } catch (e: any) {
      setError(e.message)
      setSaving(false)
    }
  }

  function toggleLabel(id: string) {
    setSelectedLabels(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'in_review', label: 'In Review' },
    { value: 'done', label: 'Done' },
  ]

  const selectedMember = members.find(m => m.id === assigneeId)

  return (
    <div className="overlay animate-fade-in" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box animate-scale-in">
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 className="font-display" style={{ fontSize: 17, fontWeight: 700 }}>
            {editing ? 'Edit Task' : 'New Task'}
          </h2>
          <button className="btn btn-ghost" style={{ padding: '6px', borderRadius: 8 }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Title *</label>
            <input id="task-title-input" className="input" placeholder="What needs to be done?"
              value={title} onChange={e => setTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSave() }} />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description</label>
            <textarea className="input" placeholder="Add more details..." value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</label>
              <select className="input" value={status} onChange={e => setStatus(e.target.value as TaskStatus)}>
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <Flag size={10} style={{ display: 'inline', marginRight: 4 }} />Priority
              </label>
              <select className="input" value={priority} onChange={e => setPriority(e.target.value as TaskPriority)}>
                <option value="low">⚪ Low</option>
                <option value="normal">🔵 Normal</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <Calendar size={10} style={{ display: 'inline', marginRight: 4 }} />Due Date
              </label>
              <input className="input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ colorScheme: 'dark' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <Users size={10} style={{ display: 'inline', marginRight: 4 }} />Assignee
              </label>
              <select className="input" value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
                <option value="">Unassigned</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>

          {selectedMember && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <Avatar member={selectedMember} size={24} />
              <span style={{ fontSize: 13, color: 'var(--text)' }}>Assigned to <strong>{selectedMember.name}</strong></span>
            </div>
          )}

          {labels.length > 0 && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <Tag size={10} style={{ display: 'inline', marginRight: 4 }} />Labels
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {labels.map(label => {
                  const selected = selectedLabels.includes(label.id)
                  return (
                    <button key={label.id} onClick={() => toggleLabel(label.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 500,
                      cursor: 'pointer', border: 'none',
                      background: selected ? label.color + '33' : 'var(--surface2)',
                      color: selected ? label.color : 'var(--text-muted)',
                      outline: selected ? `1px solid ${label.color}66` : '1px solid var(--border)',
                      transition: 'all 0.15s',
                    }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: label.color }} />
                      {label.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {error && <p style={{ color: '#ef4444', fontSize: 13, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: 8 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
