'use client';
import type {Creator} from '@/lib/crew-types';
import {nameOf} from '@/lib/crew-types';
import Link from 'next/link';
type Props={creator:Creator;variant?:'large'|'compact';onPass?:()=>void;onConnect?:()=>void;onInvite?:()=>void;busy?:boolean;connectionLabel?:string};
export default function CreatorCard({creator,variant='large',onPass,onConnect,onInvite,busy,connectionLabel}:Props){
 const roles=creator.categories?.length?creator.categories:[creator.primary_role||'Creator'];
 const photo=creator.avatar_url&&/^https:\/\//.test(creator.avatar_url)?creator.avatar_url:null;
 return <article className={'fc-creator-card '+(variant==='compact'?'fc-creator-card--compact':'')}>
  <div className="fc-creator-photo" style={photo?{backgroundImage:'linear-gradient(180deg,rgba(13,12,11,.08),rgba(13,12,11,.88)),url("'+photo+'")'}:{}}>
    <div className="fc-filmgrain" aria-hidden="true"/><div className="fc-card-top"><span>FIND YOUR CREW</span><span>EST. 2026 · DUBAI</span></div>
    {!photo&&<span className="fc-monogram" aria-hidden="true">{nameOf(creator).slice(0,1).toUpperCase()}</span>}
    <div className="fc-photo-copy"><span className="fc-card-number">CREATOR / {creator.username.toUpperCase()}</span><h2>{nameOf(creator)}</h2><p>{creator.primary_role||roles[0]}{creator.location?' · '+creator.location:''}</p></div>
  </div>
  <div className="fc-card-info">
    <p className="fc-card-quote">{creator.headline?'“'+creator.headline+'”':creator.bio?'“'+creator.bio.slice(0,115)+(creator.bio.length>115?'…':'')+'”':'Every great film starts with the right people.'}</p>
    <div className="fc-card-tags">{roles.slice(0,4).map(x=><span key={x}>{x}</span>)}</div>
    <div className="fc-card-meta"><span>{creator.available_for_collaboration?'● OPEN TO COLLABORATE':'○ CONNECT WITH ME'}</span><span>{creator.available_for_48hfp?'48HFP READY':'CREATIVE COMMUNITY'}</span></div>
    <Link className="fc-card-details" href={'/creators/'+encodeURIComponent(creator.username)}>View full profile ↗</Link>
    {(onPass||onConnect||onInvite)&&<div className="fc-card-actions">
      <button type="button" title="Pass" aria-label={'Pass on '+nameOf(creator)} disabled={busy} onClick={onPass} className="fc-action-pass">✕<small>PASS</small></button>
      <button type="button" title="Request connection" disabled={busy||!!connectionLabel} onClick={onConnect} className="fc-action-connect">♡<small>{connectionLabel||'CONNECT'}</small></button>
      <button type="button" title="Invite to crew" disabled={busy} onClick={onInvite} className="fc-action-invite">＋<small>INVITE</small></button>
    </div>}
  </div>
 </article>;
}
