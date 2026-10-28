// Cloudflare Pages Function: current official Shopify + Google product taxonomies.
// Shopify release ships compressed categories.en.txt.gz; plain-text fallback avoids 502 when release assets blocked.
const SHOPIFY_SOURCES=[
 'https://github.com/Shopify/product-taxonomy/releases/latest/download/categories.en.txt.gz',
 'https://raw.githubusercontent.com/Shopify/product-taxonomy/main/dist/en/categories.txt'
];
const GOOGLE_URL='https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt';
function parseCatalog(text,kind){
 const rows=[],seen=new Set();
 for(const raw of text.split(/\r?\n/)){
  const line=raw.trim();if(!line||line.startsWith('#'))continue;
  const split=kind==='shopify'?line.match(/^(gid:\/\/shopify\/TaxonomyCategory\/[^\s:]+)\s*:\s*(.+)$/):line.match(/^(\d+)\s+-\s+(.+)$/);
  if(!split)continue;
  const id=split[1],path=split[2].trim();
  // ThriftOps handles clothing only. Keep every subtree under Apparel > Clothing.
  if(!(path.startsWith('Apparel & Accessories > Clothing')||path==='Apparel & Accessories > Clothing'||path.startsWith('Apparel & Accessories > Clothing Accessories')||path.startsWith('Apparel & Accessories > Costumes & Accessories')))continue;
  if(!seen.has(path)){seen.add(path);rows.push({id,path})}
 }
 return rows.sort((a,b)=>a.path.localeCompare(b.path));
}
async function sourceText(url){
 const res=await fetch(url,{redirect:'follow',headers:{Accept:'text/plain,application/gzip,application/octet-stream;q=0.8,*/*;q=0.2'}});
 if(!res.ok)throw Error('HTTP '+res.status+' from '+new URL(url).hostname);
 let response=res;
 if(url.endsWith('.gz')){
  if(typeof DecompressionStream!=='function')throw Error('gzip decompression unavailable');
  response=new Response(res.body.pipeThrough(new DecompressionStream('gzip')));
 }
 const text=await response.text();if(text.trimStart().startsWith('<'))throw Error('HTML returned instead of taxonomy');return text;
}
async function shopifyTaxonomy(){let errors=[];for(const url of SHOPIFY_SOURCES){try{const rows=parseCatalog(await sourceText(url),'shopify');if(rows.length<25)throw Error('Only '+rows.length+' clothing categories parsed');return rows}catch(e){errors.push(e.message)}}throw Error('Shopify: '+errors.join('; '))}
async function googleTaxonomy(){const rows=parseCatalog(await sourceText(GOOGLE_URL),'google');if(rows.length<25)throw Error('Google: only '+rows.length+' clothing categories parsed');return rows}
export async function onRequestGet(){
 const [sr,gr]=await Promise.allSettled([shopifyTaxonomy(),googleTaxonomy()]);
 const shopify=sr.status==='fulfilled'?sr.value:[],google=gr.status==='fulfilled'?gr.value:[];
 const warnings=[];if(sr.status==='rejected')warnings.push(String(sr.reason.message));if(gr.status==='rejected')warnings.push(String(gr.reason.message));
 if(!shopify.length&&!google.length)return Response.json({error:warnings.join(' | ')},{status:502,headers:{'Cache-Control':'no-store'}});
 return Response.json({shopify,google,warnings},{headers:{'Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff'}});
}
