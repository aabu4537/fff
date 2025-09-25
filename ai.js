// Tiny client-side 'AI' (keyword extraction + notes)
function _topKeywords(text, k=10){
  const stop = new Set('a,an,the,and,or,of,to,for,in,on,at,is,are,was,were,be,by,with,as,that,from,into,than,then,this,these,those,which,who,whom,whose,what,when,where,why,how'.split(','));
  const counts = new Map();
  (text.toLowerCase().match(/[a-zA-Z][a-zA-Z\-]{1,}/g) || []).forEach(w => {
    if (stop.has(w)) return;
    counts.set(w, (counts.get(w)||0)+1);
  });
  return [...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,k).map(([w])=>w);
}

async function aiAnalyze(text){
  const keywords = _topKeywords(text, 12);
  const vocab = keywords.map(t => ({ term: t }));
  const sentences = (text||'').split(/(?<=[.!?])\s+/).filter(s => s.length>40).slice(0,6);
  const notes = sentences;
  const tags = keywords.slice(0,5);
  return { vocab, notes, tags };
}
