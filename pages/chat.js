import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import ChatWindow from '../components/ChatWindow'
import { db, ref, update, push } from '../lib/firebase'

export default function ChatPage(){
  const router = useRouter()
  const { session, user } = router.query
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!session || !user) return
    // ensure session root exists
    const root = ref(db, `sessions/${session}`)
    // use update so we don't overwrite children (like existing messages)
    update(root, { createdAt: Date.now(), user: user }).catch(()=>{})
    setInitialized(true)
  }, [session, user])

  if (!session || !user) return <div className="loader">Loading...</div>

  return (
    <div className="screen">
      <aside className="side">
        <h2>Support</h2>
        <p>Session: {session}</p>
        <p>User: {user}</p>
      </aside>
      <section className="main">
        <ChatWindow sessionId={session} user={user} isHost={false} />
      </section>

      <style jsx>{`
        .screen{display:flex;height:100vh}
        .side{width:280px;padding:20px;background:#0b93f6;color:white}
        .main{flex:1;padding:16px}
      `}</style>
    </div>
  )
}
