import { supabase } from './supabase'
import type { Task, TaskStatus, Label, Comment, ActivityLog } from '../types'

// ── Auth ──────────────────────────────────────────────
export async function getOrCreateGuestSession() {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) return session.user

  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) throw error
  return data.user
}

// ── Tasks ─────────────────────────────────────────────
export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select(`*, task_labels(label_id, labels(*))`)
    .order('position', { ascending: true })

  if (error) throw error

  return (data ?? []).map((t: any) => ({
    ...t,
    labels: (t.task_labels ?? []).map((tl: any) => tl.labels).filter(Boolean),
  }))
}

export async function createTask(task: Partial<Task> & { title: string; status: TaskStatus; user_id: string }): Promise<Task> {
  const { data: existing } = await supabase
    .from('tasks')
    .select('position')
    .eq('status', task.status)
    .order('position', { ascending: false })
    .limit(1)

  const nextPos = existing && existing.length > 0 ? (existing[0].position ?? 0) + 1 : 0

  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...task, position: nextPos })
    .select()
    .single()

  if (error) throw error

  await logActivity(data.id, task.user_id, `Task created`)
  return data
}

export async function updateTask(id: string, updates: Partial<Task>, userId: string, logMsg?: string): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  if (logMsg) await logActivity(id, userId, logMsg)
  return data
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

export async function moveTask(id: string, newStatus: TaskStatus, userId: string, oldStatus: TaskStatus): Promise<void> {
  const statusLabels: Record<TaskStatus, string> = {
    todo: 'To Do',
    in_progress: 'In Progress',
    in_review: 'In Review',
    done: 'Done',
  }
  await updateTask(id, { status: newStatus }, userId, `Moved from ${statusLabels[oldStatus]} → ${statusLabels[newStatus]}`)
}

// ── Labels ────────────────────────────────────────────
export async function fetchLabels(): Promise<Label[]> {
  const { data, error } = await supabase.from('labels').select('*').order('name')
  if (error) throw error
  return data ?? []
}

export async function createLabel(label: Omit<Label, 'id'>): Promise<Label> {
  const { data, error } = await supabase.from('labels').insert(label).select().single()
  if (error) throw error
  return data
}

export async function deleteLabel(id: string): Promise<void> {
  const { error } = await supabase.from('labels').delete().eq('id', id)
  if (error) throw error
}

export async function addLabelToTask(taskId: string, labelId: string): Promise<void> {
  const { error } = await supabase.from('task_labels').insert({ task_id: taskId, label_id: labelId })
  if (error && !error.message.includes('duplicate')) throw error
}

export async function removeLabelFromTask(taskId: string, labelId: string): Promise<void> {
  const { error } = await supabase.from('task_labels').delete().eq('task_id', taskId).eq('label_id', labelId)
  if (error) throw error
}

// ── Comments ──────────────────────────────────────────
export async function fetchComments(taskId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function addComment(taskId: string, userId: string, content: string): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .insert({ task_id: taskId, user_id: userId, content })
    .select()
    .single()
  if (error) throw error
  await logActivity(taskId, userId, `Added a comment`)
  return data
}

// ── Activity Log ──────────────────────────────────────
export async function fetchActivity(taskId: string): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function logActivity(taskId: string, userId: string, action: string): Promise<void> {
  await supabase.from('activity_log').insert({ task_id: taskId, user_id: userId, action })
}
