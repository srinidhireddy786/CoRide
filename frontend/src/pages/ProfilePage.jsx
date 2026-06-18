import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setPhone(user.phone || '')
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Name is required.')

    setSaving(true)
    try {
      const updated = await api.patch('/api/profile', { name: name.trim(), phone: phone.trim() })
      updateUser(updated)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.message)
    }
    setSaving(false)
  }

  return (
    <div className="profile-page">
      <motion.div
        className="profile-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="avatar"
          whileHover={{ scale: 1.08, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {user?.name?.charAt(0)?.toUpperCase()}
        </motion.div>

        <h2>{user?.name}</h2>
        {user?.avg_rating > 0 && (
          <p className="rating">★ {Number(user.avg_rating).toFixed(1)}</p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <motion.label
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Full Name
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </motion.label>

          <motion.label
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            Email
            <input type="email" value={user?.email || ''} disabled />
          </motion.label>

          <motion.label
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Phone
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </motion.label>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                  Saving...
                </span>
              ) : 'Save Changes'}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  )
}
