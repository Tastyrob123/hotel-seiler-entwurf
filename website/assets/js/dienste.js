/* Hotel Seiler au Lac — Gäste-Funktionen (Tasty Studios, 10.10.2026, Vorlage Carlton-Europe und die Häuser der Familie Maeder)
   Zimmer-Finder mit Tagespreis aus dem Buchungssystem des Hauses (SimpleBooking 10421, nur gelesen, gebucht wird dort), Wetter am See für die gewählten Tage,
   Tisch im «La Gare» oder in der «La Bohème», Seminarrechner aus den Pauschalen des Hauses, Gutschein online, Vor Ihrer Anreise.
   Der Preisvergleich zeigt Beispielwerte, bis das Haus ihn im Buchungssystem freischaltet. Fällt ein Dienst aus, bleibt der bisherige Weg. */
(function () {
  'use strict';
  var doc = document.documentElement, $ = function (s, c) { return (c || document).querySelector(s); }, $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var PFEIL = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
  var DATEN = {}; try { DATEN = JSON.parse(($('#dn-daten') || {}).textContent || '{}'); } catch (e) {}
  var ZIM = DATEN.zimmer || {};
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var chf = function (n, nachkomma) {
    var neg = n < 0; n = Math.abs(n);
    var r = Math.round(n * 100) / 100, ganz = Math.floor(r), rest = Math.round((r - ganz) * 100);
    var t = String(ganz).replace(/\B(?=(\d{3})+(?!\d))/g, '’');
    return (neg ? '-' : '') + ((nachkomma || rest) ? t + '.' + (rest < 10 ? '0' : '') + rest : t);
  };
  var iso = function (t) { return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2); };
  var tageZw = function (a, b) { return Math.round((new Date(b) - new Date(a)) / 864e5); };
  var TAGE_L = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  var RUHIG = matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]nomotion/.test(location.search);
  var SIEGEL = function (kl) { var z = $('.buchen__t svg'); return z ? z.outerHTML.replace(/class="[^"]*"/, 'class="' + kl + '"') : ''; };
  var schalter = function (wurzel, attr, wenn) {
    var w = 0;
    $$('[' + attr + ']', wurzel).forEach(function (b) { b.addEventListener('click', function () { w = +b.getAttribute(attr); $$('[' + attr + ']', wurzel).forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); }); if (wenn) wenn(w); }); });
    return function () { return w; };
  };
  document.addEventListener('change', function (e) { var t = e.target; if (t && t.tagName === 'SELECT' && t.closest('.dn-karte-dunkel, .dn-rechner, .dn-tisch, .dn-gs-form, dialog.buchen')) t.blur(); });

  /* ---------- Wetter-Zeichen und Auftritt ---------- */
  var WMO = ['klar', 'heiter', 'teils bewölkt', 'bedeckt', 'Nebel', 'Niesel', 'Regen', 'Schnee', 'Schauer', 'Schneeschauer', 'Gewitter'];
  var wmo = function (c) { var w = WMO; return c === 0 ? w[0] : c === 1 ? w[1] : c === 2 ? w[2] : c === 3 ? w[3] : c < 50 ? w[4] : c < 60 ? w[5] : c < 70 ? w[6] : c < 80 ? w[7] : c < 83 ? w[8] : c < 90 ? w[9] : w[10]; };
  var icon = function (c, tag) {
    var s = '<svg viewBox="0 0 32 32" aria-hidden="true">';
    if (c <= 1) s += tag === 0 ? '<path d="M20 6a10 10 0 1 0 6 16A12 12 0 0 1 20 6Z"/>' : '<circle cx="16" cy="16" r="6"/><path d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M6.8 25.2l2.8-2.8M22.4 9.6l2.8-2.8"/>';
    else if (c <= 3 || (c >= 45 && c < 50)) s += (c === 2 ? '<circle cx="12" cy="11" r="4.5"/>' : '') + '<path d="M9 25h14a5 5 0 0 0 0-10 7 7 0 0 0-13.4 2A4 4 0 0 0 9 25Z"/>';
    else if ((c >= 71 && c < 80) || c === 85 || c === 86) s += '<path d="M9 20h14a5 5 0 0 0 0-10 7 7 0 0 0-13.4 2A4 4 0 0 0 9 20Z"/><path d="M11 24v4M16 23v4M21 24v4"/>';
    else s += '<path d="M9 20h14a5 5 0 0 0 0-10 7 7 0 0 0-13.4 2A4 4 0 0 0 9 20Z"/><path d="m11 23-1.5 4M16 23l-1.5 4M21 23l-1.5 4"/>';
    return s + '</svg>';
  };
  function belebe(wurzel) {
    $$('[data-anim]', wurzel).forEach(function (el) {
      if (RUHIG) { el.classList.add('dn-los', 'dn-ruhig'); return; }
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('dn-los'); }); });
      $$('[data-hoch]', el).forEach(function (z) {
        var ziel = +z.getAttribute('data-hoch'), zeile = z.closest('[style*="--i"]'), i = zeile ? +zeile.style.getPropertyValue('--i') || 0 : 0, start = null;
        var schritt = function (t) { if (start === null) start = t; var p = Math.min(1, Math.max(0, (t - start - 250 - i * 140) / 1100)), e = 1 - Math.pow(1 - p, 3); z.textContent = p < 1 ? chf(Math.round(ziel * e)) : chf(ziel); if (p < 1) requestAnimationFrame(schritt); };
        z.textContent = chf(0); requestAnimationFrame(schritt);
      });
    });
  }
  var WETTER = null;
  var holeWetter = function () { if (!WETTER) WETTER = fetch('/api/dienste?was=wetter').then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); return WETTER; };
  function reiseWetter(an, ab, ziel) {
    if (!ziel || !an || !ab || !window.fetch) return;
    ziel.innerHTML = '';
    fetch('/api/dienste?was=reisewetter&an=' + an + '&ab=' + ab).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (w) {
      var L = w.tage.filter(function (t) { return t.max != null; });
      if (!L.length) return;
      var vh = L.some(function (t) { return t.art === 'vorhersage'; }), mi = L.some(function (t) { return t.art === 'mittel'; });
      var karten = L.map(function (t, i) {
        var d = new Date(t.datum + 'T12:00'), mittel = t.art === 'mittel';
        return '<div class="dn-rw__tag" style="--i:' + i + '"><span class="dn-rw__wt">' + TAGE_L[d.getDay()] + '</span><span class="dn-rw__dt">' + d.getDate() + '.' + (d.getMonth() + 1) + '.</span>' +
          '<span class="dn-rw__ic">' + (mittel ? '<i class="dn-rw__oe">Ø</i>' : icon(t.code, 1)) + '</span>' +
          '<b class="dn-rw__max"><span data-hoch="' + Math.round(t.max) + '">' + Math.round(t.max) + '</span>°</b><span class="dn-rw__min">' + Math.round(t.min) + '°</span>' +
          (t.regen != null ? '<span class="dn-rw__nass"><i style="--h:' + Math.max(.04, t.regen / 100) + '"></i></span><em>Niederschlag ' + t.regen + ' %</em>' : '') + '</div>';
      }).join('');
      var fuss = (vh ? 'Mit Zeichen: Vorhersage.' : '') + (vh && mi ? ' ' : '') + (mi ? 'Mit Ø: gemessenes Mittel dieser Tage ' + w.jahre + ', ' + (w.klima || 'MeteoSchweiz') + ', keine Vorhersage.' : '');
      ziel.innerHTML = '<div class="dn-rw" data-anim><div class="dn-edel__kopf"><span class="mono">Wetter am See für Ihre Tage</span></div><div class="dn-rw__reihe">' + karten + '</div><p class="dn-edel__satz">' + fuss + '</p></div>';
      var wv = ziel.closest('[data-wv]'); if (wv) wv.setAttribute('data-tage', L.length);
      belebe(ziel);
    }).catch(function () {});
  }

  /* ---------- Preisvergleich: Beispielwerte, bis das Haus den Vergleich im Buchungssystem freischaltet ---------- */
  function vergleichHTML(o) {
    var alle = [o.wir].concat(o.portale.map(function (p) { return p.chf; })), hoechst = Math.max.apply(null, alle), spar = hoechst - o.wir;
    var zeile = function (name, klein, v, i, wir) {
      var weniger = wir && spar > 0 ? '<span class="dn-pv__weniger">CHF <span data-hoch="' + Math.round(spar) + '">' + chf(Math.round(spar)) + '</span> günstiger</span>' : '';
      return '<li class="dn-pv__z' + (wir ? ' dn-pv__z--wir' : '') + '" style="--i:' + i + '"><span class="dn-pv__n">' + esc(name) + (klein ? '<small>' + esc(klein) + '</small>' : '') + '</span>' +
        '<span class="dn-pv__spur"><i style="--w:' + Math.max(.08, v / hoechst).toFixed(3) + '"></i></span><span class="dn-pv__preis"><b>CHF <span data-hoch="' + Math.round(v) + '">' + chf(Math.round(v)) + '</span></b>' + weniger + '</span></li>';
    };
    return '<div class="dn-pv dn-pv--beispiel" data-anim><div class="dn-edel__kopf"><span class="mono">Preisvergleich für Ihre Daten</span><em>Beispielwerte</em></div>' +
      '<ul class="dn-pv__liste">' + zeile('Direkt bei uns', o.klein, o.wir, 0, true) + o.portale.map(function (p, i) { return zeile(p.name, '', p.chf, i + 1, false); }).join('') + '</ul>' +
      '<p class="dn-edel__satz">Die Portalpreise sind erfundene Beispielwerte. Den echten Vergleich liefert das Buchungssystem des Hauses, sobald die Funktion dort eingeschaltet ist.</p></div>';
  }

  /* ---------- Buchen-Fenster: Reiter Zimmer / Tisch; die Knöpfe «Tisch reservieren» öffnen den Tisch ---------- */
  var dlg = $('dialog.buchen'), f = dlg && $('form[data-zimmerform]', dlg);
  var tabTisch = dlg && $$('.tabs--schalter .tab', dlg)[1], tabZimmer = dlg && $$('.tabs--schalter .tab', dlg)[0];
  $$('[data-tisch-auf]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault(); doc.classList.remove('offen'); document.body.style.overflow = '';
      if (dlg && dlg.showModal) { if (!dlg.open) dlg.showModal(); if (tabTisch) tabTisch.click(); }
    });
  });
  $$('[data-buchen]').forEach(function (b) { b.addEventListener('click', function () { if (tabZimmer) tabZimmer.click(); }); });

  /* ---------- Zimmer-Finder ---------- */
  if (f) (function () {
    var g = f.elements.gaeste, t = $('[data-feld]', dlg) || $('.buchen__t', dlg), vorteil = $('.buchen__vorteil', dlg), titelH = $('h2', dlg), titelAlt = titelH ? titelH.innerHTML : '';
    var lbl = g.closest('label'); if (lbl) $('span', lbl).textContent = 'Mit wem reisen Sie?';
    ['Allein', 'Zu zweit', 'Zu dritt', 'Zu viert', 'Zu fünft'].forEach(function (x, i) { if (g.options[i]) g.options[i].textContent = x; });
    var knopf = $('button[type=submit]', f); if (knopf && knopf.firstChild) knopf.firstChild.nodeValue = 'Zimmer und Preise zeigen';
    var raum = document.createElement('div'); raum.className = 'dn-treffer'; raum.hidden = true; t.appendChild(raum);
    function zurueck() { raum.hidden = true; raum.innerHTML = ''; f.hidden = false; if (vorteil) vorteil.hidden = false; if (titelH) titelH.innerHTML = titelAlt; dlg.classList.remove('dn-breit'); }
    $$('[data-buchen],[data-tisch-auf]').forEach(function (b) { b.addEventListener('click', zurueck); });
    var link = function (an, ab, gz) { var gl = []; for (var i = 0; i < gz; i++) gl.push('A'); return (doc.getAttribute('data-buchung') || DATEN.buchung) + '?lang=DE&cur=CHF&in=' + an + '&out=' + ab + '&guests=' + encodeURIComponent(gl.join(',')); };
    var kopfZeile = function (an, ab, n, gz) {
      return '<p class="dn-treffer__kopf"><span>' + new Date(an).toLocaleDateString('de-CH', { day: 'numeric', month: 'short' }) + ' – ' + new Date(ab).toLocaleDateString('de-CH', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ' · ' + (n === 1 ? 'eine Nacht' : n + ' Nächte') + ' · ' + (gz === 1 ? '1 Person' : gz + ' Personen') + '</span><button type="button" class="dn-zurueck" data-zurueck>Andere Daten</button></p>';
    };
    var rateName = function (r) { return /Halfboard|Halbpension/i.test(r.rate + r.essen) ? 'mit Halbpension' : /Non Refundable/i.test(r.rate) ? 'nicht erstattbar' : 'flexibel, mit Frühstück'; };
    function karte(z, d, oben) {
      var info = ZIM[z.id] || { name: z.name }, flex = z.raten.filter(function (r) { return /Standard/i.test(r.rate); })[0], nr = z.raten.filter(function (r) { return /Non Refundable/i.test(r.rate); })[0], hp = z.raten.filter(function (r) { return /Halfboard/i.test(r.rate); })[0];
      var raten = [flex, nr, hp].filter(Boolean).map(function (r) { return '<span class="dn-rate"><i>' + rateName(r) + '</i><b>CHF ' + chf(r.chf) + '</b></span>'; }).join('');
      if (!raten) raten = z.raten.slice(0, 2).map(function (r) { return '<span class="dn-rate"><i>' + esc(r.essen) + '</i><b>CHF ' + chf(r.chf) + '</b></span>'; }).join('');
      return '<article class="dn-zi' + (oben ? ' dn-zi--oben' : '') + '">' + (oben && info.bild ? '<span class="dn-zi__b"><img src="' + esc(info.bild) + '" alt="" loading="lazy" decoding="async"></span>' : '') +
        '<div class="dn-zi__t">' + (oben ? '<span class="mono">Passt am besten</span>' : '') + '<h3>' + esc(info.name || z.name) + '</h3>' + (info.satz ? '<p>' + esc(info.satz) + '</p>' : '') +
        '<div class="dn-zi__raten">' + raten + '</div><small>für ' + (d.naechte === 1 ? 'eine Nacht' : d.naechte + ' Nächte') + ', alle Personen, mit Frühstücksbuffet, exkl. City-Tax</small></div>' +
        '<a class="kn' + (oben ? '' : ' kn--klein kn--linie') + '" href="' + esc(link(d.an, d.ab, d.gaeste)) + '" target="_blank" rel="noopener">Buchen<i>' + PFEIL + '</i></a></article>';
    }
    function zeige(d) {
      dlg.classList.add('dn-breit');
      var L = d.zimmer.slice();
      if (!L.length) { raum.innerHTML = kopfZeile(d.an, d.ab, d.naechte, d.gaeste) + '<p class="dn-hinweis">Für diese Daten zeigt das Buchungssystem kein freies Zimmer. Versuchen Sie andere Daten oder rufen Sie uns an: ' + esc(DATEN.tel) + '.</p>'; return; }
      var best = L[0], rest = L.slice(1);
      var wir = (best.raten.filter(function (r) { return /Standard/i.test(r.rate); })[0] || best.raten[0]).chf;
      var vg = vergleichHTML({ wir: wir, klein: (ZIM[best.id] || {}).name || best.name, portale: [{ name: 'Booking.com', chf: Math.round(wir * 1.12) }, { name: 'Expedia', chf: Math.round(wir * 1.09) }, { name: 'Hotels.com', chf: Math.round(wir * 1.07) }] });
      raum.innerHTML = kopfZeile(d.an, d.ab, d.naechte, d.gaeste) + karte(best, d, true) + vg +
        (rest.length ? '<p class="mono dn-treffer__mehr">Ebenfalls frei</p>' + rest.map(function (z) { return karte(z, d, false); }).join('') : '');
      belebe(raum);
    }
    function ohnePreis(an, ab, gz) {
      var n = Math.max(1, tageZw(an, ab)), ids = Object.keys(ZIM);
      dlg.classList.add('dn-breit');
      raum.innerHTML = kopfZeile(an, ab, n, gz) + '<p class="dn-hinweis">Das Buchungssystem antwortet gerade nicht. Den Preis für Ihre Daten zeigt es Ihnen direkt.</p>' +
        ids.map(function (k, i) { var z = ZIM[k]; return '<article class="dn-zi' + (i ? '' : ' dn-zi--oben') + '">' + (i ? '' : '<span class="dn-zi__b"><img src="' + esc(z.bild) + '" alt="" loading="lazy"></span>') + '<div class="dn-zi__t"><h3>' + esc(z.name) + '</h3>' + (i ? '' : '<p>' + esc(z.satz) + '</p>') + '<small>' + esc(z.g) + ' · ' + esc(z.bel) + ' · ' + esc(z.sonne) + '</small></div><a class="kn' + (i ? ' kn--klein kn--linie' : '') + '" href="' + esc(link(an, ab, gz)) + '" target="_blank" rel="noopener">Preis und buchen<i>' + PFEIL + '</i></a></article>'; }).join('');
    }
    raum.addEventListener('click', function (e) { if (e.target.closest('[data-zurueck]')) zurueck(); });
    function suche(an, ab, gz) {
      f.hidden = true; if (vorteil) vorteil.hidden = true; raum.hidden = false; if (titelH) titelH.innerHTML = 'Ihr <em>Zimmer.</em>';
      raum.innerHTML = '<p class="dn-hinweis">Einen Moment, wir fragen die freien Zimmer ab.</p>';
      var url = '/api/dienste?was=preise&an=' + an + '&ab=' + ab + '&g=' + gz, hole = function () { return fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); };
      hole().catch(function () { return new Promise(function (ok) { setTimeout(ok, 1200); }).then(hole); }).then(zeige).catch(function () { ohnePreis(an, ab, gz); });
    }
    document.addEventListener('submit', function (e) {
      var q = e.target;
      if (!window.fetch || !q.matches || !(q === f || q.matches('form[data-leiste]'))) return;
      e.preventDefault(); e.stopImmediatePropagation();
      var an = q.elements.an.value, ab = q.elements.ab.value, gz = +q.elements.gaeste.value;
      if (q !== f) { f.elements.an.value = an; f.elements.ab.value = ab; g.value = String(gz); var b = $('[data-buchen]'); if (b) b.click(); }
      suche(an, ab, gz);
    }, true);
  })();

  /* ---------- Tisch: La Gare oder La Bohème → Anfrage per E-Mail ---------- */
  $$('form[data-tisch]').forEach(function (t) {
    var lokal = t.elements.lokal, zeit = $('.dn-tisch__zeit', t), tag = t.elements.tag;
    tag.min = iso(new Date()); tag.value = iso(new Date());
    var neu = function () { var o = lokal.options[lokal.selectedIndex]; zeit.textContent = o.getAttribute('data-zeit') || ''; };
    lokal.addEventListener('change', neu); neu();
    t.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new Date(tag.value + 'T12:00');
      var z = ['Restaurant: ' + lokal.value, 'Tag: ' + TAGE_L[d.getDay()] + ', ' + d.toLocaleDateString('de-CH'), 'Uhrzeit: ' + t.elements.zeit.value, 'Personen: ' + t.elements.pers.value, 'Name: ' + t.elements.name.value];
      if (t.elements.wunsch.value) z.push('Wünsche: ' + t.elements.wunsch.value);
      location.href = 'mailto:' + (DATEN.mail || '') + '?subject=' + encodeURIComponent('Tischreservation ' + lokal.value + ', ' + d.toLocaleDateString('de-CH')) + '&body=' + encodeURIComponent('Guten Tag\n\n' + z.join('\n') + '\n\nFreundliche Grüsse\n');
    });
  });

  /* ---------- Drucken ---------- */
  function drucke(html) {
    var d = $('#dn-druck') || document.body.appendChild(Object.assign(document.createElement('div'), { id: 'dn-druck' }));
    d.innerHTML = html; doc.classList.add('dn-druckt');
    var weg = function () { doc.classList.remove('dn-druckt'); window.removeEventListener('afterprint', weg); };
    window.addEventListener('afterprint', weg);
    setTimeout(function () { window.print(); setTimeout(weg, 1500); }, 60);
  }
  var MARKE = function () { return '<p class="dn-d-marke">' + SIEGEL('dn-d-zeichen') + '<b>Hotel Seiler au Lac</b></p>'; };
  var ADRESSE = 'Hotel Seiler au Lac · Am Quai 3 · 3806 Bönigen bei Interlaken · ' + (DATEN.tel || '') + ' · ' + (DATEN.mail || '');

  /* ---------- Seminarrechner: Personen, Tage, Pauschale → Raum und Richtpreis ---------- */
  $$('form[data-seminar]').forEach(function (box) {
    var D = DATEN.seminar || {}, el = box.elements, stand = null, art = 'ez';
    var n = function (k) { return Math.max(0, parseInt(el[k].value, 10) || 0); };
    function rechne() {
      var ps = Math.max(1, n('pers')), tg = Math.max(1, n('tage')), p = D[art] || {}, zeilen = [], summe = ps * tg * (p.preis || 0);
      zeilen.push([(p.name || '') + ', ' + ps + ' × ' + tg + (tg === 1 ? ' Tag' : ' Tage') + ' × CHF ' + chf(p.preis || 0), summe]);
      var raum = (D.raeume || []).filter(function (r) { return r.max && r.max >= ps; }).sort(function (a, b) { return a.max - b.max; })[0];
      var satz = raum ? 'Passender Raum: <b>' + esc(raum.name) + '</b>, ' + esc(raum.zeile) + '.' : 'Für ' + ps + ' Personen reicht kein einzelner Raum. Wir finden eine Lösung.';
      $('[data-summe]', box).textContent = chf(summe);
      $('[data-zeilen]', box).innerHTML = zeilen.map(function (z) { return '<li><span>' + esc(z[0]) + '</span><b>' + chf(z[1], true) + '</b></li>'; }).join('');
      $('[data-saal]', box).innerHTML = satz;
      stand = { zeilen: zeilen, summe: summe, raum: raum ? raum.name : '', pers: ps, tage: tg, satz: satz.replace(/<[^>]+>/g, ''), art: p.name || '' };
    }
    $$('[data-pauschale]', box).forEach(function (b) { b.addEventListener('click', function () { art = b.getAttribute('data-pauschale'); $$('[data-pauschale]', box).forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); }); rechne(); }); });
    box.addEventListener('input', rechne); box.addEventListener('change', rechne);
    $('[data-offerte]', box).addEventListener('click', function () {
      var datum = el.datum.value ? new Date(el.datum.value).toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' }) : 'noch offen';
      drucke('<div class="dn-blatt-druck">' + MARKE() + '<p class="dn-d-kl">' + esc(ADRESSE) + '</p><h1>Erster Entwurf <em>Ihr Seminar</em></h1><p class="dn-d-kl">Stand ' + new Date().toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' }) + ' · Datum: ' + datum + ' · ' + stand.pers + ' Personen · ' + stand.tage + (stand.tage === 1 ? ' Tag' : ' Tage') + '</p>' +
        '<table>' + stand.zeilen.map(function (z) { return '<tr><td>' + esc(z[0]) + '</td><td>CHF ' + chf(z[1], true) + '</td></tr>'; }).join('') + '<tr class="dn-d-summe"><td>Richtpreis</td><td>CHF ' + chf(stand.summe, true) + '</td></tr></table>' +
        '<p>' + esc(stand.satz) + '</p><p class="dn-d-kl">Erster Entwurf nach den Pauschalen des Hauses, keine Offerte und keine Bestätigung. Getränke am Abend, Technik über die Pauschale hinaus und Ihre Wünsche kommen dazu. Die verbindliche Offerte schreibt Ihnen das Haus.</p></div>');
    });
    box.addEventListener('submit', function (e) {
      e.preventDefault();
      var z = ['Seminar', 'Datum: ' + (el.datum.value || 'offen'), 'Personen: ' + stand.pers, 'Tage: ' + stand.tage, 'Raum: ' + (stand.raum || 'offen')].concat(stand.zeilen.map(function (x) { return x[0] + ': CHF ' + chf(x[1], true); }));
      z.push('Richtpreis (erster Entwurf): CHF ' + chf(stand.summe, true)); if (el.name.value) z.push('Name: ' + el.name.value); if (el.wunsch.value) z.push('Wünsche: ' + el.wunsch.value);
      location.href = 'mailto:' + (DATEN.mail || '') + '?subject=' + encodeURIComponent('Seminar im Hotel Seiler au Lac, ' + stand.pers + ' Personen') + '&body=' + encodeURIComponent('Guten Tag\n\n' + z.join('\n') + '\n\nFreundliche Grüsse\n');
    });
    rechne();
  });

  /* ---------- Gutschein online: Wert, als PDF oder als Karte per Post ---------- */
  $$('form[data-gutschein]').forEach(function (fo) {
    var el = fo.elements, nr = '', teile = $$('[data-teil]', fo), schritt = $('.dn-gs', fo), reihe = $('.dn-betraege', fo), post = schalter(fo, 'data-post-weg', function () { neu(); });
    reihe.innerHTML = [50, 100, 200, 300].map(function (b) { return '<button class="taste" type="button" data-betrag="' + b + '">CHF ' + b + '</button>'; }).join('');
    var wert = function () { return Math.max(0, +el.betrag.value || 0); };
    function neu() {
      $$('[data-betrag]', reihe).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.betrag === el.betrag.value)); });
      $$('[data-nur-post]', fo).forEach(function (t) { t.hidden = !post(); });
      $('[data-wert]', fo).textContent = chf(wert());
    }
    reihe.addEventListener('click', function (e) { var b = e.target.closest('[data-betrag]'); if (b) { el.betrag.value = b.dataset.betrag; neu(); } });
    fo.addEventListener('input', neu); fo.addEventListener('change', neu); neu();
    function karte() {
      return '<div class="dn-gk">' + SIEGEL('dn-gk__z') + '<span class="mono">Gutschein · Hotel Seiler au Lac</span><b class="dn-gk__wert">CHF ' + chf(wert()) + '</b><span class="dn-gk__was">' + esc(el.fuerwas.value) + ', am Brienzersee in Bönigen</span>' +
        (el.fuer.value ? '<span class="dn-gk__fuer">für ' + esc(el.fuer.value) + '</span>' : '') + (el.widmung.value ? '<span class="dn-gk__widmung">«' + esc(el.widmung.value) + '»</span>' : '') +
        (el.von.value ? '<span class="dn-gk__von">von ' + esc(el.von.value) + '</span>' : '') + (nr ? '<span class="dn-gk__nr">Gutschein-Nummer ' + nr + '</span>' : '') + '</div>';
    }
    function zeige(html) { teile.forEach(function (t) { t.hidden = true; }); schritt.hidden = false; schritt.innerHTML = html; }
    function anfang() { nr = ''; teile.forEach(function (t) { t.hidden = false; }); schritt.hidden = true; schritt.innerHTML = ''; neu(); }
    fo.addEventListener('submit', function (e) {
      e.preventDefault();
      zeige(karte() + '<p class="dn-gs__satz">Probe: In diesem Entwurf wird nichts abgebucht. Mit dem Zahlungsanbieter des Hauses läuft hier die echte Zahlung' + (post() ? ', die Karte geht per Post an ' + esc(el.adresse.value || 'Ihre Adresse') : ', der Gutschein geht als PDF per E-Mail hinaus') + '.</p><div class="knoepfe"><button class="kn" type="button" data-zahlen>Bezahlen CHF ' + chf(wert()) + '<i>' + PFEIL + '</i></button><button class="kn kn--linie" type="button" data-aendern>Ändern<i>' + PFEIL + '</i></button></div>');
    });
    schritt.addEventListener('click', function (e) {
      if (e.target.closest('[data-aendern]')) return anfang();
      if (e.target.closest('[data-neu]')) { fo.reset(); return anfang(); }
      if (e.target.closest('[data-zahlen]')) {
        var t = new Date(); nr = 'SL-' + String(t.getFullYear()).slice(2) + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
        zeige('<p class="dn-gs__ok">Bezahlt.</p>' + karte() + '<p class="dn-gs__satz">' + (post() ? 'Die Karte geht in den nächsten Tagen per Post hinaus. Sichern Sie den Gutschein zusätzlich als PDF.' : 'Ihr Gutschein ist fertig. Sichern Sie ihn als PDF, drucken Sie ihn aus oder schicken Sie ihn weiter.') + '</p><div class="knoepfe"><button class="kn" type="button" data-pdf>Gutschein als PDF<i>' + PFEIL + '</i></button><button class="kn kn--linie" type="button" data-neu>Neuer Gutschein<i>' + PFEIL + '</i></button></div>');
      }
      if (e.target.closest('[data-pdf]')) drucke('<div class="dn-gutschein-druck">' + karte() + '<p class="dn-d-kl">' + esc(ADRESSE) + '</p></div>');
    });
  });

  /* ---------- Vorschlag aus dem Haus: klar → aufs Wasser, nass → hinein ---------- */
  var istKlar = function (t) { return t && t.code <= 2 && t.wolken < 35 && (t.regen == null || t.regen < 40); };
  var knA = function (t, h, linie, ext) { return '<a class="kn kn--klein' + (linie ? ' kn--linie' : '') + '" href="' + h + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + t + '<i>' + PFEIL + '</i></a>'; };
  function vorschlag(box, titel, satz, knoepfe) {
    if (!box) return;
    box.innerHTML = '<span class="dn-vorschlag__z" aria-hidden="true">' + SIEGEL('') + '</span><div><h3 class="d3">' + titel[0] + ' <em>' + titel[1] + '</em></h3><p>' + satz + '</p><div class="knoepfe">' + knoepfe + '</div></div>';
    box.hidden = false;
  }
  function vorschlagFuer(box, tage) {
    var klar = tage.filter(istKlar)[0];
    if (klar) { var d = new Date(klar.datum + 'T12:00'); vorschlag(box, [klar.datum === iso(new Date()) ? 'Heute klar' : 'Am ' + TAGE_L[d.getDay()] + ' klar', 'auf dem See.'], 'Ein Tag auf dem Wasser: Das Kursschiff legt vor dem Haus an, im Sommer im Stundentakt ab 9.25 Uhr. Am Abend ein Tisch auf der Terrasse des «La Gare».', knA('Vor der Tür', 'vor-der-tuer.html', false) + knA('Tisch reservieren', '#', true).replace('href="#"', 'href="#" data-tisch-auf')); }
    else vorschlag(box, ['Ein Tag', 'für drinnen.'], 'Draussen ist es nass. Das Postauto 103 fährt alle 30 Minuten nach Interlaken Ost, mit Gästekarte gratis. Am Abend wartet das «La Gare» mit Blick auf den See.', knA('Vor der Tür', 'vor-der-tuer.html', false) + knA('Essen & Trinken', 'essen-trinken.html', true));
    var b = $('[data-tisch-auf]', box); if (b) b.addEventListener('click', function (e) { e.preventDefault(); if (dlg && dlg.showModal) { if (!dlg.open) dlg.showModal(); if (tabTisch) tabTisch.click(); } });
  }

  /* ---------- Heute am See (Vor der Tür) ---------- */
  $$('[data-wetter-heute]').forEach(function (feld) {
    if (!window.fetch) return;
    holeWetter().then(function (w) {
      var orte = ['boenigen', 'harder'].map(function (k) { return w[k]; }).filter(Boolean);
      feld.innerHTML = '<div class="dn-rw" data-anim><div class="dn-edel__kopf"><span class="mono">Jetzt und heute</span></div><div class="dn-rw__reihe">' + orte.map(function (o, i) {
        var t = o.tage[0];
        return '<div class="dn-rw__tag dn-rw__tag--ort" style="--i:' + i + '"><span class="dn-rw__wt">' + esc(o.name) + '</span><span class="dn-rw__dt">' + esc(wmo(o.jetzt.code)) + '</span><span class="dn-rw__ic">' + icon(o.jetzt.code, o.jetzt.tag) + '</span><b class="dn-rw__max"><span data-hoch="' + Math.round(o.jetzt.temp) + '">' + Math.round(o.jetzt.temp) + '</span>°</b><span class="dn-rw__min">heute ' + Math.round(t.min) + '° bis ' + Math.round(t.max) + '°</span><span class="dn-rw__nass"><i style="--h:' + Math.max(.04, (t.regen || 0) / 100) + '"></i></span><em>Niederschlag ' + t.regen + ' %</em></div>';
      }).join('') + '</div></div>';
      var wv = feld.closest('[data-wv]'); if (wv) wv.setAttribute('data-tage', orte.length);
      belebe(feld);
      vorschlagFuer($('[data-vorschlag]', feld.parentNode), w.boenigen ? [w.boenigen.tage[0]] : []);
    }).catch(function () { feld.innerHTML = '<p class="dn-hinweis">Das Wetter ist gerade nicht abrufbar. Aktuelle Werte bei <a href="https://www.meteoschweiz.admin.ch/" target="_blank" rel="noopener">MeteoSchweiz</a>.</p>'; });
  });

  /* ---------- Vor Ihrer Anreise ---------- */
  $$('form[data-anreise]').forEach(function (fo) {
    var el = fo.elements, q = new URLSearchParams(location.search), hund = schalter(fo, 'data-hund', function () { neu(); }), garage = schalter(fo, 'data-garage', function () { neu(); }), hp = schalter(fo, 'data-hp', function () { neu(); });
    el.an.min = iso(new Date());
    ['an', 'ab'].forEach(function (k) { if (/^\d{4}-\d{2}-\d{2}$/.test(q.get(k) || '')) el[k].value = q.get(k); });
    if (q.get('name')) el.name.value = q.get('name').slice(0, 80);
    if (q.get('nr')) el.nr.value = q.get('nr').slice(0, 40);
    var wf = $('[data-anreise-wetter]', fo), vs = $('[data-vorschlag]', fo), stand = { z: [], extras: 0 }, P = DATEN.preise || {};
    function wetter() {
      if (!wf) return;   // Wetter-Abschnitt entfernt (Robert 10.10.2026)
      if (!(el.an.value && el.ab.value && el.ab.value > el.an.value)) { wf.innerHTML = '<p class="dn-hinweis">Mit Anreise und Abreise steht hier das Wetter für Ihre Tage.</p>'; vs.hidden = true; var wv = wf.closest('[data-wv]'); if (wv) wv.removeAttribute('data-tage'); return; }
      reiseWetter(el.an.value, el.ab.value, wf);
      holeWetter().then(function (w) {
        var drin = (w.boenigen ? w.boenigen.tage : []).filter(function (t) { return t.datum >= el.an.value && t.datum <= el.ab.value; });
        if (drin.length) vorschlagFuer(vs, drin); else vs.hidden = true;
      }).catch(function () { vs.hidden = true; });
    }
    function neu() {
      var z = [], extras = 0, n = el.an.value && el.ab.value ? Math.max(0, tageZw(el.an.value, el.ab.value)) : 0, g = Math.max(1, +el.pers.value || 1);
      z.push('Ankunft: ' + el.ankunft.value + ', ' + el.weg.options[el.weg.selectedIndex].text);
      $$('[data-nur-auto]', fo).forEach(function (t) { t.hidden = el.weg.value !== 'auto'; });
      if (el.weg.value === 'auto' && garage() && P.garage) { z.push('Garage, ' + n + (n === 1 ? ' Nacht' : ' Nächte') + ' × CHF ' + P.garage + ': CHF ' + chf(n * P.garage)); extras += n * P.garage; }
      if (hp() && P.halbpension) { var tg = Math.max(2, n); z.push('Halbpension für ' + g + (g === 1 ? ' Person' : ' Personen') + ', ' + tg + ' Tage × CHF ' + P.halbpension + ' (Mittwoch bis Sonntag, ab 12 Jahren): CHF ' + chf(g * tg * P.halbpension)); extras += g * tg * P.halbpension; }
      if (hund() && P.hund) { z.push('Hund, ' + n + (n === 1 ? ' Nacht' : ' Nächte') + ' × CHF ' + P.hund + ': CHF ' + chf(n * P.hund)); extras += n * P.hund; }
      if (el.lokal.value) z.push('Tisch: ' + el.lokal.value + ', ' + (el.tischtag.value ? new Date(el.tischtag.value + 'T12:00').toLocaleDateString('de-CH', { weekday: 'short', day: 'numeric', month: 'short' }) + ', ' : '') + el.tischzeit.value + ', ' + el.tischpers.value + ' Personen');
      if (el.wunsch.value) z.push('Wünsche: ' + el.wunsch.value);
      $('[data-extras]', fo).textContent = chf(extras);
      $('[data-wuensche]', fo).innerHTML = z.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
      stand = { z: z, extras: extras };
    }
    fo.addEventListener('input', neu); fo.addEventListener('change', function (e) { neu(); if (e.target === el.an || e.target === el.ab) wetter(); }); neu(); wetter();
    fo.addEventListener('submit', function (e) {
      e.preventDefault();
      var z = ['Name: ' + el.name.value, 'Buchungsnummer: ' + (el.nr.value || '-'), 'Anreise: ' + el.an.value, 'Abreise: ' + el.ab.value, 'Personen: ' + el.pers.value].concat(stand.z, ['Extras laut Preisliste: CHF ' + chf(stand.extras, true)]);
      location.href = 'mailto:' + (DATEN.mail || '') + '?subject=' + encodeURIComponent('Vor der Anreise: ' + el.name.value + ', ' + el.an.value) + '&body=' + encodeURIComponent('Guten Tag\n\n' + z.join('\n') + '\n\nFreundliche Grüsse\n');
    });
  });
})();
