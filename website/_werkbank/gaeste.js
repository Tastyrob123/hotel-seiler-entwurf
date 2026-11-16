// Aufnahmen der Gäste-Funktionen für die Werkbank: node _werkbank/gaeste.js  →  _werkbank/ansichten/Gaeste/<name>.jpg
//   finder          Buchen-Fenster mit dem Zimmer-Finder (Zimmer, Preis oder Weg zur Buchung, Beispiel-Vergleich, Wetter für die Tage)
//   vergleich       Ausschnitt: Preisvergleich · wetter-buchen: Ausschnitt: Wetter für die gebuchten Tage
//   tisch           Reiter «Tisch» im Buchen-Fenster (La Gare oder La Bohème) · gutschein: Gutschein online nach der Wahl des Betrags
//   rechner         Seminarrechner auf Feiern & Tagen · wetter: «Heute auf dem See oder drinnen?» auf Vor der Tür · anreise, anreise-2: «Vor Ihrer Anreise»
//   finder-h, anreise-h, anreise-lang   am Handy (lang = ganze Seite, scrollt in der Werkbank im Handy)
// Nichts wird abgeschickt: Formulare werden nur ausgefüllt. Der Finder nimmt den Weg, den Gäste sehen, wenn das Buchungssystem keine Preise herausgibt.
const path = require('path'), fs = require('fs');
const { chromium } = require(path.join(process.env.HOME, 'Desktop/Apps & Tools/Tasty Website Builder/node_modules/playwright'));
const B = process.env.BASE || 'http://127.0.0.1:8921/', A = path.join(__dirname, 'ansichten', 'Gaeste');
const an = '2026-11-13', ab = '2026-11-16';
(async () => {
  fs.mkdirSync(A, { recursive: true });
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'de-CH' });
  const p = await ctx.newPage();
  const foto = (n, o) => p.screenshot(Object.assign({ path: path.join(A, n + '.jpg'), quality: 90 }, o || {}));
  const ruhe = ms => p.waitForTimeout(ms);
  const ausschnitt = async (sel, n, luft = 24) => { const el = p.locator(sel).first(); if (!(await el.count())) { console.log('fehlt', n); return; } await el.scrollIntoViewIfNeeded({ timeout: 8000 }).catch(() => {}); await ruhe(900); const b = await el.boundingBox(); if (!b) { console.log('kein Ausschnitt', n); return; } await foto(n, { clip: { x: Math.max(0, b.x - luft), y: Math.max(0, b.y - luft), width: Math.min(1440, b.width + 2 * luft), height: b.height + 2 * luft } }); };
  const zu = async (sel, ab_ = -80) => { await p.evaluate(([s, a]) => { const k = document.querySelector(s); if (k) scrollTo(0, k.getBoundingClientRect().top + scrollY + a); }, [sel, ab_]); await ruhe(1600); };

  // Zimmer-Finder: wie online, wenn das Buchungssystem keine Preise an den Server gibt
  await p.goto(B + 'zimmer.html?nomotion', { waitUntil: 'load' }); await ruhe(1500);
  await p.route('**/api/dienste?was=preise*', r => r.fulfill({ status: 503, body: '{}' }));
  await p.locator('[data-buchen]:visible').first().click(); await ruhe(700);
  await p.fill('dialog.buchen [name=an]', an); await p.fill('dialog.buchen [name=ab]', ab); await p.selectOption('dialog.buchen [name=gaeste]', '2'); await ruhe(300);
  await foto('buchen');
  await p.click('dialog.buchen form[data-zimmerform] button[type=submit]'); await p.waitForSelector('.dn-treffer:not([hidden])', { timeout: 20000 }).catch(() => {}); await ruhe(2800);
  await foto('finder');
  await ausschnitt('.dn-pv', 'vergleich');
  await p.unroute('**/api/dienste?was=preise*');
  console.log('ok finder');
  // Tisch reservieren: Reiter im Buchen-Fenster
  await p.keyboard.press('Escape'); await ruhe(400);
  await p.locator('[data-tisch-auf]:visible').first().click(); await ruhe(900);
  await p.selectOption('dialog.buchen form[data-tisch] [name=lokal]', { index: 1 }).catch(() => {}); await p.fill('dialog.buchen form[data-tisch] [name=name]', 'Anna Muster').catch(() => {}); await ruhe(600);
  await foto('tisch');
  console.log('ok tisch');
  await p.keyboard.press('Escape'); await ruhe(300);

  // Gutschein online
  await p.goto(B + 'angebote.html?nomotion', { waitUntil: 'load' }); await ruhe(1200);
  await p.locator('[data-betrag="200"]').scrollIntoViewIfNeeded(); await p.click('[data-betrag="200"]'); await ruhe(300);
  await p.fill('form[data-gutschein] [name=fuer]', 'Anna und Peter').catch(() => {}); await p.fill('form[data-gutschein] [name=widmung]', 'Für ein Wochenende am See').catch(() => {}); await ruhe(700);
  await zu('form[data-gutschein]', -110); await foto('gutschein');
  console.log('ok gutschein');

  // Seminarrechner
  await p.goto(B + 'feiern-tagen.html?nomotion', { waitUntil: 'load' }); await ruhe(1200);
  await zu('form[data-seminar]', -100);
  await p.fill('form[data-seminar] [name=pers]', '20').catch(() => {}); await p.fill('form[data-seminar] [name=tage]', '2').catch(() => {}); await ruhe(900);
  await foto('rechner');
  console.log('ok rechner');


  // Vor Ihrer Anreise
  await p.goto(B + `anreise.html?nomotion&an=${an}&ab=${ab}&name=Anna%20Muster`, { waitUntil: 'load' }); await ruhe(2200);
  await foto('anreise');
  await zu('#extras', -60); await foto('anreise-2');
  console.log('ok anreise');
  await ctx.close();

  // am Handy
  const ctx2 = await br.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'de-CH' });
  const q = await ctx2.newPage();
  await q.route('**/api/dienste?was=preise*', r => r.fulfill({ status: 503, body: '{}' }));
  await q.goto(B + 'zimmer.html?nomotion', { waitUntil: 'load' }); await q.waitForTimeout(1500);
  await q.locator('[data-buchen]:visible').first().click(); await q.waitForTimeout(700);
  await q.fill('dialog.buchen [name=an]', an); await q.fill('dialog.buchen [name=ab]', ab); await q.selectOption('dialog.buchen [name=gaeste]', '2');
  await q.click('dialog.buchen form[data-zimmerform] button[type=submit]'); await q.waitForSelector('.dn-treffer:not([hidden])', { timeout: 20000 }).catch(() => {}); await q.waitForTimeout(2600);
  await q.screenshot({ path: path.join(A, 'finder-h.jpg'), quality: 90 });
  await q.goto(B + `anreise.html?nomotion&an=${an}&ab=${ab}&name=Anna%20Muster`, { waitUntil: 'load' }); await q.waitForTimeout(2600);
  await q.screenshot({ path: path.join(A, 'anreise-h.jpg'), quality: 90 });
  await q.addStyleTag({ content: 'header.nav,.nav,.eckknopf,.gast-knopf,.sonnenlauf{display:none!important}' });
  await q.screenshot({ path: path.join(A, 'anreise-lang.jpg'), quality: 88, fullPage: true });
  await q.goto(B + 'zimmer.html?nomotion', { waitUntil: 'load' }); await q.waitForTimeout(2200);
  await q.addStyleTag({ content: 'header.nav,.nav,.eckknopf,.gast-knopf,.sonnenlauf{display:none!important}' });
  await q.screenshot({ path: path.join(A, 'zimmer-lang.jpg'), quality: 88, fullPage: true });
  console.log('ok handy', fs.readdirSync(A).length);
  await br.close();
})();
// Die langen Handy-Aufnahmen dürfen höchstens 14-mal so hoch wie breit sein (WebP-Grenze beim Bau): python3 -c "from PIL import Image;[Image.open(p).crop((0,0,Image.open(p).width,Image.open(p).width*14)).save(p,quality=88) for p in ['_werkbank/ansichten/Gaeste/anreise-lang.jpg','_werkbank/ansichten/Gaeste/zimmer-lang.jpg'] if Image.open(p).height>Image.open(p).width*14]"
