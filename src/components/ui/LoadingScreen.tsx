import { LayoutGrid } from 'lucide-react'

export function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 20,
      background: 'var(--bg)',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 40px rgba(99,102,241,0.4)',
        animation: 'pulse-glow 2s infinite',
      }}>
        <LayoutGrid size={26} color="white" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <p className="font-display" style={{ fontSize: 20, fontWeight: 700 }}>NextPlay Board</p>
        <div style={{ display: 'flex', gap: 5 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--accent)',
              animation: `fadeIn 0.6s ease ${i * 0.2}s infinite alternate`,
            }} />
          ))}
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Setting up your workspace…</p>
      </div>
    </div>
  )
}
