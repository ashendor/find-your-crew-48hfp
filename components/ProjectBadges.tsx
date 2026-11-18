'use client';
import {useEffect, useState} from 'react';
import Link from 'next/link';
import {getCrewSupabase} from '@/lib/crew-supabase';
import {projectTitle,type Project} from '@/lib/crew-types';

export default function ProjectBadges({userId}:{userId:string}){
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => {
    const client = getCrewSupabase();
    if (!client || !userId) return;
    let active = true;
    void client.from('project_members').select('projects(*)').eq('user_id', userId).eq('status', 'accepted').then(({data}) => {
      if (!active) return;
      const list = ((data || []) as {projects:Project|Project[]|null}[])
        .map(row => Array.isArray(row.projects) ? row.projects[0] : row.projects)
        .filter((project): project is Project => !!project && project.featured && project.status === 'published');
      setProjects(list);
    });
    return () => { active = false; };
  }, [userId]);
  if (!projects.length) return null;
  return <div className="lm-badges">{projects.map(project => <Link className="lm-badge" key={project.id} href={'/projects/' + project.id}>Participating in {projectTitle(project)}</Link>)}</div>;
}
