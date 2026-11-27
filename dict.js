/* ¿SABÍAS QUE? — Diccionario contextual.
 * Al seleccionar una palabra (o una expresión corta) en cualquier texto que se esté leyendo,
 * aparece un botón «¿Qué significa?». Al tocarlo se muestra:
 *   1. la frase del propio texto donde aparece la palabra (el ejemplo en su contexto),
 *   2. la definición del glosario del artículo, si la palabra es uno de sus «conceptos relacionados»,
 *   3. las acepciones del Wikcionario en español (licencia CC BY-SA), con sus ejemplos de uso,
 *   4. enlaces para consultar el Diccionario de la lengua española (RAE) y la FundéuRAE.
 * No inventa definiciones: si no encuentra la palabra, lo dice y ofrece los enlaces. */
(function () {
  'use strict';
  const API = 'https://es.wiktionary.org/api/rest_v1/page/html/';
  const cache = new Map();
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const clean = s => String(s || '').replace(/[ \s]+/g, ' ').replace(/^[\s«»"“”'‘’¿¡(\[]+|[\s«»"“”'‘’.,;:!?)…\]]+$/g, '').trim();
  const isWordish = s => s && s.length <= 40 && s.split(/\s+/).length <= 3 && /\p{L}/u.test(s) && !/\d{3,}/.test(s);

  /* ---------- Wikcionario ---------- */
  async function fetchPage(title) {
    if (cache.has(title)) return cache.get(title);
    const p = (async () => {
      try {
        const r = await fetch(API + encodeURIComponent(title.replace(/ /g, '_')), { headers: { 'Api-User-Agent': 'SabiasQueApp/1.0 (https://cultura-khaki.vercel.app)' } });
        if (!r.ok) return null;
        return await r.text();
      } catch { return null; }
    })();
    cache.set(title, p);
    return p;
  }
  function parse(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const h2 = doc.getElementById('Español');
    if (!h2) return null;
    const sec = h2.closest('section') || doc.body;
    const out = [];
    let lemma = null, etym = '';
    const ety = sec.querySelector('[id^="Etimología"]');
    if (ety) { const sib = (ety.closest('section') || ety.parentElement).querySelector('dl dd, p'); if (sib) etym = textOf(sib).slice(0, 260); }
    sec.querySelectorAll('dl').forEach(dl => {
      const head = headingFor(dl);
      if (/Traducci|Refer|Véase|Información|Locuciones|Conjugación|Pronunciación|Etimolog/i.test(head)) return;
      dl.querySelectorAll(':scope > dd').forEach(dd => {
        const c = dd.cloneNode(true);
        c.querySelectorAll('style,sup,link,ul,ol,dl').forEach(x => x.remove());
        let def = textOf(c);
        if (!def || def.length < 3) return;
        const exs = [], tags = [];
        dd.querySelectorAll(':scope > ul').forEach(ul => {
          const mw = ul.getAttribute('data-mw') || '';
          const uc = ul.cloneNode(true); uc.querySelectorAll('style,sup,link').forEach(x => x.remove()); uc.querySelectorAll('br').forEach(x => x.replaceWith(' '));
          const t = textOf(uc);
          if (/"ejemplo"/.test(mw)) { const e = t.replace(/^Ejemplos?:\s*/i, '').trim(); if (e) exs.push(e.slice(0, 300)); }
          else if (/"(uso|ámbito|sinónimo|antónimo|relacionado)"/.test(mw) && t) tags.push(t.slice(0, 140));
        });
        const m = def.match(/^(Forma|Primera|Segunda|Tercera|Gerundio|Participio)\b.*?\b(de|del)\s+([\p{L}-]+)\.?$/u);
        if (m && !lemma) { const a = dd.querySelector('a[rel="mw:WikiLink"]'); lemma = a ? decodeURIComponent((a.getAttribute('href') || '').replace(/^\.\//, '').split('#')[0]).replace(/_/g, ' ') : m[3]; }
        out.push({ pos: head, def, exs, tags });
      });
    });
    return { defs: out, lemma, etym };
  }
  const textOf = el => (el.textContent || '').replace(/\s+/g, ' ').trim();
  function headingFor(el) {
    for (let n = el.parentElement; n; n = n.parentElement) {
      if (n.tagName === 'SECTION') { const h = n.querySelector(':scope > h3, :scope > h4, :scope > h5'); if (h) return textOf(h); }
    }
    return '';
  }
  async function lookup(word) {
    const tries = [];
    const w = clean(word);
    tries.push(w);
    const lw = w.toLowerCase(); if (lw !== w) tries.push(lw);
    for (const t of tries) {
      const html = await fetchPage(t);
      if (!html) continue;
      const r = parse(html);
      if (!r || !r.defs.length) continue;
      let base = null;
      if (r.lemma && norm(r.lemma) !== norm(t)) {
        const h2 = await fetchPage(r.lemma);
        const rr = h2 && parse(h2);
        if (rr && rr.defs.length) base = { word: r.lemma, ...rr };
      }
      return { word: t, ...r, base, url: 'https://es.wiktionary.org/wiki/' + encodeURIComponent(t.replace(/ /g, '_')) };
    }
    return null;
  }

  /* ---------- Contexto: la frase del texto donde aparece la palabra ---------- */
  function contextSentence(range, word) {
    let el = range.commonAncestorContainer;
    if (el.nodeType === 3) el = el.parentElement;
    const block = el.closest('p, li, dd, .lede, .sub, figcaption, blockquote, h1, h2, h3, .body, .tl li') || el;
    const text = (block.textContent || '').replace(/\s+/g, ' ').trim();
    const sents = text.match(/[^.!?…]+[.!?…»”"]*/g) || [text];
    const nw = norm(word);
    const hit = sents.find(s => norm(s).includes(nw)) || '';
    return hit.trim().slice(0, 420);
  }
  function highlight(sentence, word) {
    if (!sentence) return '';
    const nS = norm(sentence), nW = norm(word);
    const i = nS.indexOf(nW);
    if (i < 0) return esc(sentence);
    return esc(sentence.slice(0, i)) + '<mark>' + esc(sentence.slice(i, i + word.length)) + '</mark>' + esc(sentence.slice(i + word.length));
  }

  /* ---------- Glosario propio del contenido abierto ---------- */
  function currentItem() {
    const m = location.hash.match(/#\/(?:articulo|dato)\/([\w-]+)/);
    return m && window.SQ ? window.SQ.ContentRepo.get(m[1]) : null;
  }
  function glossaryHit(word) {
    const it = currentItem();
    if (!it || !(it.concepts || []).length) return null;
    const nw = norm(word);
    return it.concepts.find(c => norm(c.t) === nw || norm(c.t).split(/\s+/).includes(nw)) || null;
  }

  /* ---------- Interfaz ---------- */
  let pill, card, lastSel = null;
  function ensureUI() {
    if (pill) return;
    pill = document.createElement('button');
    pill.className = 'dict-pill'; pill.type = 'button'; pill.hidden = true;
    pill.addEventListener('pointerdown', e => e.preventDefault());
    pill.addEventListener('click', () => { if (lastSel) open(lastSel.word, lastSel.context); });
    card = document.createElement('div');
    card.className = 'dict-card'; card.hidden = true; card.setAttribute('role', 'dialog'); card.setAttribute('aria-label', 'Significado de la palabra');
    document.body.append(pill, card);
    card.addEventListener('click', e => { if (e.target.closest('[data-dict-close]')) close(); const a = e.target.closest('[data-dict-word]'); if (a) { e.preventDefault(); open(a.dataset.dictWord, ''); } });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !card.hidden) close(); });
  }
  const READ_AREAS = '#view .prose, #view .art-head, #view .sources ol, #view .card .body, #view .quick, #view .row, #sheet .panel, #view .anat-hero, #view .country, #view .dict-page .def';
  function onSelection() {
    ensureUI();
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) { hidePill(); return; }
    const raw = sel.toString();
    const word = clean(raw);
    const range = sel.getRangeAt(0);
    let node = range.commonAncestorContainer; if (node.nodeType === 3) node = node.parentElement;
    if (!node || !node.closest(READ_AREAS) || node.closest('input, textarea, .dict-card')) { hidePill(); return; }
    if (!isWordish(word)) { hidePill(); return; }
    lastSel = { word, context: contextSentence(range, word) };
    pill.innerHTML = `<span aria-hidden="true">📖</span> ¿Qué significa «${esc(word.length > 22 ? word.slice(0, 22) + '…' : word)}»?`;
    pill.hidden = false;
  }
  function hidePill() { if (pill) pill.hidden = true; }
  let tSel;
  document.addEventListener('selectionchange', () => { clearTimeout(tSel); tSel = setTimeout(onSelection, 350); });

  function links(word) {
    const q = encodeURIComponent(word);
    return `<div class="dict-links"><a href="https://dle.rae.es/${q}" target="_blank" rel="noopener noreferrer">Diccionario de la RAE</a><a href="https://www.fundeu.es/?s=${q}" target="_blank" rel="noopener noreferrer">Dudas en la FundéuRAE</a></div>`;
  }
  function defsHtml(r, max = 4) {
    let items = r.defs.filter(d => !/^(Forma|Primera|Segunda|Tercera|Gerundio|Participio)\b/.test(d.def)).slice(0, max);
    if (!items.length) items = r.defs.slice(0, max);
    if (!items.length) return '';
    let lastPos = '';
    return `<ol class="dict-defs">${items.map(d => { const pos = d.pos && d.pos !== lastPos ? `<span class="pos">${esc(d.pos)}</span>` : ''; lastPos = d.pos; return `<li>${pos}<span class="d">${esc(d.def)}</span>${d.tags.length ? `<span class="tags">${d.tags.map(esc).join(' · ')}</span>` : ''}${d.exs[0] ? `<span class="ex">Ejemplo: ${esc(d.exs[0])}</span>` : ''}</li>`; }).join('')}</ol>`;
  }
  async function open(word, context) {
    ensureUI(); hidePill();
    const g = glossaryHit(word);
    card.innerHTML = `<div class="dict-in"><button class="icon-btn x" data-dict-close aria-label="Cerrar">✕</button>
      <span class="eyebrow">Diccionario</span><h3 class="dict-w">${esc(word)}</h3>
      ${context ? `<div class="dict-ctx"><b>En este texto</b><p>${highlight(context, word)}</p></div>` : ''}
      ${g ? `<div class="dict-gl"><b>En este artículo</b><p>${esc(g.d)}</p></div>` : ''}
      <div class="dict-body"><p class="faint">Buscando el significado…</p></div></div>`;
    card.hidden = false;
    requestAnimationFrame(() => card.classList.add('on'));
    const r = await lookup(word);
    const body = card.querySelector('.dict-body');
    if (!body) return;
    if (!r) { body.innerHTML = `<p class="faint">No encontramos «${esc(word)}» en el Wikcionario. Puede ser una forma conjugada, un nombre propio o una expresión. Consúltala en:</p>${links(word)}`; return; }
    const main = r.base || r;
    const formNote = r.base ? `<p class="dict-form">«${esc(r.word)}» es una forma de <a href="#" data-dict-word="${esc(r.base.word)}">${esc(r.base.word)}</a>.</p>` : '';
    body.innerHTML = `${formNote}${defsHtml(main) || defsHtml(r.base || r)}
      ${main.etym ? `<p class="dict-ety"><b>Etimología:</b> ${esc(main.etym)}</p>` : ''}
      <p class="dict-src">Definiciones: <a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">Wikcionario</a> (CC BY-SA). Para la norma académica, consulta el diccionario de la RAE.</p>${links(r.base ? r.base.word : r.word)}`;
  }
  function close() { if (!card) return; card.classList.remove('on'); setTimeout(() => { card.hidden = true; }, 180); }
  /* Página #/diccionario */
  async function renderSearch(word) {
    const box = document.getElementById('dict-result'); if (!box) return;
    word = clean(word); if (!word) { box.innerHTML = ''; return; }
    box.innerHTML = '<p class="faint">Buscando…</p>';
    const r = await lookup(word);
    if (!r) { box.innerHTML = `<h3 class="dict-w">${esc(word)}</h3><p class="faint">No encontramos «${esc(word)}» en el Wikcionario. Consúltala en:</p>${links(word)}`; return; }
    const main = r.base || r;
    box.innerHTML = `<h3 class="dict-w">${esc(r.word)}</h3>${r.base ? `<p class="dict-form">«${esc(r.word)}» es una forma de <a href="#/diccionario?q=${encodeURIComponent(r.base.word)}">${esc(r.base.word)}</a>.</p>` : ''}${defsHtml(main, 8)}${main.etym ? `<p class="dict-ety"><b>Etimología:</b> ${esc(main.etym)}</p>` : ''}<p class="dict-src">Definiciones: <a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">Wikcionario</a> (CC BY-SA).</p>${links(r.base ? r.base.word : r.word)}`;
  }
  document.addEventListener('submit', e => { const f = e.target.closest('.dict-search'); if (!f) return; e.preventDefault(); const w = f.querySelector('input').value; history.replaceState(null, '', '#/diccionario?q=' + encodeURIComponent(clean(w))); renderSearch(w); });
  const auto = () => { if (/^#\/diccionario/.test(location.hash)) { const m = location.hash.match(/[?&]q=([^&]+)/); if (m) setTimeout(() => renderSearch(decodeURIComponent(m[1])), 0); } };
  window.addEventListener('hashchange', auto); auto();
  window.SQ_DICT = { lookup, open, defsHtml, links, renderSearch };
})();
