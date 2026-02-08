// Lightweight fallback when Firebase config is not provided.
const hasFirebaseConfig = !!process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL &&
  !process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL.includes('your-project')

if (hasFirebaseConfig) {
  // Use official Firebase SDK in production when configured
  import('firebase/app').then(({ initializeApp, getApps }) => {})
}

// Implementation note: other modules call `ref(db, path)` so the signatures
// are kept compatible. When using the fallback, `db` is `null` and `ref(db,path)`
// returns the path string.

function createFallback() {
  const CHANNEL = typeof window !== 'undefined' && 'BroadcastChannel' in window ? new BroadcastChannel('live-support') : null
  const STORAGE_KEY = 'live-support-db'

  function readStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch (e) {
      return {}
    }
  }

  function writeStore(store) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    if (CHANNEL) CHANNEL.postMessage({ type: 'update', store })
  }

  const listeners = new Map()

  if (CHANNEL) {
    CHANNEL.onmessage = (ev) => {
      if (ev.data && ev.data.type === 'update') {
        // notify listeners of full store change
        for (const [path, cbs] of listeners.entries()) {
          const val = getPath(ev.data.store, path)
          for (const cb of cbs) cb({ val: () => val })
        }
      }
    }
  }

  function getPath(obj, path) {
    if (!path) return obj
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
    const merged = Object.assign({}, existing, value)
    setPath(obj, path, merged)
  }

  function pushPath(obj, path, value) {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2,6)
    const parent = getPath(obj, path) || {}
    parent[id] = value
    setPath(obj, path, parent)
    return id
  }

  function ref(db, path) { return path }

  function onValue(pathRef, cb) {
    const path = pathRef
    const arr = listeners.get(path) || []
    arr.push(cb)
    listeners.set(path, arr)
    // call immediately with current value
    const s = readStore()
    cb({ val: () => getPath(s, path) })
    return () => {
      const cur = listeners.get(path) || []
      listeners.set(path, cur.filter(c=>c!==cb))
    }
  }

  function push(pathRef, value) {
    const s = readStore()
    const id = pushPath(s, pathRef, value)
    writeStore(s)
    return Promise.resolve({ key: id })
  }

  function set(pathRef, value) {
    const s = readStore()
    setPath(s, pathRef, value)
    writeStore(s)
    return Promise.resolve()
  }

  function update(pathRef, value) {
    const s = readStore()
    updatePath(s, pathRef, value)
    writeStore(s)
    return Promise.resolve()
  }

  function onDisconnect() { return { cancel: () => {} } }

  return { db: null, ref, onValue, push, set, update, onDisconnect }
}

// If Firebase config exists, initialize Firebase SDK; otherwise use fallback.
let db, ref, onValue, push, set, update, onDisconnect

if (hasFirebaseConfig) {
  // lazy require to keep bundles small when not used
  const { initializeApp, getApps } = require('firebase/app')
  const { getDatabase, ref: firebaseRef, onValue: firebaseOnValue, push: firebasePush, set: firebaseSet, onDisconnect: firebaseOnDisconnect, update: firebaseUpdate } = require('firebase/database')
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
} else {
  const fallback = createFallback()
  db = fallback.db
  ref = fallback.ref
  onValue = fallback.onValue
  push = fallback.push
  set = fallback.set
  update = fallback.update
  onDisconnect = fallback.onDisconnect
}

export { db, ref, onValue, push, set, onDisconnect, update }
