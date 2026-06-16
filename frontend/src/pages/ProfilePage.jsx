import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { saveUser } from '../lib/auth'

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' })
    }
  }, [user])

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Name is required.')

    setSaving(true)
    try {
      await api.patch('/api/profile', { name: form.name.trim(), phone: form.phone.trim() })
    } catch (err) {
      setSaving(false)
      return toast.error(err.message)
    }
    setSaving(false)

    const updatedUser = { ...user, name: form.name.trim(), phone: form.phone.trim() }
    setUser(updatedUser)
    saveUser(updatedUser)
    toast.success('Profile updated!')
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
        <h2>{user?.name}</h2>
        {user?.avg_rating > 0 && (
          <p className="rating">★ {Number(user.avg_rating).toFixed(1)}</p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <label>
            Full Name
            <input type="text" value={form.name} onChange={update('name')} />
          </label>
          <label>
            Email
            <input type="email" value={form.email} disabled />
          </label>
          <label>
            Phone
            <input type="tel" value={form.phone} onChange={update('phone')} placeholder="9876543210" />
          </label>

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
