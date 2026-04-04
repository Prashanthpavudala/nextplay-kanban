import { useState, useEffect } from 'react'
import { X, Trash2, Edit2, MessageSquare, Clock, Send, Loader2, Calendar, Flag, Tag, ArrowRight, Pencil, UserCheck, Hash } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { fetchComments, addComment, fetchActivity, deleteTask } from '../../lib/api'
import type { Task, Comment, ActivityLog, Label } from '../../types'

interface Props {
  task: Task
  userId: string
  labels: Label[]
  onClose: () => void
  onEdit: () => void
  onDeleted: () => void
  onUpdated: () => void
}

const PRIORITY_CONFIG = {
  high: { color: '#ef4444', label: 'High' },
  normal: { color: '#3b82f6', label: 'Normal' },
  low: { color: '#6b7280', label: 'Low' },
}
const STATUS_LABELS: Record<string, string> = {
  todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done',
}

// Parse activity action into icon + formatted message
function parseActivity(action: string): { icon: React.ReactNode; text: string } {
  if (action.startsWith('Moved from')) {
    return { icon: <ArrowRight size={11} color="#f59e0b" />, text: action }
  }
  if (action.startsWith('Renamed')) {
    return { icon: <Pencil size={11} color="#8b5cf6" />, text: action }
  }
  if (action.startsWith('Assigned to')) {
    return { icon: <UserCheck size={11} color="#10b981" />, text: action }
  }
  if (action.includes('Priority')) {
    return { icon: <Flag size={11} color="#ef4444" />, text: action }
  }
  if (action.includes('Due date')) {
    return { icon: <Calendar size={11} color="#06b6d4" />, text: action }
  }
  if (action.includes('comment')) {
    return { icon: <MessageSquare size={11} color="#6366f1" />, text: action }
  }
  if (action === 'Task created') {
    return { icon: <Hash size={11} color="#10b981" />, text: action }
  }
  if (action.includes('Status changed')) {
    return { icon: <ArrowRight size={11} color="#f59e0b" />, text: action }
  }
  return { icon: <Clock size={11} color="var(--text-muted)" />, text: action }
}

export function TaskDetailPanel({ task, userId: _userId, labels: _labels, onClose, onEdit, onDeleted, onUpdated: _onUpdated }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [activity, setActivity] = useState<ActivityLog[]>([])
  const [newComment, setNewComment] = useState('')
  const [sendingComment, setSendingComment] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [tab, setTab] = useState<'comments' | 'activity'>('comments')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [c, a] = await Promise.all([fetchComments(task.id), fetchActivity(task.id)])
      setComments(c); setActivity(a); setLoading(false)
    }
    load()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [task.id, onClose])

  async function handleSendComment() {
    if (!newComment.trim()) return
    setSendingComment(true)
    try {
      const c = await addComment(task.id, _userId, newComment.trim())
      setComments(prev => [...prev, c])   // append at end = chronological
      setNewComment('')
      const a = await fetchActivity(task.id)
      setActivity(a)
    } finally { setSendingComment(false) }
  }

  async function handleDelete() {
    await deleteTask(task.id)
    onDeleted()
  }

  const priority = PRIORITY_CONFIG[task.priority]
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'

  return (
    <div className="overlay animate-fade-in" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box animate-scale-in" style={{ display:"flex", flexDirection:"column" }}>
        {/* Header */}
        <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.35, flex: 1 }}>{task.title}</h2>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 12, height: 30 }} onClick={onEdit}>
                <Edit2 size={13} /> Edit
              </button>
              {!confirmDelete ? (
                <button className="btn btn-danger" style={{ padding: '6px 10px', fontSize: 12, height: 30 }} onClick={() => setConfirmDelete(true)}>
                  <Trash2 size={13} />
                </button>
              ) : (
                <button className="btn btn-danger" style={{ padding: '6px 10px', fontSize: 12, height: 30 }} onClick={handleDelete}>
                  Confirm?
                </button>
              )}
              <button className="btn btn-ghost" style={{ padding: '6px', borderRadius: 8, height: 30, width: 30 }} onClick={onClose}>
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Meta pills */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <span style={{ background: 'var(--surface2)', border: '1px solid var(--border)', padding: '3px 10px', borderRadius: 99, fontSize: 12, color: 'var(--text-dim)' }}>
              {STATUS_LABELS[task.status]}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: priority.color + '15', border: `1px solid ${priority.color}33`, padding: '3px 10px', borderRadius: 99, fontSize: 12, color: priority.color, fontWeight: 500 }}>
              <Flag size={10} />{priority.label} priority
            </span>
            {task.due_date && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: isOverdue ? 'rgba(239,68,68,0.1)' : 'var(--surface2)', border: `1px solid ${isOverdue ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`, padding: '3px 10px', borderRadius: 99, fontSize: 12, color: isOverdue ? '#ef4444' : 'var(--text-dim)', fontWeight: 500 }}>
                <Calendar size={10} />{isOverdue ? 'Overdue · ' : ''}{format(new Date(task.due_date), 'MMM d, yyyy')}
              </span>
            )}
            <span style={{ background: 'var(--surface2)', border: '1px solid var(--border)', padding: '3px 10px', borderRadius: 99, fontSize: 11, color: 'var(--text-muted)' }}>
              Created {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
            </span>
          </div>

          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <div style={{ display: 'flex', gap: 5, marginTop: 10, flexWrap: 'wrap' }}>
              {task.labels.map(l => (
                <span key={l.id} className="label-chip" style={{ background: l.color + '22', color: l.color, border: `1px solid ${l.color}44` }}>
                  <Tag size={9} />{l.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.65 }}>{task.description}</p>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          {(['comments', 'activity'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: tab === t ? 'var(--accent)' : 'var(--text-muted)', borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {t === 'comments' ? <MessageSquare size={13} /> : <Clock size={13} />}
              {t === 'comments' ? `Comments (${comments.length})` : `Activity (${activity.length})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 48 }} />)}
            </div>
          ) : tab === 'comments' ? (
            /* ── COMMENTS: chronological (oldest first, newest at bottom) ── */
            <>
              {comments.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                  <MessageSquare size={28} style={{ margin: '0 auto 8px', opacity: 0.3, display: 'block' }} />
                  No comments yet — start the conversation
                </div>
              )}
              {comments.map((c, idx) => (
                <div key={c.id} style={{ marginBottom: 10, animation: `fadeIn 0.2s ease ${idx * 0.04}s both` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'white', flexShrink: 0 }}>G</div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Guest</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>·</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }} title={format(new Date(c.created_at), 'MMM d, yyyy HH:mm')}>
                      {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div style={{ marginLeft: 30, padding: '9px 12px', background: 'var(--surface2)', borderRadius: '4px 10px 10px 10px', border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.55 }}>{c.content}</p>
                  </div>
                </div>
              ))}
            </>
          ) : (
            /* ── ACTIVITY: reverse chronological (newest first) with rich icons ── */
            <>
              {activity.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                  <Clock size={28} style={{ margin: '0 auto 8px', opacity: 0.3, display: 'block' }} />
                  No activity yet
                </div>
              )}
              <div style={{ position: 'relative' }}>
                {/* Timeline line */}
                {activity.length > 1 && (
                  <div style={{ position: 'absolute', left: 11, top: 20, bottom: 0, width: 1, background: 'var(--border)', zIndex: 0 }} />
                )}
                {activity.map((a, idx) => {
                  const { icon, text } = parseActivity(a.action)
                  return (
                    <div key={a.id} style={{ display: 'flex', gap: 12, marginBottom: 14, position: 'relative', zIndex: 1, animation: `slideIn 0.2s ease ${idx * 0.04}s both` }}>
                      {/* Timeline dot with icon */}
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--surface2)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {icon}
                      </div>
                      <div style={{ paddingTop: 3 }}>
                        <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.4 }}>{text}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }} title={format(new Date(a.created_at), 'MMM d, yyyy HH:mm')}>
                          {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Comment input */}
        {tab === 'comments' && (
          <div style={{ padding: '12px 24px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'white', flexShrink: 0 }}>G</div>
              <input
                className="input"
                placeholder="Write a comment… (Enter to send)"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendComment() } }}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={handleSendComment} disabled={sendingComment || !newComment.trim()} style={{ padding: '8px 14px', flexShrink: 0 }}>
                {sendingComment ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Send size={14} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
