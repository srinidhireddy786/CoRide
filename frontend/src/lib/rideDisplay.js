export function formatRideDateTime(dateStr, locale = 'en-IN') {
  if (!dateStr) return 'Not scheduled'

  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return 'Not scheduled'

  return date.toLocaleString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRideTime(dateStr, locale = 'en-IN') {
  if (!dateStr) return '--'

  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return '--'

  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatCurrency(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '--'

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatVehicleName(ride) {
  if (ride?.vehicle_name) return ride.vehicle_name
  if (ride?.brand || ride?.model) return [ride.brand, ride.model].filter(Boolean).join(' ')
  return 'Vehicle details pending'
}

export function getDriverName(ride) {
  return ride?.driver_name || ride?.owner_name || 'Driver'
}

export function getInitials(name, fallback = '?') {
  if (!name) return fallback
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getStatusLabel(status, bookingStatus) {
  if (bookingStatus === 'accepted') return 'Confirmed'
  if (bookingStatus === 'pending') return 'Pending'

  const labels = {
    open: 'Open',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }

  return labels[status] || 'Scheduled'
}
