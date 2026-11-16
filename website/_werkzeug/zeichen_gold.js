/* Das S-Siegel des Hauses in Gold mit Relief (wie das BR-Zeichen im Auftakt des Grand Beau-Rivage): Goldverlauf, ausgeschnitten mit dem
   Zeichen, Lichtkante oben links, Schattenkante unten rechts, alles im SVG; Aufnahme kopflos als PNG mit durchsichtigem Grund → WebP.
   Aufruf: node _werkzeug/zeichen_gold.js  → assets/logo/zeichen-gold.webp (800 px) */
const path = require('path'), fs = require('fs');
const pw = require(path.join(process.env.HOME, 'Desktop/Apps & Tools/Tasty Website Builder/node_modules/playwright'));
const ROOT = path.join(__dirname, '..');
const s = fs.readFileSync(path.join(ROOT, 'assets/logo/s-siegel.svg'), 'utf8');
const inner = s.match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1];
const W = 800, H = Math.round(800 * 1713 / 1917);
const html = `<!doctype html><html><body style="margin:0;background:transparent">
<svg width="${W}" height="${H}" viewBox="0 0 1917 1713" xmlns="http://www.w3.org/2000/svg">
<defs>
<symbol id="emblem" viewBox="0 0 1917 1713">${inner}</symbol>
<linearGradient id="hz-gold" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#8a6a36"/><stop offset=".16" stop-color="#d9bf86"/><stop offset=".3" stop-color="#fbf0cf"/>
<stop offset=".42" stop-color="#d4b273"/><stop offset=".56" stop-color="#9c7b43"/><stop offset=".7" stop-color="#e8d29c"/>
<stop offset=".84" stop-color="#c3a061"/><stop offset="1" stop-color="#7d5e2e"/></linearGradient>
<mask id="hz-maske" maskUnits="userSpaceOnUse" x="0" y="0" width="1917" height="1713"><use href="#emblem" style="color:#fff"/></mask>
<filter id="hz-relief" x="-4%" y="-4%" width="108%" height="108%" color-interpolation-filters="sRGB">
<feGaussianBlur in="SourceAlpha" stdDeviation="9" result="weich"/>
<feSpecularLighting in="weich" surfaceScale="8" specularConstant="1.1" specularExponent="24" lighting-color="#fff7e2" result="glanz"><feDistantLight azimuth="225" elevation="48"/></feSpecularLighting>
<feComposite in="glanz" in2="SourceAlpha" operator="in" result="glanz2"/>
<feOffset in="SourceAlpha" dx="-8" dy="-10" result="versatz"/>
<feComposite in="SourceAlpha" in2="versatz" operator="out" result="kante"/>
<feFlood flood-color="#3d2a10" flood-opacity=".55"/><feComposite in2="kante" operator="in" result="schatten"/>
<feComposite in="SourceGraphic" in2="glanz2" operator="arithmetic" k2="1" k3=".8" result="hell"/>
<feMerge><feMergeNode in="hell"/><feMergeNode in="schatten"/></feMerge>
</filter></defs>
<g filter="url(#hz-relief)"><rect width="1917" height="1713" fill="url(#hz-gold)" mask="url(#hz-maske)"/></g>
</svg></body></html>`;
(async () => {
  const b = await pw.chromium.launch(); const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await p.setContent(html); await p.waitForTimeout(400);
  const png = path.join(ROOT, 'assets/logo/zeichen-gold.png');
  await p.screenshot({ path: png, omitBackground: true, clip: { x: 0, y: 0, width: W, height: H } });
  await b.close();
  const { execSync } = require('child_process');
  execSync(`python3 -c "from PIL import Image; im=Image.open('${png}'); im.save('${png.replace('.png', '.webp')}','WEBP',quality=92,method=6,lossless=False); print(im.size)"`, { stdio: 'inherit' });
})();
