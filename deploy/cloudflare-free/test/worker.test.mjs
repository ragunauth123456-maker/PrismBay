import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.mjs';

const REPORT_TOKEN = 'r'.repeat(64);
const ADMIN_TOKEN = 'a'.repeat(64);
const envOf = DB => ({ DB, REPORT_TOKEN, ADMIN_TOKEN });
function dbFake() {
  const runs = new Map();
  const tasks = new Map();
  return {
    runs, tasks,
    prepare(sql) {
      let args = [];
      return {
        bind(...values) { args = values; return this; },
        async first() {
          if (sql.startsWith('SELECT 1')) return { healthy: 1 };
          if (sql.includes('COUNT(*)')) return { total: [...tasks.values()].filter(t => t.status === 'pending').length };
          throw Error('Unexpected first SQL');
        },
        async all() {
          if (sql.includes('FROM run_events')) return { results: [...runs.values()].sort((a,b) => b.finished_at.localeCompare(a.finished_at)).slice(0,5) };
          if (sql.includes('FROM task_requests')) return { results: [...tasks.values()].filter(t => t.status === 'pending').map(t => ({ task_id:t.task_id, kind:t.kind,created_at:t.created_at })).slice(0,8) };
          throw Error('Unexpected all SQL');
        },
        async run() {
          if (sql.startsWith('INSERT INTO run_events')) {
            const old = runs.get(args[0]);
            if (!old || args[2] >= old.finished_at)
              runs.set(args[0], { run_id:args[0], status:args[1],finished_at:args[2],products:args[3],catalog_updated_at:args[4] });
            return { meta:{ changes:1 } };
          }
          if (sql.startsWith('INSERT INTO task_requests')) {
            tasks.set(args[0], { task_id:args[0],kind:args[1],status:args[2],created_at:args[3] });
            return { meta:{ changes:1 } };
          }
          if (sql.startsWith('UPDATE task_requests')) {
            const old=tasks.get(args[2]);
            if (!old || old.status !== 'pending') return {meta:{changes:0}};
            tasks.set(args[2], {...old,status:'completed',completed_at:args[0],completed_by_run:args[1]});
            return {meta:{changes:1}};
          }
          throw Error('Unexpected run SQL');
        }
      };
    }
  };
}
const base='https://example.workers.dev';
function request(path, opts={}) { return new Request(base+path, opts); }
const jsonOpts=(token,payload)=>({method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify(payload)});
test('DB must exist before health or status claims success',async()=>{
  const res=await worker.fetch(request('/healthz'),{});
  assert.equal(res.status,503);
  assert.equal((await res.json()).error,'Database not provisioned');
});
test('public health and status expose only coarse telemetry',async()=>{
  const DB=dbFake(), env=envOf(DB);
  assert.equal((await worker.fetch(request('/healthz'),env)).status,200);
  const res=await worker.fetch(request('/v1/status',{headers:{origin:'https://ragunauth123456-maker.github.io'}}),env);
  assert.equal(res.status,200);
  assert.equal(res.headers.get('access-control-allow-origin'),'https://ragunauth123456-maker.github.io');
  assert.equal((await res.json()).lastRun,null);
});
test('run receipts require reporter token, allowlist and idempotent key',async()=>{
  const DB=dbFake(),env=envOf(DB),at='2026-09-26T01:00:00.000Z';
  const input={runId:'36206405788',status:'success',source:'github-actions',finishedAt:at,products:9,catalogUpdatedAt:at};
  assert.equal((await worker.fetch(request('/v1/runs',jsonOpts('wrong',input)),env)).status,401);
  assert.equal((await worker.fetch(request('/v1/runs',jsonOpts(REPORT_TOKEN,{...input,status:'executing'})),env)).status,400);
  assert.equal((await worker.fetch(request('/v1/runs',jsonOpts(REPORT_TOKEN,input)),env)).status,202);
  assert.equal((await worker.fetch(request('/v1/runs',jsonOpts(REPORT_TOKEN,input)),env)).status,202);
  assert.equal(DB.runs.size,1);
  const publicStatus=await (await worker.fetch(request('/v1/status'),env)).json();
  assert.equal(publicStatus.lastRun.products,9);
  assert.equal(publicStatus.lastRun.status,'success');
});
test('task creation rejects unauthorized and unsupported kinds',async()=>{
 const DB=dbFake(),env=envOf(DB);
 assert.equal((await worker.fetch(request('/v1/tasks',jsonOpts(REPORT_TOKEN,{kind:'research_refresh'})),env)).status,401);
 assert.equal((await worker.fetch(request('/v1/tasks',jsonOpts(ADMIN_TOKEN,{kind:'send_emails'})),env)).status,400);
 const created=await worker.fetch(request('/v1/tasks',jsonOpts(ADMIN_TOKEN,{kind:'research_refresh'})),env);
 assert.equal(created.status,201);
 assert.equal(DB.tasks.size,1);
});
test('reporter can view and complete an already-approved task',async()=>{
 const DB=dbFake(),env=envOf(DB);
 const created=await worker.fetch(request('/v1/tasks',jsonOpts(ADMIN_TOKEN,{kind:'health_check'})),env);
 const task=await created.json();
 assert.equal((await worker.fetch(request('/v1/tasks/pending'),env)).status,401);
 const header={authorization:'Bearer '+REPORT_TOKEN};
 const list=await (await worker.fetch(request('/v1/tasks/pending',{headers:header}),env)).json();
 assert.equal(list.tasks[0].task_id,task.taskId);
 const path='/v1/tasks/'+task.taskId+'/complete';
 assert.equal((await worker.fetch(request(path,jsonOpts(REPORT_TOKEN,{runId:'123456'})),env)).status,200);
 assert.equal((await worker.fetch(request(path,jsonOpts(REPORT_TOKEN,{runId:'123456'})),env)).status,404);
 assert.equal((await (await worker.fetch(request('/v1/status'),env)).json()).pendingTasks,0);
});
test('public dashboard loads without exposing credentials or pretending D1 is live',async()=>{
 const page=await worker.fetch(request('/'),{});
 assert.equal(page.status,200);
 assert.match(page.headers.get('content-security-policy'),/script-src 'self'/);
 const html=await page.text();
 assert.match(html,/Cloud operations/);
 assert.doesNotMatch(html,/REPORT_TOKEN|ADMIN_TOKEN/);
 const script=await worker.fetch(request('/status.js'),{});
 assert.equal(script.status,200);
 assert.match(await script.text(),/Not yet active/);
});
