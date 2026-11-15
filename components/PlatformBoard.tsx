import SocialIcon from '@/components/SocialIcon';

export type PlatformCard = {name: string; href: string};

export function profilePlatforms(profile: {instagram_url?: string | null; youtube_url?: string | null; vimeo_url?: string | null; behance_url?: string | null; dribbble_url?: string | null; website_url?: string | null}): PlatformCard[] {
  return [
    {name: 'Instagram', href: profile.instagram_url || ''},
    {name: 'YouTube', href: profile.youtube_url || ''},
    {name: 'Vimeo', href: profile.vimeo_url || ''},
    {name: 'Behance', href: profile.behance_url || ''},
    {name: 'Dribbble', href: profile.dribbble_url || ''},
    {name: 'Website', href: profile.website_url || ''},
  ];
}

export function linkedUrl(href: string) {
  return /^https:\/\//i.test(href);
}

function Mark({item, linked}:{item: PlatformCard; linked: boolean}) {
  return <>
    {linked && <i className="lm-ext" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17 17 7M9 7h8v8"/></svg></i>}
    <SocialIcon name={item.name} brand={linked} />
    <span>{item.name}</span>
  </>;
}

export default function PlatformBoard({items, extras, mine, onLink, onAddOther, onRemoveExtra}:{items: PlatformCard[]; extras: (PlatformCard & {id: string})[]; mine: boolean; onLink?: (item: PlatformCard) => void; onAddOther?: () => void; onRemoveExtra?: (id: string) => void}) {
  return <div className="lm-plats">
    {items.map(item => {
      const linked = linkedUrl(item.href);
      if (linked) return <a className="lm-plat" key={item.name} href={item.href} target="_blank" rel="noopener noreferrer"><Mark item={item} linked /></a>;
      if (mine) return <button className="lm-plat lm-plat-add" type="button" key={item.name} onClick={() => onLink?.(item)}><Mark item={item} linked={false} /><small>Link</small></button>;
      return <div className="lm-plat lm-plat-off" key={item.name}><Mark item={item} linked={false} /><small>Not linked</small></div>;
    })}
    {extras.map(item => <div className="lm-shotwrap" key={item.id}><a className="lm-plat" href={item.href} target="_blank" rel="noopener noreferrer"><Mark item={item} linked /></a>{mine && onRemoveExtra && <button className="lm-shot-x" type="button" aria-label={'Remove ' + item.name} onClick={() => onRemoveExtra(item.id)}>×</button>}</div>)}
    {mine && <button className="lm-plat lm-plat-add" type="button" onClick={onAddOther}><SocialIcon name="Others" /><span>Others</span><small>Add</small></button>}
  </div>;
}
