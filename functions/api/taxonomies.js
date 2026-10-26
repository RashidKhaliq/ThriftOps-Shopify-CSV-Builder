// Cloudflare Pages Function: official Shopify and Google taxonomy catalogs.
const SHOPIFY_URL='https://github.com/Shopify/product-taxonomy/releases/latest/download/categories.en.txt.gz';
const GOOGLE_URL='https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt';
function parseCatalog(text){
 const seen=new Set(),rows=[];
 for(const raw of text.split(/\r?\n/)){
  const line=raw.trim();if(!line||line.startsWith('#'))continue;
  // Shopify: aa-1-2 : Apparel & Accessories > Clothing > ...
  // Google: 1234 - Apparel & Accessories > Clothing > ...
  const m=line.match(/^([\w-]+)\s*[:\-]\s*(.+)$/);
  let id=m?m[1]:'',path=m?m[2].trim():line;
  if(!path.includes('>')&&!/^(Apparel & Accessories|Baby & Toddler|Clothing)/i.test(path))continue;
  if(!/^(Apparel & Accessories|Baby & Toddler|Clothing)/i.test(path))continue;
  if(!seen.has(path)){seen.add(path);rows.push({id,path})}
 }
 return rows.sort((a,b)=>a.path.localeCompare(b.path));
}
async function loadShopify(){
 const r=await fetch(SHOPIFY_URL,{redirect:'follow'});if(!r.ok)throw Error('Shopify HTTP '+r.status);
 const body=r.body.pipeThrough(new DecompressionStream('gzip'));
 const text=await new Response(body).text();return parseCatalog(text);
}
async function loadGoogle(){const r=await fetch(GOOGLE_URL);if(!r.ok)throw Error('Google HTTP '+r.status);return parseCatalog(await r.text())}
export async function onRequestGet(){
 try{
  const [shopify,google]=await Promise.all([loadShopify(),loadGoogle()]);
  if(shopify.length<50||google.length<50)throw Error('Catalog parsing incomplete: Shopify '+shopify.length+', Google '+google.length);
  return new Response(JSON.stringify({shopify,google}),{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff'}});
 }catch(e){return new Response(JSON.stringify({error:e.message}),{status:502,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}})}
}
