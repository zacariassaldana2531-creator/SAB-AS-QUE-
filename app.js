/* ¿SABÍAS QUE? — Motor de la app v1
 * Capas:
 *   1. Utils           utilidades puras
 *   2. Storage         acceso seguro a localStorage
 *   3. ContentRepo     lectura de contenido (hoy: content.js; mañana: API/Supabase)
 *   4. UserRepo        progreso del usuario (hoy: dispositivo; mañana: cuenta)
 *   5. Services        reglas: dato del día, sorpréndeme, quiz, niveles
 *   6. UI              componentes y vistas
 *   7. Router          navegación por hash (#/ruta), compatible con hosting estático
 */
(() => {
'use strict';

/* ================= 1. UTILS ================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const dayKey = (d = new Date()) => Math.floor((d.getTime() - d.getTimezoneOffset() * 6e4) / 864e5);
const hash = str => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = seed => () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const shuffle = (a, r = Math.random) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const fmtDate = s => { try { return new Date(s + 'T12:00:00').toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return s; } };
const plural = (n, a, b) => `${n} ${n === 1 ? a : b}`;

/* ================= 2. STORAGE ================= */
const Storage = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch { } }
};

/* ================= 3. CONTENT REPO ================= */
const TYPE = { articulo: 'Artículo', curiosidad: 'Curiosidad', mito: 'Mito o realidad' };
const LEVEL = { 1: 'Básico', 2: 'Intermedio', 3: 'Avanzado' };

const ContentRepo = (() => {
  let src = window.SQ_CONTENT || { categories: [], items: [], questions: [] };
  let preview = false;
  if (Storage.get('sq.preview', false)) {
    const d = Storage.get('sq.draft', null);
    if (d && Array.isArray(d.items)) { src = d; preview = true; }
  }
  const cats = src.categories || [];
  const catMap = Object.fromEntries(cats.map(c => [c.id, c]));
  const textOf = i => [i.intro, ...(i.sections || []).flatMap(s => [s.h, ...(s.p || [])]), ...(i.facts || []), i.conclusion, i.desc, i.body].filter(Boolean).join(' ');
  const enrich = i => {
    const text = textOf(i);
    const words = text.split(/\s+/).filter(Boolean).length;
    const cat = catMap[i.cat];
    return {
      ...i,
      read: i.read || Math.max(1, Math.ceil(words / 180)),
      _search: norm([i.title, i.subtitle, i.sub, cat && cat.name, TYPE[i.type], text].join(' ')),
      _title: norm(i.title)
    };
  };
  const items = (src.items || []).filter(i => i.status === 'publicado').map(enrich)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const map = Object.fromEntries(items.map(i => [i.id, i]));
  const questions = (src.questions || []).filter(q => q.status !== 'borrador' && Array.isArray(q.o) && q.o.length >= 2);

  return {
    preview,
    categories: () => cats,
    cat: id => catMap[id],
    all: () => items,
    get: id => map[id],
    byType: t => items.filter(i => i.type === t),
    byCat: (c, t) => items.filter(i => i.cat === c && (!t || t === 'todo' || i.type === t)),
    questions: () => questions,
    search(q) {
      const terms = norm(q).split(/\s+/).filter(t => t.length > 1);
      if (!terms.length) return [];
      return items
        .filter(i => terms.every(t => i._search.includes(t)))
        .map(i => ({ i, s: terms.reduce((n, t) => n + (i._title.includes(t) ? 3 : 0), 0) + (i.type === 'articulo' ? 1 : 0) }))
        .sort((a, b) => b.s - a.s).map(x => x.i);
    }
  };
})();

/* ================= 4. USER REPO ================= */
const UserRepo = (() => {
  const K = 'sq.user.v1';
  const fresh = () => ({
    v: 1, name: '', created: Date.now(), xp: 0,
    favs: [], read: {}, seen: {}, days: {},
    streak: { cur: 0, best: 0, last: null },
    quiz: { played: 0, answered: 0, correct: 0, best: {}, qSeen: {} },
    bag: [], recent: []
  });
  const base = fresh();
  const stored = Storage.get(K, {}) || {};
  let u = { ...base, ...stored, streak: { ...base.streak, ...(stored.streak || {}) }, quiz: { ...base.quiz, ...(stored.quiz || {}) } };
  const save = () => Storage.set(K, u);
  const activity = () => {
    const t = dayKey();
    if (u.streak.last === t) return;
    u.streak.cur = u.streak.last === t - 1 ? u.streak.cur + 1 : 1;
    u.streak.best = Math.max(u.streak.best, u.streak.cur);
    u.streak.last = t; u.days[t] = 1;
  };
  return {
    get: () => u,
    name: () => u.name || '',
    setName(n) { u.name = String(n || '').trim().slice(0, 30); save(); },
    isFav: id => u.favs.includes(id),
    toggleFav(id) { const on = !u.favs.includes(id); u.favs = on ? [id, ...u.favs] : u.favs.filter(x => x !== id); save(); return on; },
    isRead: id => !!u.read[id],
    markRead(id) { if (u.read[id]) return false; u.read[id] = Date.now(); u.xp += 20; activity(); save(); return true; },
    isSeen: id => !!u.seen[id],
    markSeen(id) { if (u.seen[id]) return false; u.seen[id] = Date.now(); u.xp += 5; activity(); save(); return true; },
    streak() { const t = dayKey(); const s = u.streak; return { cur: s.last === t || s.last === t - 1 ? s.cur : 0, best: s.best, today: s.last === t }; },
    quizDone(res) {
      const q = u.quiz; q.played++; q.answered += res.total; q.correct += res.correct;
      const pct = Math.round(res.correct / res.total * 100);
      const key = String(res.level);
      const isBest = pct > (q.best[key] || 0);
      if (isBest) q.best[key] = pct;
      u.xp += res.xp; activity(); save(); return isBest;
    },
    qSeen(id) { u.quiz.qSeen[id] = Date.now(); save(); },
    bag: () => u.bag, setBag(b) { u.bag = b; save(); },
    pushRecent(q) { q = q.trim(); if (!q) return; u.recent = [q, ...u.recent.filter(x => x !== q)].slice(0, 6); save(); },
    recent: () => u.recent,
    reset() { u = fresh(); save(); }
  };
})();

/* ================= 5. SERVICES ================= */
const Services = {
  daily() {
    const pool = ContentRepo.all().filter(i => i.type !== 'mito');
    if (!pool.length) return null;
    const order = shuffle(pool.map(i => i.id).sort(), rng(20261125));
    return ContentRepo.get(order[dayKey() % order.length]);
  },
  /* «Sorpréndeme»: bolsa barajada. No repite nada hasta haber mostrado todo el catálogo,
     y al rebarajar evita que los últimos vistos salgan primero. */
  surprise() {
    const ids = ContentRepo.all().map(i => i.id);
    if (!ids.length) return null;
    let bag = UserRepo.bag().filter(id => ids.includes(id));
    if (!bag.length) {
      const recentSeen = Object.entries(UserRepo.get().seen).concat(Object.entries(UserRepo.get().read))
        .sort((a, b) => b[1] - a[1]).slice(0, 5).map(x => x[0]);
      const fresh = shuffle(ids);
      bag = [...fresh.filter(id => !recentSeen.includes(id)), ...fresh.filter(id => recentSeen.includes(id))];
    }
    const id = bag.shift(); UserRepo.setBag(bag);
    return ContentRepo.get(id);
  },
  level(xp) {
    const names = ['Curioso', 'Aprendiz', 'Explorador', 'Investigador', 'Erudito', 'Sabio', 'Enciclopedia viviente'];
    const lv = Math.floor(Math.sqrt(xp / 40));
    const cur = 40 * lv * lv, next = 40 * (lv + 1) * (lv + 1);
    return { n: lv + 1, name: names[Math.min(lv, names.length - 1)], pct: Math.round((xp - cur) / (next - cur) * 100), toNext: next - xp };
  },
  buildQuiz(level, cat, n = 10) {
    const seen = UserRepo.get().quiz.qSeen;
    let pool = ContentRepo.questions().filter(q => (!level || q.level === level) && (cat === 'all' || q.cat === cat));
    // Primero las nunca vistas (barajadas), luego las vistas hace más tiempo.
    const unseen = shuffle(pool.filter(q => !seen[q.id]));
    const old = pool.filter(q => seen[q.id]).sort((a, b) => seen[a.id] - seen[b.id]);
    return [...unseen, ...old].slice(0, n).map(q => {
      const opts = shuffle(q.o.map((t, k) => ({ t, ok: k === q.a })));
      return { ...q, opts };
    });
  }
};

/* ================= 6. UI ================= */
const ICON = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
  compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/></svg>',
  quiz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.2M12 17h.01"/></svg>',
  bookmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z"/></svg>',
  bookmarkFill: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v13M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>',
  shuffle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z"/></svg>'
};

/* Portadas ilustradas generadas en código: sin peticiones de red, únicas por contenido. */
let svgUid = 0;
function cover(item, { w = 800, h = 500, glyph = true } = {}) {
  if (item.img) return `<img src="${esc(item.img)}" alt="" loading="lazy" decoding="async">`;
  const cat = ContentRepo.cat(item.cat) || { color: '#8f7cff', icon: '✦', name: '' };
  const r = rng(hash(item.id)), c = cat.color, id = 'g' + (++svgUid);
  const cx = 25 + r() * 50, cy = 20 + r() * 45;
  const motif = hash(item.id + 'm') % 3;
  let shapes = '';
  if (motif === 0) {
    for (let k = 1; k <= 5; k++) shapes += `<circle cx="${cx * w / 100}" cy="${cy * h / 100}" r="${k * (60 + r() * 30)}" fill="none" stroke="${c}" stroke-opacity="${.32 - k * .05}" stroke-width="${k === 2 ? 1.6 : 1}"/>`;
    shapes += `<circle cx="${cx * w / 100 + 120 + r() * 80}" cy="${cy * h / 100 - 40}" r="${6 + r() * 6}" fill="${c}" fill-opacity=".9"/>`;
  } else if (motif === 1) {
    const amp = 18 + r() * 26, ph = r() * 6;
    for (let k = 0; k < 9; k++) {
      let d = `M0 ${h * .25 + k * 34}`;
      for (let x = 0; x <= w; x += 40) d += ` L${x} ${(h * .25 + k * 34 + Math.sin(x / 90 + ph + k * .4) * amp).toFixed(1)}`;
      shapes += `<path d="${d}" fill="none" stroke="${c}" stroke-opacity="${.08 + k * .025}" stroke-width="1.2"/>`;
    }
  } else {
    const s = 38;
    for (let x = s / 2; x < w; x += s) for (let y = s / 2; y < h; y += s) {
      const dx = x - cx * w / 100, dy = y - cy * h / 100, dist = Math.sqrt(dx * dx + dy * dy);
      const o = Math.max(0, .55 - dist / 520);
      if (o > .03) shapes += `<circle cx="${x}" cy="${y}" r="${1.2 + o * 3}" fill="${c}" fill-opacity="${o.toFixed(2)}"/>`;
    }
    shapes += `<rect x="${w * .62}" y="${h * .18}" width="${w * .22}" height="${w * .22}" rx="18" fill="none" stroke="${c}" stroke-opacity=".35" transform="rotate(${(r() * 30 - 15).toFixed(1)} ${w * .73} ${h * .18 + w * .11})"/>`;
  }
  const gx = (cx > 50 ? 32 : 68), gy = 50;
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Ilustración: ${esc(cat.name)}">
<defs><radialGradient id="${id}" cx="${cx}%" cy="${cy}%" r="85%"><stop offset="0" stop-color="${c}" stop-opacity=".62"/><stop offset=".45" stop-color="${c}" stop-opacity=".14"/><stop offset="1" stop-color="#07080b" stop-opacity="0"/></radialGradient>
<linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#15171f"/><stop offset="1" stop-color="#0a0b0f"/></linearGradient></defs>
<rect width="${w}" height="${h}" fill="url(#${id}b)"/><rect width="${w}" height="${h}" fill="url(#${id})"/>${shapes}
${glyph ? `<text x="${gx}%" y="${gy}%" font-size="${h * .34}" text-anchor="middle" dominant-baseline="central" opacity=".95">${cat.icon}</text>` : ''}
</svg>`;
}

const catChip = item => { const c = ContentRepo.cat(item.cat); return c ? `<span class="chip" style="color:${c.color}"><span class="dot"></span>${esc(c.name)}</span>` : ''; };
const lvlBars = n => `<span class="lvl" title="Nivel ${LEVEL[n] || ''}">${[1, 2, 3].map(k => `<b class="${k <= n ? 'on' : ''}"></b>`).join('')}</span>`;
const metaLine = (i, extra = '') => `<div class="meta"><span>${ICON.clock}${i.read} min</span><span>${lvlBars(i.level || 1)} ${LEVEL[i.level || 1]}</span>${extra}</div>`;
const kindColor = t => t === 'mito' ? '#ffb08a' : t === 'curiosidad' ? 'var(--ac2)' : 'var(--tx3)';
const href = i => i.type === 'articulo' ? `#/articulo/${i.id}` : `#/dato/${i.id}`;

/* Tarjeta de descubrimiento rápido: muestra la afirmación y abre la explicación en una hoja */
const quickCard = i => {
  const c = ContentRepo.cat(i.cat) || {};
  return `<button class="quick" style="--qc:${c.color}" data-act="open" data-id="${i.id}">
    <span class="glyph">${c.icon || '✦'}</span>
    ${i.type === 'mito' ? '<span class="chip myth">Mito o realidad</span>' : ''}
    <p>${esc(i.title)}</p>
    <span class="foot"><span>${esc(c.name || '')}</span><b>Ver explicación →</b></span>
  </button>`;
};
const rowCard = i => `<a class="rowc" href="${href(i)}" ${i.type !== 'articulo' ? `data-act="open" data-id="${i.id}"` : ''}>
  <div class="cover">${cover(i, { w: 300, h: 300 })}</div>
  <div><span class="kind" style="color:${kindColor(i.type)}">${TYPE[i.type]}${UserRepo.isRead(i.id) || UserRepo.isSeen(i.id) ? ' · <span style="color:var(--ok)">✓ visto</span>' : ''}</span>
  <h4>${esc(i.title)}</h4>${metaLine(i)}</div></a>`;
const featCard = i => `<a class="card feat" href="#/articulo/${i.id}">
  <div class="cover">${cover(i)}</div>
  <div class="in">${catChip(i)}<h3>${esc(i.title)}</h3><p>${esc(i.desc)}</p>${metaLine(i, `<span>${fmtDate(i.date)}</span>`)}</div></a>`;
const emptyState = (ic, h, p, cta = '') => `<div class="empty"><div class="art-ic">${ic}</div><h3>${h}</h3><p>${p}</p>${cta}</div>`;
const favBtn = (id, label = true) => { const on = UserRepo.isFav(id); return `<button class="btn sm" data-act="fav" data-id="${id}" aria-pressed="${on}">${on ? ICON.bookmarkFill : ICON.bookmark}${label ? `<span>${on ? 'Guardado' : 'Guardar'}</span>` : ''}</button>`; };
const sourcesBlock = srcs => (srcs && srcs.length) ? `<div class="sources"><h3>Fuentes consultadas</h3><ol>${srcs.map(s => `<li><a href="${esc(s.u)}" target="_blank" rel="noopener noreferrer">${esc(s.t)}</a></li>`).join('')}</ol></div>` : '';

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('on'), 2200);
}

async function share(i) {
  const url = location.href.split('#')[0] + href(i);
  const text = `¿Sabías que…? ${i.title}`;
  try {
    if (navigator.share) { await navigator.share({ title: i.title, text, url }); return; }
  } catch (e) { if (e && e.name === 'AbortError') return; }
  try { await navigator.clipboard.writeText(`${text}\n${url}`); toast('Enlace copiado'); }
  catch { toast('No se pudo compartir en este navegador'); }
}

/* ----- Hoja (sheet) para curiosidades, mitos y sorpresas ----- */
const Sheet = {
  el: null, lastFocus: null,
  open(i, { surprise = false } = {}) {
    if (!i) return;
    this.lastFocus = document.activeElement;
    const c = ContentRepo.cat(i.cat) || {};
    const isArt = i.type === 'articulo';
    if (!isArt && UserRepo.markSeen(i.id)) refreshStats();
    const head = i.type === 'mito'
      ? `<span class="verdict ${i.verdict === 'matizado' ? 'matizado' : 'falso'}">${i.verdict === 'matizado' ? 'Verdad a medias' : 'Mito · Falso'}</span>`
      : catChip(i);
    $('#sheet .panel').innerHTML = `
      <div class="grab"></div>
      <button class="icon-btn x" data-act="sheet-close" aria-label="Cerrar">${ICON.close}</button>
      ${surprise ? `<div class="eyebrow" style="color:var(--ac2);margin-bottom:10px">✦ Sorpréndeme · ${TYPE[i.type]}</div>` : ''}
      <div class="cover mini-cover">${cover(i, { w: 800, h: 260 })}</div>
      <div style="margin-top:14px">${head}</div>
      <h2 class="claim" id="sheet-title">${esc(i.title)}</h2>
      <p class="lede">${esc(i.desc)}</p>
      ${isArt ? `<p class="full">${esc(i.intro)}</p>${metaLine(i)}` : `<p class="full">${esc(i.body)}</p>`}
      ${isArt ? '' : sourcesBlock(i.sources)}
      <div class="acts">
        ${isArt ? `<a class="btn pri" href="#/articulo/${i.id}" data-act="sheet-close-nav">Leer artículo ${ICON.arrow}</a>` : ''}
        ${surprise ? `<button class="btn ${isArt ? '' : 'ac'}" data-act="surprise">${ICON.shuffle} Otro</button>` : ''}
        ${favBtn(i.id)}
        <button class="btn sm" data-act="share" data-id="${i.id}">${ICON.share}<span>Compartir</span></button>
      </div>
      <div class="faint" style="font-size:12.5px;margin-top:16px">${esc(c.name || '')} · ${esc(i.sub || '')}</div>`;
    const s = $('#sheet'); s.classList.add('open'); s.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('#sheet .panel').scrollTop = 0;
    setTimeout(() => $('#sheet .x').focus({ preventScroll: true }), 50);
  },
  close() {
    const s = $('#sheet'); if (!s.classList.contains('open')) return;
    s.classList.remove('open'); s.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (this.lastFocus && this.lastFocus.focus) this.lastFocus.focus({ preventScroll: true });
  },
  isOpen: () => $('#sheet').classList.contains('open')
};

function refreshStats() { /* se re-renderizan al navegar; aquí actualizamos el avatar */ renderAvatar(); }
function renderAvatar() {
  const n = UserRepo.name();
  $$('.js-avatar').forEach(a => { a.textContent = n ? n[0].toUpperCase() : '?'; });
}

/* ================= VISTAS ================= */
const Views = {};

Views.home = () => {
  const name = UserRepo.name();
  const h = new Date().getHours();
  const saludo = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
  const d = Services.daily();
  const quick = shuffle(ContentRepo.all().filter(i => i.type !== 'articulo'), rng(dayKey())).slice(0, 10);
  const arts = ContentRepo.byType('articulo');
  const featured = shuffle(arts, rng(dayKey() + 7)).filter(a => !d || a.id !== d.id);
  const recent = ContentRepo.all().slice(0, 6);
  const total = ContentRepo.all().length;
  const st = UserRepo.streak();
  return `
  <section class="welcome">
    <div class="eyebrow">${saludo}${name ? ', ' + esc(name) : ''}${st.cur > 1 ? ` · 🔥 ${st.cur} días seguidos` : ''}</div>
    <h1 class="h-display">Hoy vas a saber algo que <em>casi nadie sabe.</em></h1>
    <p>${total} descubrimientos con fuentes verificables. Sin anuncios, sin muros de pago: solo curiosidad.</p>
  </section>

  <a class="searchbar home-search" href="#/buscar" style="margin-bottom:18px" aria-label="Buscar">${ICON.search}<span>Buscar artículos, curiosidades, mitos…</span></a>

  ${d ? `<article class="card daily">
    <div class="cover">${cover(d, { w: 900, h: 600 })}</div>
    <div class="body">
      <div class="tag">El conocimiento del día</div>
      <h3>${esc(d.title)}</h3>
      <p>${esc(d.desc)}</p>
      <div class="row">
        <a class="btn pri" href="${href(d)}" ${d.type !== 'articulo' ? `data-act="open" data-id="${d.id}"` : ''}>Descubrir ${ICON.arrow}</a>
        ${favBtn(d.id)}
        <span class="faint" style="font-size:13px">${catChip(d)}</span>
      </div>
    </div></article>` : ''}

  <button class="surprise" data-act="surprise">
    <span class="ic">${ICON.shuffle}</span>
    <span><b>Sorpréndeme</b><span>Un descubrimiento al azar, sin repetir</span></span>
    <span class="arr">${ICON.arrow}</span>
  </button>

  <div class="sec"><div><h2>Descubrimientos rápidos</h2><p>Lee la afirmación. Toca para saber por qué es cierta (o falsa).</p></div></div>
  <div class="rail">${quick.map(quickCard).join('')}</div>

  <div class="sec"><div><h2>Explorar categorías</h2><p>13 áreas del conocimiento</p></div><a class="more" href="#/explorar">Ver todo</a></div>
  ${catsGrid()}

  <div class="sec"><div><h2>Artículos destacados</h2><p>Lecturas para entender el porqué de las cosas</p></div><a class="more" href="#/explorar?tipo=articulo">Ver todos</a></div>
  <div class="editorial">
    ${featured[0] ? featCard(featured[0]) : ''}
    <div class="rows">${featured.slice(1, 5).map(rowCard).join('')}</div>
  </div>

  <div class="sec"><div><h2>Recién publicado</h2><p>Lo último que añadimos</p></div></div>
  <div class="list two">${recent.map(rowCard).join('')}</div>

  <p class="foot-note">¿SABÍAS QUE? · Contenido educativo gratuito.<br>Cada dato incluye sus fuentes para que puedas comprobarlo.</p>`;
};

function catsGrid() {
  return `<div class="cats">${ContentRepo.categories().map(c => {
    const n = ContentRepo.byCat(c.id).length;
    return `<a class="cat" href="#/categoria/${c.id}" style="--cc:${c.color}">
      <span class="gl">${c.icon}</span><span><b>${esc(c.name)}</b><small>${plural(n, 'contenido', 'contenidos')}</small></span></a>`;
  }).join('')}</div>`;
}

const typeSeg = (cur, base) => `<div class="seg" role="tablist">${[['todo', 'Todo'], ['articulo', 'Artículos'], ['curiosidad', 'Curiosidades'], ['mito', 'Mitos y realidades']]
  .map(([v, l]) => `<button role="tab" aria-selected="${cur === v}" class="${cur === v ? 'on' : ''}" data-act="nav" data-to="${base}${v === 'todo' ? '' : '?tipo=' + v}">${l}</button>`).join('')}</div>`;

Views.explore = (p, q) => {
  const tipo = q.get('tipo') || 'todo';
  const list = tipo === 'todo' ? null : ContentRepo.byType(tipo);
  return `
  <div class="sec" style="margin-top:8px"><div><h1 class="h1">Explorar</h1><p>Elige un tema o un tipo de contenido.</p></div></div>
  <a class="searchbar" href="#/buscar" style="margin-bottom:14px">${ICON.search}<span>Buscar en todo el catálogo…</span></a>
  ${typeSeg(tipo, '#/explorar')}
  ${list ? `<div class="sec"><div><h2>${TYPE[tipo]}${tipo === 'mito' ? '' : 's'}</h2><p>${plural(list.length, 'resultado', 'resultados')}</p></div></div><div class="list two">${list.map(rowCard).join('')}</div>`
      : `<div style="margin-top:16px">${catsGrid()}</div>`}`;
};

Views.category = ([id], q) => {
  const c = ContentRepo.cat(id);
  if (!c) return Views.notFound();
  const tipo = q.get('tipo') || 'todo';
  const list = ContentRepo.byCat(id, tipo);
  return `
  <button class="back" data-act="back">${ICON.back} Volver</button>
  <header class="cat-hero" style="--cc:${c.color}"><div class="gl">${c.icon}</div><h1 class="h1">${esc(c.name)}</h1><p>${esc(c.desc)}</p></header>
  ${typeSeg(tipo, '#/categoria/' + id)}
  <div style="margin-top:14px">${list.length ? `<div class="list two">${list.map(rowCard).join('')}</div>`
      : emptyState(c.icon, 'Nada por aquí todavía', 'No hay contenidos de este tipo en esta categoría. Prueba con otro filtro.', `<a class="btn" href="#/categoria/${id}">Ver todo en ${esc(c.name)}</a>`)}</div>`;
};

Views.search = (p, q) => {
  const term = q.get('q') || '';
  return `
  <div style="margin-top:6px">
    <label class="searchbar" for="q">${ICON.search}<input id="q" type="search" enterkeyhint="search" autocomplete="off" placeholder="Ej.: pulpo, inflación, Platón…" value="${esc(term)}"></label>
  </div>
  <div id="results" style="margin-top:16px">${searchResults(term)}</div>`;
};
function searchResults(term) {
  if (!term.trim()) {
    const rec = UserRepo.recent();
    const sug = ['cerebro', 'Venus', 'vikingos', 'República Dominicana', 'inflación', 'pulpo'];
    return `<div class="eyebrow" style="margin:6px 0 10px">${rec.length ? 'Búsquedas recientes' : 'Prueba con'}</div>
      <div class="seg" style="flex-wrap:wrap">${(rec.length ? rec : sug).map(s => `<button data-act="search-term" data-v="${esc(s)}">${esc(s)}</button>`).join('')}</div>
      <div class="sec"><div><h2>Explora por tema</h2></div></div>${catsGrid()}`;
  }
  const r = ContentRepo.search(term);
  if (!r.length) return emptyState('🔍', 'Sin resultados', `No encontramos nada para «${esc(term)}». Prueba con otra palabra o explora por categorías.`, '<a class="btn" href="#/explorar">Explorar categorías</a>');
  return `<div class="faint" style="font-size:13px;margin-bottom:10px">${plural(r.length, 'resultado', 'resultados')}</div><div class="list two">${r.map(rowCard).join('')}</div>`;
}

Views.article = ([id]) => {
  const i = ContentRepo.get(id);
  if (!i) return Views.notFound();
  if (i.type !== 'articulo') return Views.fact([id]);
  const c = ContentRepo.cat(i.cat) || {};
  const related = ContentRepo.byCat(i.cat).filter(x => x.id !== i.id).slice(0, 4);
  const read = UserRepo.isRead(i.id);
  return `
  <article class="art" data-article="${i.id}">
    <div class="art-top"><button class="back" data-act="back">${ICON.back} Volver</button>
      <div style="display:flex;gap:8px">${favBtn(i.id, false)}<button class="btn sm" data-act="share" data-id="${i.id}" aria-label="Compartir">${ICON.share}</button></div></div>
    <header class="art-head">
      ${catChip(i)}
      <h1>${esc(i.title)}</h1>
      <p class="sub">${esc(i.subtitle || i.desc)}</p>
      ${metaLine(i, `<span>${esc(i.sub || '')}</span><span>${fmtDate(i.date)}</span>`)}
    </header>
    <div class="cover art-hero">${cover(i, { w: 1200, h: 675 })}</div>
    <div class="art-actions">${favBtn(i.id)}<button class="btn sm" data-act="share" data-id="${i.id}">${ICON.share}<span>Compartir</span></button></div>
    <div class="prose">
      <p class="lead">${esc(i.intro)}</p>
      ${(i.sections || []).map((s, k) => `<h2><span class="n">${String(k + 1).padStart(2, '0')}</span>${esc(s.h)}</h2>${(s.p || []).map(t => `<p>${esc(t)}</p>`).join('')}`).join('')}
      ${(i.facts || []).length ? `<aside class="box"><h3>Datos complementarios</h3><ul>${i.facts.map(f => `<li>${esc(f)}</li>`).join('')}</ul></aside>` : ''}
      ${i.conclusion ? `<h2><span class="n">EN RESUMEN</span>Conclusión</h2><p class="conclusion">${esc(i.conclusion)}</p>` : ''}
    </div>
    ${sourcesBlock(i.sources)}
    <p class="verify">¿Encontraste un error? Revisa las fuentes enlazadas: toda afirmación de este artículo debería poder comprobarse en ellas.</p>
    <div class="endread ${read ? 'done' : ''}" id="endread">${read ? `${ICON.check} Artículo leído · +20 XP` : 'Llega al final para marcarlo como leído'}</div>
    ${related.length ? `<div class="sec"><div><h2>Más de ${esc(c.name)}</h2></div></div><div class="list">${related.map(rowCard).join('')}</div>` : ''}
  </article>`;
};

/* Página completa para curiosidades y mitos (enlaces compartidos y búsqueda directa) */
Views.fact = ([id]) => {
  const i = ContentRepo.get(id);
  if (!i) return Views.notFound();
  if (i.type === 'articulo') return Views.article([id]);
  if (UserRepo.markSeen(i.id)) renderAvatar();
  const related = ContentRepo.byCat(i.cat).filter(x => x.id !== i.id).slice(0, 4);
  return `<article class="art">
    <div class="art-top"><button class="back" data-act="back">${ICON.back} Volver</button></div>
    <div class="cover art-hero" style="margin-top:0">${cover(i, { w: 1200, h: 520 })}</div>
    <header class="art-head" style="margin-top:22px">
      ${i.type === 'mito' ? `<span class="verdict ${i.verdict === 'matizado' ? 'matizado' : 'falso'}" style="margin-bottom:14px">${i.verdict === 'matizado' ? 'Verdad a medias' : 'Mito · Falso'}</span>` : catChip(i)}
      <h1>${esc(i.title)}</h1><p class="sub">${esc(i.desc)}</p>${metaLine(i)}
    </header>
    <div class="prose"><p>${esc(i.body)}</p></div>
    <div class="art-actions">${favBtn(i.id)}<button class="btn sm" data-act="share" data-id="${i.id}">${ICON.share}<span>Compartir</span></button><button class="btn sm" data-act="surprise">${ICON.shuffle}<span>Sorpréndeme</span></button></div>
    ${sourcesBlock(i.sources)}
    ${related.length ? `<div class="sec"><div><h2>Relacionado</h2></div></div><div class="list">${related.map(rowCard).join('')}</div>` : ''}
  </article>`;
};

Views.saved = (p, q) => {
  const tab = q.get('tab') || 'todo';
  const favs = UserRepo.get().favs.map(ContentRepo.get).filter(Boolean);
  const list = favs.filter(i => tab === 'todo' || (tab === 'articulo' ? i.type === 'articulo' : i.type !== 'articulo'));
  return `
  <div class="sec" style="margin-top:8px"><div><h1 class="h1">Guardados</h1><p>Tu biblioteca personal${favs.length ? ' · ' + plural(favs.length, 'elemento', 'elementos') : ''}</p></div></div>
  ${favs.length ? `<div class="seg">${[['todo', 'Todo'], ['articulo', 'Artículos'], ['datos', 'Curiosidades y mitos']].map(([v, l]) => `<button class="${tab === v ? 'on' : ''}" data-act="nav" data-to="#/guardados${v === 'todo' ? '' : '?tab=' + v}">${l}</button>`).join('')}</div>` : ''}
  <div style="margin-top:14px">${list.length ? `<div class="list two">${list.map(rowCard).join('')}</div>`
      : favs.length ? emptyState('🗂️', 'Nada en esta pestaña', 'Lo que guardes de este tipo aparecerá aquí.')
        : emptyState('🔖', 'Tu biblioteca está vacía', 'Toca «Guardar» en cualquier artículo o curiosidad y lo tendrás aquí siempre, incluso sin conexión.', '<button class="btn ac" data-act="surprise">' + ICON.shuffle + ' Descubrir algo ahora</button>')}</div>`;
};

/* ----- Quiz ----- */
const Quiz = { level: 0, cat: 'all', list: [], i: 0, correct: 0, xp: 0, wrong: [], answered: false };
Views.quiz = () => {
  if (Quiz.list.length && Quiz.i < Quiz.list.length) return quizQuestion();
  if (Quiz.list.length && Quiz.i >= Quiz.list.length) return quizResult();
  const best = UserRepo.get().quiz.best;
  const levels = [[0, '🎲', 'Mixto', 'Todos los niveles'], [1, '🌱', 'Fácil', 'Cultura general básica'], [2, '🔥', 'Medio', 'Para curiosos'], [3, '🧠', 'Difícil', 'Solo para expertos']];
  const avail = Services.buildQuiz(Quiz.level, Quiz.cat, 999).length;
  return `<div class="quiz-wrap">
    <div class="sec" style="margin-top:8px"><div><h1 class="h1">Quiz</h1><p>${plural(ContentRepo.questions().length, 'pregunta', 'preguntas')} con explicación y fuente. Las que no has visto salen primero.</p></div></div>
    <div class="eyebrow">Dificultad</div>
    <div class="opt-grid c4">${levels.map(([v, e, n, d]) => `<button class="pick ${Quiz.level === v ? 'on' : ''}" data-act="q-level" data-v="${v}"><span class="em">${e}</span><span>${n}<small>${d}${best[v] ? ` · récord ${best[v]}%` : ''}</small></span></button>`).join('')}</div>
    <div class="eyebrow" style="margin-top:16px">Tema</div>
    <div class="seg" style="flex-wrap:wrap;margin-top:10px">
      <button class="${Quiz.cat === 'all' ? 'on' : ''}" data-act="q-cat" data-v="all">Todos</button>
      ${ContentRepo.categories().filter(c => ContentRepo.questions().some(q => q.cat === c.id)).map(c => `<button class="${Quiz.cat === c.id ? 'on' : ''}" data-act="q-cat" data-v="${c.id}">${c.icon} ${esc(c.name)}</button>`).join('')}
    </div>
    <div style="margin-top:22px">${avail ? `<button class="btn ac block" data-act="q-start">Empezar · ${Math.min(10, avail)} preguntas</button>`
      : `<p class="muted" style="text-align:center">No hay preguntas con esa combinación. Prueba otro nivel o tema.</p>`}</div>
  </div>`;
};
function quizQuestion() {
  const q = Quiz.list[Quiz.i], n = Quiz.list.length;
  return `<div class="quiz-wrap">
    <div class="qbar"><button class="icon-btn" data-act="q-quit" aria-label="Salir del quiz">${ICON.close}</button><div class="track"><i style="width:${Quiz.i / n * 100}%"></i></div><span>${Quiz.i + 1}/${n}</span></div>
    <div class="card qcard">${catChip(q)} <span class="chip">${LEVEL[q.level]}</span><h2>${esc(q.q)}</h2></div>
    <div id="answers">${q.opts.map((o, k) => `<button class="ans" data-act="q-ans" data-i="${k}"><span class="k">${'ABCD'[k]}</span><span>${esc(o.t)}</span></button>`).join('')}</div>
    <div id="fb"></div>
  </div>`;
}
function quizAnswer(k) {
  if (Quiz.answered) return;
  Quiz.answered = true;
  const q = Quiz.list[Quiz.i], ok = q.opts[k].ok;
  UserRepo.qSeen(q.id);
  if (ok) { Quiz.correct++; Quiz.xp += 10 * q.level; } else Quiz.wrong.push(q);
  $$('#answers .ans').forEach((b, j) => {
    b.disabled = true;
    if (q.opts[j].ok) b.classList.add('ok'); else if (j === k) b.classList.add('bad'); else b.classList.add('dim');
  });
  const ref = q.ref && ContentRepo.get(q.ref);
  const last = Quiz.i === Quiz.list.length - 1;
  $('#fb').innerHTML = `<div class="feedback"><b class="${ok ? 'ok' : 'bad'}">${ok ? '¡Correcto! +' + 10 * q.level + ' XP' : 'No era esa'}</b><p>${esc(q.exp)}</p>
    <div class="row"><button class="btn ac" data-act="q-next">${last ? 'Ver resultado' : 'Siguiente'} ${ICON.arrow}</button>
    ${ref ? `<a class="btn sm" href="${href(ref)}" ${ref.type !== 'articulo' ? `data-act="open" data-id="${ref.id}"` : ''}>Saber más</a>` : ''}</div></div>`;
  $('#fb').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function quizResult() {
  const n = Quiz.list.length, pct = Math.round(Quiz.correct / n * 100);
  if (!Quiz.saved) { Quiz.isBest = UserRepo.quizDone({ total: n, correct: Quiz.correct, xp: Quiz.xp, level: Quiz.level }); Quiz.saved = true; }
  const msg = pct === 100 ? 'Perfecto. Impresionante.' : pct >= 70 ? 'Muy bien. Sabes más que la mayoría.' : pct >= 40 ? 'Nada mal. Cada error es algo nuevo que ahora sabes.' : 'Hoy aprendiste mucho. Repasa y vuelve a intentarlo.';
  const C = 2 * Math.PI * 64;
  return `<div class="quiz-wrap" style="text-align:center">
    <div class="eyebrow" style="margin-top:14px">Resultado</div>
    <div class="score-ring"><svg viewBox="0 0 150 150"><circle cx="75" cy="75" r="64" fill="none" stroke="var(--g3)" stroke-width="10"/><circle cx="75" cy="75" r="64" fill="none" stroke="var(--ac)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct / 100)}"/></svg><div class="v">${Quiz.correct}/${n}</div></div>
    <h2 class="h2">${msg}</h2>
    <p class="muted" style="margin-top:6px">+${Quiz.xp} XP${Quiz.isBest ? ' · ¡Nuevo récord en este nivel!' : ''}</p>
    <div style="display:flex;gap:10px;justify-content:center;margin-top:20px;flex-wrap:wrap"><button class="btn ac" data-act="q-start">Jugar otra vez</button><button class="btn" data-act="q-quit">Cambiar ajustes</button></div>
    ${Quiz.wrong.length ? `<div style="text-align:left"><div class="sec"><div><h2>Para repasar</h2><p>Las que fallaste, con su respuesta correcta</p></div></div>
      <div class="list">${Quiz.wrong.map(q => `<div class="card" style="padding:16px 18px"><div class="faint" style="font-size:13px">${esc(q.q)}</div><div style="font-weight:700;margin:6px 0;color:var(--ok)">${esc(q.o[q.a])}</div><div class="muted" style="font-size:14.5px">${esc(q.exp)}</div></div>`).join('')}</div></div>` : ''}
  </div>`;
}
function quizStart() {
  Object.assign(Quiz, { list: Services.buildQuiz(Quiz.level, Quiz.cat, 10), i: 0, correct: 0, xp: 0, wrong: [], answered: false, saved: false, isBest: false });
  render();
}

/* ----- Perfil ----- */
Views.profile = () => {
  const u = UserRepo.get(), lv = Services.level(u.xp), st = UserRepo.streak();
  const arts = ContentRepo.byType('articulo');
  const readN = arts.filter(a => u.read[a.id]).length;
  const seenN = ContentRepo.all().filter(i => i.type !== 'articulo' && u.seen[i.id]).length;
  const acc = u.quiz.answered ? Math.round(u.quiz.correct / u.quiz.answered * 100) : 0;
  const t = dayKey();
  const week = Array.from({ length: 7 }, (_, k) => u.days[t - 6 + k] ? 'on' : '');
  return `
  <div class="prof-head">
    <div class="avatar js-avatar">${esc((u.name || '?')[0].toUpperCase())}</div>
    <div style="flex:1;min-width:0">
      <label class="sr" for="pname">Tu nombre</label>
      <input id="pname" value="${esc(u.name)}" placeholder="¿Cómo te llamas?" maxlength="30" autocomplete="given-name">
      <div class="faint" style="font-size:13px;margin-top:4px">Nivel ${lv.n} · ${lv.name} · ${u.xp} XP</div>
      <div class="lvlbar"><i style="width:${lv.pct}%"></i></div>
      <div class="faint" style="font-size:12px;margin-top:4px">${lv.toNext} XP para el siguiente nivel</div>
    </div>
  </div>
  <div class="streak"><span class="fire">🔥</span><div><b>${plural(st.cur, 'día', 'días')}</b><div class="faint" style="font-size:13px">Racha actual · récord ${st.best}${st.today ? '' : ' · aprende algo hoy para mantenerla'}</div></div><div class="week" aria-label="Actividad de los últimos 7 días">${week.map(w => `<i class="${w}"></i>`).join('')}</div></div>
  <div class="stats">
    <div class="stat"><b>${readN}<span class="faint" style="font-size:16px">/${arts.length}</span></b><span>Artículos leídos</span></div>
    <div class="stat"><b>${seenN}</b><span>Datos descubiertos</span></div>
    <div class="stat"><b>${u.quiz.played}</b><span>Quizzes jugados</span></div>
    <div class="stat"><b>${acc}%</b><span>Acierto en quiz</span></div>
  </div>
  <div class="sec"><div><h2>Récords por nivel</h2></div></div>
  <div class="stats">${[[1, 'Fácil'], [2, 'Medio'], [3, 'Difícil'], [0, 'Mixto']].map(([k, n]) => `<div class="stat"><b>${u.quiz.best[k] ? u.quiz.best[k] + '%' : '—'}</b><span>${n}</span></div>`).join('')}</div>
  <div class="sec"><div><h2>Progreso por categoría</h2><p>Contenidos vistos de cada tema</p></div></div>
  <div class="progress-cats">${ContentRepo.categories().map(c => {
    const all = ContentRepo.byCat(c.id); const done = all.filter(i => u.read[i.id] || u.seen[i.id]).length;
    const pc = all.length ? Math.round(done / all.length * 100) : 0;
    return `<a class="pc" href="#/categoria/${c.id}" style="--cc:${c.color}"><span>${c.icon}</span><span>${esc(c.name)}</span><span class="faint">${done}/${all.length}</span><span class="bar"><i style="width:${pc}%"></i></span></a>`;
  }).join('')}</div>
  <div class="danger"><b style="color:var(--tx)">Tus datos</b><br>Tu progreso se guarda solo en este dispositivo. Cuando la plataforma tenga cuentas, podrás sincronizarlo.
    <div style="margin-top:12px" id="resetbox"><button class="btn sm" data-act="reset">Borrar mi progreso</button></div></div>`;
};

Views.notFound = () => emptyState('🧭', 'No encontramos esa página', 'Puede que el enlace esté mal o que el contenido ya no esté publicado.', '<a class="btn ac" href="#/">Ir al inicio</a>');

/* ================= 7. ROUTER ================= */
const ROUTES = [
  [/^\/?$/, 'home', Views.home, 'inicio'],
  [/^\/explorar$/, 'explore', Views.explore, 'explorar'],
  [/^\/categoria\/([\w-]+)$/, 'category', Views.category, 'explorar'],
  [/^\/buscar$/, 'search', Views.search, 'explorar'],
  [/^\/articulo\/([\w-]+)$/, 'article', Views.article, ''],
  [/^\/dato\/([\w-]+)$/, 'fact', Views.fact, ''],
  [/^\/quiz$/, 'quiz', Views.quiz, 'quiz'],
  [/^\/guardados$/, 'saved', Views.saved, 'guardados'],
  [/^\/perfil$/, 'profile', Views.profile, 'perfil']
];
let current = { name: '', path: '' };
function parse() {
  const raw = decodeURIComponent(location.hash.replace(/^#/, '')) || '/';
  const [path, qs] = raw.split('?');
  return { path, q: new URLSearchParams(qs || '') };
}
function render() {
  const { path, q } = parse();
  let match = null;
  for (const [re, name, fn, tab] of ROUTES) { const m = path.match(re); if (m) { match = { name, fn, tab, args: m.slice(1) }; break; } }
  if (!match) match = { name: '404', fn: Views.notFound, tab: '', args: [] };
  const view = $('#view');
  const samePage = current.name === match.name && current.path === path;
  try { view.innerHTML = match.fn(match.args, q); }
  catch (e) { console.error(e); view.innerHTML = Views.notFound(); }
  if (!samePage) { view.style.animation = 'none'; void view.offsetWidth; view.style.animation = ''; window.scrollTo(0, 0); }
  current = { name: match.name, path };
  $$('[data-tab]').forEach(a => a.classList.toggle('on', a.dataset.tab === match.tab));
  $$('[data-tab]').forEach(a => a.dataset.tab === match.tab ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
  const titleEl = $('h1', view);
  document.title = (match.name === 'home' ? '' : (titleEl ? titleEl.textContent.trim() + ' · ' : '')) + '¿SABÍAS QUE?';
  afterRender(match.name);
}

function afterRender(name) {
  $('#progress').style.width = '0';
  if (name === 'search') {
    const inp = $('#q');
    if (inp) {
      if (matchMedia('(hover:hover)').matches || !inp.value) inp.focus({ preventScroll: true });
      let t;
      inp.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => {
          $('#results').innerHTML = searchResults(inp.value);
          history.replaceState(null, '', '#/buscar' + (inp.value ? '?q=' + encodeURIComponent(inp.value) : ''));
        }, 140);
      });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { UserRepo.pushRecent(inp.value); inp.blur(); } });
    }
  }
  if (name === 'profile') {
    const inp = $('#pname');
    inp && inp.addEventListener('change', () => { UserRepo.setName(inp.value); renderAvatar(); toast('Nombre guardado'); });
  }
  if (name === 'article') watchReading();
}

/* Marca como leído cuando el lector llega al final del artículo */
let readObs = null;
function watchReading() {
  if (readObs) readObs.disconnect();
  const art = $('[data-article]'); const end = $('#endread');
  if (!art || !end) return;
  const id = art.dataset.article;
  if (!UserRepo.isRead(id) && 'IntersectionObserver' in window) {
    readObs = new IntersectionObserver(es => {
      if (es.some(e => e.isIntersecting)) {
        if (UserRepo.markRead(id)) { end.classList.add('done'); end.innerHTML = `${ICON.check} Artículo leído · +20 XP`; toast('Artículo leído · +20 XP'); renderAvatar(); }
        readObs.disconnect();
      }
    }, { threshold: .9 });
    readObs.observe(end);
  }
}
function onScroll() {
  $('.top').classList.toggle('scrolled', scrollY > 6);
  if (current.name === 'article') {
    const art = $('.art'); if (!art) return;
    const r = art.getBoundingClientRect(), total = art.offsetHeight - innerHeight;
    $('#progress').style.width = Math.max(0, Math.min(100, (-r.top) / Math.max(1, total) * 100)) + '%';
  }
}

/* ================= EVENTOS ================= */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act, id = el.dataset.id;
  switch (act) {
    case 'open': {
      const i = ContentRepo.get(id);
      if (i && i.type !== 'articulo') { e.preventDefault(); Sheet.open(i); }
      break;
    }
    case 'surprise': {
      e.preventDefault();
      const b = $('.surprise'); if (b) { b.classList.remove('spin'); void b.offsetWidth; b.classList.add('spin'); }
      Sheet.open(Services.surprise(), { surprise: true });
      break;
    }
    case 'sheet-close': Sheet.close(); break;
    case 'sheet-close-nav': Sheet.close(); break;
    case 'fav': {
      const on = UserRepo.toggleFav(id);
      $$(`[data-act="fav"][data-id="${id}"]`).forEach(b => {
        const label = b.querySelector('span');
        b.setAttribute('aria-pressed', on);
        b.innerHTML = (on ? ICON.bookmarkFill : ICON.bookmark) + (label ? `<span>${on ? 'Guardado' : 'Guardar'}</span>` : '');
      });
      toast(on ? 'Guardado en tu biblioteca' : 'Eliminado de guardados');
      if (current.name === 'saved') render();
      break;
    }
    case 'share': { const i = ContentRepo.get(id); if (i) share(i); break; }
    case 'back':
      if (sessionStorage.getItem('sq.nav')) history.back(); // hubo navegación interna en esta sesión
      else location.hash = '#/';                            // llegó por enlace directo: volver al inicio
      break;
    case 'nav': location.hash = el.dataset.to; break;
    case 'search-term': {
      const inp = $('#q'); if (inp) { inp.value = el.dataset.v; inp.dispatchEvent(new Event('input')); UserRepo.pushRecent(el.dataset.v); }
      break;
    }
    case 'q-level': Quiz.level = +el.dataset.v; render(); break;
    case 'q-cat': Quiz.cat = el.dataset.v; render(); break;
    case 'q-start': quizStart(); break;
    case 'q-ans': quizAnswer(+el.dataset.i); break;
    case 'q-next': Quiz.i++; Quiz.answered = false; render(); window.scrollTo(0, 0); break;
    case 'q-quit': Quiz.list = []; render(); break;
    case 'reset':
      $('#resetbox').innerHTML = '<p style="margin-bottom:10px;color:var(--tx)">¿Seguro? Se borrarán favoritos, estadísticas y rachas. No se puede deshacer.</p><button class="btn sm" data-act="reset-yes" style="border-color:rgba(255,111,111,.5);color:#ff9a9a">Sí, borrar todo</button> <button class="btn sm ghost" data-act="reset-no">Cancelar</button>';
      break;
    case 'reset-yes': UserRepo.reset(); renderAvatar(); render(); toast('Progreso borrado'); break;
    case 'reset-no': render(); break;
    case 'exit-preview': Storage.del('sq.preview'); location.reload(); break;
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && Sheet.isOpen()) Sheet.close();
  if (e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); location.hash = '#/buscar'; }
});
/* Búsqueda desde el encabezado de escritorio */
$('#topq').addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.value.trim()) { UserRepo.pushRecent(e.target.value); location.hash = '#/buscar?q=' + encodeURIComponent(e.target.value.trim()); e.target.value = ''; e.target.blur(); }
});
window.addEventListener('hashchange', () => { sessionStorage.setItem('sq.nav', '1'); if (Sheet.isOpen()) Sheet.close(); render(); });
window.addEventListener('scroll', onScroll, { passive: true });

/* ================= ARRANQUE ================= */
if (ContentRepo.preview) {
  const b = document.createElement('div'); b.className = 'banner';
  b.innerHTML = '<span>Vista previa con el borrador del panel admin (solo en este dispositivo).</span><button class="btn sm" data-act="exit-preview">Salir</button>';
  $('.main').prepend(b);
}
renderAvatar();
render();
window.SQ = { ContentRepo, UserRepo, Services }; // útil para depurar y para pruebas
})();
