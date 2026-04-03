export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done'
export type TaskPriority = 'low' | 'normal' | 'high'

export interface Label {
  id: string
  name: string
  color: string
  user_id: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  due_date?: string
  position: number
  user_id: string
  created_at: string
  assignee_id?: string
  labels?: Label[]
}

export interface Comment {
  id: string
  task_id: string
  user_id: string
  content: string
  created_at: string
}

export interface ActivityLog {
  id: string
  task_id: string
  user_id: string
  action: string
  created_at: string
}

export interface Column {
  id: TaskStatus
  title: string
  color: string
  accent: string
}

export const COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do', color: '#94a3b8', accent: '#e2e8f0' },
  { id: 'in_progress', title: 'In Progress', color: '#f59e0b', accent: '#fef3c7' },
  { id: 'in_review', title: 'In Review', color: '#8b5cf6', accent: '#ede9fe' },
  { id: 'done', title: 'Done', color: '#10b981', accent: '#d1fae5' },
]
