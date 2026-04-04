import { api } from './goClient'

export interface TeamMember {
  id: string
  name: string
  color: string
  user_id: string
  created_at: string
}

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  return api.get<TeamMember[]>('/api/team')
}

export async function createTeamMember(
  member: { name: string; color: string; user_id: string }
): Promise<TeamMember> {
  return api.post<TeamMember>('/api/team', { name: member.name, color: member.color })
}

export async function deleteTeamMember(id: string): Promise<void> {
  await api.delete(`/api/team/${id}`)
}
