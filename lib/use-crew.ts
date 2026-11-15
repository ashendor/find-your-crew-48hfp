'use client';
import {useCallback,useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {getCrewSupabase} from './crew-supabase';
import type {Creator} from './crew-types';
export function useCrewUser(){
 const client=getCrewSupabase(),router=useRouter();
 const [user,setUser]=useState<Creator|null>(null),[userId,setUserId]=useState(''),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const reload=useCallback(async()=>{
  if(!client){setError('Supabase is not configured.');setLoading(false);return}
  const {data:{user:authUser},error:authError}=await client.auth.getUser();
  if(authError||!authUser){router.replace('/auth');return}
  setUserId(authUser.id);
  const {data,error:profileError}=await client.from('profiles').select('*').eq('id',authUser.id).maybeSingle();
  if(profileError){setError(profileError.message);setLoading(false);return}
  if(!data?.onboarding_complete){router.replace('/onboarding');return}
  setUser(data as Creator);setLoading(false)
 },[client,router]);
 useEffect(()=>{void reload()},[reload]);
 return {client,user,userId,loading,error,reload};
}
