(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function newJob() { return { role: '', company: '', from: '', to: '', current: false, note: '', desc: '' }; }
  function newEdu() { return { school: '', degree: '', from: '', to: '' }; }

  var state = {
    name: '', title: '', email: '', phone: '', city: '', born: '', link: '', photo: '',
    summary: '', skills: '', langs: '', other: '',
    template: 'simple', last5: false,
    jobs: [newJob()], edus: [newEdu()]
  };

  var A4_PX = 297 * 96 / 25.4;

  /* ---------- Kompetencia-ötletek ---------- */

  var COMMON = ['Terhelhetőség', 'Precizitás', 'Csapatban és egyedül is tudok dolgozni'];
  var IDEAS = [
    { name: 'Általános', items: [
      'Megbízhatóság', 'Pontosság, határidők betartása', 'Önálló munkavégzés', 'Gyors tanulás',
      'Jó kommunikációs készség', 'Problémamegoldó képesség', 'Segítőkészség', 'Stressztűrő képesség',
      'Szervezőkészség', 'Felelősségtudat'] },
    { name: 'Pénzügyi munka', items: [
      'Könyvelési és pénzügyi ismeretek', 'Számlázás, bizonylatkezelés', 'Főkönyvi könyvelés',
      'Bankszámla-egyeztetés', 'Költségellenőrzés', 'Excel (haladó szint)',
      'Pénzügyi szoftverek ismerete (pl. SAP, számlázó programok)', 'ÁFA és adóügyi alapismeretek',
      'Adatbevitel nagy pontossággal', 'Riportok, kimutatások készítése'] },
    { name: 'Adminisztratív munka', items: [
      'Irodai programok ismerete (Word, Excel, Outlook)', 'Gyors és pontos gépelés',
      'Iratkezelés, archiválás', 'Ügyfélkezelés telefonon és e-mailben', 'Időpont- és naptárkezelés',
      'Levelezés, dokumentumszerkesztés', 'Adatbevitel', 'Diszkréció, bizalmas adatkezelés',
      'Szervezőkészség'] },
    { name: 'Takarítói munka', items: [
      'Fizikai erőnlét', 'Alaposság, igényesség', 'Tisztítószerek és gépek szakszerű használata',
      'Munkavédelmi szabályok ismerete', 'Önálló munkavégzés', 'Jó időbeosztás',
      'Megbízhatóság, kulcskezelés', 'Műszakos és hétvégi munka vállalása'] },
    { name: 'Értékesítés, ügyfélszolgálat', items: [
      'Ügyfélközpontú hozzáállás', 'Jó kommunikációs készség', 'Konfliktuskezelés, panaszkezelés',
      'Türelem', 'Pénztárgép- és kasszakezelés', 'Eladási tapasztalat',
      'Termékismeret gyors elsajátítása', 'Udvarias, segítőkész fellépés'] },
    { name: 'Raktár, logisztika', items: [
      'Fizikai erőnlét', 'Áruátvétel, komissiózás', 'Leltározás', 'Raktárkezelő programok ismerete',
      'Targoncavezetői jogosítvány', 'Pontos és gyors munkavégzés', 'Munkavédelmi szabályok ismerete'] },
    { name: 'Vendéglátás', items: [
      'Gyors tempóban is pontos munka', 'Vendégbarát hozzáállás', 'Pénztárkezelés',
      'Higiéniai szabályok ismerete (HACCP)', 'Műszakbeosztás, hétvégi munka vállalása',
      'Jó stressztűrő képesség'] },
    { name: 'Vezetés, szervezés', items: [
      'Csapatvezetés', 'Döntési képesség', 'Felelősségvállalás', 'Feladatok delegálása',
      'Időmenedzsment', 'Konfliktuskezelés', 'Tervezés, szervezés'] },
    { name: 'Sofőr, szállítás', items: [
      '„B” kategóriás jogosítvány', 'Balesetmentes vezetés', 'Útvonaltervezés, térképismeret',
      'Fegyelmezett, szabálykövető munkavégzés', 'Felelősségtudat', 'Önálló munkavégzés'] },
    { name: 'Számítógép és nyelv', items: [
      'Számítógépes alapismeretek', 'Irodai programok ismerete (Word, Excel, Outlook)',
      'Internet- és e-mail-használat', 'Angol nyelv: alapfok', 'Angol nyelv: középfok',
      'Angol nyelv: felsőfok', 'Német nyelv: alapfok', 'Német nyelv: középfok'] }
  ];
  var ideaCat = 0;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- Dátumok (szabad szöveg, pl. 2023.08 vagy 2023.08.14.) ---------- */

  function parseYM(s) {
    var m = /(\d{4})(?:\D+(\d{1,2}))?/.exec(String(s || ''));
    return m ? { y: parseInt(m[1], 10), m: m[2] ? Math.min(12, Math.max(1, parseInt(m[2], 10))) : 0 } : null;
  }
  function nowKey() { var d = new Date(); return d.getFullYear() * 12 + d.getMonth(); }
  function isCurrent(j) { return j.current || /jelenleg|most|folyamatban/i.test(j.to || ''); }

  function range(job) {
    var a = (job.from || '').trim();
    var b = job.current ? 'jelenleg' : (job.to || '').trim();
    var r = a && b ? a + ' – ' + b : (a || b);
    if (job.note && job.note.trim()) r += (r ? ' ' : '') + '(' + job.note.trim() + ')';
    return r;
  }
  function eduRange(e) {
    var a = (e.from || '').trim(), b = (e.to || '').trim();
    return a && b ? a + ' – ' + b : (a || b);
  }
  // 5 évnél régebben véget ért munka. Ha nem értjük a dátumot, nem rejtjük el.
  function isOld(job) {
    if (isCurrent(job)) return false;
    var s = job.to && job.to.trim() ? job.to : job.from;
    var p = parseYM(s);
    if (!p) return false;
    var month = p.m || (job.to && job.to.trim() ? 12 : 1);
    return p.y * 12 + month - 1 < nowKey() - 60;
  }
  function jobHasContent(j) { return !!(j.role || j.company || j.desc || j.from || j.to); }
  function eduHasContent(e) { return !!(e.school || e.degree || e.from || e.to); }
  function visibleJobs() {
    return state.jobs.filter(function (j) { return jobHasContent(j) && !(state.last5 && isOld(j)); });
  }

  /* ---------- Szövegfeldolgozás ---------- */

  function lines(s) {
    return String(s || '').split(/\n+/).map(function (l) {
      return l.replace(/^\s*[-•*–·●]+\s*/, '').trim();
    }).filter(Boolean);
  }
  function richHTML(text) {
    var out = '', open = false;
    String(text || '').split(/\n/).map(function (l) { return l.trim(); }).filter(Boolean).forEach(function (l) {
      var m = /^[-•*–·●]\s*(.*)$/.exec(l);
      if (m) {
        if (!open) { out += '<ul class="bul">'; open = true; }
        out += '<li>' + esc(m[1]) + '</li>';
      } else {
        if (open) { out += '</ul>'; open = false; }
        out += '<p>' + esc(l) + '</p>';
      }
    });
    return out + (open ? '</ul>' : '');
  }
  function bulletsHTML(arr, cls) {
    return arr.length ? '<ul class="bul' + (cls ? ' ' + cls : '') + '">' + arr.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '';
  }
  function titleHTML(main, sub) {
    if (main && sub) return '<b>' + esc(main) + '</b><span class="sub"> — <i>' + esc(sub) + '</i></span>';
    if (main) return '<b>' + esc(main) + '</b>';
    if (sub) return '<b>' + esc(sub) + '</b>';
    return '';
  }
  function compItems() { return lines(state.skills).concat(lines(state.langs)); }

  /* ---------- Önéletrajz lap ---------- */

  function contactItems() {
    var items = [];
    if (state.city) items.push(esc(state.city));
    if (state.phone) items.push(esc(state.phone));
    if (state.email) items.push(esc(state.email));
    if (state.link) items.push(esc(state.link));
    return items;
  }
  function jobsHTML() {
    return visibleJobs().map(function (j) {
      var when = range(j);
      return '<div class="item"><div class="row"><div class="ttl">' + titleHTML(j.role, j.company) + '</div>' +
        (when ? '<span class="when">' + esc(when) + '</span>' : '') + '</div>' +
        bulletsHTML(lines(j.desc)) + '</div>';
    }).join('');
  }
  function edusHTML() {
    return state.edus.filter(eduHasContent).map(function (e) {
      var when = eduRange(e);
      return '<div class="item"><div class="row"><div class="ttl">' + titleHTML(e.degree, e.school) + '</div>' +
        (when ? '<span class="when">' + esc(when) + '</span>' : '') + '</div></div>';
    }).join('');
  }
  function photoHTML() { return state.photo ? '<img class="photo" alt="" src="' + state.photo + '">' : ''; }
  function sec(title, body) { return body ? '<section><h2>' + title + '</h2>' + body + '</section>' : ''; }

  function sheetHTML() {
    var name = state.name ? esc(state.name) : '<span class="ph">Teljes neved</span>';
    var role = state.title ? '<p class="role">' + esc(state.title) + '</p>' : '';
    var contact = contactItems();
    var born = state.born.trim() ? '<div class="born">Született: ' + esc(state.born.trim()) + '</div>' : '';
    var comp = compItems();
    var body =
      sec('Bemutatkozás', richHTML(state.summary)) +
      sec('Szakmai tapasztalat', jobsHTML()) +
      sec('Tanulmányok', edusHTML());
    var other = sec('Egyéb', richHTML(state.other));

    if (state.template === 'modern') {
      var side = contact.concat(state.born.trim() ? ['Született: ' + esc(state.born.trim())] : []);
      return '<div class="sheet t-modern"><aside class="aside">' + photoHTML() +
        (side.length ? '<h2>Kapcsolat</h2><ul>' + side.map(function (c) { return '<li>' + c + '</li>'; }).join('') + '</ul>' : '') +
        (comp.length ? '<h2>Kompetenciák</h2><ul>' + comp.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>' : '') +
        '</aside><div class="main"><h1>' + name + '</h1>' + role + body + other + '</div></div>';
    }

    var head = '<div class="head">' + photoHTML() + '<div class="hd"><h1>' + name + '</h1>' + role +
      (contact.length ? '<div class="contact">' + contact.map(function (c) { return '<span>' + c + '</span>'; }).join('') + '</div>' : '') +
      born + '</div></div>';

    if (state.template === 'compact') {
      return '<div class="sheet t-compact">' + head + body +
        sec('Kompetenciák', bulletsHTML(comp, 'cols')) + other + '</div>';
    }
    return '<div class="sheet t-simple">' + head + body + sec('Kompetenciák', bulletsHTML(comp)) + other + '</div>';
  }

  /* ---------- Tippek (szabályalapú, nincs AI) ---------- */

  function computeTips(pages) {
    var tips = [];
    function add(level, text) { tips.push({ level: level, text: text }); }

    if (!state.name.trim()) add('warn', 'Hiányzik a neved.');
    if (!state.email.trim() && !state.phone.trim()) add('warn', 'Nincs elérhetőség. Adj meg legalább egy telefonszámot vagy e-mail-címet.');
    if (state.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(state.email.trim())) add('warn', 'Az e-mail-cím formátuma hibásnak tűnik.');

    var sum = state.summary.trim();
    if (!sum) add('info', 'A bemutatkozás hiányzik. 2–3 mondat elég: ki vagy, miben vagy jó, mit keresel.');
    else if (sum.length < 60) add('info', 'A bemutatkozás nagyon rövid. 150–400 karakter a jó.');
    else if (sum.length > 600) add('warn', 'A bemutatkozás túl hosszú (' + sum.length + ' karakter). Rövidítsd, a részletek a munkahelyeknél vannak.');

    var jobs = state.jobs.filter(jobHasContent);
    var anyNumber = false, anyBullets = false, weak = 0, longLine = 0, many = 0, noDesc = 0, noDate = 0;
    jobs.forEach(function (j) {
      var b = lines(j.desc);
      if (!b.length) noDesc++;
      if (b.length > 6) many++;
      if (!j.from.trim()) noDate++;
      b.forEach(function (l) {
        anyBullets = true;
        if (/\d/.test(l)) anyNumber = true;
        if (l.length > 170) longLine++;
        if (/^(felelős\s+(voltam|vagyok)|feladatom|részt\s+vettem|segítettem|közreműködtem)/i.test(l)) weak++;
      });
    });
    if (noDesc) add('info', noDesc + ' munkahelynél nincs leírás. 2–4 sor kell: mit csináltál és mi lett az eredménye.');
    if (many) add('warn', 'Van munkahely 6-nál több felsorolással. Hagyd meg a 3–5 legfontosabbat.');
    if (longLine) add('warn', longLine + ' sor 170 karakternél hosszabb. Egy sor egy gondolat legyen.');
    if (weak) add('info', 'Cselekvő igével kezdj, ne azzal, hogy „felelős voltam” vagy „feladatom volt”. Pl. „Vezettem”, „Csökkentettem”.');
    if (anyBullets && !anyNumber) add('info', 'Sehol nincs szám. A mennyiség (hány ügyfél, mennyi forint, hány százalék) hitelessé teszi a leírást.');
    if (noDate) add('warn', noDate + ' munkahelynél hiányzik a kezdő dátum.');

    var older = state.jobs.filter(function (j) { return jobHasContent(j) && isOld(j); }).length;
    if (older && !state.last5) add('info', older + ' munkahely 5 évnél régebben ért véget. Ha nem kapcsolódik az álláshoz, kapcsold be az „elmúlt 5 év” szűrőt.');

    var text = [state.name, state.title, state.summary, state.skills, state.langs, state.other]
      .concat(state.jobs.map(function (j) { return j.role + ' ' + j.company + ' ' + j.desc; })).join('\n');
    if (/!/.test(text)) add('info', 'Felkiáltójel van a szövegben. Önéletrajzban nem szokás, töröld.');
    if (/[^\S\n]{2,}/.test(text)) add('info', 'Dupla szóköz van a szövegben. Töröld, mert rendezetlennek látszik.');
    if (/\b[A-ZÁÉÍÓÖŐÚÜŰ]{5,}\b/.test(text.replace(/\b(SAP|ERP|CRM|HTML|CSS|NAV|SZJA|ÁFA|GDPR|IFRS|HACCP)\b/g, ''))) {
      add('info', 'Csupa nagybetűs szó van a szövegben. Nehezebb olvasni, használj sima írást.');
    }
    if (lines(state.skills).length > 10) add('info', lines(state.skills).length + ' kompetenciát adtál meg. 6–10 a jó, a legfontosabbakat tartsd meg.');

    if (pages > 2) add('warn', 'Az önéletrajz ' + pages + ' oldalas. Cél az 1, legfeljebb 2 oldal. Rövidíts, vagy válaszd a „Tömör” sablont.');
    else if (pages === 2) add('info', 'Az önéletrajz 2 oldalas. 10 évnél kevesebb tapasztalatnál 1 oldal a jó.');

    if (!tips.some(function (t) { return t.level === 'warn'; }) && (state.name || jobs.length)) {
      add('ok', 'Nincs súlyos hiba. Olvasd át még egyszer, és kérj meg valakit, hogy ő is nézze át.');
    }
    return tips;
  }

  function renderTips(pages) {
    var tips = computeTips(pages);
    var warns = tips.filter(function (t) { return t.level === 'warn'; }).length;
    var infos = tips.filter(function (t) { return t.level === 'info'; }).length;
    $('#tips-sum').textContent = 'Tippek' + (warns || infos ? ' (' + (warns ? warns + ' javítandó' : '') + (warns && infos ? ', ' : '') + (infos ? infos + ' javaslat' : '') + ')' : '');
    $('#tips').innerHTML = tips.slice(0, 8).map(function (t) {
      var label = t.level === 'warn' ? 'Javítsd:' : t.level === 'ok' ? 'Rendben:' : 'Tipp:';
      return '<div class="tip ' + t.level + '"><b>' + label + '</b>' + esc(t.text) + '</div>';
    }).join('');
  }

  /* ---------- Előnézet ---------- */

  function fitPreview() {
    var wrap = $('#sheet-wrap'), stage = $('#stage'), sheet = wrap.firstElementChild;
    if (!sheet) return;
    var cs = getComputedStyle(stage);
    var padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    var padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    var avail = stage.clientWidth - padX;
    var natural = sheet.offsetWidth;
    var scale = Math.min(1, avail / natural);
    wrap.style.transform = 'scale(' + scale + ')';
    wrap.style.width = natural + 'px';
    wrap.style.height = sheet.offsetHeight + 'px';
    wrap.style.marginLeft = Math.max(0, (avail - natural * scale) / 2) + 'px';
    stage.style.height = (sheet.offsetHeight * scale + padY) + 'px';
  }

  var raf = 0;
  function update() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      raf = 0;
      $('#sheet-wrap').innerHTML = sheetHTML();
      fitPreview();
      var sheet = $('#sheet-wrap').firstElementChild;
      renderTips(Math.max(1, Math.ceil(sheet.offsetHeight / A4_PX - 0.03)));
      var n = state.jobs.filter(function (j) { return jobHasContent(j) && isOld(j); }).length;
      $('#last5-note').textContent = !state.last5 ? '' :
        (n ? n + ' régebbi munkahelyet elrejtettünk az önéletrajzból (az űrlapon megmaradnak).' : 'Nincs 5 évnél régebbi munkahely.');
    });
  }

  /* ---------- Űrlap: munkahelyek és iskolák ---------- */

  function jobCard(j, i, total) {
    return '<div class="card" data-i="' + i + '">' +
      '<div class="head"><span>Munkahely ' + (i + 1) + '</span><span class="btns">' +
      '<button type="button" class="mini ghost" data-act="up" aria-label="Feljebb"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
      '<button type="button" class="mini ghost" data-act="down" aria-label="Lejjebb"' + (i === total - 1 ? ' disabled' : '') + '>↓</button>' +
      '<button type="button" class="mini ghost danger" data-act="del" aria-label="Törlés">✕</button></span></div>' +
      '<label>Beosztás<input data-k="role" spellcheck="true" lang="hu" value="' + esc(j.role) + '" placeholder="pl. Könyvelő"></label>' +
      '<label>Cég<input data-k="company" spellcheck="true" lang="hu" value="' + esc(j.company) + '" placeholder="pl. Minta Kft."></label>' +
      '<div class="two"><label>Mikortól<input data-k="from" inputmode="numeric" value="' + esc(j.from) + '" placeholder="2023.08"></label>' +
      '<label>Meddig<input data-k="to" inputmode="numeric" value="' + esc(j.to) + '" placeholder="2025.12"' + (j.current ? ' disabled' : '') + '></label></div>' +
      '<label class="check"><input type="checkbox" data-k="current"' + (j.current ? ' checked' : '') + '> Jelenleg is itt dolgozom</label>' +
      '<label>Megjegyzés a dátum mellé (nem kötelező)<input data-k="note" spellcheck="true" lang="hu" value="' + esc(j.note) + '" placeholder="pl. 2026.04-től fizetetlen szabadságon"></label>' +
      '<label>Mit csináltál? (soronként egy pont, 3–5 elég)' +
      '<textarea data-k="desc" rows="4" spellcheck="true" lang="hu" placeholder="Havi 300 számlát könyveltem&#10;Az ügyfelek fizetési késését 20%-kal csökkentettem">' + esc(j.desc) + '</textarea></label>' +
      '</div>';
  }
  function eduCard(e, i) {
    return '<div class="card" data-i="' + i + '">' +
      '<div class="head"><span>Iskola ' + (i + 1) + '</span><span class="btns">' +
      '<button type="button" class="mini ghost danger" data-act="del" aria-label="Törlés">✕</button></span></div>' +
      '<label>Végzettség<input data-k="degree" spellcheck="true" lang="hu" value="' + esc(e.degree) + '" placeholder="pl. Pénzügy és számvitel"></label>' +
      '<label>Iskola<input data-k="school" spellcheck="true" lang="hu" value="' + esc(e.school) + '" placeholder="pl. Pannon Egyetem"></label>' +
      '<div class="two"><label>Mikortól<input data-k="from" inputmode="numeric" value="' + esc(e.from) + '" placeholder="2017"></label>' +
      '<label>Meddig<input data-k="to" inputmode="numeric" value="' + esc(e.to) + '" placeholder="2021"></label></div>' +
      '</div>';
  }
  function renderLists() {
    $('#jobs-list').innerHTML = state.jobs.map(function (j, i) { return jobCard(j, i, state.jobs.length); }).join('');
    $('#edus-list').innerHTML = state.edus.map(function (e, i) { return eduCard(e, i); }).join('');
  }

  function bindList(listSel, key, factory) {
    var list = $(listSel);
    function onField(ev) {
      var t = ev.target, card = t.closest('.card'), k = t.getAttribute('data-k');
      if (!card || !k) return;
      var item = state[key][parseInt(card.getAttribute('data-i'), 10)];
      if (!item) return;
      if (t.type === 'checkbox') {
        item[k] = t.checked;
        var to = $('[data-k="to"]', card);
        if (to) to.disabled = t.checked;
      } else {
        item[k] = t.value;
      }
      update();
    }
    list.addEventListener('input', onField);
    list.addEventListener('change', onField);
    list.addEventListener('click', function (ev) {
      var btn = ev.target.closest('button[data-act]');
      if (!btn) return;
      var i = parseInt(btn.closest('.card').getAttribute('data-i'), 10);
      var act = btn.getAttribute('data-act'), arr = state[key];
      if (act === 'del') { if (arr.length === 1) arr[0] = factory(); else arr.splice(i, 1); }
      else if (act === 'up' && i > 0) arr.splice(i - 1, 0, arr.splice(i, 1)[0]);
      else if (act === 'down' && i < arr.length - 1) arr.splice(i + 1, 0, arr.splice(i, 1)[0]);
      renderLists();
      update();
    });
  }

  /* ---------- Kérek ötletet ---------- */

  function ideaItems(cat) {
    var items = COMMON.slice();
    IDEAS[cat].items.forEach(function (x) { if (items.indexOf(x) < 0) items.push(x); });
    return items;
  }
  function renderIdeas() {
    $('#idea-cats').innerHTML = IDEAS.map(function (c, i) {
      return '<button type="button" class="chip ghost" role="tab" data-cat="' + i + '" aria-selected="' + (i === ideaCat) + '">' + esc(c.name) + '</button>';
    }).join('');
    var have = lines(state.skills).map(function (x) { return x.toLowerCase(); });
    $('#idea-list').innerHTML = ideaItems(ideaCat).map(function (it) {
      var on = have.indexOf(it.toLowerCase()) >= 0;
      return '<button type="button" class="pill ghost" data-idea="' + esc(it) + '" aria-pressed="' + on + '">' +
        '<span class="mark" aria-hidden="true">' + (on ? '✓' : '+') + '</span><span>' + esc(it) + '</span></button>';
    }).join('');
  }
  function toggleIdea(text) {
    var arr = lines(state.skills);
    var idx = arr.map(function (x) { return x.toLowerCase(); }).indexOf(text.toLowerCase());
    if (idx >= 0) arr.splice(idx, 1); else arr.push(text);
    state.skills = arr.join('\n');
    $('#f-skills').value = state.skills;
    renderIdeas();
    update();
  }

  /* ---------- Fotó ---------- */

  function handlePhoto(file) {
    if (!file || !/^image\//.test(file.type)) return;
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var s = Math.min(1, 500 / Math.max(img.width, img.height));
        var w = Math.round(img.width * s), h = Math.round(img.height * s);
        var c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        state.photo = c.toDataURL('image/jpeg', 0.85);
        $('#photo-remove').hidden = false;
        update();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  /* ---------- Letöltés ---------- */

  function fileBase() {
    var n = (state.name || '').trim().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    return (n ? n + '_' : '') + 'Oneletrajz';
  }
  function printPDF() {
    var old = document.title;
    document.title = fileBase();
    var restore = function () { document.title = old; window.removeEventListener('afterprint', restore); };
    window.addEventListener('afterprint', restore);
    window.print();
  }
  function downloadHTML() {
    var doc = '<!doctype html>\n<html lang="hu"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<title>' + esc(state.name || 'Önéletrajz') + ' – önéletrajz</title>' +
      '<style>' + $('#sheet-css').textContent + '\nbody{margin:0;background:#e9ecef}.sheet{margin:0 auto}' +
      '@media print{body{background:#fff}}</style></head><body>' + sheetHTML() + '</body></html>';
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([doc], { type: 'text/html;charset=utf-8' }));
    a.download = fileBase() + '.html';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* ---------- Indítás ---------- */

  function init() {
    $$('[data-key]').forEach(function (el) {
      el.addEventListener('input', function () {
        state[el.getAttribute('data-key')] = el.value;
        if (el.id === 'f-skills') renderIdeas();
        update();
      });
    });
    $$('input[name="tpl"]').forEach(function (r) {
      r.addEventListener('change', function () { if (r.checked) { state.template = r.value; update(); } });
    });
    $('#opt-last5').addEventListener('change', function (e) { state.last5 = e.target.checked; update(); });
    $('#f-photo').addEventListener('change', function (e) { handlePhoto(e.target.files[0]); });
    $('#photo-remove').addEventListener('click', function () {
      state.photo = ''; $('#f-photo').value = ''; $('#photo-remove').hidden = true; update();
    });
    $('#add-job').addEventListener('click', function () { state.jobs.push(newJob()); renderLists(); update(); });
    $('#add-edu').addEventListener('click', function () { state.edus.push(newEdu()); renderLists(); update(); });
    $('#btn-print').addEventListener('click', printPDF);
    $('#btn-html').addEventListener('click', downloadHTML);

    $('#ideas-btn').addEventListener('click', function () {
      var panel = $('#ideas'), open = panel.hidden;
      panel.hidden = !open;
      this.setAttribute('aria-expanded', String(open));
      this.textContent = open ? 'Ötletek elrejtése ▴' : 'Kérek ötletet ▾';
      if (open) renderIdeas();
    });
    $('#idea-cats').addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-cat]');
      if (b) { ideaCat = parseInt(b.getAttribute('data-cat'), 10); renderIdeas(); }
    });
    $('#idea-list').addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-idea]');
      if (b) toggleIdea(b.getAttribute('data-idea'));
    });

    bindList('#jobs-list', 'jobs', newJob);
    bindList('#edus-list', 'edus', newEdu);

    window.addEventListener('resize', fitPreview);
    window.addEventListener('beforeunload', function (e) {
      if (state.name || state.summary || state.jobs.some(jobHasContent) || state.edus.some(eduHasContent)) {
        e.preventDefault(); e.returnValue = '';
      }
    });

    renderLists();
    update();
  }

  init();
})();
