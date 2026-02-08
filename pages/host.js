import { useRouter } from 'next/router'
import { useEffect, useState, useRef } from 'react'
import { db, ref, onValue, set, update, push } from '../lib/firebase'

export default function HostPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState([])
  const [activeSid, setActiveSid] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState('')
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Set host presence
  useEffect(() => {
    const presenceRef = ref(db, 'presence/host')
    set(presenceRef, true)
    
    return () => {
      set(presenceRef, false)
    }
  }, [])

  // Load all sessions
  useEffect(() => {
    const chatsRef = ref(db, 'chats')
    const unsub = onValue(chatsRef, (snap) => {
      const data = snap.val() || {}
      const sessionsList = Object.entries(data).map(([id, chat]) => ({
        id,
        user: chat.user || 'Unknown User',
        lastMessage: Object.values(chat.messages || {}).pop()?.text || 'No messages yet'
      }))
      setSessions(sessionsList)
    })
    return unsub
  }, [])

  // Load messages for active session
  useEffect(() => {
    if (!activeSid) {
      setMessages([])
      return
    }

    const messagesRef = ref(db, `chats/${activeSid}/messages`)
    const unsub = onValue(messagesRef, (snap) => {
      const data = snap.val() || {}
      const arr = Object.entries(data).map(([id, msg]) => ({ id, ...msg }))
      setMessages(arr)
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
    return unsub
  }, [activeSid])

  // Load typing indicator for active session
  useEffect(() => {
    if (!activeSid) {
      setTyping('')
      return
    }

    const typingRef = ref(db, `chats/${activeSid}/typing`)
    const unsub = onValue(typingRef, (snap) => {
      const data = snap.val() || {}
      const typing = Object.entries(data)
        .filter(([k, v]) => v && k !== 'dex')
        .map(([k]) => k)
        .join(', ')
      setTyping(typing)
    })
    return unsub
  }, [activeSid])

  const sendMessage = async () => {
    if (!input.trim() || !activeSid) return
    const msg = input.trim()
    setInput('')
    
    const messagesRef = ref(db, `chats/${activeSid}/messages`)
    await push(messagesRef, { author: 'dex', text: msg })
    
    const typingRef = ref(db, `chats/${activeSid}/typing/dex`)
    await set(typingRef, false)
  }

  const handleTyping = (val) => {
    setInput(val)
    if (!activeSid) return
    
    const typingRef = ref(db, `chats/${activeSid}/typing/dex`)
    set(typingRef, true)
    
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      set(typingRef, false)
    }, 2000)
  }

  return (
    <div className="host-container">
      <div className="sidebar">
        <h2>Host Dashboard</h2>
        <p className="subtitle">dex (host)</p>
        
        <div className="sessions-list">
          <h3>Active Sessions</h3>
          {sessions.length === 0 ? (
            <p className="no-sessions">No active sessions</p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`session-item ${activeSid === session.id ? 'active' : ''}`}
                onClick={() => setActiveSid(session.id)}
              >
                <div className="session-user">{session.user}</div>
                <div className="session-preview">{session.lastMessage}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="chat-area">
        {activeSid ? (
          <>
            <div className="header">
              <h2>{sessions.find(s => s.id === activeSid)?.user || 'Session'}</h2>
              <small>ID: {activeSid}</small>
            </div>
            
            <div className="messages">
              {messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.author === 'dex' ? 'own' : 'other'}`}>
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
          </>
        ) : (
          <div className="welcome">
            <p>👋 Select a session to start chatting</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .host-container {
          display: flex;
          height: 100vh;
          background: white;
        }
        .sidebar {
          width: 300px;
          background: #f8f9fa;
          border-right: 1px solid #e9ecef;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        .sidebar h2 {
          margin: 0 0 4px;
          color: #333;
        }
        .subtitle {
          font-size: 12px;
          color: #999;
          margin: 0 0 20px;
        }
        .sessions-list h3 {
          margin: 0 0 12px;
          font-size: 14px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .no-sessions {
          font-size: 13px;
          color: #999;
          font-style: italic;
        }
        .session-item {
          padding: 12px;
          margin-bottom: 8px;
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          cursor: pointer;\n          transition: all 0.2s;
        }
        .session-item:hover {
          border-color: #667eea;
          background: #f5f7ff;
        }
        .session-item.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: #667eea;
        }
        .session-user {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 4px;
        }
        .session-preview {
          font-size: 12px;
          opacity: 0.8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .chat-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: white;
        }
        .header {
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-bottom: 1px solid #e9ecef;
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
          max-width: 60%;
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
        .welcome {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #999;
          font-size: 16px;
        }
      `}</style>
    </div>
  )
}
