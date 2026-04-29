import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export function useTasks(catId = null, date = null) {
  const [tasks, setTasks]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      const params = {}
      if (catId) params.catId = catId
      if (date)  params.date  = date
      const { data } = await api.get('/tasks', { params })
      setTasks(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [catId, date])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const createTask = async (taskData) => {
    const { data } = await api.post('/tasks', taskData)
    setTasks(prev => [data, ...prev])
    return data
  }

  const toggleTask = async (id) => {
    const { data } = await api.patch(`/tasks/${id}`)
    setTasks(prev => prev.map(t => t._id === id ? data : t))
    return data
  }

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`)
    setTasks(prev => prev.filter(t => t._id !== id))
  }

  const completedCount = tasks.filter(t => t.completed).length

  return { tasks, loading, error, fetchTasks, createTask, toggleTask, deleteTask, completedCount }
}
