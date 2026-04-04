import { useState } from 'react'
import { X, Plus, Trash2, Users } from 'lucide-react'
import { createTeamMember, deleteTeamMember } from '../../lib/teamApi'
import type { TeamMember } from '../../lib/teamApi'

interface Props {
  userId: string
  members: TeamMember[]
  onClose: () => void
  onUpdated: () => void
}

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#f59e0b', '#10b981', '#06b6d4',
  '#3b82f6', '#84cc16',
]

function Avatar({ member, size = 32 }: { member: TeamMember; size?: number }) {
  const initials = member.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: member.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, color: 'white',
      flexShrink: 0, letterSpacing: '-0.02em',
      boxShadow: `0 2px 8px ${member.color}55`,
    }}>
      {initials}
    </div>
  )
}

export { Avatar }

export function TeamModal({ userId, members, onClose, onUpdated }: Props) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    if (!name.trim()) return
    if (members.length >= 10) { setError('Max 10 team members'); return }
    setSaving(true); setError('')
    try {
      await createTeamMember({ name: name.trim(), color, user_id: userId })
      setName('')
      onUpdated()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    await deleteTeamMember(id)
    onUpdated()
  }

  return (
    <div className="overlay animate-fade-in" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box animate-scale-in">
        {/* Header */}
        <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 className="font-display" style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={16} color="var(--accent)" /> Team Members
          </h2>
          <button className="btn btn-ghost" style={{ padding: '6px', borderRadius: 8 }} onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Add member */}
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Add Member
            </p>

            {/* Preview */}
            {name.trim() && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '8px 12px', background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <Avatar member={{ id: '', name, color, user_id: '', created_at: '' }} size={28} />
                <span style={{ fontSize: 13, color: 'var(--text)' }}>{name}</span>
              </div>
            )}

            <input
              className="input"
              placeholder="Member name"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate() }}
              style={{ marginBottom: 10 }}
            />

            {/* Color picker */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {PRESET_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} style={{
                  width: 24, height: 24, borderRadius: '50%', background: c,
                  border: 'none', cursor: 'pointer',
                  outline: color === c ? '2px solid white' : '2px solid transparent',
                  outlineOffset: 2,
                  transform: color === c ? 'scale(1.2)' : 'scale(1)',
                  transition: 'all 0.15s',
                }} />
              ))}
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: 12, marginBottom: 8 }}>{error}</p>}

            <button
              className="btn btn-primary"
              onClick={handleCreate}
              disabled={saving || !name.trim()}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Plus size={14} /> Add Member
            </button>
          </div>

          {/* Existing members */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Team ({members.length}/10)
            </p>
            {members.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                <Users size={24} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                <p>No team members yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {members.map(m => (
                  <div key={m.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'var(--surface2)',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar member={m} size={28} />
                      <span style={{ fontSize: 13, color: 'var(--text)' }}>{m.name}</span>
                    </div>
                    <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: 12, height: 26 }} onClick={() => handleDelete(m.id)}>
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
