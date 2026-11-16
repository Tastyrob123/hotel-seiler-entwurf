const pw = require('/Users/robertreff/Desktop/Apps & Tools/Tasty Website Builder/node_modules/playwright-core');
const W = { 
 laeden: { l: ['#f1ede3','#f5f2ea','#ece7da','#e4ddcc','#dcd4c0'], d: ['#3a5142','#1c2a22'], ht: '#1f2e25', ha: '#b04a3c', hz: '#2f4537', da: '#e3cf9e', k1: '#3a5142', k2: '#22332a' },
 rouge:  { l: ['#f2ebe3','#f6f0e9','#eee5da','#e7dccf','#dfd1c2'], d: ['#6a3430','#2b1513'], ht: '#3a1d1a', ha: '#9c564d', hz: '#592a26', da: '#e7c9a6', k1: '#7a3b35', k2: '#4a211d' },
 storen: { l: ['#f1e7cf','#f5edd9','#efe2c4','#e8d6ad','#dcc597'], d: ['#5a3d26','#2c1e14'], ht: '#3b2a1b', ha: '#a07c3f', hz: '#4d3421', da: '#e1c580', k1: '#6b4a2e', k2: '#3e2816' },
 abend:  { l: ['#ebe7e0','#f0ede7','#e6e2da','#ddd8cf','#d4cec3'], d: ['#4a4c50','#171d22'], ht: '#22272c', ha: '#8c7a5c', hz: '#2c3238', da: '#dac7aa', k1: '#3d4247', k2: '#1f2428' },
};
const css = p => `
.tl-licht i:nth-child(1){background-color:${p.l[0]}!important}.tl-licht i:nth-child(2){background-color:${p.l[1]}!important}.tl-licht i:nth-child(3){background-color:${p.l[2]}!important}
.tl-licht i:nth-child(4){background-color:${p.l[3]}!important}.tl-licht i:nth-child(5){background-color:${p.l[4]}!important}.tl-licht i:nth-child(6){background-color:${p.d[0]}!important}.tl-licht i:nth-child(7){background-color:${p.d[1]}!important}
.tl-tag{--tw-a:${p.da}!important;--tw-z:${p.da}!important;background:${p.d[1]}!important}
.tl-tag.tw-hell{--tw-t:${p.ht}!important;--tw-a:${p.ha}!important;--tw-z:${p.hz}!important}
#tag .kn{--ko:${p.k1}!important;--ku:${p.k2}!important;--t:${p.ht}!important}
#tag .kn--linie{--o:${p.k1}!important;--m:${p.k2}!important;--u:${p.k2}!important;--t:#fff!important}
#tag .tw__pf{color:${p.ht}!important}
*{transition:none!important}`;
(async () => {
  const br = await pw.chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--hide-scrollbars'] });
  const p = await (await br.newContext({ viewport: { width: 1512, height: 945 } })).newPage();
  await p.goto('http://localhost:8921/index.html?w=' + Date.now(), { waitUntil: 'load' }); await p.waitForTimeout(1000);
  const top = await p.evaluate(() => document.querySelector('#tag').getBoundingClientRect().top + scrollY);
  for (let y = top - 945; y <= top; y += 140) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(50); }
  await p.waitForTimeout(2500);
  for (const [name, pal] of Object.entries(W)) {
    const h = await p.addStyleTag({ content: css(pal) });
    for (const [j, tag] of [[0, 'morgen'], [4, 'abend'], [5, 'nacht']]) {
      await p.evaluate(j => document.querySelectorAll('.tw__h')[j].click(), j); await p.waitForTimeout(1700);
      await (await p.$('#tag')).screenshot({ path: `${__dirname}/welt-${name}-${tag}.png` });
    }
    await p.evaluate(() => document.querySelectorAll('.tw__h')[0].click()); await p.waitForTimeout(1500);
    await h.evaluate(n => n.remove());
  }
  await br.close();
})();
