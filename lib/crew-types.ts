export type Creator = {
  id:string;username:string;display_name:string;headline:string|null;bio:string|null;
  location:string|null;avatar_url:string|null;categories:string[];skills_tags:string[];
  looking_for:string[];available_for_collaboration:boolean;primary_role:string|null;
  intent:'join'|'build'|'both';experience:string|null;portfolio_url:string|null;
  available_for_48hfp:boolean;onboarding_complete:boolean;
  instagram_url?:string|null;youtube_url?:string|null;vimeo_url?:string|null;
  behance_url?:string|null;dribbble_url?:string|null;website_url?:string|null;
};
export type Crew={id:string;owner_id:string;name:string;description:string;created_at:string};
export type Connection={id:string;requester_id:string;recipient_id:string;status:'pending'|'accepted'|'declined';created_at:string;purpose?:'network'|'project'|'crew'|null;project_id?:string|null;team_name?:string|null;crew_id?:string|null;note?:string|null};
export type Project={id:string;owner_id:string|null;name:string;description:string;kind:'featured'|'member';status:'draft'|'published'|'closed';featured:boolean;team_name_required:boolean;required_roles:string[];starts_on:string|null;ends_on:string|null;created_at:string};
export type Work={id:string;user_id:string;title:string;url:string;platform:string|null;created_at:string};
export function schemaMissing(error:{message?:string;code?:string}|null|undefined){const message=error?.message||'';return error?.code==='42P01'||error?.code==='PGRST205'||/schema cache|does not exist|could not find the/i.test(message)}
export type CrewMember={id:string;crew_id:string;user_id:string;invited_by:string;role:string;status:'invited'|'accepted'|'declined';created_at:string};
export const ROLES=['Director','Producer','Writer','Actor','Cinematographer','Camera','Editor','Sound','Composer','Production Design','Lighting','Other'];
export const INTENTS=[{value:'join',title:'Join a crew',description:'Meet teams who need your skills.'},{value:'build',title:'Build a crew',description:'Find creators for your next film.'},{value:'both',title:'Open to both',description:'Explore all the possibilities.'}];
export function nameOf(p:Pick<Creator,'display_name'|'username'>){return p.display_name?.trim()||p.username}
export function profileReady(p:Partial<Creator>|null){return !!p?.onboarding_complete}
