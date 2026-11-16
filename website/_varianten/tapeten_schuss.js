/* Jede Tapete im echten Abschnitt «Ein Tag am See» und auf «Angebote» (headless). node _varianten/tapeten_schuss.js */
const pw = require('/Users/robertreff/Desktop/Apps & Tools/Tasty Website Builder/node_modules/playwright-core');
const path = require('path'), OUT = path.join(__dirname, process.argv[2]||'tapeten');
(async () => {
  const b = await pw.chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--no-first-run','--hide-scrollbars'] });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage(); const fehler = [];
  p.on('pageerror', e => fehler.push(e.message));
  await p.goto('http://localhost:8921/'+(process.argv[3]||'tapete-varianten.html')+'#n=1', { waitUntil: 'load' });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: path.join(OUT, 'vergleich.jpg'), quality: 80 });
  for (let n = 1; n <= (+process.argv[4]||10); n++) {
    await p.click(`.tk[data-n="${n}"]`); await p.waitForTimeout(500);
    for (const z of (process.argv[5]||'tag,angebote').split(',')) {
      await p.click(`.wahl button[data-z="${z}"]`); await p.waitForTimeout(1800);
      const fr = await (await p.$('#f')).screenshot({ type: 'jpeg', quality: 78, path: path.join(OUT, `s-${String(n).padStart(2,'0')}-${z}.jpg`) });
    }
  }
  console.log('Fehler:', fehler.length ? fehler : 'keine');
  await b.close();
})();
