const path=require('path'); const {chromium}=require(path.join(process.env.HOME,'Desktop/Apps & Tools/Tasty Website Builder/node_modules/playwright'));
(async()=>{ const b=await chromium.launch();
 const p=await (await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1,locale:'de-CH'})).newPage();
 const fe=[]; p.on('pageerror',e=>fe.push(e.message)); p.on('response',r=>{ if(r.status()>=400) fe.push(r.status()+' '+r.url()); });
 await p.goto('http://localhost:8921/auftakt-varianten-2.html',{waitUntil:'networkidle'}); await p.waitForTimeout(800);
 for(let n=1;n<=15;n++){ await p.evaluate(n=>window.scrollTo(0,document.querySelector('.vfass--'+n).offsetTop),n); await p.waitForTimeout(500);
  await p.screenshot({path:`_varianten/e-${String(n).padStart(2,'0')}.jpg`,type:'jpeg',quality:74}); }
 console.log(JSON.stringify(fe)); await b.close(); })();
