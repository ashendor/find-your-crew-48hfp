export type Creator = {
  id:string;username:string;display_name:string;headline:string|null;bio:string|null;
  location:string|null;avatar_url:string|null;categories:string[];skills_tags:string[];
  looking_for:string[];available_for_collaboration:boolean;primary_role:string|null;
  intent:'join'|'build'|'both';experience:string|null;portfolio_url:string|null;
  available_for_48hfp:boolean;onboarding_complete:boolean;terms_accepted_at?:string|null;
  instagram_url?:string|null;youtube_url?:string|null;vimeo_url?:string|null;
  behance_url?:string|null;dribbble_url?:string|null;website_url?:string|null;
};
export type Crew={id:string;owner_id:string;name:string;description:string;created_at:string};
export type Connection={id:string;requester_id:string;recipient_id:string;status:'pending'|'accepted'|'declined';created_at:string;purpose?:'network'|'project'|'crew'|null;project_id?:string|null;team_name?:string|null;crew_id?:string|null;note?:string|null};
export type Project={id:string;owner_id:string|null;name:string;description:string;kind:'featured'|'member';status:'draft'|'published'|'closed';featured:boolean;team_name_required:boolean;required_roles:string[];starts_on:string|null;ends_on:string|null;created_at:string};
export type Work={id:string;user_id:string;title:string;url:string;platform:string|null;created_at:string};
export function schemaMissing(error:{message?:string;code?:string}|null|undefined){const message=error?.message||'';return error?.code==='42P01'||error?.code==='PGRST205'||/schema cache|does not exist|could not find the/i.test(message)}
export type CrewMember={id:string;crew_id:string;user_id:string;invited_by:string;role:string;status:'invited'|'accepted'|'declined';created_at:string};
export const ROLES=['Producer','General Production','Help With Anything/Runner','Writer','Director','Actor','Actress','DOP','Camera Team','Lighting Team','Grip team','Sound','Wardrobe','Makeup','Editor','Colour','Sound Design'];
export const INTENTS=[{value:'join',title:'Join a team',description:'Meet people who need your skills.'},{value:'build',title:'Build a team',description:'Find creators for a project.'},{value:'both',title:'Open to both',description:'Connect first. Collaborate when you are ready.'}];
export const FEATURED_PROJECT_NAME = '48hr project';
export const OFFICIAL_TEAM_URL = 'https://www.48hourfilm.com/dubai/48hfp';
export function projectTitle(project:{name:string;featured?:boolean|null}){return project.featured ? FEATURED_PROJECT_NAME : project.name}
export function nameOf(p:Pick<Creator,'display_name'|'username'>){return p.display_name?.trim()||p.username}
export function profileReady(p:Partial<Creator>|null){return !!p?.onboarding_complete}
