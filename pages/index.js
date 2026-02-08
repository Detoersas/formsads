import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { db, ref, onValue, update } from '../lib/firebase'

export default function Login() {
  const [username, setUsername] = useState('')
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')
  const [hostActive, setHostActive] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const presenceRef = ref(db, 'presence/host')
    const unsub = onValue(presenceRef, (snap) => {
      setHostActive(!!snap.val())
    })
    return unsub
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim()) {
      setError('Username required')
      return
    }
    if (!/^\d{4}$/.test(passcode)) {
      setError('Passcode must be 4 digits')
      return
    }

    // Check if this is the host
    if (username === 'dex' && passcode === '1982') {
      router.push('/host')
      return
    }

    // Regular user - create session
    const sessionId = Math.random().toString(36).substr(2, 9)
    try {
      const sessionRef = ref(db, `chats/${sessionId}`)
      await update(sessionRef, { user: username, createdAt: Date.now() })
    } catch (err) {
      console.error('Failed to create session:', err)
    }
    router.push(`/chat?session=${sessionId}&user=${encodeURIComponent(username)}`)
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Live Support Chat</h1>
        <div className={`status ${hostActive ? 'active' : 'inactive'}`}>
          {hostActive ? '🟢 Host is online' : '🔴 Host is offline'}
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="4-digit passcode"
            inputMode="numeric"
            maxLength="4"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))}
          />
          {error && <p className="error">{error}</p>}
          <button type="submit">Enter Chat</button>
        </form>
      </div>
      <style jsx>{`
        .container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          width: 100%;
          max-width: 400px;
          padding: 40px;
        }
        h1 {
          margin: 0 0 20px;
          text-align: center;
          color: #333;
        }
        .status {
          text-align: center;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-weight: 500;
        }
        .status.active {
          background: #d4edda;
          color: #155724;
        }
        .status.inactive {
          background: #f8d7da;
          color: #721c24;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        input {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 16px;
        }
        input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        button {
          padding: 12px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s;
        }
        button:hover {
          background: #5568d3;
        }
        .error {
          color: #dc3545;
          font-size: 14px;
          margin: -8px 0 0;
        }
      `}</style>
    </div>
  )
}
