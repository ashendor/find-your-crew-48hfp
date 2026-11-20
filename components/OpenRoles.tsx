import type {Opening} from '@/lib/team-openings';

export default function OpenRoles({items}:{items:Opening[]}){
  if (!items.length) return null;
  const shown = items.length > 3 ? items.slice(0, 2) : items;
  const extra = items.length - shown.length;
  return <div className="lm-openroles" aria-label={items.map(item => item.role + ' ' + item.open).join(', ')}>
    {shown.map(item => <em key={item.role}>{item.role} <b>{item.open}</b></em>)}
    {extra > 0 && <span className="lm-openmore">+{extra}</span>}
  </div>;
}
