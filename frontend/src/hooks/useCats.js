import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export function useCats() {
  const [cats, setCats]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchCats = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/cats')
      setCats(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cats')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCats() }, [fetchCats])

  const createCat = async (catData) => {
    const { data } = await api.post('/cats', catData)
    setCats(prev => [data, ...prev])
    return data
  }

  const updateCat = async (id, catData) => {
    const { data } = await api.put(`/cats/${id}`, catData)
    setCats(prev => prev.map(c => c._id === id ? data : c))
    return data
  }

  const deleteCat = async (id) => {
    await api.delete(`/cats/${id}`)
    setCats(prev => prev.filter(c => c._id !== id))
  }

  return { cats, loading, error, fetchCats, createCat, updateCat, deleteCat }
}
