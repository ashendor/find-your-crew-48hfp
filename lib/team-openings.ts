import type {SupabaseClient} from '@supabase/supabase-js';
import {parseNeeds,roleSeats} from '@/lib/team-roles';

export type Opening = {role:string; open:number};

export async function openingsByCrew(client:SupabaseClient, teams:{id:string; owner_id:string; role_needs?:unknown}[]):Promise<Record<string, Opening[]>>{
  const needing = teams.filter(team => parseNeeds(team.role_needs).length);
  if (!needing.length) return {};
  const [accepted, owners] = await Promise.all([
    client.from('crew_members').select('crew_id,user_id,role').eq('status', 'accepted').in('crew_id', needing.map(team => team.id)),
    client.from('profiles').select('id,primary_role').in('id', Array.from(new Set(needing.map(team => team.owner_id)))),
  ]);
  const byCrew:Record<string, {user_id:string; role:string}[]> = {};
  for (const row of (accepted.data || []) as {crew_id:string; user_id:string; role:string}[]) {
    (byCrew[row.crew_id] ||= []).push({user_id:row.user_id, role:row.role});
  }
  const ownerRole = Object.fromEntries(((owners.data || []) as {id:string; primary_role:string|null}[]).map(person => [person.id, person.primary_role]));
  const openings:Record<string, Opening[]> = {};
  for (const team of needing) {
    openings[team.id] = roleSeats(parseNeeds(team.role_needs), byCrew[team.id] || [], team.owner_id, ownerRole[team.owner_id])
      .filter(role => role.open > 0)
      .map(role => ({role:role.role, open:role.open}));
  }
  return openings;
}
