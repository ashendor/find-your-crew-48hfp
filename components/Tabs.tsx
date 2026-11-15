import Link from 'next/link';

export type TabItem = {id: string; label: string; href?: string; dot?: boolean};

export default function Tabs({items, current, onChange, label}:{items: TabItem[]; current: string; onChange?: (id: string) => void; label: string}){
  return <div className="lm-tabs" role="tablist" aria-label={label} style={{gridTemplateColumns: 'repeat(' + items.length + ', minmax(0, 1fr))'}}>
    {items.map(item => {
      const selected = current === item.id;
      const body = <span>{item.label}{item.dot && <i className="lm-tabdot" aria-label="New"/>}</span>;
      return item.href
        ? <Link key={item.id} href={item.href} role="tab" aria-selected={selected} aria-current={selected ? 'page' : undefined}>{body}</Link>
        : <button key={item.id} type="button" role="tab" aria-selected={selected} className={selected ? 'on' : ''} onClick={() => onChange?.(item.id)}>{body}</button>;
    })}
  </div>;
}
