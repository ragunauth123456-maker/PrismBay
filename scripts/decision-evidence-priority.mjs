import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

async function readJson(path, fallback={}) { try { return JSON.parse(await fs.readFile(path,'utf8')); } catch { return fallback; } }

const LEVERAGE = {
  final_zip_freight: 100,
  checkout: 95,
  variant_stock: 90,
  supplier_identity: 90,
  freight_estimate: 85,
  margin: 85,
  media_rights: 75,
  attribution: 70,
  instrumentation: 70,
  offer: 55,
  creative: 45,
  seo: 40
};

function norm(value='') { return String(value).toLowerCase().replaceAll('-','_').replaceAll(' ','_'); }
function leverage(text='') {
  const t=norm(text);
  for (const [key,value] of Object.entries(LEVERAGE)) if (t.includes(key)) return value;
  if (t.includes('stock')) return 90;
  if (t.includes('supplier')) return 88;
  if (t.includes('freight')) return 85;
  if (t.includes('checkout')) return 95;
  if (t.includes('rights')) return 75;
  if (t.includes('measurement')||t.includes('metric')) return 70;
  return 35;
}

export function buildEvidencePriority({growthBoard,evidenceLedger,tournament}) {
  const rows=[];
  for (const product of growthBoard.productRace||[]) {
    for (const gap of product.missing||[]) rows.push({
      source:'product-race',
      owner: product.lane==='primary'?'supplier-fulfillment':'product-intelligence',
      subject:product.slug,
      evidence:String(gap),
      decisionLeverage:leverage(gap),
      reason:'Closing this evidence gap can change product commercial readiness or resource allocation.'
    });
  }
  for (const item of evidenceLedger.items||[]) rows.push({
    source:'kpi-evidence-debt', owner:item.companyId, subject:item.companyId, evidence:item.evidenceGap,
    decisionLeverage:leverage(item.evidenceGap), reason:'Missing KPI evidence prevents the controller from distinguishing performance from activity.'
  });
  for (const h of tournament.hypothesisLedger||[]) rows.push({
    source:'hypothesis', owner:h.owner, subject:h.id, evidence:h.evidenceGate,
    decisionLeverage:leverage(h.evidenceGate), reason:'This evidence is required before the hypothesis can be activated or judged.'
  });
  const seen=new Set();
  const ranked=rows.filter(row=>{
    const key=`${row.owner}|${row.subject}|${row.evidence}`;
    if(seen.has(key)) return false; seen.add(key); return true;
  }).sort((a,b)=>b.decisionLeverage-a.decisionLeverage).map((row,index)=>({...row,priority:index+1}));
  return {
    schemaVersion:1,
    generatedAt:new Date().toISOString(),
    principle:'Collect evidence that can change a commercial decision before collecting low-leverage information.',
    topDecisionEvidence:ranked.slice(0,20),
    immediateTopFive:ranked.slice(0,5),
    rule:'Priority is decision leverage, not certainty. No missing fact may be invented to close an evidence item.'
  };
}

export async function main(){
  const board=buildEvidencePriority({
    growthBoard:await readJson('growth-reports/ceo-autonomous-growth-board.json'),
    evidenceLedger:await readJson('growth-reports/evidence-debt-ledger.json'),
    tournament:await readJson('growth-reports/ceo-commercial-tournament.json')
  });
  await fs.mkdir('growth-reports',{recursive:true});
  await fs.writeFile('growth-reports/decision-evidence-priority.json',JSON.stringify(board,null,2)+'\n');
  console.log(JSON.stringify({topFive:board.immediateTopFive.map(x=>({owner:x.owner,subject:x.subject,evidence:x.evidence,decisionLeverage:x.decisionLeverage}))},null,2));
  return board;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) await main();
