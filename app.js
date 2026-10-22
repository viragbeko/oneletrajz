(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function newJob() { return { role: '', company: '', from: '', to: '', current: false, desc: '' }; }
  function newEdu() { return { school: '', degree: '', from: '', to: '' }; }

  var state = {
    name: '', title: '', email: '', phone: '', city: '', link: '', photo: '',
    summary: '', skills: '', langs: '',
    template: 'classic', last5: false,
    jobs: [newJob()], edus: [newEdu()]
  };

  var A4_PX = 297 * 96 / 25.4; // egy oldal magassága képpontban

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- Dátumok ---------- */

  function fmt(m) {
    if (!m) return '';
    var p = m.split('-');
    return p[0] + '.' + p[1];
  }
  function monthKey(m) {
    if (!m) return null;
    var p = m.split('-');
    return parseInt(p[0], 10) * 12 + parseInt(p[1], 10) - 1;
  }
  function nowKey() {
    var d = new Date();
    return d.getFullYear() * 12 + d.getMonth();
  }
  function range(from, to, current) {
    var a = fmt(from);
    var b = current ? 'jelenleg' : fmt(to);
    if (!a && !b) return '';
    if (!b) return a;
    if (!a) return b;
    return a + ' – ' + b;
  }
  // Az 5 évnél régebben véget ért munka "régi".
  function isOld(job) {
    var end = job.current ? nowKey() : (monthKey(job.to) != null ? monthKey(job.to) : monthKey(job.from));
    if (end == null) return false; // dátum nélkül nem rejtjük el
    return end < nowKey() - 60;
  }
  function jobHasContent(j) { return !!(j.role || j.company || j.desc || j.from || j.to); }
  function eduHasContent(e) { return !!(e.school || e.degree || e.from || e.to); }

  function visibleJobs() {
    return state.jobs.filter(function (j) {
      return jobHasContent(j) && !(state.last5 && isOld(j));
    });
  }
  function visibleEdus() { return state.edus.filter(eduHasContent); }

  function splitList(s) {
    return String(s || '').split(/[,\n;]+/).map(function (x) { return x.trim(); }).filter(Boolean);
  }
  function bullets(desc) {
    return String(desc || '').split(/\n+/).map(function (l) {
      return l.replace(/^\s*[-•*–·]+\s*/, '').trim();
    }).filter(Boolean);
  }

  /* ---------- Önéletrajz lap ---------- */

  function contactItems() {
    var items = [];
    if (state.email) items.push(esc(state.email));
    if (state.phone) items.push(esc(state.phone));
    if (state.city) items.push(esc(state.city));
    if (state.link) items.push(esc(state.link));
    return items;
  }

  function jobsHTML(compact) {
    var jobs = visibleJobs();
    if (!jobs.length) return '';
    return jobs.map(function (j) {
      var b = bullets(j.desc);
      var title = [j.role, j.company].filter(Boolean).map(esc);
      var head = j.role ? '<b>' + esc(j.role) + '</b>' : '';
      var sub = j.company ? (j.role ? ' <span class="sub">· ' + esc(j.company) + '</span>' : '<b>' + esc(j.company) + '</b>') : '';
      if (!title.length) head = '';
      var when = range(j.from, j.to, j.current);
      return '<div class="item job"><div class="row"><div>' + head + sub + '</div>' +
        (when ? '<span class="when">' + when + '</span>' : '') + '</div>' +
        (b.length ? '<ul class="bul">' + b.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') +
        '</div>';
    }).join('');
  }

  function edusHTML() {
    return visibleEdus().map(function (e) {
      var when = range(e.from, e.to, false);
      return '<div class="item edu"><div class="row"><div>' +
        (e.school ? '<b>' + esc(e.school) + '</b>' : '') +
        (e.degree ? (e.school ? ' <span class="sub">· ' : '<b>') + esc(e.degree) + (e.school ? '</span>' : '</b>') : '') +
        '</div>' + (when ? '<span class="when">' + when + '</span>' : '') + '</div></div>';
    }).join('');
  }

  function photoHTML() {
    return state.photo ? '<img class="photo" alt="" src="' + state.photo + '">' : '';
  }

  function sectionHTML(title, body) {
    return body ? '<section><h2>' + title + '</h2>' + body + '</section>' : '';
  }

  function sheetHTML() {
    var name = state.name ? esc(state.name) : '<span class="ph">Teljes neved</span>';
    var role = state.title ? '<p class="role">' + esc(state.title) + '</p>' : '';
    var contact = contactItems();
    var skills = splitList(state.skills);
    var langs = splitList(state.langs);
    var summary = state.summary.trim() ? '<p>' + esc(state.summary.trim()).replace(/\n/g, '<br>') + '</p>' : '';
    var jobs = jobsHTML();
    var edus = edusHTML();

    if (state.template === 'modern') {
      return '<div class="sheet t-modern">' +
        '<aside class="aside">' + photoHTML() +
        (contact.length ? '<h2>Kapcsolat</h2><ul>' + contact.map(function (c) { return '<li>' + c + '</li>'; }).join('') + '</ul>' : '') +
        (skills.length ? '<h2>Készségek</h2><ul>' + skills.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>' : '') +
        (langs.length ? '<h2>Nyelvek</h2><ul>' + langs.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>' : '') +
        '</aside><div class="main"><h1>' + name + '</h1>' + role +
        sectionHTML('Bemutatkozás', summary) +
        sectionHTML('Munkatapasztalat', jobs) +
        sectionHTML('Tanulmányok', edus) +
        '</div></div>';
    }

    var head = '<div class="head"><div><h1>' + name + '</h1>' + role +
      (contact.length ? '<div class="contact">' + contact.map(function (c) { return '<span>' + c + '</span>'; }).join('') + '</div>' : '') +
      '</div>' + photoHTML() + '</div>';

    if (state.template === 'compact') {
      var cols = (skills.length || langs.length)
        ? '<div class="twocol">' +
          (skills.length ? '<section><h2>Készségek</h2><p>' + skills.map(esc).join(', ') + '</p></section>' : '<div></div>') +
          (langs.length ? '<section><h2>Nyelvek</h2><p>' + langs.map(esc).join(', ') + '</p></section>' : '<div></div>') +
          '</div>' : '';
      return '<div class="sheet t-compact">' + head +
        sectionHTML('Bemutatkozás', summary) +
        sectionHTML('Munkatapasztalat', jobs) +
        sectionHTML('Tanulmányok', edus) + cols + '</div>';
    }

    // klasszikus
    return '<div class="sheet t-classic">' + head +
      sectionHTML('Bemutatkozás', summary) +
      sectionHTML('Munkatapasztalat', jobs) +
      sectionHTML('Tanulmányok', edus) +
      sectionHTML('Készségek', skills.length ? '<p>' + skills.map(esc).join(' · ') + '</p>' : '') +
      sectionHTML('Nyelvek', langs.length ? '<p>' + langs.map(esc).join(' · ') + '</p>' : '') +
      '</div>';
  }

  /* ---------- Tippek (szabályalapú, nincs AI) ---------- */

  function computeTips(pages) {
    var tips = [];
    function add(level, text) { tips.push({ level: level, text: text }); }

    if (!state.name.trim()) add('warn', 'Hiányzik a neved.');
    if (!state.title.trim()) add('warn', 'Írd oda, milyen munkát keresel (titulus). Aki nézi, 5 másodperc alatt tudni akarja.');
    if (!state.email.trim() && !state.phone.trim()) {
      add('warn', 'Nincs elérhetőség. Adj meg legalább egy e-mail-címet vagy telefonszámot.');
    }
    if (state.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(state.email.trim())) {
      add('warn', 'Az e-mail-cím formátuma hibásnak tűnik.');
    }

    var sum = state.summary.trim();
    if (!sum) add('info', 'A bemutatkozás hiányzik. 2–3 mondat elég: ki vagy, miben vagy jó, mit keresel.');
    else if (sum.length < 60) add('info', 'A bemutatkozás nagyon rövid. 150–350 karakter a jó.');
    else if (sum.length > 450) add('warn', 'A bemutatkozás túl hosszú (' + sum.length + ' karakter). Vágd 2–3 mondatra, a részletek a munkahelyeknél vannak.');

    var jobs = state.jobs.filter(jobHasContent);
    if (!jobs.length) add('info', 'Még nincs munkahely. Ha nincs, a tanulmányokat és a készségeket tedd előre a bemutatkozásban.');

    var anyNumber = false, anyBullets = false, weakStart = 0, longLine = 0, manyBullets = 0, noDesc = 0, missingDate = 0;
    jobs.forEach(function (j) {
      var b = bullets(j.desc);
      if (!b.length) noDesc++;
      if (b.length > 6) manyBullets++;
      if (!j.from) missingDate++;
      b.forEach(function (l) {
        anyBullets = true;
        if (/\d/.test(l)) anyNumber = true;
        if (l.length > 170) longLine++;
        if (/^(felelős\s+(voltam|vagyok)|feladatom|feladatom volt|részt\s+vettem|segítettem|közreműködtem)/i.test(l)) weakStart++;
      });
    });
    if (noDesc) add('info', noDesc + ' munkahelynél nincs leírás. 2–4 sor kell: mit csináltál és mi lett az eredménye.');
    if (manyBullets) add('warn', 'Van munkahely 6-nál több felsorolással. Hagyd meg a 3–5 legfontosabbat, a többit nem olvassa el senki.');
    if (longLine) add('warn', longLine + ' sor 170 karakternél hosszabb. Egy sor egy gondolat legyen, rövid mondatokkal.');
    if (weakStart) add('info', 'Cselekvő igével kezdj, ne azzal, hogy „felelős voltam” vagy „feladatom volt”. Pl. „Vezettem”, „Csökkentettem”, „Kiszámláztam”.');
    if (anyBullets && !anyNumber) add('info', 'Sehol nincs szám. A mennyiség (hány ügyfél, mennyi forint, hány százalék, hány fő) hitelessé teszi a leírást.');
    if (missingDate) add('warn', missingDate + ' munkahelynél hiányzik a kezdő dátum.');

    var older = state.jobs.filter(function (j) { return jobHasContent(j) && isOld(j); }).length;
    if (older && !state.last5) {
      add('info', older + ' munkahely 5 évnél régebben ért véget. Ha nem kapcsolódik az álláshoz, kapcsold be az „elmúlt 5 év” szűrőt.');
    }

    var all = [state.name, state.title, state.summary, state.skills, state.langs]
      .concat(state.jobs.map(function (j) { return j.role + ' ' + j.company + ' ' + j.desc; }));
    var text = all.join(' ');
    if (/!{1,}/.test(text)) add('info', 'Felkiáltójel van a szövegben. Önéletrajzban nem szokás, töröld.');
    if (/\s{2,}/.test(text.replace(/\n/g, ' '))) add('info', 'Dupla szóköz van a szövegben. Töröld, mert rendezetlennek látszik.');
    if (/\b[A-ZÁÉÍÓÖŐÚÜŰ]{5,}\b/.test(text.replace(/\b(SAP|ERP|CRM|HTML|CSS|NAV|SZJA|ÁFA|GDPR|IFRS|PwC)\b/g, ''))) {
      add('info', 'Csupa nagybetűs szó van a szövegben. Olvashatatlanabb, használj sima írást.');
    }
    if (/(^|\n)\s*[a-záéíóöőúüű]/.test(sum) && sum) add('info', 'A bemutatkozás kisbetűvel kezdődik.');

    var sk = splitList(state.skills);
    if (sk.length > 14) add('info', sk.length + ' készséget adtál meg. 8–12 a jó, a legfontosabbakat tartsd meg.');
    if (/\b(rugalmas|dinamikus|csapatjátékos|stresszt?űrő|proaktív)\b/i.test(text)) {
      add('info', 'A „rugalmas”, „dinamikus”, „csapatjátékos” szavakat mindenki leírja. Mutass helyette konkrét példát.');
    }

    if (pages > 2) add('warn', 'Az önéletrajz ' + pages + ' oldalas. Cél az 1, legfeljebb 2 oldal. Rövidíts, vagy válaszd a „Tömör” sablont.');
    else if (pages === 2) add('info', 'Az önéletrajz 2 oldalas. 10 évnél kevesebb tapasztalatnál 1 oldal a jó.');

    if (!tips.some(function (t) { return t.level === 'warn'; }) && (state.name || jobs.length)) {
      add('ok', 'Nincs súlyos hiba. Olvasd át még egyszer, és kérj meg valakit, hogy ő is nézze át.');
    }
    return tips;
  }

  function renderTips(pages) {
    var tips = computeTips(pages);
    $('#tips').innerHTML = tips.slice(0, 7).map(function (t) {
      var label = t.level === 'warn' ? 'Javítsd:' : t.level === 'ok' ? 'Rendben:' : 'Tipp:';
      return '<div class="tip ' + t.level + '"><b>' + label + '</b>' + esc(t.text) + '</div>';
    }).join('');
  }

  /* ---------- Előnézet ---------- */

  function fitPreview() {
    var wrap = $('#sheet-wrap');
    var stage = $('#stage');
    var sheet = wrap.firstElementChild;
    if (!sheet) return 1;
    var avail = stage.clientWidth - parseFloat(getComputedStyle(stage).paddingLeft) * 2;
    var natural = sheet.offsetWidth;
    var scale = Math.min(1, avail / natural);
    wrap.style.transform = 'scale(' + scale + ')';
    wrap.style.width = natural + 'px';
    wrap.style.marginLeft = '0';
    wrap.style.height = (sheet.offsetHeight) + 'px';
    stage.style.height = (sheet.offsetHeight * scale + parseFloat(getComputedStyle(stage).paddingTop) * 2) + 'px';
    // középre igazítás
    var left = Math.max(0, (avail - natural * scale) / 2);
    wrap.style.marginLeft = left + 'px';
    return scale;
  }

  var raf = 0;
  function update() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      raf = 0;
      $('#sheet-wrap').innerHTML = sheetHTML();
      fitPreview();
      var sheet = $('#sheet-wrap').firstElementChild;
      var pages = Math.max(1, Math.ceil(sheet.offsetHeight / A4_PX - 0.03));
      renderTips(pages);
      updateLast5Note();
    });
  }

  function updateLast5Note() {
    var n = state.jobs.filter(function (j) { return jobHasContent(j) && isOld(j); }).length;
    var el = $('#last5-note');
    if (!state.last5) { el.textContent = ''; return; }
    el.textContent = n ? n + ' régebbi munkahelyet elrejtettünk az önéletrajzból (az űrlapon megmaradnak).' : 'Nincs 5 évnél régebbi munkahely.';
  }

  /* ---------- Űrlap: munkahelyek és iskolák ---------- */

  function jobCard(j, i, total) {
    return '<div class="card" data-i="' + i + '">' +
      '<div class="head"><span>Munkahely ' + (i + 1) + '</span><span class="btns">' +
      '<button type="button" class="mini ghost" data-act="up" aria-label="Feljebb"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
      '<button type="button" class="mini ghost" data-act="down" aria-label="Lejjebb"' + (i === total - 1 ? ' disabled' : '') + '>↓</button>' +
      '<button type="button" class="mini ghost danger" data-act="del" aria-label="Törlés">✕</button></span></div>' +
      '<label>Beosztás<input data-k="role" spellcheck="true" lang="hu" value="' + esc(j.role) + '" placeholder="pl. Pénzügyi asszisztens"></label>' +
      '<label>Cég<input data-k="company" spellcheck="true" lang="hu" value="' + esc(j.company) + '" placeholder="pl. Minta Kft."></label>' +
      '<div class="two"><label>Mikortól<input data-k="from" type="month" value="' + esc(j.from) + '"></label>' +
      '<label>Meddig<input data-k="to" type="month" value="' + esc(j.to) + '"' + (j.current ? ' disabled' : '') + '></label></div>' +
      '<label class="check"><input type="checkbox" data-k="current"' + (j.current ? ' checked' : '') + '> Jelenleg is itt dolgozom</label>' +
      '<label>Mit csináltál? (egy sor egy pont, 3–5 pont elég)' +
      '<textarea data-k="desc" rows="4" spellcheck="true" lang="hu" placeholder="Havi 300 számlát könyveltem&#10;Az ügyfelek fizetési késését 20%-kal csökkentettem">' + esc(j.desc) + '</textarea></label>' +
      '</div>';
  }

  function eduCard(e, i, total) {
    return '<div class="card" data-i="' + i + '">' +
      '<div class="head"><span>Iskola ' + (i + 1) + '</span><span class="btns">' +
      '<button type="button" class="mini ghost danger" data-act="del" aria-label="Törlés">✕</button></span></div>' +
      '<label>Iskola<input data-k="school" spellcheck="true" lang="hu" value="' + esc(e.school) + '" placeholder="pl. Pannon Egyetem"></label>' +
      '<label>Végzettség<input data-k="degree" spellcheck="true" lang="hu" value="' + esc(e.degree) + '" placeholder="pl. Pénzügy és számvitel BSc"></label>' +
      '<div class="two"><label>Mikortól<input data-k="from" type="month" value="' + esc(e.from) + '"></label>' +
      '<label>Meddig<input data-k="to" type="month" value="' + esc(e.to) + '"></label></div>' +
      '</div>';
  }

  function renderLists() {
    $('#jobs-list').innerHTML = state.jobs.map(function (j, i) { return jobCard(j, i, state.jobs.length); }).join('');
    $('#edus-list').innerHTML = state.edus.map(function (e, i) { return eduCard(e, i, state.edus.length); }).join('');
  }

  function bindList(listSel, key, factory) {
    var list = $(listSel);
    function onField(ev) {
      var t = ev.target;
      var card = t.closest('.card');
      var k = t.getAttribute('data-k');
      if (!card || !k) return;
      var item = state[key][parseInt(card.getAttribute('data-i'), 10)];
      if (!item) return;
      if (t.type === 'checkbox') {
        item[k] = t.checked;
        var to = $('[data-k="to"]', card);
        if (to) { to.disabled = t.checked; }
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
      var card = btn.closest('.card');
      var i = parseInt(card.getAttribute('data-i'), 10);
      var act = btn.getAttribute('data-act');
      var arr = state[key];
      if (act === 'del') {
        if (arr.length === 1) arr[0] = factory(); else arr.splice(i, 1);
      } else if (act === 'up' && i > 0) {
        arr.splice(i - 1, 0, arr.splice(i, 1)[0]);
      } else if (act === 'down' && i < arr.length - 1) {
        arr.splice(i + 1, 0, arr.splice(i, 1)[0]);
      }
      renderLists();
      update();
    });
  }

  /* ---------- Fotó ---------- */

  function handlePhoto(file) {
    if (!file || !/^image\//.test(file.type)) return;
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var max = 500;
        var s = Math.min(1, max / Math.max(img.width, img.height));
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
    var n = (state.name || 'oneletrajz').trim()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    return 'oneletrajz_' + (n || 'nev');
  }

  function printPDF() {
    var old = document.title;
    document.title = fileBase();
    var restore = function () { document.title = old; window.removeEventListener('afterprint', restore); };
    window.addEventListener('afterprint', restore);
    window.print();
  }

  function downloadHTML() {
    var css = $('#sheet-css').textContent;
    var doc = '<!doctype html>\n<html lang="hu"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<title>' + esc(state.name || 'Önéletrajz') + ' – önéletrajz</title>' +
      '<style>' + css + '\nbody{margin:0;background:#e9ecef}.sheet{margin:0 auto}' +
      '@media print{body{background:#fff}}</style></head><body>' + sheetHTML() + '</body></html>';
    var blob = new Blob([doc], { type: 'text/html;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
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
        update();
      });
    });
    $$('input[name="tpl"]').forEach(function (r) {
      r.addEventListener('change', function () {
        if (r.checked) { state.template = r.value; update(); }
      });
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
    bindList('#jobs-list', 'jobs', newJob);
    bindList('#edus-list', 'edus', newEdu);

    window.addEventListener('resize', fitPreview);
    window.addEventListener('beforeunload', function (e) {
      var dirty = state.name || state.summary || state.jobs.some(jobHasContent) || state.edus.some(eduHasContent);
      if (dirty) { e.preventDefault(); e.returnValue = ''; }
    });

    renderLists();
    update();
  }

  init();
})();
