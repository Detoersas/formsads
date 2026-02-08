import { useRouter } from 'next/router'
import { useState } from 'react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  function submit(e) {
    e.preventDefault()
    if (!/^[0-9]{4}$/.test(pass)) {
      setError('Passcode must be 4 numeric digits')
      return
    }
    const isHost = username === 'dex' && pass === '1982'
    // for host, redirect to /host
    if (isHost) return router.push('/host?user=dex')
    // for regular user create a session id and go to chat
    const sessionId = Math.random().toString(36).slice(2, 9)
    router.push(`/chat?session=${sessionId}&user=${encodeURIComponent(username)}`)
  }

  return (
    <div className="page">
      <main className="card">
        <h1>Live Support</h1>
        <form onSubmit={submit} className="form">
          <label>Username</label>
          <input value={username} onChange={(e)=>setUsername(e.target.value)} required />
          <label>4-digit passcode</label>
          <input value={pass} onChange={(e)=>setPass(e.target.value)} required inputMode="numeric" />
          {error && <div className="error">{error}</div>}
          <button type="submit">Continue</button>
        </form>
        <p className="hint">Host: username <strong>dex</strong> passcode <strong>1982</strong></p>
      </main>

      <style jsx>{`
        .page{display:flex;align-items:center;justify-content:center;height:100vh;background:#f0f4f8}
        .card{width:360px;background:white;padding:24px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.08)}
        h1{margin:0 0 12px}
        .form{display:flex;flex-direction:column;gap:8px}
        input{padding:10px;border-radius:6px;border:1px solid #ddd}
        button{margin-top:8px;padding:10px;border-radius:6px;background:#111;color:white;border:none}
        .hint{font-size:13px;color:#666;margin-top:12px}
        .error{color:#b00020}
      `}</style>
    </div>
  )
}
