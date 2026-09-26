// An optional adapter for the existing six-hour PrismBay GitHub job.
// Never publishes social posts, sends email, orders products or processes payments.
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const QUEUE_PATH = 'growth-reports/cloudflare-pending-tasks.json';
const KINDS = new Set(['research_refresh','health_check']);
export function settings(env=process.env) {
  const endpoint = env.PRISMBAY_CF_ENDPOINT;
  const token = env.PRISMBAY_CF_REPORT_TOKEN;
  if (!endpoint && !token) return null;
  if (!endpoint || !token) throw Error('Cloudflare endpoint and reporter token must both be configured.');
  const url = new URL(endpoint);
  if (url.protocol !== 'https:' || !url.hostname.endsWith('.workers.dev') ||
      url.username || url.password || (url.pathname !== '/' && url.pathname !== ''))
    throw Error('Only a HTTPS Cloudflare workers.dev base URL is accepted.');
  if (token.length < 32) throw Error('Cloudflare reporter token is too short.');
  return { base: url.origin, token };
}
async function getJson(fetchFn,url,opts) {
  const response=await fetchFn(url,{...opts,signal:AbortSignal.timeout(12000)});
  if (!response.ok) throw Error('Cloudflare returned HTTP '+response.status);
  return response.json();
}
export async function sync(mode,{env=process.env,fetchFn=fetch,now=new Date()}={}) {
  const conf=settings(env);
  if (!conf) {
    if(mode==='poll') await fs.writeFile(QUEUE_PATH,'[]\n');
    return { configured:false, reason:'Cloudflare credentials not connected; GitHub workers remain operational.' };
  }
  const headers={authorization:'Bearer '+conf.token};
  if(mode==='poll') {
    const result=await getJson(fetchFn,conf.base+'/v1/tasks/pending',{headers});
    const tasks=(result.tasks||[]).filter(t=>KINDS.has(t.kind)&&/^[a-f0-9-]{36}$/.test(t.task_id))
      .map(t=>({taskId:t.task_id,kind:t.kind}));
    await fs.writeFile(QUEUE_PATH,JSON.stringify(tasks,null,2)+'\n');
    return { configured:true,queued:tasks.length };
  }
  if(mode==='complete') {
    const tasks=JSON.parse(await fs.readFile(QUEUE_PATH,'utf8').catch(()=>'[]'));
    const runId=String(env.GITHUB_RUN_ID||'');
    if(!/^[1-9][0-9]{0,16}$/.test(runId)) throw Error('Missing GitHub run ID');
    for(const task of tasks) {
      await getJson(fetchFn,conf.base+'/v1/tasks/'+task.taskId+'/complete',
        {method:'POST',headers:{...headers,'content-type':'application/json'},
        body:JSON.stringify({runId})});
    }
    return { configured:true,completed:tasks.length };
  }
  if(mode==='report') {
    const runId=String(env.GITHUB_RUN_ID||'');
    if(!/^[1-9][0-9]{0,16}$/.test(runId)) throw Error('Missing GitHub run ID');
    const status=env.PRISMBAY_RUN_STATUS;
    if(!['success','failure','cancelled'].includes(status)) throw Error('Invalid GitHub job status');
    let catalog={};
    try {catalog=JSON.parse(await fs.readFile('public/viral-catalog.json','utf8'));}catch{}
    const report={runId,source:'github-actions',status,finishedAt:now.toISOString(),
      products:Array.isArray(catalog.products)?catalog.products.length:0,
      catalogUpdatedAt:Number.isFinite(Date.parse(catalog.updatedAt))?new Date(catalog.updatedAt).toISOString():null};
    const response=await getJson(fetchFn,conf.base+'/v1/runs',{method:'POST',
      headers:{...headers,'content-type':'application/json'},body:JSON.stringify(report)});
    return {configured:true,accepted:response.accepted,runId};
  }
  throw Error('Unsupported mode. Use poll, complete or report.');
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  sync(process.argv[2]).then(result=>console.log(JSON.stringify(result))).catch(error=>{
    console.error('CLOUDFLARE_SYNC_FAILED',error.message);
    process.exitCode=1;
  });
}
