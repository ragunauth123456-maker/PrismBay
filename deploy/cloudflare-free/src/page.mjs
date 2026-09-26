// Public, read-only interface: never embed API tokens or private K1 data.
export const PAGE = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>PrismBay Free Cloud Control</title><style>
:root{font:16px system-ui,-apple-system,Segoe UI,sans-serif;background:#0b1426;color:#edf5ff}
body{margin:0;padding:24px}main{max-width:900px;margin:7vh auto}
a{color:#73ebd2}h1{font-size:clamp(32px,5vw,58px);letter-spacing:-.04em;margin:10px 0}
small,p{color:#bdcee0}.label{color:#73ebd2;text-transform:uppercase;letter-spacing:.14em;font-size:12px;font-weight:800}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:16px;margin:34px 0}
article{background:#172a40;border:1px solid #3a556d;border-radius:16px;padding:22px}
strong{display:block;font-size:22px;color:white;margin:13px 0;overflow-wrap:anywhere}
footer{border-top:1px solid #385268;padding-top:23px;margin-top:40px;line-height:1.65}
</style></head><body><main><p class="label">PrismBay · Free Cloud</p>
<h1>Cloud operations</h1><p>Public status of scheduled GitHub workers and the private D1 status database.</p>
<section class="grid" aria-label="Operational status">
<article><span class="label">Cloudflare database</span><strong id="db" aria-live="polite">Checking...</strong></article>
<article><span class="label">GitHub cloud worker</span><strong id="last-run">Checking...</strong><small id="last-time"></small></article>
<article><span class="label">Approved task queue</span><strong id="pending">Checking...</strong></article>
</section><p><a href="https://ragunauth123456-maker.github.io/PrismBay/cloud-status.html">Existing PrismBay dashboard</a></p>
<footer><small>Read-only public telemetry. The administrator's queue and report endpoints require separate tokens.
Cloudflare Workers are request-driven; local K1 n8n remains on K1.</small></footer>
</main><script src="/status.js" defer></script></body></html>`;
export const SCRIPT = `
const text=(id,value)=>{document.getElementById(id).textContent=value;};
fetch('/v1/status',{cache:'no-store'})
.then(response=>response.ok?response.json():Promise.reject(Error('No D1 connection')))
.then(status=>{
  text('db','Connected');
  text('last-run',status.lastRun?status.lastRun.status:'Awaiting first report');
  text('last-time',status.lastRun?new Date(status.lastRun.finishedAt).toLocaleString():'GitHub connection activates after owner authorization.');
  text('pending',String(status.pendingTasks));
})
.catch(()=>{text('db','Not yet active');text('last-run','GitHub remains available');text('pending','Unavailable');});
`;
