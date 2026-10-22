(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function newJob() { return { role: '', company: '', from: '', to: '', current: false, note: '', desc: '' }; }
  function newEdu() { return { school: '', degree: '', from: '', to: '' }; }
  function newOther() { return { title: 'Egyéb', text: '' }; }

  var DEF_HUE = 214, DEF_LIGHT = 35;
  var BASE_PT = 2, FS_MIN = -2, FS_MAX = 3, FS_STEP = 2; // az alapméret már +2 pt, innen lépked a gomb

  var state = {
    name: '', fileName: '', title: '', email: '', phone: '', city: '', born: '', link: '', photo: '',
    summary: '', skills: '', langs: '',
    template: 'simple', last5: false,
    fsLevel: 0, hue: DEF_HUE, light: DEF_LIGHT,
    jobs: [newJob()], edus: [newEdu()], others: [newOther()]
  };

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
    { name: 'Számítógép', items: [
      'Számítógépes alapismeretek', 'Irodai programok ismerete (Word, Excel, Outlook)',
      'Internet- és e-mail-használat', 'Gyors tanulás új programokból', 'Online ügyintézés',
      'Adatvédelmi szabályok ismerete'] }
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
  function compItems() { return lines(state.langs).concat(lines(state.skills)); }

  // Betűméret és szín: a lap saját változóiként kerül a lapra, így a letöltött fájlban is megmarad.
  function sheetVars() {
    var fs = BASE_PT + state.fsLevel * FS_STEP;
    var h = state.hue, l = state.light;
    return '--fs:' + fs + 'pt;' +
      '--ac:hsl(' + h + ',50%,' + l + '%);' +
      '--acd:hsl(' + h + ',50%,' + Math.min(l, 30) + '%);' +
      '--acl:hsl(' + h + ',75%,82%)';
  }

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
    var vars = ' style="' + sheetVars() + '"';
    var body =
      sec('Bemutatkozás', richHTML(state.summary)) +
      sec('Szakmai tapasztalat', jobsHTML()) +
      sec('Tanulmányok', edusHTML());
    var other = state.others.filter(function (o) { return o.text.trim(); }).map(function (o) {
      return sec(esc(o.title.trim() || 'Egyéb'), richHTML(o.text));
    }).join('');

    if (state.template === 'modern') {
      var side = contact.concat(state.born.trim() ? ['Született: ' + esc(state.born.trim())] : []);
      var list = function (arr) { return '<ul>' + arr.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>'; };
      return '<div class="sheet t-modern"' + vars + '><aside class="aside">' + photoHTML() +
        (side.length ? '<h2>Kapcsolat</h2><ul>' + side.map(function (c) { return '<li>' + c + '</li>'; }).join('') + '</ul>' : '') +
        (comp.length ? '<h2>Kompetenciák</h2>' + list(comp) : '') +
        '</aside><div class="main"><h1>' + name + '</h1>' + role + body + other + '</div></div>';
    }

    var head = '<div class="head">' + photoHTML() + '<div class="hd"><h1>' + name + '</h1>' + role +
      (contact.length ? '<div class="contact">' + contact.map(function (c) { return '<span>' + c + '</span>'; }).join('') + '</div>' : '') +
      born + '</div></div>';

    if (state.template === 'compact') {
      return '<div class="sheet t-compact"' + vars + '>' + head + body +
        sec('Kompetenciák', bulletsHTML(comp, 'cols')) + other + '</div>';
    }
    return '<div class="sheet t-simple"' + vars + '>' + head + body +
      sec('Kompetenciák', bulletsHTML(comp)) + other + '</div>';
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
  function otherCard(o, i, total) {
    return '<div class="card" data-i="' + i + '">' +
      '<div class="head"><span>Szakasz ' + (i + 1) + '</span><span class="btns">' +
      '<button type="button" class="mini ghost" data-act="up" aria-label="Feljebb"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
      '<button type="button" class="mini ghost" data-act="down" aria-label="Lejjebb"' + (i === total - 1 ? ' disabled' : '') + '>↓</button>' +
      '<button type="button" class="mini ghost danger" data-act="del" aria-label="Törlés">✕</button></span></div>' +
      '<label>Szakasz címe<input data-k="title" spellcheck="true" lang="hu" value="' + esc(o.title) + '" placeholder="Egyéb"></label>' +
      '<label>Tartalom<textarea data-k="text" rows="4" spellcheck="true" lang="hu" placeholder="- Elsősegély tanfolyam (2023)&#10;- Önkéntes a helyi állatmenhelyen">' + esc(o.text) + '</textarea></label>' +
      '</div>';
  }
  function renderLists() {
    $('#jobs-list').innerHTML = state.jobs.map(function (j, i) { return jobCard(j, i, state.jobs.length); }).join('');
    $('#edus-list').innerHTML = state.edus.map(function (e, i) { return eduCard(e, i); }).join('');
    $('#others-list').innerHTML = state.others.map(function (o, i) { return otherCard(o, i, state.others.length); }).join('');
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

  // Saját név, ha megadta; különben a neve alapján: Kovacs_Anna_Oneletrajz
  function fileBase() {
    var custom = (state.fileName || '').trim()
      .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '').replace(/\s+/g, '_').replace(/^[._]+|[._]+$/g, '');
    if (custom) return custom;
    var n = (state.name || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
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
    bindList('#others-list', 'others', newOther);
    $('#add-other').addEventListener('click', function () {
      state.others.push({ title: '', text: '' });
      renderLists(); update();
    });

    // Betűméret: minden lépés minden szöveghez ugyanannyi pontot ad hozzá
    function applyLook() {
      var pt = state.fsLevel * FS_STEP;
      $('#fs-label').textContent = pt === 0 ? 'alap' : (pt > 0 ? '+' : '−') + Math.abs(pt) + ' pt';
      $('#fs-minus').disabled = state.fsLevel <= FS_MIN;
      $('#fs-plus').disabled = state.fsLevel >= FS_MAX;
      var look = $('.look');
      look.style.setProperty('--sw-hue', state.hue);
      look.style.setProperty('--sw-l', state.light);
      $('#hue').value = state.hue;
      $('#light').value = state.light;
      update();
    }
    $('#fs-minus').addEventListener('click', function () { if (state.fsLevel > FS_MIN) { state.fsLevel--; applyLook(); } });
    $('#fs-plus').addEventListener('click', function () { if (state.fsLevel < FS_MAX) { state.fsLevel++; applyLook(); } });
    $('#hue').addEventListener('input', function (e) { state.hue = parseInt(e.target.value, 10); applyLook(); });
    $('#light').addEventListener('input', function (e) { state.light = parseInt(e.target.value, 10); applyLook(); });
    $('#color-reset').addEventListener('click', function () { state.hue = DEF_HUE; state.light = DEF_LIGHT; applyLook(); });
    applyLook();

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
