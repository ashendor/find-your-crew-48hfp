export default function TeamCopy({name, description, member}:{name:string; description?:string|null; member?:boolean}){
  return <>
    <strong>{name}</strong>
    {member && <p className="lm-onteam">Already on this team</p>}
    {description ? <p>{description}</p> : null}
  </>;
}
