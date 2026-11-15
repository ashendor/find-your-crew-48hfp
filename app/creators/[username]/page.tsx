'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getCrewSupabase } from '@/lib/crew-supabase';
import '../../profile/creator.css';

type PublicProfile={username:string;display_name:string|null;headline:string|null;bio:string|null;location:string|null;avatar_url:string|null;categories:string[]|null;skills_tags:string[]|null;looking_for:string[]|null;available_for_collaboration:boolean|null};

export default function CreatorPublicPage(){
  const {username}=useParams<{username:string}>();
  const [profile,setProfile]=useState<PublicProfile|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  useEffect(()=>{
    const client=getCrewSupabase();
    if(!client){setError('Creator profiles are not configured yet.');setLoading(false);return}
    let active=true;
    client.from('profiles').select('username,display_name,headline,bio,location,avatar_url,categories,skills_tags,looking_for,available_for_collaboration').eq('username',username).maybeSingle()
      .then(({data,error})=>{if(!active)return;setProfile(data as PublicProfile|null);if(error)setError(error.message);setLoading(false)});
    return()=>{active=false};
  },[username]);
  return <main className="crew-page"><div className="crew-shell"><Link className="crew-back" href="/">← Find Your Crew</Link>
    {loading?<p>Loading creator…</p>:error?<p role="alert">{error}</p>:!profile?<p>We couldn't find that creator.</p>:
    <article className="crew-public"><p className="crew-eyebrow">LIKEMINDS / CREATOR PROFILE</p><div className="crew-public-head">
      {profile.avatar_url?<img src={profile.avatar_url} alt={profile.display_name||'Creator portrait'}/>:<div className="crew-avatar-preview" aria-hidden="true">✦</div>}
      <div><h1>{profile.display_name||profile.username}</h1><p>@{profile.username}{profile.location?' · '+profile.location:''}</p></div></div>
      {profile.headline&&<h2>{profile.headline}</h2>}
      <p>{profile.available_for_collaboration?'🟢 Open to collaborate':'Currently not available for collaborations'}</p>
      <div className="crew-divider"/>
      {profile.bio&&<><h3>About</h3><p>{profile.bio}</p></>}
      <h3>Creative roles</h3><div className="crew-chips">{(profile.categories||[]).map(x=><span className="crew-chip" key={x}>{x}</span>)}</div>
      {!!profile.skills_tags?.length&&<><h3>Skills</h3><p>{profile.skills_tags.join(' · ')}</p></>}
      {!!profile.looking_for?.length&&<><h3>Looking for</h3><p>{profile.looking_for.join(' · ')}</p></>}
      <div className="crew-divider"/><p>Want to collaborate? Connections and messaging are coming in the next phase.</p><Link href="/auth">Create your LikeMinds profile →</Link>
    </article>}
  </div></main>;
}
