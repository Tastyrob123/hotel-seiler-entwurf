/* Tapeten-Kacheln aus den SVG rechnen (headless, 2-fach). node _varianten/tapeten_raster.js */
const pw = require('/Users/robertreff/Desktop/Apps & Tools/Tasty Website Builder/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, process.argv[2] || 'tapeten');
const liste = JSON.parse(fs.readFileSync(path.join(DIR, 'liste.json'), 'utf8'));
(async () => {
  const browser = await pw.chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--no-first-run', '--no-default-browser-check'] });
  for (const t of liste) for (const art of ['hell', 'dunkel']) {
    const nn = String(t.n).padStart(2, '0');
    const ctx = await browser.newContext({ viewport: { width: t.w, height: t.h }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    const svg = fs.readFileSync(path.join(DIR, `${nn}-${art}.svg`), 'utf8');
    await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
    await page.screenshot({ path: path.join(DIR, `${nn}-${art}.png`), clip: { x: 0, y: 0, width: t.w, height: t.h } });
    await ctx.close();
  }
  await browser.close();
})();
