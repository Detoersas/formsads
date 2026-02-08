import { useRouter } from 'next/router'
import { useEffect, useState, useRef } from 'react'
import { db, ref, onValue, push, set, update } from '../lib/firebase'

export default function ChatPage() {
  const router = useRouter()
  const { session, user } = router.query
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState('')
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    if (!session || !user) return

    // Initialize the session if it doesn't exist
    const initSession = async () => {
      const sessionRef = ref(db, `chats/${session}`)
      try {
        await set(sessionRef, { user: user, createdAt: Date.now() })
      } catch (err) {
        console.error('Failed to initialize session:', err)
      }
    }
    initSession()
  }, [session, user])

  useEffect(() => {
    if (!session || !user) return

    // Subscribe to messages
    const messagesRef = ref(db, `chats/${session}/messages`)
    const unsubMessages = onValue(messagesRef, (snap) => {
      const data = snap.val() || {}
      const arr = Object.entries(data).map(([id, msg]) => ({ id, ...msg }))
      setMessages(arr)
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    })

    // Subscribe to typing indicator
    const typingRef = ref(db, `chats/${session}/typing`)
    const unsubTyping = onValue(typingRef, (snap) => {
      const data = snap.val() || {}
      const typing = Object.entries(data)
        .filter(([k, v]) => v && k !== user)
        .map(([k]) => k)
        .join(', ')
      setTyping(typing)
    })

    return () => {
      unsubMessages()
      unsubTyping()
    }
  }, [session, user])

  const sendMessage = async () => {
    if (!input.trim() || !session || !user) return
    const msg = input.trim()
    setInput('')
    
    const messagesRef = ref(db, `chats/${session}/messages`)
    await push(messagesRef, { author: user, text: msg })
    
    // Clear typing
    const typingRef = ref(db, `chats/${session}/typing/${user}`)
    await set(typingRef, false)
  }

  const handleTyping = (val) => {
    setInput(val)
    if (!session || !user) return
    
    const typingRef = ref(db, `chats/${session}/typing/${user}`)
    set(typingRef, true)
    
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      set(typingRef, false)
    }, 2000)
  }

  if (!session || !user) return <div className="loading">Loading...</div>

  return (
    <div className="chat-container">
      <div className="header">
        <h2>Support Chat ({user})</h2>
        <small>Session: {session}</small>
      </div>
      
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.author === user ? 'own' : 'other'}`}>
            <div className="author">{msg.author}</div>
            <div className="text">{msg.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {typing && <div className="typing">💬 {typing} is typing...</div>}

      <div className="input-area">
        <input
          value={input}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>

      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: white;
        }
        .header {
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-bottom: 2px solid #555;
        }
        .header h2 {
          margin: 0 0 4px;
        }
        .header small {
          opacity: 0.9;
        }
        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .message {
          display: flex;
          flex-direction: column;
          margin-bottom: 8px;
        }
        .message.own {
          align-items: flex-end;
        }
        .author {
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }
        .text {
          max-width: 70%;
          padding: 10px 14px;
          border-radius: 12px;
          word-wrap: break-word;
        }
        .message.other .text {
          background: #f1f3f5;
          color: #333;
        }
        .message.own .text {
          background: #667eea;
          color: white;
        }
        .typing {
          padding: 0 20px 8px;
          color: #999;
          font-size: 13px;
          font-style: italic;
        }
        .input-area {
          padding: 16px;
          border-top: 1px solid #eee;
          display: flex;
          gap: 10px;
        }
        input {
          flex: 1;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 24px;
          font-size: 14px;
          outline: none;
        }
        input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        button {
          padding: 12px 24px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 24px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.3s;
        }
        button:hover {
          background: #5568d3;
        }
        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          font-size: 18px;
          color: #666;
        }
      `}</style>
    </div>
  )
}
