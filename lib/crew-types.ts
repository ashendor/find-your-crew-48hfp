export type Creator = {
  id:string;username:string;display_name:string;headline:string|null;bio:string|null;
  location:string|null;avatar_url:string|null;categories:string[];skills_tags:string[];
  looking_for:string[];available_for_collaboration:boolean;primary_role:string|null;
  intent:'join'|'build'|'both';experience:string|null;portfolio_url:string|null;
  available_for_48hfp:boolean;onboarding_complete:boolean;
};
export type Crew={id:string;owner_id:string;name:string;description:string;created_at:string};
export type Connection={id:string;requester_id:string;recipient_id:string;status:'pending'|'accepted'|'declined';created_at:string};
export type CrewMember={id:string;crew_id:string;user_id:string;invited_by:string;role:string;status:'invited'|'accepted'|'declined';created_at:string};
export const ROLES=['Director','Producer','Writer','Actor','Cinematographer','Camera','Editor','Sound','Composer','Production Design','Lighting','Other'];
export const INTENTS=[{value:'join',title:'Join a crew',description:'Meet teams who need your skills.'},{value:'build',title:'Build a crew',description:'Find creators for your next film.'},{value:'both',title:'Open to both',description:'Explore all the possibilities.'}];
export function nameOf(p:Pick<Creator,'display_name'|'username'>){return p.display_name?.trim()||p.username}
export function profileReady(p:Partial<Creator>|null){return !!p?.onboarding_complete}
