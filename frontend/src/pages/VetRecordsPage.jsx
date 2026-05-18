import { useState, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import { motion, AnimatePresence } from 'framer-motion'
import { useVetRecords } from '../hooks/useVetRecords'
import { useCats } from '../hooks/useCats'
import { useToast } from '../context/ToastContext'
import VetForm from '../components/VetForm'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import { SkeletonCard } from '../components/SkeletonCard'
import { CAT_VET } from '../utils/catImages'

const LIBRARIES = ['places']

const TYPE_META = {
  vaccination: { icon: '💉', bg: 'bg-blue-50 dark:bg-blue-900/20',      text: 'text-blue-700 dark:text-blue-400',     border: 'border-blue-200 dark:border-blue-800',     barColor: '#3b82f6', label: 'Vaccination' },
  checkup:     { icon: '🩺', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', barColor: '#10b981', label: 'Checkup'     },
  dental:      { icon: '🦷', bg: 'bg-amber-50 dark:bg-amber-900/20',    text: 'text-amber-700 dark:text-amber-400',   border: 'border-amber-200 dark:border-amber-800',   barColor: '#f59e0b', label: 'Dental'      },
  emergency:   { icon: '🚨', bg: 'bg-red-50 dark:bg-red-900/20',        text: 'text-red-700 dark:text-red-400',       border: 'border-red-200 dark:border-red-800',       barColor: '#ef4444', label: 'Emergency'   },
  other:       { icon: '📋', bg: 'bg-slate-50 dark:bg-slate-800',       text: 'text-slate-600 dark:text-slate-400',   border: 'border-slate-200 dark:border-slate-700',   barColor: '#94a3b8', label: 'Other'       },
}

// ── Vet Record Card ──────────────────────────────────────────────────────────
function VetRecordCard({ record, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const meta    = TYPE_META[record.type] || TYPE_META.other
  const date    = new Date(record.date)
  const hasNext = record.nextVisitDate && new Date(record.nextVisitDate) > new Date()

  return (
    <div className={`card card-hover border ${meta.border} overflow-hidden group`}>
      <div className="h-1 w-full" style={{ background: meta.barColor }} />
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl ${meta.bg} ${meta.border} border flex items-center justify-center text-2xl flex-shrink-0`}>
            {meta.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className={`badge ${meta.bg} ${meta.text} capitalize`}>{meta.label}</span>
                {record.catId?.name && (
                  <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    🐱 {record.catId.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-semibold flex-shrink-0">
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            {(record.vetName || record.clinic) && (
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1.5">
                👨‍⚕️ {[record.vetName, record.clinic].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>
        {record.notes && (
          <div className="mt-3">
            <p className={`text-sm text-slate-500 dark:text-slate-400 leading-relaxed ${!expanded && 'line-clamp-2'}`}>
              {record.notes}
            </p>
            {record.notes.length > 100 && (
              <button onClick={() => setExpanded(e => !e)}
                className="text-xs text-brand-600 dark:text-brand-400 font-bold mt-1 hover:underline">
                {expanded ? '↑ Show less' : '↓ Read more'}
              </button>
            )}
          </div>
        )}
        {hasNext && (
          <div className="mt-3 flex items-center gap-2 bg-coral-50 dark:bg-coral-900/20 border border-coral-200 dark:border-coral-900/40 rounded-xl px-3 py-2">
            <span className="text-base">📅</span>
            <p className="text-xs font-bold text-coral-700 dark:text-coral-400">
              Next visit: {new Date(record.nextVisitDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        )}
        <div className="flex gap-2 mt-4 pt-3 border-t border-slate-50 dark:border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button onClick={() => onEdit(record)} className="btn-ghost text-xs py-1.5 px-3">✏️ Edit</button>
          <button onClick={() => onDelete(record._id)} className="btn-ghost text-xs py-1.5 px-3 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">🗑 Delete</button>
        </div>
      </div>
    </div>
  )
}

// ── Nearby Vets Map (embedded) ───────────────────────────────────────────────
function NearbyVetsMap() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: LIBRARIES,
  })

  const [userLocation, setUserLocation]   = useState(null)
  const [vets, setVets]                   = useState([])
  const [selectedVet, setSelectedVet]     = useState(null)
  const [locating, setLocating]           = useState(false)
  const [searching, setSearching]         = useState(false)
  const [locationError, setLocationError] = useState('')
  const [manualInput, setManualInput]     = useState('')
  const [geocoding, setGeocoding]         = useState(false)

  const mapRef          = useRef(null)
  const autocompleteRef = useRef(null)
  const inputRef        = useRef(null)

  const onMapLoad = useCallback((map) => { mapRef.current = map }, [])

  // Attach Google Places Autocomplete to the text input once Maps is loaded
  const onInputMount = useCallback((el) => {
    if (!el || !isLoaded || autocompleteRef.current) return
    inputRef.current = el
    const ac = new window.google.maps.places.Autocomplete(el, { types: ['geocode'] })
    ac.addListener('place_changed', () => {
      const place = ac.getPlace()
      if (!place.geometry?.location) return
      const loc = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      }
      setManualInput(place.formatted_address || el.value)
      setLocationError('')
      setUserLocation(loc)
      if (mapRef.current) { mapRef.current.panTo(loc); mapRef.current.setZoom(14) }
      searchNearbyVets(loc)
    })
    autocompleteRef.current = ac
  }, [isLoaded]) // eslint-disable-line

  const searchNearbyVets = useCallback((location) => {
    if (!mapRef.current) return
    setSearching(true)
    setVets([])
    setSelectedVet(null)
    const service = new window.google.maps.places.PlacesService(mapRef.current)
    service.nearbySearch(
      { location, radius: 5000, type: 'veterinary_care' },
      (results, status) => {
        setSearching(false)
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          setVets(results)
        } else {
          setVets([])
        }
      }
    )
  }, [])

  // Manual search by typing an address and pressing Enter / Search button
  const handleManualSearch = useCallback(() => {
    if (!manualInput.trim() || !isLoaded) return
    setLocationError('')
    setGeocoding(true)
    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ address: manualInput }, (results, status) => {
      setGeocoding(false)
      if (status === 'OK' && results[0]) {
        const loc = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
        }
        setUserLocation(loc)
        if (mapRef.current) { mapRef.current.panTo(loc); mapRef.current.setZoom(14) }
        searchNearbyVets(loc)
      } else {
        setLocationError('Could not find that location. Try a more specific address.')
      }
    })
  }, [manualInput, isLoaded, searchNearbyVets])

  const handleLocate = useCallback(() => {
    setLocationError('')
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserLocation(loc)
        setManualInput('')
        setLocating(false)
        if (mapRef.current) { mapRef.current.panTo(loc); mapRef.current.setZoom(14) }
        searchNearbyVets(loc)
      },
      (err) => {
        setLocating(false)
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? 'Location access denied. Please allow location in your browser settings.'
            : 'Could not get your location. Please try again.'
        )
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [searchNearbyVets])

  const handleMarkerClick = useCallback((vet) => {
    setSelectedVet(vet)
    if (mapRef.current) mapRef.current.panTo(vet.geometry.location)
  }, [])

  if (loadError) {
    return (
      <div className="card p-6 text-center space-y-2">
        <p className="text-3xl">⚠️</p>
        <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Failed to load Google Maps</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Check that your API key is valid and Maps JavaScript API + Places API are enabled.
        </p>
      </div>
    )
  }

  const isBusy = locating || searching || geocoding

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
    >
      <div className="card p-5 space-y-4">
        {/* Header */}
        <div>
          <p className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
            📍 Nearby Vet Clinics
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {vets.length > 0
              ? `${vets.length} clinic${vets.length > 1 ? 's' : ''} found within 5km`
              : 'Use your GPS or type a location to find nearby vets'}
          </p>
        </div>

        {/* Location controls */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Manual address input */}
          <div className="flex flex-1 gap-2">
            <input
              ref={onInputMount}
              type="text"
              value={manualInput}
              onChange={e => setManualInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleManualSearch()}
              placeholder="Type a city or address..."
              disabled={!isLoaded || isBusy}
              className="input flex-1 text-sm py-2 px-3"
              style={{ borderRadius: '0.875rem' }}
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleManualSearch}
              disabled={!isLoaded || isBusy || !manualInput.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', color: 'var(--text-primary)' }}
            >
              {geocoding
                ? <span className="w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent-1)', borderTopColor: 'transparent' }} />
                : '🔍'
              }
              Search
            </motion.button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2 sm:flex-col sm:justify-center">
            <div className="flex-1 h-px sm:h-6 sm:w-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>or</span>
            <div className="flex-1 h-px sm:h-6 sm:w-px bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* GPS button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleLocate}
            disabled={isBusy || !isLoaded}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed flex-shrink-0"
            style={{ background: 'var(--accent-1)', color: 'white', boxShadow: '0 4px 14px var(--accent-glow)' }}
          >
            {locating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Locating...
              </>
            ) : (
              <>📡 Use My GPS</>
            )}
          </motion.button>
        </div>

        {/* Error */}
        <AnimatePresence>
          {locationError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40"
            >
              <span>⚠️</span>
              <p className="text-sm text-red-700 dark:text-red-400">{locationError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map + list side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ minHeight: '380px' }}>

          {/* Map */}
          <div className="lg:col-span-2 rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)', minHeight: '340px' }}>
            {!isLoaded ? (
              <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800" style={{ minHeight: '340px' }}>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: 'var(--accent-1)', borderTopColor: 'transparent' }} />
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Loading map...</p>
                </div>
              </div>
            ) : (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%', minHeight: '340px' }}
                center={userLocation || { lat: 24.8607, lng: 67.0011 }}
                zoom={userLocation ? 14 : 12}
                options={{ disableDefaultUI: false, streetViewControl: false, mapTypeControl: false }}
                onLoad={onMapLoad}
              >
                {userLocation && (
                  <Marker
                    position={userLocation}
                    icon={{
                      path: window.google.maps.SymbolPath.CIRCLE,
                      scale: 9,
                      fillColor: '#5b6af7',
                      fillOpacity: 1,
                      strokeColor: 'white',
                      strokeWeight: 3,
                    }}
                    title="Your location"
                  />
                )}
                {vets.map((vet) => (
                  <Marker
                    key={vet.place_id}
                    position={vet.geometry.location}
                    onClick={() => handleMarkerClick(vet)}
                  />
                ))}
                {selectedVet && (
                  <InfoWindow
                    position={selectedVet.geometry.location}
                    onCloseClick={() => setSelectedVet(null)}
                  >
                    <div style={{ maxWidth: '200px', fontFamily: 'system-ui, sans-serif' }}>
                      <p style={{ fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>
                        🏥 {selectedVet.name}
                      </p>
                      {selectedVet.vicinity && (
                        <p style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>
                          📍 {selectedVet.vicinity}
                        </p>
                      )}
                      {selectedVet.rating && (
                        <p style={{ fontSize: '11px', color: '#f59e0b', marginBottom: '6px' }}>
                          {'★'.repeat(Math.round(selectedVet.rating))} {selectedVet.rating.toFixed(1)}
                        </p>
                      )}
                      {selectedVet.opening_hours && (
                        <p style={{ fontSize: '11px', fontWeight: 700, marginBottom: '8px',
                          color: selectedVet.opening_hours.open_now ? '#10b981' : '#ef4444' }}>
                          {selectedVet.opening_hours.open_now ? '✅ Open now' : '❌ Closed'}
                        </p>
                      )}
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedVet.geometry.location.lat()},${selectedVet.geometry.location.lng()}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ display: 'block', textAlign: 'center', padding: '5px 10px',
                          background: '#5b6af7', color: 'white', borderRadius: '8px',
                          fontSize: '11px', fontWeight: 700, textDecoration: 'none' }}
                      >
                        🗺️ Get Directions
                      </a>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            )}
          </div>

          {/* Results list */}
          <div className="lg:col-span-1 flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: '380px' }}>
            {!userLocation && !locating && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-2 p-4">
                <p className="text-3xl">🗺️</p>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>No results yet</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Type an address or use GPS to find clinics near you.</p>
              </div>
            )}
            {(locating || searching || geocoding) && (
              <div className="flex flex-col items-center justify-center h-full gap-2 p-4">
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: 'var(--accent-1)', borderTopColor: 'transparent' }} />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {locating ? 'Getting your location...' : geocoding ? 'Finding address...' : 'Searching for vets...'}
                </p>
              </div>
            )}
            {!searching && !locating && userLocation && vets.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-2 p-4">
                <p className="text-3xl">🔍</p>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>No vets found nearby</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No clinics found within 5km.</p>
              </div>
            )}
            <AnimatePresence>
              {vets.map((vet, i) => (
                <motion.div
                  key={vet.place_id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => handleMarkerClick(vet)}
                  className="cursor-pointer rounded-2xl p-3 border transition-all"
                  style={{
                    background: selectedVet?.place_id === vet.place_id ? 'var(--accent-soft)' : 'var(--bg-card)',
                    borderColor: selectedVet?.place_id === vet.place_id ? 'var(--accent-1)' : 'var(--border)',
                  }}
                >
                  <p className="font-bold text-xs leading-tight" style={{ color: 'var(--text-primary)' }}>
                    🏥 {vet.name}
                  </p>
                  {vet.vicinity && (
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                      📍 {vet.vicinity}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {vet.rating && (
                      <span className="text-xs text-amber-500 font-bold">
                        {'★'.repeat(Math.round(vet.rating))} {vet.rating.toFixed(1)}
                      </span>
                    )}
                    {vet.opening_hours && (
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                        vet.opening_hours.open_now
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {vet.opening_hours.open_now ? 'Open' : 'Closed'}
                      </span>
                    )}
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${vet.geometry.location.lat()},${vet.geometry.location.lng()}`}
                    target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="mt-2 flex items-center justify-center gap-1 w-full py-1.5 rounded-xl text-xs font-bold"
                    style={{ background: 'var(--accent-1)', color: 'white' }}
                  >
                    🗺️ Directions
                  </a>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function VetRecordsPage() {
  const [searchParams]           = useSearchParams()
  const [selectedCat, setSC]     = useState(searchParams.get('cat') || '')
  const [typeFilter, setTF]      = useState('')
  const [showAdd, setShowAdd]    = useState(false)
  const [editRecord, setEdit]    = useState(null)
  const [deleteId, setDeleteId]  = useState(null)
  const [saving, setSaving]      = useState(false)
  const [deleting, setDeleting]  = useState(false)
  const [showMap, setShowMap]    = useState(false)

  const { cats }                                                       = useCats()
  const { records, loading, createRecord, updateRecord, deleteRecord } = useVetRecords(selectedCat || null)
  const { addToast }                                                   = useToast()

  const filtered = typeFilter ? records.filter(r => r.type === typeFilter) : records

  const handleCreate = async (data) => {
    try { setSaving(true); await createRecord(data); setShowAdd(false); addToast('Vet record saved! 🏥', 'success') }
    catch (err) { addToast(err.response?.data?.message || 'Failed to save record', 'error') }
    finally { setSaving(false) }
  }

  const handleUpdate = async (data) => {
    try { setSaving(true); await updateRecord(editRecord._id, data); setEdit(null); addToast('Record updated! 📋', 'success') }
    catch { addToast('Failed to update record', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try { setDeleting(true); await deleteRecord(deleteId); setDeleteId(null); addToast('Record deleted', 'info') }
    catch { addToast('Failed to delete', 'error') }
    finally { setDeleting(false) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="space-y-5 pb-8">

      {/* Hero banner */}
      <div className="card overflow-hidden relative">
        <div className="absolute inset-0">
          <img src={CAT_VET} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-800/75 to-transparent" />
        </div>
        <div className="relative z-10 p-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Health History</p>
            <h1 className="font-display text-3xl text-white mb-1">Vet Records</h1>
            <p className="text-slate-300 text-sm">
              {records.length === 0 ? 'No records yet' : `${records.length} visit${records.length > 1 ? 's' : ''} recorded`}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMap(s => !s)}
              className="flex items-center gap-1.5 backdrop-blur text-white font-bold text-sm px-4 py-2.5 rounded-2xl border transition-all"
              style={{
                background: showMap ? 'rgba(91,106,247,0.7)' : 'rgba(255,255,255,0.12)',
                borderColor: showMap ? 'rgba(91,106,247,0.9)' : 'rgba(255,255,255,0.3)',
              }}
            >
              📍 {showMap ? 'Hide Map' : 'Find Nearby Vets'}
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowAdd(true)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur text-white font-bold text-sm px-4 py-2.5 rounded-2xl border border-white/30 transition-all">
              + Add Record
            </motion.button>
          </div>
        </div>
      </div>

      {/* Nearby vets map — toggles in/out */}
      <AnimatePresence>
        {showMap && <NearbyVetsMap key="nearby-map" />}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {cats.length > 1 && (
          <select className="input text-sm py-2 px-3 w-auto dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            value={selectedCat} onChange={e => setSC(e.target.value)}>
            <option value="">All Cats</option>
            {cats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        )}
        <select className="input text-sm py-2 px-3 w-auto dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          value={typeFilter} onChange={e => setTF(e.target.value)}>
          <option value="">All Types</option>
          {Object.entries(TYPE_META).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
        </select>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(TYPE_META).map(([v, { icon, label }]) => (
            <motion.button whileTap={{ scale: 0.93 }} key={v} onClick={() => setTF(typeFilter === v ? '' : v)}
              className={`text-xs px-3 py-1.5 rounded-full border font-bold transition-all
                ${typeFilter === v ? 'bg-brand-600 text-white border-brand-600' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-brand-300'}`}>
              {icon} {label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && <div className="space-y-3">{[1,2,3].map(i => <SkeletonCard key={i} lines={3} />)}</div>}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="card">
          <EmptyState image={CAT_VET} emoji="🏥" title="No vet records yet"
            description="Keep your cat's health history organised — add vaccinations, checkups, and more."
            action={<button onClick={() => setShowAdd(true)} className="btn-primary">Add First Record</button>} />
        </motion.div>
      )}

      {/* Records */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((r, i) => (
              <motion.div key={r._id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                <VetRecordCard record={r} onEdit={setEdit} onDelete={setDeleteId} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="🏥 New Vet Record">
        <VetForm cats={cats} onSubmit={handleCreate} onCancel={() => setShowAdd(false)} loading={saving} />
      </Modal>
      <Modal isOpen={!!editRecord} onClose={() => setEdit(null)} title="✏️ Edit Vet Record">
        {editRecord && <VetForm cats={cats} initial={editRecord} onSubmit={handleUpdate} onCancel={() => setEdit(null)} loading={saving} />}
      </Modal>
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete this record?" message="This vet record will be permanently removed." loading={deleting} />
    </motion.div>
  )
}
