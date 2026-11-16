// Aufnahmen der Runde 3: node _varianten/schuss3.js [breite hoehe praefix]
const path=require('path'); const {chromium}=require(path.join(process.env.HOME,'Desktop/Apps & Tools/Tasty Website Builder/node_modules/playwright'));
const W=+(process.argv[2]||1440), H=+(process.argv[3]||900), P=process.argv[4]||'r3';
(async()=>{ const b=await chromium.launch(); const fe=[];
 const c=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,locale:'de-CH'});
 for(let n=1;n<=20;n++){ const nn=String(n).padStart(2,'0'); const p=await c.newPage();
  p.on('pageerror',e=>fe.push(nn+' '+e.message)); p.on('response',r=>{ if(r.status()>=400) fe.push(nn+' '+r.status()+' '+r.url()); });
  await p.goto(`http://localhost:8921/auftakt-3/${nn}.html?nomotion`,{waitUntil:'networkidle'}); await p.waitForTimeout(3600);
  const ov=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth); if(ov>0) fe.push(nn+' Ueberlauf '+ov);
  await p.screenshot({path:`_varianten/${P}-${nn}.jpg`,type:'jpeg',quality:78}); await p.close(); }
 console.log(JSON.stringify(fe)); await b.close(); })();
