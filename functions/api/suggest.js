// Optional unofficial Google Autocomplete proxy. No promise of availability or search volume.
export async function onRequestGet({request}) {
  const q=new URL(request.url).searchParams.get('q')?.trim()||'';
  if(q.length<2||q.length>100)return Response.json({error:'Query length must be 2–100'}, {status:400});
  try{
    const url='https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=pk&q='+encodeURIComponent(q);
    const upstream=await fetch(url,{headers:{Accept:'application/json'}});
    if(!upstream.ok)throw Error('Upstream '+upstream.status);
    const data=await upstream.json();
    const suggestions=Array.isArray(data[1])?data[1].filter(x=>typeof x==='string').slice(0,12):[];
    return Response.json({query:q,suggestions},{headers:{'Cache-Control':'public, max-age=3600'}});
  }catch(e){return Response.json({error:'Suggestions unavailable',detail:String(e.message)}, {status:502})}
}
