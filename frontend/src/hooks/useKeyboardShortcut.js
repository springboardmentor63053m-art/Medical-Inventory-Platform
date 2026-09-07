import { useEffect } from 'react'

export default function useKeyboardShortcut(keys, callback, enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const handler = (e) => {
      const keyList = keys.toLowerCase().split('+').map(k => k.trim())
      const needsCtrl = keyList.includes('ctrl') || keyList.includes('cmd')
      const needsShift = keyList.includes('shift')
      const needsAlt = keyList.includes('alt')
      const mainKey = keyList.filter(k => !['ctrl', 'cmd', 'shift', 'alt'].includes(k))[0]

      const ctrlOk = needsCtrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey)
      const shiftOk = needsShift ? e.shiftKey : !e.shiftKey
      const altOk = needsAlt ? e.altKey : !e.altKey
      const keyOk = e.key.toLowerCase() === mainKey

      if (ctrlOk && shiftOk && altOk && keyOk) {
        e.preventDefault()
        callback(e)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [keys, callback, enabled])
}
