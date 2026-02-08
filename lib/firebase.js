const hasFirebaseConfig = !!process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL &&
  !process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL.includes('your-project')

let db, ref, onValue, push, set, update, onDisconnect

if (hasFirebaseConfig) {
  // Proper Firebase initialization with ES imports
  import('firebase/app').then(async (appModule) => {
    const { initializeApp, getApps } = appModule
    const { getDatabase, ref: firebaseRef, onValue: firebaseOnValue, push: firebasePush, set: firebaseSet, onDisconnect: firebaseOnDisconnect, update: firebaseUpdate } = await import('firebase/database')
    
    if (!getApps().length) {
      const cfg = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
      }
      initializeApp(cfg)
    }
    db = getDatabase()
    ref = firebaseRef
    onValue = firebaseOnValue
    push = firebasePush
    set = firebaseSet
    update = firebaseUpdate
    onDisconnect = firebaseOnDisconnect
  }).catch((err) => {
    console.warn('Firebase SDK failed to load, using fallback:', err.message)
    setupFallback()
  })
} else {
  setupFallback()
}

function setupFallback() {
  const CHANNEL = typeof window !== 'undefined' && 'BroadcastChannel' in window ? new BroadcastChannel('live-support') : null
  const STORAGE_KEY = 'live-support-db'
  const listeners = new Map()

  function readStore() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    } catch (e) {
      return {}
    }
  }

  function writeStore(store) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    if (CHANNEL) CHANNEL.postMessage({ type: 'update', store })
  }

  if (CHANNEL) {
    CHANNEL.onmessage = (ev) => {
      if (ev.data?.type === 'update') {
        for (const [path, cbs] of listeners.entries()) {
          const val = getPath(ev.data.store, path)
          cbs.forEach(cb => cb({ val: () => val }))
        }
      }
    }
  }

  function getPath(obj, path) {
    const parts = path.split('/').filter(Boolean)
    let cur = obj
    for (const p of parts) {
      if (!cur) return null
      cur = cur[p]
    }
    return cur
  }

  function setPath(obj, path, value) {
    const parts = path.split('/').filter(Boolean)
    let cur = obj
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i]
      if (!cur[p]) cur[p] = {}
      cur = cur[p]
    }
    cur[parts[parts.length - 1]] = value
  }

  function updatePath(obj, path, value) {
    const existing = getPath(obj, path) || {}
    setPath(obj, path, { ...existing, ...value })
  }

  function pushPath(obj, path, value) {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
    const parent = getPath(obj, path) || {}
    parent[id] = value
    setPath(obj, path, parent)
    return id
  }

  ref = (db, path) => path

  onValue = (pathRef, cb) => {
    const path = pathRef
    const arr = listeners.get(path) || []
    arr.push(cb)
    listeners.set(path, arr)
    const s = readStore()
    cb({ val: () => getPath(s, path) })
    return () => {
      const cur = listeners.get(path) || []
      listeners.set(path, cur.filter(c => c !== cb))
    }
  }

  push = (pathRef, value) => {
    const s = readStore()
    const id = pushPath(s, pathRef, value)
    writeStore(s)
    return Promise.resolve({ key: id })
  }

  set = (pathRef, value) => {
    const s = readStore()
    setPath(s, pathRef, value)
    writeStore(s)
    return Promise.resolve()
  }

  update = (pathRef, value) => {
    const s = readStore()
    updatePath(s, pathRef, value)
    writeStore(s)
    return Promise.resolve()
  }

  onDisconnect = () => ({ cancel: () => {} })

  db = null
}

export { db, ref, onValue, push, set, onDisconnect, update }
