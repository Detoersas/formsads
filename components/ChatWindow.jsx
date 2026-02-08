import { useEffect, useRef, useState } from 'react'
import { db, ref, onValue, push, set, update } from '../lib/firebase'

export default function ChatWindow({ sessionId, user, isHost }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState({})
  const listRef = useRef(null)

  useEffect(() => {
    if (!sessionId) return
    const messagesRef = ref(db, `sessions/${sessionId}/messages`)
    return onValue(messagesRef, (snap) => {
      const data = snap.val() || {}
      const arr = Object.keys(data).map((k) => ({ id: k, ...data[k] }))
      setMessages(arr)
      setTimeout(() => listRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    })
  }, [sessionId])

  useEffect(() => {
    if (!sessionId || !user) return
    const typingRef = ref(db, `sessions/${sessionId}/typing/${user}`)
    set(typingRef, false)
    const allTypingRef = ref(db, `sessions/${sessionId}/typing`)
    const unsub = onValue(allTypingRef, (snap) => {
      setTypingUsers(snap.val() || {})
    })

    return () => {
      set(typingRef, false)
      if (typeof unsub === 'function') unsub()
    }
  }, [sessionId, user])

  async function send() {
    if (!text.trim()) return
    const messagesRef = ref(db, `sessions/${sessionId}/messages`)
    await push(messagesRef, { author: user, text: text.trim(), ts: Date.now() })
    setText('')
    await update(ref(db, `sessions/${sessionId}/typing`), { [user]: false })
  }

  async function handleTyping(v) {
    setText(v)
    if (!sessionId || !user) return
    await update(ref(db, `sessions/${sessionId}/typing`), { [user]: !!v })
  }

  return (
    <div className="chatRoot">
      <div className="messages">
        {messages.map((m) => (
          <div key={m.id} className={"msg " + (m.author === user ? 'me' : '')}>
            <div className="author">{m.author}</div>
            <div className="text">{m.text}</div>
          </div>
        ))}
        <div ref={listRef} />
      </div>

      <div className="typingRow">
        {Object.keys(typingUsers).filter(u=>u!==user && typingUsers[u]).length > 0 && (
          <div className="typingText">
            {Object.keys(typingUsers).filter(u=>u!==user && typingUsers[u]).join(', ')} is typing...
          </div>
        )}
      </div>

      <div className="composer">
        <input
          value={text}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Type a message..."
          inputMode="text"
        />
        <button onClick={send}>Send</button>
      </div>

      <style jsx>{`
        .chatRoot { display:flex; flex-direction:column; height:100%; }
        .messages { flex:1; overflow:auto; padding:12px; }
        .typingRow{height:22px;padding:0 12px;color:#666;font-size:13px}
        .typingText{font-style:italic}
        .msg { margin-bottom:12px; }
        .msg.me { text-align:right; }
        .author { font-size:12px; color:#666 }
        .text { background:#f1f1f1; display:inline-block; padding:8px 12px; border-radius:8px; max-width:70%; }
        .msg.me .text { background:#0b93f6; color:white }
        .composer { display:flex; gap:8px; padding:12px; border-top:1px solid #eee }
        input { flex:1; padding:8px 10px; border-radius:6px; border:1px solid #ccc }
        button { padding:8px 12px; border-radius:6px; background:#111; color:white; border:none }
      `}</style>
    </div>
  )
}
