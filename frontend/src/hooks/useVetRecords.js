import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export function useVetRecords(catId = null) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true)
      const params = catId ? { catId } : {}
      const { data } = await api.get('/vet', { params })
      setRecords(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load vet records')
    } finally {
      setLoading(false)
    }
  }, [catId])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  const createRecord = async (recordData) => {
    const { data } = await api.post('/vet', recordData)
    setRecords(prev => [data, ...prev])
    return data
  }

  const updateRecord = async (id, recordData) => {
    const { data } = await api.put(`/vet/${id}`, recordData)
    setRecords(prev => prev.map(r => r._id === id ? data : r))
    return data
  }

  const deleteRecord = async (id) => {
    await api.delete(`/vet/${id}`)
    setRecords(prev => prev.filter(r => r._id !== id))
  }

  // Upcoming visits (next 7 days)
  const upcoming = records.filter(r => {
    const d = new Date(r.nextVisitDate || r.date)
    const now = new Date()
    const week = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return d >= now && d <= week
  })

  return { records, loading, error, fetchRecords, createRecord, updateRecord, deleteRecord, upcoming }
}
