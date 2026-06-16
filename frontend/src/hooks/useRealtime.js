import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export function useRealtime(channel, callback, deps = []) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const subscription = supabase
      .channel(channel)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          callbackRef.current({ type: 'SUBSCRIBED' })
        }
      })

    subscription.on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
      callbackRef.current(payload)
    })

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [channel, ...deps])
}
