// Aufnahmen der Rezeption im Chat für die Werkbank: node _werkbank/chat.js  →  _werkbank/ansichten/Chat/<name>.jpg
//   chat        Startseite mit geöffnetem Chat und einer Antwort im Wortlaut der Tests vom 10.10.2026 (_Rezeption im Chat/antworten/seiler.json);
//               die Funktion wird dafür mit genau dieser Antwort bedient, damit die Aufnahme nicht von der Wartezeit abhängt
//   rezeption   Seite «Rezeption im Chat» oben · rezeption-2: «Ein Gast möchte den See sehen» · rezeption-3: «Buchen, ohne die Seite zu verlassen» · rezeption-4: «Und morgen, bei dem Wetter?»
//   mappe       Zimmermappe (mappe.html) am Handy · chat-h: Chat am Handy
const path = require('path'), fs = require('fs');
const { chromium } = require(path.join(process.env.HOME, 'Desktop/Apps & Tools/Tasty Website Builder/node_modules/playwright'));
const B = process.env.BASE || 'http://127.0.0.1:8921/', A = path.join(__dirname, 'ansichten', 'Chat');
const T = JSON.parse(fs.readFileSync(path.join(process.env.HOME, 'Desktop/Website-Projekte/_Rezeption im Chat/antworten/seiler.json'), 'utf8'));
const ANTWORT = {}; for (const k of ['see', 'pizza', 'park']) ANTWORT[T[k][0]] = T[k][1].text;
const bediene = async ctx => ctx.route('**/api/gast*', async r => { let f = ''; try { const d = r.request().postDataJSON(); f = (d.messages || []).filter(m => m.role === 'user').pop().content; } catch (e) {} const t = ANTWORT[f]; if (t) r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ text: t }) }); else r.fulfill({ status: 503, body: '{}' }); });
(async () => {
  fs.mkdirSync(A, { recursive: true });
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'de-CH' });
  await bediene(ctx);
  const p = await ctx.newPage();
  const foto = n => p.screenshot({ path: path.join(A, n + '.jpg'), quality: 90 });
  const ruhe = ms => p.waitForTimeout(ms);
  await p.goto(B + 'index.html?nomotion', { waitUntil: 'load' }); await ruhe(2500);
  await p.evaluate(() => scrollTo(0, Math.round(innerHeight * 1.15))); await ruhe(1200);
  await p.click('.gast-knopf'); await ruhe(900);
  const feld = p.locator('.gast__feld input').first();
  await feld.click().catch(() => {}); await p.keyboard.type(T.see[0], { delay: 12 }); await p.keyboard.press('Enter'); await ruhe(3200);
  await foto('chat');
  console.log('ok chat');
  await p.goto(B + 'rezeption/?nomotion', { waitUntil: 'load' }); await ruhe(3200); await foto('rezeption');
  await p.addStyleTag({ content: 'header.nav,.nav,.eckknopf,.sonnenlauf{display:none!important}' });
  const zu = async re => { await p.evaluate(s => { const h = [...document.querySelectorAll('h2')].find(x => new RegExp(s).test(x.textContent)); if (h) scrollTo(0, h.getBoundingClientRect().top + scrollY - 60); }, re); await ruhe(2600); };
  await zu('Gast möchte'); await foto('rezeption-2');
  await zu('Buchen, ohne'); await foto('rezeption-3');
  await zu('Und morgen'); await foto('rezeption-4');
  console.log('ok rezeption');
  await ctx.close();
  const ctx2 = await br.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'de-CH' });
  await bediene(ctx2);
  const q = await ctx2.newPage();
  await q.goto(B + 'mappe.html?nomotion', { waitUntil: 'load' }); await q.waitForTimeout(3500);
  await q.screenshot({ path: path.join(A, 'mappe.jpg'), quality: 90 });
  console.log('ok mappe');
  await q.goto(B + 'index.html?nomotion', { waitUntil: 'load' }); await q.waitForTimeout(2500);
  await q.evaluate(() => scrollTo(0, Math.round(innerHeight * 1.1))); await q.waitForTimeout(900);
  await q.click('.gast-knopf'); await q.waitForTimeout(900);
  await q.locator('.gast__feld input').first().click().catch(() => {}); await q.keyboard.type(T.pizza[0], { delay: 12 }); await q.keyboard.press('Enter'); await q.waitForTimeout(3200);
  await q.screenshot({ path: path.join(A, 'chat-h.jpg'), quality: 90 });
  console.log('ok chat-h');
  await br.close();
})();
