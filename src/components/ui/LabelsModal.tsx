import { useState } from 'react'
import { X, Plus, Trash2, Tag } from 'lucide-react'
import { createLabel, deleteLabel } from '../../lib/api'
import type { Label } from '../../types'

interface Props {
  userId: string
  labels: Label[]
  onClose: () => void
  onUpdated: () => void
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#22c55e',
  '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6',
  '#ec4899', '#6b7280',
]

export function LabelsModal({ userId, labels, onClose, onUpdated }: Props) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [saving, setSaving] = useState(false)

  async function handleCreate() {
    if (!name.trim()) return
    setSaving(true)
    await createLabel({ name: name.trim(), color, user_id: userId })
    setName('')
    setSaving(false)
    onUpdated()
  }

  async function handleDelete(id: string) {
    await deleteLabel(id)
    onUpdated()
  }

  return (
    <div className="overlay animate-fade-in" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="animate-scale-in" style={{
        background: 'var(--surface)',
        border: '1px solid var(--border2)',
        borderRadius: 16,
        width: '100%', maxWidth: 420,
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 className="font-display" style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag size={16} color="var(--accent)" /> Manage Labels
          </h2>
          <button className="btn btn-ghost" style={{ padding: '6px', borderRadius: 8 }} onClick={onClose}><X size={15} /></button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Create label */}
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>New Label</p>
            <input className="input" placeholder="Label name" value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate() }} style={{ marginBottom: 10 }} />

            {/* Color picker */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {PRESET_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} style={{
                  width: 24, height: 24, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
                  outline: color === c ? `2px solid white` : '2px solid transparent',
                  outlineOffset: 2, transition: 'all 0.15s', transform: color === c ? 'scale(1.15)' : 'scale(1)',
                }} />
              ))}
            </div>

            <button className="btn btn-primary" onClick={handleCreate} disabled={saving || !name.trim()} style={{ width: '100%', justifyContent: 'center' }}>
              <Plus size={14} /> Create Label
            </button>
          </div>

          {/* Existing labels */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Existing Labels ({labels.length})
            </p>
            {labels.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>No labels yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {labels.map(l => (
                  <div key={l.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', background: 'var(--surface2)', borderRadius: 8,
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: 'var(--text)' }}>{l.name}</span>
                    </div>
                    <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: 12, height: 26 }} onClick={() => handleDelete(l.id)}>
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
