// Je Fassung ein Bild bei 1440x900 und 390x844. node _varianten/schuss.js
const path=require('path'); const {chromium}=require(path.join(process.env.HOME,'Desktop/Apps & Tools/Tasty Website Builder/node_modules/playwright'));
(async()=>{ const b=await chromium.launch();
 for(const [w,h,tag] of [[1440,900,'d'],[390,844,'m']]){
  const p=await (await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:1,locale:'de-CH'})).newPage();
  await p.goto('http://localhost:8921/auftakt-varianten.html',{waitUntil:'networkidle'}); await p.waitForTimeout(600);
  const sw=await p.evaluate(()=>document.documentElement.scrollWidth); console.log(tag,'scrollWidth',sw);
  for(let n=1;n<=15;n++){ const s=await p.$(`.vfass--${n}`); await s.scrollIntoViewIfNeeded(); await p.evaluate(n=>window.scrollTo(0,document.querySelector('.vfass--'+n).offsetTop),n); await p.waitForTimeout(150);
   await p.screenshot({path:`_varianten/${tag}-${String(n).padStart(2,'0')}.jpg`,type:'jpeg',quality:72}); }
 }
 await b.close(); })();
