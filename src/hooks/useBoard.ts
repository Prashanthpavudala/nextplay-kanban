import { useState, useEffect, useCallback } from 'react'
import { getOrCreateGuestSession, fetchTasks, fetchLabels } from '../lib/api'
import { fetchTeamMembers } from '../lib/teamApi'
import type { Task, Label } from '../types'
import type { TeamMember } from '../lib/teamApi'

export function useBoard() {
  const [userId, setUserId] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [labels, setLabels] = useState<Label[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      try {
        const user = await getOrCreateGuestSession()
        setUserId(user!.id)
        const [t, l, m] = await Promise.all([fetchTasks(), fetchLabels(), fetchTeamMembers()])
        setTasks(t); setLabels(l); setMembers(m)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const reload = useCallback(async () => {
    const [t, l, m] = await Promise.all([fetchTasks(), fetchLabels(), fetchTeamMembers()])
    setTasks(t); setLabels(l); setMembers(m)
  }, [])

  return { userId, tasks, setTasks, labels, members, loading, error, reload }
}
