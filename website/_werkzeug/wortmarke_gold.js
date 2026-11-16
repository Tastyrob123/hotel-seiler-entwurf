/* Die ausgeschriebene Wortmarke (Hotel · Seiler au Lac · Bönigen / Interlaken) in Gold mit Relief, dasselbe Gold wie das S-Siegel
   (zeichen_gold.js) und das BR-Zeichen des Grand Beau-Rivage: Goldverlauf, ausgeschnitten mit der Wortmarke, Lichtkante oben links,
   Schattenkante unten rechts; Aufnahme kopflos als PNG mit durchsichtigem Grund → WebP in zwei Grössen.
   Aufruf: node _werkzeug/wortmarke_gold.js  → assets/logo/wortmarke-gold.webp (1400 px, Auftakt) + wortmarke-gold-s.webp (560 px, Leiste) */
const path = require('path'), fs = require('fs');
const pw = require(path.join(process.env.HOME, 'Desktop/Apps & Tools/Tasty Website Builder/node_modules/playwright'));
const ROOT = path.join(__dirname, '..');
const s = fs.readFileSync(path.join(ROOT, 'assets/logo/seiler-au-lac.svg'), 'utf8');
const inner = s.match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1];
const VB = [2096, 651], RAND = 40;                       // Rand, damit Lichtkante und Schatten nicht abgeschnitten werden
const bild = (W, staerke) => { const H = Math.round(W * (VB[1] + 2 * RAND) / (VB[0] + 2 * RAND)); return [H, `<!doctype html><html><body style="margin:0;background:transparent">
<svg width="${W}" height="${H}" viewBox="${-RAND} ${-RAND} ${VB[0] + 2 * RAND} ${VB[1] + 2 * RAND}" xmlns="http://www.w3.org/2000/svg">
<defs>
<symbol id="wortmarke" viewBox="0 0 ${VB[0]} ${VB[1]}">${inner}</symbol>
<linearGradient id="hz-gold" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${VB[0]}" y2="${VB[1]}">
<stop offset="0" stop-color="#b08d4f"/><stop offset=".14" stop-color="#dcc188"/><stop offset=".3" stop-color="#f3e3b8"/>
<stop offset=".44" stop-color="#d4b273"/><stop offset=".58" stop-color="#b89455"/><stop offset=".72" stop-color="#e6cf98"/>
<stop offset=".86" stop-color="#c8a565"/><stop offset="1" stop-color="#a27e42"/></linearGradient>
<mask id="hz-maske" maskUnits="userSpaceOnUse" x="0" y="0" width="${VB[0]}" height="${VB[1]}"><use href="#wortmarke" width="${VB[0]}" height="${VB[1]}" style="color:#fff"/></mask>
<filter id="hz-relief" x="-3%" y="-8%" width="106%" height="116%" color-interpolation-filters="sRGB">
<feGaussianBlur in="SourceAlpha" stdDeviation="${3.2 * staerke}" result="weich"/>
<feSpecularLighting in="weich" surfaceScale="${5 * staerke}" specularConstant=".9" specularExponent="22" lighting-color="#fff7e2" result="glanz"><feDistantLight azimuth="225" elevation="50"/></feSpecularLighting>
<feComposite in="glanz" in2="SourceAlpha" operator="in" result="glanz2"/>
<feOffset in="SourceAlpha" dx="${-3 * staerke}" dy="${-4 * staerke}" result="versatz"/>
<feComposite in="SourceAlpha" in2="versatz" operator="out" result="kante"/>
<feFlood flood-color="#6b4f1f" flood-opacity=".38"/><feComposite in2="kante" operator="in" result="schatten"/>
<feComposite in="SourceGraphic" in2="glanz2" operator="arithmetic" k2="1" k3=".42" result="hell"/>
<feMerge><feMergeNode in="hell"/><feMergeNode in="schatten"/></feMerge>
</filter></defs>
<g filter="url(#hz-relief)"><rect width="${VB[0]}" height="${VB[1]}" fill="url(#hz-gold)" mask="url(#hz-maske)"/></g>
</svg></body></html>`]; };
(async () => {
  const b = await pw.chromium.launch();
  for (const [name, W, staerke] of [['wortmarke-gold', 1400, 1], ['wortmarke-gold-s', 560, 1.5]]) {
    const [H, html] = bild(W, staerke);
    const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    await p.setContent(html); await p.waitForTimeout(400);
    const png = path.join(ROOT, 'assets/logo/' + name + '.png');
    await p.screenshot({ path: png, omitBackground: true, clip: { x: 0, y: 0, width: W, height: H } });
    await p.close();
    require('child_process').execSync(`python3 -c "from PIL import Image; im=Image.open('${png}'); im.save('${png.replace('.png', '.webp')}','WEBP',quality=92,method=6); print('${name}', im.size)"`, { stdio: 'inherit' });
  }
  await b.close();
})();
