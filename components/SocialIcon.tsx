import {useId} from 'react';

const stroke = {width:16, height:16, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:1.8, 'aria-hidden':true as const};

export default function SocialIcon({name, brand = false}:{name:string; brand?:boolean}){
  const raw = useId();
  const id = raw.replace(/:/g, '');
  if (brand && name === 'Instagram') return <svg viewBox="0 0 24 24" aria-hidden="true"><defs><radialGradient id={id} cx="30%" cy="110%" r="140%"><stop offset="0%" stopColor="#FFD600"/><stop offset="30%" stopColor="#FF7A00"/><stop offset="55%" stopColor="#FF0069"/><stop offset="78%" stopColor="#D300C5"/><stop offset="100%" stopColor="#7638FA"/></radialGradient></defs><rect x="1.5" y="1.5" width="21" height="21" rx="6" fill={'url(#' + id + ')'}/><rect x="7.1" y="7.1" width="9.8" height="9.8" rx="4.9" fill="none" stroke="#fff" strokeWidth="1.7"/><circle cx="17.15" cy="6.85" r="1.05" fill="#fff"/></svg>;
  if (brand && name === 'YouTube') return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#FF0000" d="M23 12.2s0-3.2-.4-4.6c-.2-.9-.9-1.6-1.8-1.8C19.2 5.4 12 5.4 12 5.4s-7.2 0-8.8.4c-.9.2-1.6.9-1.8 1.8C1 9 1 12.2 1 12.2s0 3.2.4 4.6c.2.9.9 1.6 1.8 1.8 1.6.4 8.8.4 8.8.4s7.2 0 8.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.4.4-4.6.4-4.6z"/><path fill="#fff" d="m10 9.5 5.2 2.7L10 14.9z"/></svg>;
  if (brand && name === 'Vimeo') return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#1AB7EA" d="M22.8 7.1c-.1 2.1-1.5 4.9-4.3 8.5-2.9 3.7-5.3 5.6-7.3 5.6-1.2 0-2.3-1.1-3.1-3.4L6.6 13c-.5-1.6-1.1-2.4-1.8-2.4-.2 0-.7.3-1.6 1L2.2 10.4c1-.8 2-1.7 2.9-2.5 1.3-1.1 2.3-1.7 3-1.8.8 0 1.3.5 1.5 1.5.2 1.3.4 2.2.6 2.6.6 2.7 1.3 4.1 2 4.1.5 0 1.4-.8 2.4-2.4 1-1.6 1.6-2.9 1.7-3.7.1-1.4-.4-2.1-1.7-2.1-.6 0-1.2.1-1.8.4 1.2-3.9 3.5-5.8 6.8-5.7 2.5.1 3.7 1.7 3.2 4.3z"/></svg>;
  if (brand && name === 'Behance') return <svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="5" fill="#1769FF"/><text x="12" y="16.2" textAnchor="middle" fill="#fff" fontFamily="Archivo, Arial, sans-serif" fontSize="11" fontWeight="800">Be</text></svg>;
  if (brand && name === 'Dribbble') return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#EA4C89"/><g fill="none" stroke="#fff" strokeWidth="1.25"><path d="M4.1 8.7c4.4 1.6 8.8 1.5 13.2-.6"/><path d="M8.1 20.1c1.3-4.1 2.6-7.8 4.3-12.2"/><path d="M16.6 5.2c.2 3.1-.1 6.2-1.4 9.6-1 2.5-2.2 4.2-3.4 5.2"/></g></svg>;
  if (brand) return <svg viewBox="0 0 24 24" aria-hidden="true"><defs><clipPath id={id}><circle cx="12" cy="12" r="10"/></clipPath></defs><g clipPath={'url(#' + id + ')'}><circle cx="12" cy="12" r="10" fill="#1A73E8"/><ellipse cx="12" cy="12" rx="4.2" ry="10" fill="none" stroke="#fff" strokeWidth="1.4"/><path d="M2 9.2h20M2 14.8h20" stroke="#fff" strokeWidth="1.4"/></g></svg>;
  if (name === 'Instagram') return <svg {...stroke}><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.5"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/></svg>;
  if (name === 'YouTube') return <svg {...stroke}><rect x="3" y="6" width="18" height="12" rx="3"/><path d="m11 10 4 2-4 2z" fill="currentColor" stroke="none"/></svg>;
  if (name === 'Vimeo') return <svg {...stroke}><path d="M4 9.5c2.2-1.6 4.2-.8 6 2.2 1.2 2 2 4.2 2.4 6.6 1.6-5.2 3.6-8 6.6-9.2 1.4-.6 2.6.2 2.2 2.4-1.2 6.2-3.4 9.4-6.6 9.6-2 .2-3.2-1.2-4.2-4.4-.6-2-1.4-4.2-2.4-5.6C6.8 9.2 5.4 9.4 4 10.6"/></svg>;
  if (name === 'Behance') return <svg {...stroke}><path d="M8 8H4v8h4.2A3.2 3.2 0 0 0 8 8Zm.2 5.2H6.2V10h2a1.4 1.4 0 0 1 0 3.2ZM14 11.2h5M16.2 8.2A3.4 3.4 0 0 0 13 12a3.4 3.4 0 0 0 3.6 3.6c1.6 0 2.6-.8 3.2-2"/></svg>;
  if (name === 'Dribbble') return <svg {...stroke}><circle cx="12" cy="12" r="8"/><path d="M5.2 9.2c3.2 1.2 6.6 1.2 9.6-.2M8 19c1.6-3.4 3-6.2 4.2-10M15.5 18.2c-.8-2.4-1.2-4.8-1.2-7.2"/></svg>;
  return <svg {...stroke}><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7L11 6"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7L13 18"/></svg>;
}
