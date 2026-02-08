import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import ChatWindow from '../components/ChatWindow'
import { db, ref, onValue, set, onDisconnect } from '../lib/firebase'

export default function Host(){
  const router = useRouter()
  const { user } = router.query
  const [sessions, setSessions] = useState([])
  const [active, setActive] = useState(null)

  useEffect(()=>{
    // simple client-side guard
    if (user !== 'dex') router.replace('/')
    const presenceRef = ref(db, 'presence/dex')

    // If using Firebase Realtime Database, use .info/connected + onDisconnect
    try {
      const infoRef = ref(db, '.info/connected')
      const unsubInfo = onValue(infoRef, (snap) => {
        const connected = !!snap.val()
        if (connected) {
          try {
            const od = onDisconnect(presenceRef)
            if (od && typeof od.set === 'function') od.set(false)
          } catch (e) {}
          set(presenceRef, true).catch(()=>{})
        }
      })
      const onUnload = () => { set(presenceRef, false).catch(()=>{}) }
      window.addEventListener('beforeunload', onUnload)
      return () => {
        set(presenceRef, false).catch(()=>{})
        window.removeEventListener('beforeunload', onUnload)
        if (typeof unsubInfo === 'function') unsubInfo()
      }
    } catch (e) {
      // Fallback: set presence while tab is open and clear on unload (works for local fallback too)
      set(presenceRef, true).catch(()=>{})
      const onUnload = () => { set(presenceRef, false).catch(()=>{}) }
      window.addEventListener('beforeunload', onUnload)
      return () => {
        set(presenceRef, false).catch(()=>{})
        window.removeEventListener('beforeunload', onUnload)
      }
    }
  },[user])

  useEffect(()=>{
    const sref = ref(db, 'sessions')
    return onValue(sref, (snap)=>{
      const v = snap.val() || {}
      const arr = Object.keys(v).map(k=>({ id:k, ...v[k] }))
      setSessions(arr)
      // do not auto-select a session when sessions appear; require host to click one
    })
  },[])

  return (
    <div className="hostRoot">
      <nav className="left">
        <h3>Host Dashboard</h3>
        <div className="sessions">
          {sessions.map(s=> (
            <button key={s.id} className={s.id===active? 'sel':''} onClick={()=>setActive(s.id)}>
              {s.id} — {s.user || 'guest'}
            </button>
          ))}
        </div>
      </nav>

      <main className="right">
        {active ? <ChatWindow sessionId={active} user={'dex'} isHost={true} /> : <div className="empty">No sessions</div>}
      </main>

      <style jsx>{`
        .hostRoot{display:flex;height:100vh}
        .left{width:320px;padding:16px;border-right:1px solid #eee}
        .sessions{display:flex;flex-direction:column;gap:8px;margin-top:12px}
        button{padding:8px;border-radius:6px;border:1px solid #ddd;background:white;text-align:left}
        button.sel{background:#0b93f6;color:white;border:none}
        .right{flex:1;padding:8px}
      `}</style>
    </div>
  )
}
