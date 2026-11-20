import {ROLES} from '@/lib/crew-types';
import {type RoleNeed} from '@/lib/team-roles';

export default function RoleNeeds({value, onChange}:{value:RoleNeed[]; onChange:(next:RoleNeed[])=>void}){
  function toggle(role:string){
    onChange(value.some(item => item.role === role) ? value.filter(item => item.role !== role) : [...value, {role, count:1}]);
  }
  function setCount(role:string, count:number){
    const next = Math.max(1, Math.min(12, count));
    onChange(value.map(item => item.role === role ? {...item, count:next} : item));
  }
  return <div>
    <div className="lm-pills">{ROLES.map(role => <button type="button" key={role} aria-pressed={value.some(item => item.role === role)} onClick={() => toggle(role)}>{role}</button>)}</div>
    {value.length > 0 && <div className="lm-needs">{value.map(item => <div className="lm-need" key={item.role}>
      <span>{item.role}</span>
      <button type="button" aria-label={'Fewer ' + item.role} onClick={() => setCount(item.role, item.count - 1)}>−</button>
      <strong>{item.count}</strong>
      <button type="button" aria-label={'More ' + item.role} onClick={() => setCount(item.role, item.count + 1)}>+</button>
    </div>)}</div>}
  </div>;
}
