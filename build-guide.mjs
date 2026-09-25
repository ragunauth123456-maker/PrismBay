import fs from 'node:fs';
const md = fs.readFileSync(new URL('./risk-matrix.md', import.meta.url), 'utf8');
const escape = s => s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const format = text => escape(text)
  .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
  .replace(/\[([^\]]+)\]\((https:\/\/[^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
const lines=md.split(/\r?\n/);
const out=[];
for (let i=0;i<lines.length;i++){
 const l=lines[i].trim();
 if(!l){continue;}
 if(/^---+$/.test(l)){out.push('<hr>');continue;}
 if(l.startsWith('|')){
  const group=[];while(i<lines.length&&lines[i].trim().startsWith('|')){group.push(lines[i++].trim());}i--;
  const cols = s => s.slice(1,-1).split('|').map(x=>x.trim());
  const valid=group.filter(g=>!/^\|(?:\s*:?-+:?\s*\|)+$/.test(g));
  out.push('<div class="scroll"><table><thead><tr>'+cols(valid[0]).map(c=>'<th scope="col">'+format(c)+'</th>').join('')+'</tr></thead><tbody>'+
   valid.slice(1).map(row=>'<tr>'+cols(row).map(c=>'<td>'+format(c||'&nbsp;')+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>');
  continue;
 }
 if(l.startsWith('# '))out.push('<h1>'+format(l.slice(2))+'</h1>');
 else if(l.startsWith('## '))out.push('<h2>'+format(l.slice(3))+'</h2>');
 else out.push('<p>'+format(l)+'</p>');
}
const page=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Free AI Vendor Risk Matrix Worksheet | PrismBay AI</title>
<meta name="description" content="An original, free 10-question AI vendor evidence checklist with a fictional worked example, score interpretation and 30-day decision plan.">
<meta property="og:type" content="article"><meta property="og:title" content="Free AI Vendor Risk Matrix | PrismBay AI"><meta property="og:image" content="https://ragunauth123456-maker.github.io/PrismBay/og-card.png">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="https://ragunauth123456-maker.github.io/PrismBay/og-card.png">
<link rel="canonical" href="https://ragunauth123456-maker.github.io/PrismBay/guide.html">
<style>
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#172b42;background:#eef4f9}*{box-sizing:border-box}body{margin:0}a{color:#046c62}a:focus-visible{outline:3px solid #087d70;outline-offset:3px}
header{background:#0b1325;color:#eaf4fa;padding:20px 24px}header nav{max-width:1020px;margin:auto;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap}header strong{font-size:23px}header strong span{color:#67e8ce}header a{color:#bafbed}main{max-width:1020px;margin:26px auto 70px;background:white;border:1px solid #d2dfeb;border-radius:20px;padding:40px 45px;box-shadow:0 12px 45px #10273c14}h1{font-size:clamp(33px,5vw,49px);line-height:1.13;letter-spacing:-.045em;margin:18px 0 30px;color:#132a42}h2{font-size:clamp(23px,3vw,32px);line-height:1.2;letter-spacing:-.03em;color:#0b5e61;margin:44px 0 15px}p{line-height:1.82;color:#445569;font-size:16px;margin:14px 0}p strong{color:#122f45}hr{border:0;border-top:1px solid #d7e6ef;margin:36px 0}.scroll{overflow:auto;border-radius:12px;border:1px solid #d1dce7;margin:24px 0}table{width:100%;border-collapse:collapse;min-width:740px;font-size:14px}th{background:#143047;color:#e2fff7;text-align:left}th,td{padding:15px 12px;border-bottom:1px solid #d6e2eb;line-height:1.55;vertical-align:top}tr:nth-child(2n){background:#f3f8fa}.actions{display:flex;flex-wrap:wrap;gap:12px}.button{display:inline-block;text-decoration:none;background:#036e66;color:#fff;border-radius:9px;font-weight:800;padding:13px 18px}.button.secondary{background:#e0f5ef;color:#075953}.band{background:#ecfaf6;border-left:4px solid #0a8973;padding:19px 22px;margin:36px 0}.band p{margin:9px 0}.support{border-top:1px solid #dae6eb;padding-top:25px;margin-top:40px;color:#506073}.support p{font-size:14px}.support a.btn{display:inline-block;background:#0a7165;color:white;text-decoration:none;padding:12px 17px;border-radius:9px;font-weight:800}
@media(max-width:740px){main{margin:0;padding:23px 19px;border-radius:0}header nav{gap:12px}}
@media print{body{background:white}main{border:none;box-shadow:none;margin:0;padding:5px}header,.actions,.support{display:none}table{font-size:10px}th,td{padding:7px 8px}h2{page-break-after:avoid}}
</style></head><body><header><nav><strong>PrismBay<span> AI</span></strong><div class="actions"><a href="./">← Overview</a><a href="./risk-matrix.md" download>Editable Markdown ↓</a><a href="javascript:window.print()">Print / Save PDF</a></div></nav></header>
<main><p style="text-transform:uppercase;color:#067969;letter-spacing:.15em;font-size:12px;font-weight:850">Original free learning resource · No sign-in or payment</p>
${out.join('\n')}
<div class="band"><strong>Keep the worksheet free.</strong><p>Anyone can copy, print or share this original educational resource. No account or credit card is required.</p>
<div class="actions"><a class="button" href="./scorecard.html">Try the interactive evidence review</a><a class="button secondary" href="./risk-matrix.md" download>Download editable version</a><a class="button secondary" href="./">Watch the short explainer</a></div></div>
<div class="support"><h2 style="margin:12px 0">Support more free research, optionally</h2><p>If the guide was useful, you can choose a one-time amount from $3 to $100 USD via Stripe. There is no extra content behind payment and no subscription. This is voluntary commercial support through Studysmartz LLC, not a charitable donation.</p><a class="btn" href="https://buy.stripe.com/aFa3cw0jweEMfCn2xs2400H" target="_blank" rel="noopener noreferrer">Optional one-time support ↗</a></div>
</main></body></html>`;
fs.writeFileSync(new URL('./guide.html',import.meta.url),page);console.log('Generated guide.html, '+page.length+' bytes, '+out.length+' content sections');
