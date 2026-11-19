import type {SupabaseClient} from '@supabase/supabase-js';

export type TeamJoin = {id:string;user_id:string;team:string;created_at:string};

export async function leadJoinRequests(client:SupabaseClient, userId:string):Promise<TeamJoin[]>{
  const owned = await client.from('crews').select('id,name').eq('owner_id', userId);
  const teams = (owned.data || []) as {id:string;name:string}[];
  if (!teams.length) return [];
  const pending = await client.from('team_join_requests').select('id,crew_id,user_id,created_at').eq('status', 'pending').in('crew_id', teams.map(team => team.id));
  if (pending.error || !pending.data) return [];
  const names = Object.fromEntries(teams.map(team => [team.id, team.name]));
  return (pending.data as {id:string;crew_id:string;user_id:string;created_at:string}[]).map(row => ({
    id:row.id,
    user_id:row.user_id,
    team:names[row.crew_id] || 'Team',
    created_at:row.created_at,
  }));
}
