const CHANNEL='UCw2hs85TzIpdKwJtG-BSxzQ';
const BLOCK=[/prismbay\s*clean/i,/spin\s*scrubber/i,/cordless\s*pressure\s*washer/i,/garment\s*steamer/i,/home\s*cleaning/i,/(?:\/scrubber\/|utm_campaign=prismbay_clean)/i];
function classify(post){
  const data=post.youtubeData||{};
  const text=[post.text||'',data.title||'',...(data.tags||[])].join(' ');
  if(post.providers?.some(x=>x.network==='youtube')!==true)return {ok:true,reason:'not-youtube'};
  if(BLOCK.some(x=>x.test(text)))return {ok:false,reason:'retail-content-in-ai-channel'};
  if(!/(?:\bAI\b|artificial intelligence|automation|agent|LLM|vendor risk|procurement)/i.test(text))return {ok:false,reason:'unverified-editorial-fit'};
  return {ok:true,reason:'ai-editorial-fit'};
}
function audit(posts,channel=CHANNEL){
  const issues=[];
  if(channel!==CHANNEL)issues.push({reason:'wrong-channel',channel});
  const upcoming=posts.filter(p=>p.providers?.some(x=>x.network==='youtube')&&p.autoPublish&&!p.draft)
    .map(p=>({...p,when:Date.parse(p.publicationDate.dateTime+(p.publicationDate.timezone==='America/Guyana'?'-04:00':'Z'))})).sort((a,b)=>a.when-b.when);
  for(const p of upcoming){const c=classify(p);if(!c.ok)issues.push({id:p.id,reason:c.reason});}
  for(let i=1;i<upcoming.length;i++)if(upcoming[i].when-upcoming[i-1].when<4*3600000)
    issues.push({id:upcoming[i].id,reason:'spacing-under-four-hours',previous:upcoming[i-1].id});
  const ids=new Set();for(const p of upcoming){
    const key=[channel,p.media?.[0],p.youtubeData?.title].join('|');
    if(ids.has(key))issues.push({id:p.id,reason:'duplicate-creative'});ids.add(key);
  }
  return {channel,count:upcoming.length,issues};
}
export {CHANNEL,classify,audit};
