const path=require('path'); const {chromium,webkit}=require(path.join(process.env.HOME,'Desktop/Apps & Tools/Tasty Website Builder/node_modules/playwright'));
(async()=>{ for(const [eng,nm] of [[chromium,'c'],[webkit,'w']]){ const b=await eng.launch();
 for(const [w,h,t] of [[1440,900,'d'],[390,844,'m']]){ const p=await (await b.newContext({viewport:{width:w,height:h},locale:'de-CH'})).newPage();
  const fe=[]; p.on('pageerror',e=>fe.push(e.message));
  await p.goto('http://localhost:8921/index.html',{waitUntil:'networkidle'}); await p.waitForTimeout(5200);
  const sw=await p.evaluate(()=>document.documentElement.scrollWidth);
  await p.screenshot({path:`_varianten/start-${nm}-${t}.jpg`,type:'jpeg',quality:75}); console.log(nm,t,'sw',sw,'fehler',fe.length); }
 await b.close(); } })();
