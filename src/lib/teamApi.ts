import { supabase } from './supabase'

export interface TeamMember {
  id: string
  name: string
  color: string
  user_id: string
  created_at: string
}

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createTeamMember(member: { name: string; color: string; user_id: string }): Promise<TeamMember> {
  const { data, error } = await supabase
    .from('team_members')
    .insert(member)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTeamMember(id: string): Promise<void> {
  const { error } = await supabase.from('team_members').delete().eq('id', id)
  if (error) throw error
}
