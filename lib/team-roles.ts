export type RoleNeed = {role:string; count:number};

export function parseNeeds(value:unknown):RoleNeed[]{
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const needs:RoleNeed[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const role = String((item as {role?:unknown}).role || '').trim();
    const count = Math.round(Number((item as {count?:unknown}).count));
    if (!role || seen.has(role) || !Number.isFinite(count) || count < 1) continue;
    seen.add(role);
    needs.push({role, count:Math.min(12, count)});
  }
  return needs;
}

export type RoleSeat = {role:string; count:number; filled:number; open:number};

export function roleSeats(needs:RoleNeed[], members:{user_id:string; role:string}[], ownerId:string, ownerRole:string|null|undefined):RoleSeat[]{
  const byRole:Record<string, number> = {};
  const ownerHasSeat = members.some(member => member.user_id === ownerId);
  for (const member of members) byRole[member.role] = (byRole[member.role] || 0) + 1;
  if (ownerRole && !ownerHasSeat) byRole[ownerRole] = (byRole[ownerRole] || 0) + 1;
  return needs.map(need => {
    const filled = Math.min(need.count, byRole[need.role] || 0);
    return {role:need.role, count:need.count, filled, open:Math.max(0, need.count - filled)};
  });
}

export function seatSummary(needs:RoleNeed[], members:{user_id:string; role:string}[], ownerId:string, ownerRole:string|null|undefined){
  const roles = roleSeats(needs, members, ownerId, ownerRole);
  const seats = roles.reduce((total, role) => total + role.count, 0);
  const filled = roles.reduce((total, role) => total + role.filled, 0);
  return {seats, filled, open:Math.max(0, seats - filled)};
}
