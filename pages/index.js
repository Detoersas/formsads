import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { db, ref, onValue } from '../lib/firebase'

export default function Login() {
  const [username, setUsername] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [hostActive, setHostActive] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // subscribe to host presence
    const pRef = ref(db, 'presence/dex')
    const unsub = onValue(pRef, (snap) => {
      const v = snap.val()
      setHostActive(!!v)
    })
    return () => { if (unsub) unsub() }
  }, [])

  function submit(e) {
    e.preventDefault()
    if (!/^[0-9]{4}$/.test(pass)) {
      setError('Passcode must be 4 numeric digits')
      return
    }
    const isHost = username === 'dex' && pass === '1982'
    if (isHost) return router.push('/host?user=dex')
    const sessionId = Math.random().toString(36).slice(2, 9)
    router.push(`/chat?session=${sessionId}&user=${encodeURIComponent(username)}`)
  }

  // no contact button: show status text only

  return (
    <div className="page">
      <main className="card">
        <h1>Live Support</h1>

        <div className="hostStatus">
          {hostActive ? (
            <div className="active">🟢 Host is active — contact them now.</div>
          ) : (
            <div className="inactive">🔴 Host not active — contact them now.</div>
          )}
        </div>

        <form onSubmit={submit} className="form">
          <label>Username</label>
          <input value={username} onChange={(e)=>setUsername(e.target.value)} required />
          <label>4-digit passcode</label>
          <input value={pass} onChange={(e)=>setPass(e.target.value)} required inputMode="numeric" />
          {error && <div className="error">{error}</div>}
          <button type="submit">Continue</button>
        </form>
      </main>

      <style jsx>{`
        .page{display:flex;align-items:center;justify-content:center;height:100vh;background:#f0f4f8}
        .card{width:360px;background:white;padding:24px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.08)}
        h1{margin:0 0 12px}
        .hostStatus{margin-bottom:12px}
        .hostStatus .active{color:green}
        .hostStatus .inactive{color:#c33}
        .hostStatus button{background:transparent;border:1px solid #ddd;padding:6px 8px;border-radius:6px;cursor:pointer}
        .form{display:flex;flex-direction:column;gap:8px}
        input{padding:10px;border-radius:6px;border:1px solid #ddd}
        button[type="submit"]{margin-top:8px;padding:10px;border-radius:6px;background:#111;color:white;border:none}
        .error{color:#b00020}
      `}</style>
    </div>
  )
}
