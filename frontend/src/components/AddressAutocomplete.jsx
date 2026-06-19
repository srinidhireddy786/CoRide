import { useState, useEffect, useRef, useCallback } from 'react'
import { searchAddress } from '../lib/tomtom'

export default function AddressAutocomplete({ value, onChange, onSelect, placeholder, icon, inputClassName = '' }) {
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const wrapperRef = useRef(null)
  const timerRef = useRef(null)

  const handleChange = useCallback((e) => {
    const val = e.target.value
    onChange(val)
  }, [onChange])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!value || value.length < 2) {
      setSuggestions([])
      setOpen(false)
      return
    }
    setSearching(true)
    timerRef.current = setTimeout(async () => {
      const results = await searchAddress(value)
      setSuggestions(results)
      setOpen(results.length > 0)
      setSearching(false)
    }, 300)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [value])

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  const select = (item) => {
    onChange(item.label)
    onSelect({ label: item.label, lat: item.lat, lon: item.lon })
    setOpen(false)
    setSuggestions([])
  }

  return (
    <div className="address-autocomplete" ref={wrapperRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        {icon && (
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 20, color: 'var(--on-surface-variant)', pointerEvents: 'none' }}>
            {icon}
          </span>
        )}
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          onFocus={() => { if (suggestions.length) setOpen(true) }}
          style={icon ? { paddingLeft: 40 } : undefined}
          className={inputClassName}
        />
        {searching && (
          <span className="spinner" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, borderWidth: 2 }} />
        )}
      </div>
      {open && suggestions.length > 0 && (
        <ul className="autocomplete-dropdown">
          {suggestions.map((item, i) => (
            <li key={i} onMouseDown={() => select(item)} className="autocomplete-item">
              <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 8, color: 'var(--on-surface-variant)' }}>location_on</span>
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
