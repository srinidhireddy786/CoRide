import { useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../lib/api'

export function useRideStatus(ride, onUpdate) {
  const [updating, setUpdating] = useState(false)

  const startRide = async () => {
    if (!ride) return
    setUpdating(true)
    try {
      await api.patch(`/api/rides/${ride.id}/status?status=in_progress`)
      toast.success('Ride started!')
      onUpdate?.()
    } catch { toast.error('Failed to start ride.') }
    setUpdating(false)
  }

  const completeRide = async () => {
    if (!ride) return
    setUpdating(true)
    try {
      await api.patch(`/api/rides/${ride.id}/status?status=completed`)
      toast.success('Ride completed!')
      onUpdate?.()
    } catch { toast.error('Failed to complete ride.') }
    setUpdating(false)
  }

  const cancelRide = async () => {
    if (!ride) return
    setUpdating(true)
    try {
      await api.patch(`/api/rides/${ride.id}/status?status=cancelled`)
      toast.success('Ride cancelled.')
      onUpdate?.()
    } catch { toast.error('Failed to cancel ride.') }
    setUpdating(false)
  }

  return { startRide, completeRide, cancelRide, updating }
}
