import { supabase } from './supabase'
import { api } from './goClient'
import type { Task, TaskStatus, Label, Comment, ActivityLog } from '../types'

// ── Auth (stays on Supabase directly) ────────────────────────────────
export async function getOrCreateGuestSession() {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) return session.user

  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) throw error
  return data.user
}

// ── Tasks ─────────────────────────────────────────────────────────────
export async function fetchTasks(): Promise<Task[]> {
  const tasks = await api.get<Task[]>('/api/tasks')
  return tasks ?? []
}

export async function createTask(
  task: Partial<Task> & { title: string; status: TaskStatus; user_id: string }
): Promise<Task> {
  return api.post<Task>('/api/tasks', {
    title:       task.title,
    description: task.description,
    status:      task.status,
    priority:    task.priority ?? 'normal',
    due_date:    task.due_date,
    assignee_id: task.assignee_id,
  })
}

export async function updateTask(
  id: string,
  updates: Partial<Task>,
  _userId: string,
  _logMsg?: string
): Promise<Task> {
  return api.patch<Task>(`/api/tasks/${id}`, updates)
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/api/tasks/${id}`)
}

export async function moveTask(
  id: string,
  newStatus: TaskStatus,
  _userId: string,
  oldStatus: TaskStatus
): Promise<void> {
  await api.post(`/api/tasks/${id}/move`, {
    status:     newStatus,
    old_status: oldStatus,
  })
}

// ── Labels ─────────────────────────────────────────────────────────────
export async function fetchLabels(): Promise<Label[]> {
  return api.get<Label[]>('/api/labels')
}

export async function createLabel(label: Omit<Label, 'id'>): Promise<Label> {
  return api.post<Label>('/api/labels', { name: label.name, color: label.color })
}

export async function deleteLabel(id: string): Promise<void> {
  await api.delete(`/api/labels/${id}`)
}

export async function addLabelToTask(taskId: string, labelId: string): Promise<void> {
  await api.post(`/api/tasks/${taskId}/labels/${labelId}`)
}

export async function removeLabelFromTask(taskId: string, labelId: string): Promise<void> {
  await api.delete(`/api/tasks/${taskId}/labels/${labelId}`)
}

// ── Comments ───────────────────────────────────────────────────────────
export async function fetchComments(taskId: string): Promise<Comment[]> {
  return api.get<Comment[]>(`/api/tasks/${taskId}/comments`)
}

export async function addComment(
  taskId: string,
  _userId: string,
  content: string
): Promise<Comment> {
  return api.post<Comment>(`/api/tasks/${taskId}/comments`, { content })
}

// ── Activity Log ───────────────────────────────────────────────────────
export async function fetchActivity(taskId: string): Promise<ActivityLog[]> {
  return api.get<ActivityLog[]>(`/api/tasks/${taskId}/activity`)
}

// kept for compatibility — Go backend logs automatically
export async function logActivity(
  _taskId: string,
  _userId: string,
  _action: string
): Promise<void> {}
