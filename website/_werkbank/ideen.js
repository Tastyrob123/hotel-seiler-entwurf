// Aufnahmen für die zehn Ideen der Werkbank: node _werkbank/ideen.js  →  _werkbank/ansichten/Ideen/<name>.jpg
//   Tag am See (Startseite, Halt 9.25) · Ost oder West · Zimmer (Kacheln mit Finder) · Schiff (Das Schiff legt an) · Fahrplan (Vor der Tür) ·
//   Zwei Tische · Geschichte (Das Haus) · Vor der Tuer (Auf dem See) · Buchen (Buchen-Fenster offen)
const path = require('path'), fs = require('fs');
const { chromium } = require(path.join(process.env.HOME, 'Desktop/Apps & Tools/Tasty Website Builder/node_modules/playwright'));
const B = process.env.BASE || 'http://127.0.0.1:8921/', A = path.join(__dirname, 'ansichten', 'Ideen');
(async () => {
  fs.mkdirSync(A, { recursive: true });
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'de-CH' });
  const p = await ctx.newPage();
  const foto = n => p.screenshot({ path: path.join(A, n + '.jpg'), quality: 90 });
  const ruhe = ms => p.waitForTimeout(ms);
  const fahr = async () => { const h = await p.evaluate(() => document.documentElement.scrollHeight); for (let y = 0; y < h; y += 500) { await p.evaluate(v => scrollTo(0, v), y); await ruhe(140); } };
  const zu = async (sel, ab = 0) => { await p.evaluate(([s, a]) => { const k = document.querySelector(s); if (k) scrollTo(0, k.getBoundingClientRect().top + scrollY + a); }, [sel, ab]); await ruhe(2600); };
  await p.goto(B + 'index.html?nomotion', { waitUntil: 'load' }); await ruhe(2500); await fahr();
  await zu('#tag', -20); await ruhe(600);
  const halt = p.locator('#tag .tw__h').nth(1); if (await halt.count()) { await halt.click(); await ruhe(1800); }
  await foto('Tag am See');
  await zu('#sonne', -10); await foto('Ost oder West');
  await zu('#tuer', -10); await ruhe(2400); await foto('Schiff');
  await zu('#tische', -10); await foto('Zwei Tische');
  await p.evaluate(() => scrollTo(0, 0)); await ruhe(800);
  await p.locator('[data-buchen]:visible').first().click(); await ruhe(1400); await foto('Buchen'); await p.keyboard.press('Escape'); await ruhe(400);
  console.log('ok start');
  await p.goto(B + 'zimmer.html?nomotion', { waitUntil: 'load' }); await ruhe(2500); await fahr();
  await zu('[data-finder]', -120); await ruhe(400);
  const chip = p.locator('[data-finder] button[data-sonne], [data-finder] [data-wahl] button, [data-finder] button').nth(1); if (await chip.count()) { await chip.click().catch(() => {}); await ruhe(1400); }
  await foto('Zimmer');
  await p.goto(B + 'vor-der-tuer.html?nomotion', { waitUntil: 'load' }); await ruhe(2500); await fahr();
  await zu('#fahrplan', -10); await ruhe(1500); await foto('Fahrplan');
  await zu('#see', -10); await foto('Vor der Tuer');
  await p.goto(B + 'haus.html?nomotion', { waitUntil: 'load' }); await ruhe(2500); await fahr();
  await zu('#geschichte', 160); await foto('Geschichte');
  console.log('ok', fs.readdirSync(A).length);
  await br.close();
})();
