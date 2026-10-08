// Cloudflare Pages Function: same-origin proxy for published Google Sheet CSV.
const SOURCES = [
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ9bXevLFb34ANvltWXeUZoHrCfRXrzTq-7Nq5fy2jLDE54-fbUZFstVYUIch3vCfHc8zK027aO6YGD/pub?gid=0&single=true&output=csv',
  'https://docs.google.com/spreadsheets/d/13AvQFzdzIf7zJtUAiM3yXjJi6vivKPd1UgBzGM2dN6g/export?format=csv&gid=0'
];
function parseCSV(text){
 const rows=[];let row=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(c==='"') {if(quoted&&text[i+1]==='"'){cell+='"';i++}else quoted=!quoted}
  else if(c===','&&!quoted){row.push(cell);cell=''}
  else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell=''}
  else cell+=c;
 }
 if(cell||row.length){row.push(cell);rows.push(row)}
 const rawHeaders=rows.shift()||[];
 // Papa Parse previously renames repeated headings to _1, _2; retain compatibility.
 const counts={};const headers=rawHeaders.map(h=>{h=h.replace(/^\uFEFF/,'').trim();const n=counts[h]||0;counts[h]=n+1;return n?`${h}_${n}`:h});
 return rows.filter(r=>r.some(x=>x.trim())).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]||''])));
}
export async function onRequestGet(){
 let error='';
 for(const url of SOURCES){
  try{
   const res=await fetch(url,{headers:{'Accept':'text/csv,text/plain;q=0.9,*/*;q=0.1'},redirect:'follow',cf:{cacheTtl:0}});
   if(!res.ok)throw Error('upstream HTTP '+res.status);
   const csv=await res.text();
   if(/^\s*<!doctype html|^\s*<html/i.test(csv))throw Error('Google returned HTML instead of CSV');
   const rows=parseCSV(csv);
   if(!rows.some(r=>r.Code&&(r['Category Types']||r['Category Type']||r['New Types'])))throw Error('Missing Code / Category Types');
   return new Response(JSON.stringify({rows,updated:new Date().toISOString(),source:'Google Sheet'}),{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  }catch(e){error+=e.message+'; '}
 }
 return new Response('Google Sheet unavailable: '+error,{status:502,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}});
}
