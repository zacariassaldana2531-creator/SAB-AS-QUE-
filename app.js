/* Lumbrario — Motor de la app v1
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
  const textOf = i => [i.intro, ...(i.sections || []).flatMap(s => [s.h, ...(s.p || []), s.example]), ...(i.timeline || []).map(e => e.y + ' ' + e.t), ...(i.concepts || []).map(c => c.t + ' ' + (c.d || '')), ...(i.facts || []), i.conclusion, i.desc, i.body, i.deep].filter(Boolean).join(' ');
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
  const items = (src.items || []).filter(i => i.status === 'publicado' && (!i.verif || i.verif.status === 'verificado')).map(enrich)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const map = Object.fromEntries(items.map(i => [i.id, i]));
  const reco = (window.SQ_RECO || { build: () => () => [] }).build(items, src.series || []);
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
    series: () => (src.series || []).map(x => ({ ...x, items: (x.ids || []).map(id => map[id]).filter(Boolean) })).filter(x => x.items.length),
    /* Colecciones editoriales transversales (no son categorías): p. ej. «Lo que pocos saben» */
    collections: () => (src.collections || []).map(x => ({ ...x, items: (x.ids || []).map(id => map[id]).filter(Boolean) })).filter(x => x.items.length),
    inCollection: (cid, id) => ((src.collections || []).find(x => x.id === cid) || { ids: [] }).ids.includes(id),
    corrections: () => (src.corrections || []).slice().sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    catImage: id => (catMap[id] || {}).img || null,
    /* Recomendaciones: motor compartido en reco.js (también lo usan las páginas estáticas) */
    recommend(i, n = 3) { return reco(i, n); },
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
  /* Selección que cambia cada día sin repetir hasta recorrer la lista */
  dailyRotate(list, n) {
    if (list.length <= n) return list;
    const order = shuffle(list.slice().sort((a, b) => a.id.localeCompare(b.id)), rng(20261126));
    const start = (dayKey() * n) % order.length;
    return Array.from({ length: n }, (_, k) => order[(start + k) % order.length]);
  },
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
  spark: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z"/></svg>',
  image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>',
  sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
  stop: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
  quote: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h4v4c0 3-2 5-4 6M15 7h4v4c0 3-2 5-4 6"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>'
};

/* Portadas ilustradas generadas en código: sin peticiones de red, únicas por contenido. */
let svgUid = 0;
function cover(item, { w = 800, h = 500, glyph = true } = {}) {
  if (item.img) return `<img src="${esc(item.img)}" alt="${esc(item.imgAlt || '')}" loading="lazy" decoding="async" referrerpolicy="no-referrer">`;
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
const paras = t => String(t || '').split(/\n\s*\n/).map(x => x.trim()).filter(Boolean).map(x => `<p>${esc(x)}</p>`).join('');
const deepBlock = i => i.deep ? `<aside class="deep"><span class="deep-h">${ICON.spark || '✦'} A fondo</span>${paras(i.deep)}</aside>` : '';
const metaLine = (i, extra = '') => `<div class="meta"><span>${ICON.clock}${i.read} min</span><span>${lvlBars(i.level || 1)} ${LEVEL[i.level || 1]}</span>${extra}</div>`;
const kindColor = t => t === 'mito' ? '#ffb08a' : t === 'curiosidad' ? 'var(--ac2)' : 'var(--tx3)';
const href = i => i.type === 'articulo' ? `#/articulo/${i.id}` : i.type === 'pais' ? `#/pais/${i.iso.toLowerCase()}` : i.type === 'anat' ? `#/anatomia/${i.slug}` : i.type === 'elem' ? `#/quimica/elemento/${i.slug}` : i.type === 'quim' ? `#/quimica/tema/${i.slug}` : `#/dato/${i.id}`;

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
/* Regla de veracidad: referencias completas, estado de verificación y tipo de afirmación */
const fmtLong = d => { try { const x = new Date(d + 'T12:00:00'); return `${x.getDate()} de ${MONTHS[x.getMonth()]} de ${x.getFullYear()}`; } catch { return d; } };
const SRC_KIND = { institucional: 'Institución oficial', academica: 'Fuente académica', enciclopedia: 'Enciclopedia', otra: 'Otra fuente' };
const CLAIMS = {
  hecho: ['Hecho comprobado', '#53d39a', 'Afirmación documentada en las fuentes citadas y comprobada contra su texto.'],
  teoria: ['Teoría científica respaldada', '#7fc4e8', 'Explicación aceptada por la comunidad científica y apoyada por estudios, que puede matizarse con nuevas investigaciones.'],
  hipotesis: ['Hipótesis', '#f2b84b', 'Explicación propuesta que todavía no está confirmada o que es objeto de debate entre especialistas.'],
  interpretacion: ['Interpretación histórica', '#c8a46a', 'Conclusión de los historiadores a partir de las pruebas disponibles; no es un dato documentado de forma directa.'],
  creencia: ['Creencia religiosa', '#b48ce6', 'Afirmación propia de una fe o tradición religiosa. Se presenta como lo que creen sus fieles, no como un hecho comprobado.'],
  leyenda: ['Leyenda', '#e07aa8', 'Relato tradicional sin respaldo documental suficiente para considerarlo un hecho.'],
  especulacion: ['Especulación', '#ff9a8a', 'Idea sin pruebas sólidas. Solo se menciona para explicar por qué no se sostiene o qué se sabe realmente.'],
  misterio: ['Misterio sin resolver', '#ff6f9a', 'Los hechos están documentados, pero la explicación sigue sin conocerse con certeza.'],
  debate: ['Debate filosófico abierto', '#9fa8ff', 'Pregunta sin una única respuesta correcta: se presentan las distintas posturas.']
};
const claimBadge = i => { const c = CLAIMS[i.claim]; return c ? `<button class="claim-b" data-act="claims" style="--k:${c[1]}" aria-label="Tipo de afirmación: ${c[0]}. Ver qué significa"><i></i>${c[0]}</button>` : ''; };
const claimNote = i => i.claimNote ? `<p class="claim-note"><b>Ten en cuenta:</b> ${esc(i.claimNote)}</p>` : '';
const verifBox = i => { const v = i && i.verif; if (!v) return ''; return `<div class="verif"><span class="ok">${ICON.check} Verificado</span><span>Última revisión: ${fmtLong(v.reviewed)}</span><span>${v.level === 'institucional' ? 'Incluye fuentes institucionales o académicas' : 'Fuentes de consulta enciclopédica · incorporación de fuentes institucionales en curso'}</span></div>`; };
const srcLine = (s, k) => `<li id="src-${k + 1}"><div><span class="sk">${SRC_KIND[s.kind] || 'Fuente'}</span><b>${esc(s.org || '')}</b>${s.org ? ' — ' : ''}<a href="${esc(s.u)}" target="_blank" rel="noopener noreferrer">«${esc(s.title || s.t)}»</a>${s.date ? ` (${esc(s.date)})` : ''}.${s.note ? ` <span class="faint">${esc(s.note)}</span>` : ''}${s.accessed ? ` <span class="faint">Consultado el ${fmtLong(s.accessed)}.</span>` : ''}</div></li>`;
const sourcesBlock = (srcs, i) => (srcs && srcs.length) ? `<div class="sources"><h3>Fuentes y referencias</h3><ol>${srcs.map(srcLine).join('')}</ol>${verifBox(i)}</div>` : '';
const firstSrc = x => x && x.sources && x.sources[0];
const refMarks = srcs => (srcs && srcs.length) ? `<p class="refs">Fuentes de este texto: ${srcs.map((s, k) => `<button class="ref" data-act="toref" data-n="${k + 1}" aria-label="Ir a la fuente ${k + 1}">[${k + 1}]</button>`).join(' ')}</p>` : '';
/* Dirección pública: páginas estáticas indexables con vista previa al compartir (las genera tools/build-pages.js) */
const SITE = /vercel\.app$|sabiasque|lumbrario/i.test(location.hostname) ? location.origin : 'https://cultura-khaki.vercel.app';
const publicUrl = i => i.type === 'pais' ? `${SITE}/pais/${i.iso.toLowerCase()}/` : i.type === 'anat' ? `${SITE}/anatomia/${i.slug}/` : i.type === 'elem' ? `${SITE}/quimica/${i.slug}/` : i.type === 'quim' ? `${SITE}/quimica/tema/${i.slug}/` : `${SITE}/${i.type === 'articulo' ? 'articulo' : 'dato'}/${i.id}/`;
const credit = (x, cls = 'credit') => x && x.imgCredit ? `<figcaption class="${cls}">Imagen: ${esc(x.imgCredit.artist)} · <a href="${esc(x.imgCredit.page)}" target="_blank" rel="noopener noreferrer">${esc(x.imgCredit.license)} · Wikimedia Commons</a></figcaption>` : '';
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const LAUNCH = Date.UTC(2026, 10, 25);
const edition = () => { const d = new Date(); return { n: Math.max(1, Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - LAUNCH) / 864e5) + 1), date: d.toLocaleDateString('es-DO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }; };
const apa = i => { const d = new Date((i.date || '2026-11-25') + 'T12:00:00'); return `Redacción Lumbrario (${d.getFullYear()}, ${d.getDate()} de ${MONTHS[d.getMonth()]}). ${i.title}. Lumbrario ${publicUrl(i)}`; };
const readText = i => [i.title, i.subtitle || i.desc, i.intro, ...(i.sections || []).flatMap(s => [s.h, ...(s.p || []), s.example && 'Ejemplo. ' + s.example]), ...(i.timeline || []).map(e => `${e.y}: ${e.t}`), i.facts && i.facts.length ? 'Datos complementarios. ' + i.facts.join(' ') : '', i.conclusion, ...String(i.body || '').split(/\n\s*\n/), i.deep && 'A fondo. ' + i.deep, i.lead, i.name_origin, i.history, i.where && 'Dónde está. ' + i.where, i.what !== i.desc && i.what, ...(i.functions || []), ...(Array.isArray(i.curious) ? i.curious : [i.curious]), i.uses && 'Para qué sirve. ' + i.uses.join('. '), i.disc, i.origin].filter(Boolean).join('. ').replace(/\.\./g, '.');
const toolBtns = (id, extra = '') => `<div class="art-actions">${favBtn(id)}<button class="btn sm" data-act="share" data-id="${id}">${ICON.share}<span>Compartir</span></button><button class="btn sm" data-act="card" data-id="${id}">${ICON.image}<span>Imagen</span></button><button class="btn sm" data-act="listen" data-id="${id}">${ICON.sound}<span>Escuchar</span></button><button class="btn sm" data-act="cite" data-id="${id}">${ICON.quote}<span>Citar</span></button>${extra}</div>`;
const getAny = id => String(id).startsWith('pais-') ? Countries.get(id) : String(id).startsWith('anat-') ? Anatomy.get(id) : /^(elem|quim)-/.test(String(id)) ? Chem.get(id) : ContentRepo.get(id);

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('on'), 2200);
}

async function share(i) {
  const url = publicUrl(i);
  const text = `Dato de Lumbrario: ${i.title}`;
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
      <figure><div class="cover mini-cover">${cover(i, { w: 800, h: 260 })}</div>${credit(i, 'credit sm')}</figure>
      <div style="margin-top:14px">${head}</div>
      <h2 class="claim" id="sheet-title">${esc(i.title)}</h2>
      <p class="lede">${esc(i.desc)}</p>
      <div class="claim-row">${claimBadge(i)}</div>${claimNote(i)}
      ${isArt ? `<p class="full">${esc(i.intro)}</p>${metaLine(i)}` : `<p class="full">${esc(String(i.body || '').split(/\n\s*\n/)[0])}</p>${/\n\s*\n/.test(i.body || '') || i.deep ? `<a class="btn sm more-link" href="#/dato/${i.id}" data-act="sheet-close-nav">Seguir leyendo · ${i.read} min ${ICON.arrow}</a>` : ''}`}
      ${i.cat === 'medicina' ? medNote('sm') : ''}
      ${isArt ? '' : sourcesBlock(i.sources, i)}
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
  custom(html) {
    this.lastFocus = document.activeElement;
    $('#sheet .panel').innerHTML = `<div class="grab"></div><button class="icon-btn x" data-act="sheet-close" aria-label="Cerrar">${ICON.close}</button>${html}`;
    const s = $('#sheet'); s.classList.add('open'); s.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; $('#sheet .panel').scrollTop = 0;
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
  const ed = edition();
  const series = ContentRepo.series();
  return `
  <div class="masthead"><span>Edición n.º ${ed.n}</span><span class="md">${esc(ed.date)}</span><span>Edición digital</span></div>
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

  ${rareHome()}

  <section class="otd card" id="otd-home"><div class="otd-head"><span class="eyebrow">${ICON.calendar} Hoy en la historia</span><a class="more" href="#/hoy">Ver todo</a></div><div class="otd-body">${otdSkeleton()}</div></section>

  <div class="sec"><div><h2>Descubrimientos rápidos</h2><p>Lee la afirmación. Toca para saber por qué es cierta (o falsa).</p></div></div>
  <div class="rail">${quick.map(quickCard).join('')}</div>

  <div class="sec"><div><h2>Explorar categorías</h2><p>${ContentRepo.categories().length} áreas del conocimiento</p></div><a class="more" href="#/explorar">Ver todo</a></div>
  ${catsGrid()}
  <div class="banners">${chemBanner()}${anatomyBanner()}${countriesBanner()}</div>

  ${series.length ? `<div class="sec"><div><h2>Dosieres</h2><p>Series temáticas para leer de principio a fin</p></div><a class="more" href="#/dosieres">Ver todos</a></div>
  <div class="rail">${series.map(seriesCard).join('')}</div>` : ''}

  <div class="sec"><div><h2>Artículos destacados</h2><p>Lecturas para entender el porqué de las cosas</p></div><a class="more" href="#/explorar?tipo=articulo">Ver todos</a></div>
  <div class="editorial">
    ${featured[0] ? featCard(featured[0]) : ''}
    <div class="rows">${featured.slice(1, 5).map(rowCard).join('')}</div>
  </div>

  <div class="sec"><div><h2>Recién publicado</h2><p>Lo último que añadimos</p></div></div>
  <div class="list two">${recent.map(rowCard).join('')}</div>

  ${footNote()}`;
};
const footNote = () => `<footer class="foot-note">Lumbrario · Contenido educativo gratuito.<br>Cada dato incluye sus fuentes para que puedas comprobarlo.<br><a href="#/metodologia">Cómo verificamos</a> · <a href="#/erratas">Fe de erratas</a> · <a href="#/dosieres">Dosieres</a> · <a href="#/lo-que-pocos-saben">Lo que pocos saben</a> · <a href="#/diccionario">Diccionario</a> · <a href="#/hoy">Hoy en la historia</a></footer>`;

function catsGrid() {
  return `<div class="cats">${ContentRepo.categories().map(c => {
    const n = ContentRepo.byCat(c.id).length;
    return `<a class="cat${c.img ? ' has-img' : ''}" href="#/categoria/${c.id}" style="--cc:${c.color}">
      ${c.img ? `<img class="cat-bg" src="${esc(c.img)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : ''}
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
      : `<div class="banners" style="margin-top:16px">${chemBanner()}${anatomyBanner()}${countriesBanner()}</div><div style="margin-top:12px">${catsGrid()}</div>`}`;
};

Views.category = ([id], q) => {
  const c = ContentRepo.cat(id);
  if (!c) return Views.notFound();
  const tipo = q.get('tipo') || 'todo';
  const list = ContentRepo.byCat(id, tipo);
  return `
  <button class="back" data-act="back">${ICON.back} Volver</button>
  <header class="cat-hero${c.img ? ' has-img' : ''}" style="--cc:${c.color}">${c.img ? `<img class="cat-bg" src="${esc(c.img)}" alt="" decoding="async" referrerpolicy="no-referrer">` : ''}<div class="gl">${c.icon}</div><h1 class="h1">${esc(c.name)}</h1><p>${esc(c.desc)}</p></header>
  ${c.imgCredit ? credit(c, 'credit sm') : ''}
  ${id === 'medicina' ? medNote() : ''}${id === 'cuerpo' || id === 'medicina' ? `<div style="margin:12px 0">${anatomyBanner()}</div>` : ''}${id === 'ciencia' ? `<div style="margin:12px 0">${chemBanner()}</div>` : ''}${id === 'lengua' ? `<a class="dict-banner" href="#/diccionario"><span class="gl">📖</span><span><b>Diccionario</b><small>Busca una palabra o selecciónala mientras lees para ver su significado en contexto.</small></span><span class="arr">${ICON.arrow}</span></a>` : ''}
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
    const sug = ['corazón', 'vacuna', 'Venus', 'vikingos', 'República Dominicana', 'inflación', 'pulpo'];
    return `<div class="eyebrow" style="margin:6px 0 10px">${rec.length ? 'Búsquedas recientes' : 'Prueba con'}</div>
      <div class="seg" style="flex-wrap:wrap">${(rec.length ? rec : sug).map(s => `<button data-act="search-term" data-v="${esc(s)}">${esc(s)}</button>`).join('')}</div>
      <div class="sec"><div><h2>Explora por tema</h2></div></div>${catsGrid()}`;
  }
  const r = ContentRepo.search(term);
  const pc = Countries.search(term).slice(0, 8);
  const an = Anatomy.search(term).slice(0, 6);
  const ch = Chem.search(term), ce = ch.els.slice(0, 6), cl = ch.ls.slice(0, 4);
  const pcBlock = (ce.length || cl.length ? `<div class="sec" style="margin-top:4px"><div><h2>Química</h2></div></div><div class="list two" style="margin-bottom:8px">${ce.map(elRow).join('')}${cl.map(lessonRow).join('')}</div>` : '') + (an.length ? `<div class="sec" style="margin-top:4px"><div><h2>Atlas del cuerpo</h2></div></div><div class="list two" style="margin-bottom:8px">${an.map(anatRow).join('')}</div>` : '') + (pc.length ? `<div class="sec" style="margin-top:4px"><div><h2>Países</h2></div></div><div class="list two" style="margin-bottom:8px">${pc.map(countryRow).join('')}</div>` : '');
  if (!r.length && (pc.length || an.length || ce.length || cl.length)) return pcBlock;
  if (!r.length) return emptyState('🔍', 'Sin resultados', `No encontramos nada para «${esc(term)}». Prueba con otra palabra o explora por categorías.`, '<a class="btn" href="#/explorar">Explorar categorías</a>');
  return `${pcBlock}<div class="faint" style="font-size:13px;margin-bottom:10px">${plural(r.length, 'resultado', 'resultados')}${pc.length || an.length || ce.length || cl.length ? ' en artículos y curiosidades' : ''}</div><div class="list two">${r.map(rowCard).join('')}</div>`;
}

/* Bloques enriquecidos del artículo: apartados con imagen, ejemplo y fuente directa; cronología; conceptos relacionados */
const srcRefs = (ns, label = 'Fuente') => (ns || []).length ? `<p class="sec-src">${label}${ns.length > 1 ? 's' : ''}: ${ns.map(n => `<button class="ref" data-act="toref" data-n="${n}" aria-label="Ir a la fuente ${n}">[${n}]</button>`).join(' ')}</p>` : '';
const inlineFig = (im, cls = 'sec-fig') => im && im.src ? `<figure class="${cls}"><img src="${esc(im.src)}" alt="${esc(im.alt || '')}" loading="lazy" decoding="async" referrerpolicy="no-referrer">${im.caption ? `<figcaption class="cap">${esc(im.caption)}</figcaption>` : ''}${credit({ imgCredit: im.credit })}</figure>` : '';
const secHtml = (s, k) => `<h2><span class="n">${String(k + 1).padStart(2, '0')}</span>${esc(s.h)}</h2>${(s.p || []).map(t => `<p>${esc(t)}</p>`).join('')}${inlineFig(s.img)}${s.example ? `<aside class="ex"><b>Ejemplo</b><p>${esc(s.example)}</p></aside>` : ''}${srcRefs(s.src)}`;
const timelineHtml = i => (i.timeline || []).length ? `<h2><span class="n">CRONOLOGÍA</span>${esc(i.timelineTitle || 'Línea de tiempo')}</h2><ol class="tl">${i.timeline.map(e => `<li><span class="tl-y">${esc(e.y)}</span><div><p>${esc(e.t)}</p>${srcRefs(e.src)}</div></li>`).join('')}</ol>` : '';
const conceptsHtml = i => {
  const cs = (i.concepts || []).filter(c => c && c.t);
  if (!cs.length) return '';
  return `<aside class="box concepts"><h3>Conceptos relacionados</h3><dl>${cs.map(c => { const x = c.id && ContentRepo.get(c.id); return `<div><dt>${x ? `<a href="${href(x)}">${esc(c.t)}</a>` : esc(c.t)}</dt><dd>${esc(c.d || '')}</dd></div>`; }).join('')}</dl></aside>`;
};
const recoBlock = list => list.length ? `<section class="reco" aria-label="Te recomendamos"><div class="sec"><div><h2>Sigue leyendo</h2><p>Tres contenidos relacionados de la biblioteca</p></div></div><div class="list">${list.map(rowCard).join('')}</div></section>` : '';
Views.article = ([id]) => {
  const i = ContentRepo.get(id);
  if (!i) return Views.notFound();
  if (i.type !== 'articulo') return Views.fact([id]);
  const c = ContentRepo.cat(i.cat) || {};
  const related = ContentRepo.recommend(i, 3);
  const read = UserRepo.isRead(i.id);
  return `
  <article class="art" data-article="${i.id}">
    <div class="art-top"><button class="back" data-act="back">${ICON.back} Volver</button>
      <div style="display:flex;gap:8px">${favBtn(i.id, false)}<button class="btn sm" data-act="share" data-id="${i.id}" aria-label="Compartir">${ICON.share}</button></div></div>
    <header class="art-head">
      ${catChip(i)}
      ${rareBadge(i)}<h1>${esc(i.title)}</h1>
      <p class="sub">${esc(i.subtitle || i.desc)}</p>
      ${metaLine(i, `<span>${esc(i.sub || '')}</span><span>${fmtDate(i.date)}</span>`)}
      <div class="claim-row">${claimBadge(i)}</div>${claimNote(i)}
    </header>
    <figure class="art-fig"><div class="cover art-hero">${cover(i, { w: 1200, h: 675 })}</div>${credit(i)}</figure>
    ${toolBtns(i.id)}
    <div class="prose">
      <p class="lead">${esc(i.intro)}</p>
      ${(i.sections || []).map((s, k) => secHtml(s, k)).join('')}
      ${timelineHtml(i)}
      ${(i.facts || []).length ? `<aside class="box"><h3>Datos complementarios</h3><ul>${i.facts.map(f => `<li>${esc(f)}</li>`).join('')}</ul></aside>` : ''}
      ${i.conclusion ? `<h2><span class="n">EN RESUMEN</span>Conclusión</h2><p class="conclusion">${esc(i.conclusion)}</p>` : ''}
      ${conceptsHtml(i)}
      ${refMarks(i.sources)}
    </div>
    ${i.cat === 'medicina' ? medNote() : ''}
    ${sourcesBlock(i.sources, i)}
    <p class="verify">¿Encontraste un error? Toda afirmación de este artículo debería poder comprobarse en sus fuentes. Consulta <a href="#/metodologia">cómo verificamos</a> y nuestra <a href="#/erratas">fe de erratas</a>.</p>
    <div class="endread ${read ? 'done' : ''}" id="endread">${read ? `${ICON.check} Artículo leído · +20 XP` : 'Llega al final para marcarlo como leído'}</div>
    ${recoBlock(related)}
  </article>`;
};

/* Página completa para curiosidades y mitos (enlaces compartidos y búsqueda directa) */
Views.fact = ([id]) => {
  const i = ContentRepo.get(id);
  if (!i) return Views.notFound();
  if (i.type === 'articulo') return Views.article([id]);
  if (UserRepo.markSeen(i.id)) renderAvatar();
  const related = ContentRepo.recommend(i, 3);
  return `<article class="art">
    <div class="art-top"><button class="back" data-act="back">${ICON.back} Volver</button></div>
    <figure class="art-fig" style="margin-top:0"><div class="cover art-hero" style="margin-top:0">${cover(i, { w: 1200, h: 520 })}</div>${credit(i)}</figure>
    <header class="art-head" style="margin-top:22px">
      ${i.type === 'mito' ? `<span class="verdict ${i.verdict === 'matizado' ? 'matizado' : 'falso'}" style="margin-bottom:14px">${i.verdict === 'matizado' ? 'Verdad a medias' : 'Mito · Falso'}</span>` : catChip(i)}
      ${rareBadge(i)}<h1>${esc(i.title)}</h1><p class="sub">${esc(i.desc)}</p>${metaLine(i)}
      <div class="claim-row">${claimBadge(i)}</div>${claimNote(i)}
    </header>
    <div class="prose">${paras(i.body)}${deepBlock(i)}${refMarks(i.sources)}</div>
    ${i.cat === 'medicina' ? medNote() : ''}
    ${toolBtns(i.id, `<button class="btn sm" data-act="surprise">${ICON.shuffle}<span>Sorpréndeme</span></button>`)}
    ${sourcesBlock(i.sources, i)}
    ${recoBlock(related)}
  </article>`;
};

Views.saved = (p, q) => {
  const tab = q.get('tab') || 'todo';
  const ids = UserRepo.get().favs;
  if (ids.some(x => x.startsWith('pais-')) && !Countries.data) return needCountries();
  if (ids.some(x => /^(elem|quim)-/.test(x)) && !Chem.data) return needChem();
  const favs = ids.map(getAny).filter(Boolean);
  const list = favs.filter(i => tab === 'todo' || (tab === 'articulo' ? i.type === 'articulo' : tab === 'paises' ? i.type === 'pais' : tab === 'cuerpo' ? i.type === 'anat' : tab === 'quimica' ? ['elem', 'quim'].includes(i.type) : !['articulo', 'pais', 'anat', 'elem', 'quim'].includes(i.type)));
  return `
  <div class="sec" style="margin-top:8px"><div><h1 class="h1">Guardados</h1><p>Tu biblioteca personal${favs.length ? ' · ' + plural(favs.length, 'elemento', 'elementos') : ''}</p></div></div>
  ${favs.length ? `<div class="seg">${[['todo', 'Todo'], ['articulo', 'Artículos'], ['datos', 'Curiosidades y mitos'], ['paises', 'Países'], ['cuerpo', 'Cuerpo humano'], ['quimica', 'Química']].map(([v, l]) => `<button class="${tab === v ? 'on' : ''}" data-act="nav" data-to="#/guardados${v === 'todo' ? '' : '?tab=' + v}">${l}</button>`).join('')}</div>` : ''}
  <div style="margin-top:14px">${list.length ? `<div class="list two">${list.map(i => i.type === 'pais' ? countryRow(i) : i.type === 'anat' ? anatRow(i) : i.type === 'elem' ? elRow(i) : i.type === 'quim' ? lessonRow(i) : rowCard(i)).join('')}</div>`
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
  const avail = Quiz.cat === 'paises' || Quiz.cat === 'quimica' ? 10 : Services.buildQuiz(Quiz.level, Quiz.cat, 999).length;
  return `<div class="quiz-wrap">
    <div class="sec" style="margin-top:8px"><div><h1 class="h1">Quiz</h1><p>${plural(ContentRepo.questions().length, 'pregunta', 'preguntas')} con explicación y fuente. Las que no has visto salen primero.</p></div></div>
    <div class="eyebrow">Dificultad</div>
    <div class="opt-grid c4">${levels.map(([v, e, n, d]) => `<button class="pick ${Quiz.level === v ? 'on' : ''}" data-act="q-level" data-v="${v}"><span class="em">${e}</span><span>${n}<small>${d}${best[v] ? ` · récord ${best[v]}%` : ''}</small></span></button>`).join('')}</div>
    <div class="eyebrow" style="margin-top:16px">Tema</div>
    <div class="seg" style="flex-wrap:wrap;margin-top:10px">
      <button class="${Quiz.cat === 'all' ? 'on' : ''}" data-act="q-cat" data-v="all">Todos</button>
      <button class="${Quiz.cat === 'paises' ? 'on' : ''}" data-act="q-cat" data-v="paises">🌎 Banderas y capitales</button>
      <button class="${Quiz.cat === 'quimica' ? 'on' : ''}" data-act="q-cat" data-v="quimica">⚗️ Tabla periódica</button>
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
    <div class="card qcard">${q.cat === 'paises' ? '<span class="chip" style="color:var(--ac2)"><span class="dot"></span>Países</span>' : q.cat === 'quimica' ? `<span class="chip" style="color:${CHEM_COLOR}"><span class="dot"></span>Química</span>` : catChip(q)} <span class="chip">${LEVEL[q.level]}</span><h2>${esc(q.q)}</h2>${q.img ? `<img class="qflag" src="${q.img}" alt="Bandera para adivinar">` : ''}</div>
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
  const refSrc = q.src || firstSrc(ref) || (q.href && q.href.startsWith('#/anatomia/') && firstSrc(Anatomy.get(q.href.split('/').pop()))) || (q.cat === 'paises' && Countries.get(q.id.slice(2)) ? { org: 'Wikidata', title: Countries.get(q.id.slice(2)).name, u: Countries.get(q.id.slice(2)).wikidata } : null);
  const last = Quiz.i === Quiz.list.length - 1;
  $('#fb').innerHTML = `<div class="feedback"><b class="${ok ? 'ok' : 'bad'}">${ok ? '¡Correcto! +' + 10 * q.level + ' XP' : 'No era esa'}</b>${ok ? '' : `<p class="fb-ans">Respuesta correcta: <b>${esc(q.opts.find(o => o.ok).t)}</b></p>`}<p>${esc(q.exp)}</p>${refSrc ? `<p class="fb-src">Fuente: <a href="${esc(refSrc.u)}" target="_blank" rel="noopener noreferrer">${esc(refSrc.org ? refSrc.org + ' — ' : '')}${esc(refSrc.title || refSrc.t)}</a></p>` : ''}
    <div class="row"><button class="btn ac" data-act="q-next">${last ? 'Ver resultado' : 'Siguiente'} ${ICON.arrow}</button>
    ${q.href ? `<a class="btn sm" href="${q.href}">${q.href.startsWith('#/anatomia') ? 'Ver en el atlas' : q.href.startsWith('#/quimica') ? 'Ver el elemento' : 'Ver país'}</a>` : ref ? `<a class="btn sm" href="${href(ref)}" ${ref.type !== 'articulo' ? `data-act="open" data-id="${ref.id}"` : ''}>Saber más</a>` : ''}</div></div>`;
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
  if (Quiz.cat === 'paises' && !Countries.data) { $('#view').innerHTML = loadingView('Preparando banderas…'); Countries.load().then(quizStart).catch(() => { toast('No se pudieron cargar los países'); render(); }); return; }
  if (Quiz.cat === 'quimica' && !Chem.data) { $('#view').innerHTML = loadingView('Preparando la tabla periódica…'); Chem.load().then(quizStart).catch(() => { toast('No se pudo cargar la química'); render(); }); return; }
  Object.assign(Quiz, { list: Quiz.cat === 'paises' ? Countries.buildQuiz(Quiz.level, 10) : Quiz.cat === 'quimica' ? Chem.buildQuiz(Quiz.level, 10) : Services.buildQuiz(Quiz.level, Quiz.cat, 10), i: 0, correct: 0, xp: 0, wrong: [], answered: false, saved: false, isBest: false });
  render();
}

/* ----- Perfil ----- */
Views.profile = () => {
  const u = UserRepo.get(), lv = Services.level(u.xp), st = UserRepo.streak();
  const arts = ContentRepo.byType('articulo');
  const readN = arts.filter(a => u.read[a.id]).length;
  const seenN = ContentRepo.all().filter(i => i.type !== 'articulo' && u.seen[i.id]).length; // los países se cuentan aparte
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
    <div class="stat"><b>${Object.keys(u.seen).filter(k => k.startsWith('pais-')).length}<span class="faint" style="font-size:16px">/195</span></b><span>Países explorados</span></div>
    <div class="stat"><b>${Anatomy.all().filter(x => u.seen[x.id]).length}<span class="faint" style="font-size:16px">/${Anatomy.all().length}</span></b><span>Atlas del cuerpo</span></div>
    <div class="stat"><b>${Object.keys(u.seen).filter(k => k.startsWith('elem-')).length}<span class="faint" style="font-size:16px">/118</span></b><span>Elementos químicos</span></div>
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

/* ================= PAÍSES DEL MUNDO =================
 * Datos: countries.js (Wikidata + world-countries + Wikipedia en español), cargado bajo demanda.
 * Banderas: flags/xx.svg (flag-icons, licencia MIT). */
const REGIONS = ['África', 'América', 'Asia', 'Europa', 'Oceanía'];
const Countries = {
  data: null, map: {}, loading: null,
  load() {
    if (this.data) return Promise.resolve(this.data);
    if (!this.loading) this.loading = new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = 'countries.js'; s.async = true;
      s.onload = () => {
        this.data = (window.SQ_COUNTRIES || []).map(c => ({ ...c, id: 'pais-' + c.iso.toLowerCase(), type: 'pais', title: c.name, _s: norm([c.name, c.capital, c.official, c.region, c.subregion, ...(c.languages || []), ...(c.currencies || []).map(x => x.n)].join(' ')) }));
        this.map = Object.fromEntries(this.data.map(c => [c.iso.toLowerCase(), c]));
        res(this.data);
      };
      s.onerror = () => { this.loading = null; rej(new Error('No se pudo cargar')); };
      document.head.appendChild(s);
    });
    return this.loading;
  },
  get(iso) { return this.map[String(iso || '').replace(/^pais-/, '').toLowerCase()]; },
  search(q) { const t = norm(q).split(/\s+/).filter(x => x.length > 1); return t.length && this.data ? this.data.filter(c => t.every(x => c._s.includes(x))).sort((a, b) => (norm(a.name).startsWith(t[0]) ? -1 : 0) - (norm(b.name).startsWith(t[0]) ? -1 : 0)) : []; },
  flag: iso => `flags/${String(iso).toLowerCase()}.svg`,
  simpleCapital: c => c.capital && !/[(;]|\by\b/.test(c.capital),
  buildQuiz(level, n = 10) {
    const seen = UserRepo.get().quiz.qSeen;
    const lvOf = c => (c.pop || 0) >= 30e6 ? 1 : (c.pop || 0) >= 3e6 ? 2 : 3;
    let pool = this.data.filter(c => !level || lvOf(c) === level);
    pool = [...shuffle(pool.filter(c => !seen['p-' + c.iso])), ...shuffle(pool.filter(c => seen['p-' + c.iso]))].slice(0, n);
    const distract = (c, key, ok) => {
      const same = shuffle(this.data.filter(x => x !== c && x.region === c.region && key(x) && key(x) !== ok));
      const other = shuffle(this.data.filter(x => x !== c && key(x) && key(x) !== ok));
      const out = []; for (const x of [...same, ...other]) { const v = key(x); if (!out.includes(v)) out.push(v); if (out.length === 3) break; }
      return out;
    };
    return pool.map(c => {
      const kinds = ['flag', 'flag'];
      if (this.simpleCapital(c)) kinds.push('capital', 'capital-of');
      if (level !== 1 && c.currencies && c.currencies.length === 1) kinds.push('currency');
      const kind = kinds[Math.floor(Math.random() * kinds.length)];
      let q, ok, key, img = null, exp;
      if (kind === 'flag') { q = '¿De qué país es esta bandera?'; ok = c.name; key = x => x.name; img = this.flag(c.iso); exp = `Es la bandera de ${c.name}. Su capital es ${c.capital}.`; }
      else if (kind === 'capital') { q = `¿Cuál es la capital de ${c.name}?`; ok = c.capital; key = x => this.simpleCapital(x) ? x.capital : null; exp = `La capital de ${c.name} es ${c.capital}.`; }
      else if (kind === 'capital-of') { q = `${c.capital} es la capital de…`; ok = c.name; key = x => x.name; exp = `${c.capital} es la capital de ${c.name}.`; }
      else { q = `¿Qué moneda se usa en ${c.name}?`; ok = c.currencies[0].n; key = x => x.currencies && x.currencies.length === 1 ? x.currencies[0].n : null; exp = `En ${c.name} se usa el ${c.currencies[0].n} (${c.currencies[0].c}).`; }
      const o = shuffle([ok, ...distract(c, key, ok)]);
      return { id: 'p-' + c.iso, cat: 'paises', level: level || lvOf(c), q, img, o, a: o.indexOf(ok), opts: o.map(t => ({ t, ok: t === ok })), exp, href: '#/pais/' + c.iso.toLowerCase() };
    });
  }
};
const fmtNum = n => n == null ? '—' : Number(n).toLocaleString('es-DO');
const flagImg = (iso, cls = 'flag') => `<img class="${cls}" src="${Countries.flag(iso)}" alt="" loading="lazy" decoding="async" width="40" height="30">`;
const countryCard = c => `<a class="ctry" href="#/pais/${c.iso.toLowerCase()}" data-s="${esc(c._s)}" data-r="${esc(c.region)}">${flagImg(c.iso)}<span><b>${esc(c.name)}</b><small>${esc(Countries.simpleCapital(c) ? c.capital : c.capital.split(/[(;]/)[0].replace(/ y .*/, '').trim())}</small></span></a>`;
const countryRow = c => `<a class="rowc" href="#/pais/${c.iso.toLowerCase()}"><div class="flagbox">${flagImg(c.iso, 'flag lg')}</div><div><span class="kind" style="color:var(--ac2)">País · ${esc(c.region)}</span><h4>${esc(c.name)}</h4><div class="meta"><span>Capital: ${esc(c.capital.split(/[(;]/)[0].trim())}</span></div></div></a>`;
const loadingView = (msg = 'Cargando…') => `<div style="padding-top:12px"><div class="skel" style="height:26px;width:45%;margin-bottom:16px"></div><div class="skel" style="height:48px;margin-bottom:16px"></div><div class="ctry-grid">${'<div class="skel" style="height:64px"></div>'.repeat(9)}</div><p class="faint" style="text-align:center;margin-top:16px">${msg}</p></div>`;
const needCountries = () => { Countries.load().then(() => render(true)).catch(() => toast('No se pudieron cargar los países. Revisa tu conexión.')); return loadingView('Cargando 195 países…'); };

const countriesBanner = () => `<a class="ctry-banner" href="#/paises">
  <div class="mosaic">${['do', 'jp', 'br', 'za', 'ca', 'in', 'mx', 'fr', 'kr', 'eg', 'au', 'es'].map(i => `<img src="flags/${i}.svg" alt="" loading="lazy" decoding="async">`).join('')}</div>
  <div class="txt"><span class="eyebrow" style="color:var(--ac2)">Nuevo</span><b>Países del mundo</b><span>Los 195 países: bandera, capital, moneda, idiomas, origen del nombre e historia.</span><span class="go">Explorar países ${ICON.arrow}</span></div></a>`;

Views.countries = (p, q) => {
  if (!Countries.data) return needCountries();
  const reg = q.get('region') || '';
  const list = Countries.data.filter(c => !reg || c.region === reg);
  return `
  <button class="back" data-act="back">${ICON.back} Volver</button>
  <header class="cat-hero" style="--cc:#5b8cff"><div class="gl">🌎</div><h1 class="h1">Países del mundo</h1><p>Los 193 Estados miembros de la ONU y los 2 Estados observadores. Bandera, capital, moneda, idiomas e historia de cada uno.</p></header>
  <label class="searchbar" for="cq" style="margin-bottom:12px">${ICON.search}<input id="cq" type="search" autocomplete="off" placeholder="Busca un país o una capital…" value="${esc(q.get('q') || '')}"></label>
  <div class="seg">${[['', 'Todos'], ...REGIONS.map(r => [r, r])].map(([v, l]) => `<button class="${reg === v ? 'on' : ''}" data-act="nav" data-to="#/paises${v ? '?region=' + encodeURIComponent(v) : ''}">${l}</button>`).join('')}</div>
  <div class="faint" id="ccount" style="font-size:13px;margin:12px 2px 10px">${plural(list.length, 'país', 'países')}</div>
  <div class="ctry-grid" id="cgrid">${list.map(countryCard).join('')}</div>
  <div id="cempty" hidden>${emptyState('🧭', 'Ningún país coincide', 'Prueba con otro nombre o capital.')}</div>
  <p class="foot-note">Datos: Wikidata y Wikipedia en español (CC BY-SA), contrastados con la base world-countries. Banderas: flag-icons (MIT).</p>`;
};

Views.country = ([iso]) => {
  if (!Countries.data) return needCountries();
  const c = Countries.get(iso);
  if (!c) return Views.notFound();
  if (UserRepo.markSeen(c.id)) renderAvatar();
  const same = Countries.data.filter(x => x.subregion === c.subregion && x !== c).slice(0, 6);
  const kv = (k, v, note = '') => v ? `<div class="kv"><span>${k}</span><b>${v}</b>${note ? `<small>${esc(note)}</small>` : ''}</div>` : '';
  const txt = (h, t) => t ? `<h2>${h}</h2>${t.split(/\n+/).map(p => `<p>${esc(p)}</p>`).join('')}` : '';
  return `<article class="art country">
    <div class="art-top"><button class="back" data-act="back">${ICON.back} Volver</button>
      <div style="display:flex;gap:8px">${favBtn(c.id, false)}<button class="btn sm" data-act="share" data-id="${c.id}" aria-label="Compartir">${ICON.share}</button></div></div>
    <div class="flag-hero"><img src="${Countries.flag(c.iso)}" alt="Bandera de ${esc(c.name)}" decoding="async"></div>
    <header class="art-head" style="margin-top:20px">
      <span class="chip" style="color:var(--ac2)"><span class="dot"></span>${esc(c.region)} · ${esc(c.subregion)}</span>
      <h1 style="margin-top:12px">${esc(c.name)}</h1>
      ${c.official && norm(c.official) !== norm(c.name) ? `<p class="sub">Nombre oficial en su idioma: ${esc(c.official)}</p>` : ''}
    </header>
    <div class="kvs">
      ${kv('Capital', esc(c.capital))}
      ${kv(c.currencies.length > 1 ? 'Monedas' : 'Moneda', c.currencies.map(x => `${esc(x.n)} <span class="faint">(${esc(x.c)})</span>`).join('<br>'))}
      ${kv(c.languages.length > 1 ? 'Idiomas oficiales' : 'Idioma oficial', esc(c.languages.join(', ')), c.langNote)}
      ${kv('Continente', esc(c.trans || c.region))}
      ${kv('Superficie', c.area ? fmtNum(c.area) + ' km²' : '', 'Según Wikidata.')}
      ${kv('Población', c.pop ? fmtNum(c.pop) : '', c.popYear ? `Dato de ${c.popYear}, según Wikidata.` : '')}
      ${c.landlocked ? kv('Geografía', 'Sin salida al mar') : ''}
      ${c.observer ? kv('Estatus', 'Estado observador de la ONU') : ''}
    </div>
    ${toolBtns(c.id)}
    <div class="prose">
      ${txt('Resumen', c.lead)}
      ${txt('Origen del nombre', c.name_origin)}
      ${txt('Un poco de historia', c.history)}
    </div>
    <div class="sources"><h3>Fuentes</h3><ol>
      ${c.wiki ? `<li><a href="${esc(c.wiki)}" target="_blank" rel="noopener noreferrer">Wikipedia en español — ${esc(c.name)} (textos extraídos, licencia CC BY-SA 4.0)</a></li>` : ''}
      <li><a href="${esc(c.wikidata)}" target="_blank" rel="noopener noreferrer">Wikidata — datos de capital y población</a></li>
      <li><a href="https://github.com/mledoze/countries" target="_blank" rel="noopener noreferrer">world-countries (mledoze) — idiomas, monedas y regiones</a></li>
      <li><a href="https://github.com/lipis/flag-icons" target="_blank" rel="noopener noreferrer">flag-icons — imagen de la bandera (licencia MIT)</a></li>
    </ol></div>
    <p class="verify">Los textos son extractos de Wikipedia. Capital, moneda e idiomas se contrastaron entre dos bases de datos independientes.</p>
    ${same.length ? `<div class="sec"><div><h2>Más países de ${esc(c.subregion)}</h2></div></div><div class="ctry-grid">${same.map(countryCard).join('')}</div>` : ''}
  </article>`;
};

/* ================= ATLAS DEL CUERPO HUMANO =================
 * Datos: anatomy.js (window.SQ_ANATOMY): 11 sistemas y sus órganos principales, con fuentes verificadas.
 * Identificadores públicos: «anat-<id>» (favoritos, vistos, compartir). */
const MED_NOTE = 'Contenido educativo y de divulgación. No sustituye el diagnóstico, el tratamiento ni el consejo de un profesional de la salud. Ante cualquier síntoma o duda, consulta a tu médico.';
const medNote = (cls = '') => `<aside class="med-note ${cls}" role="note"><b>⚕️ Aviso</b> ${MED_NOTE}</aside>`;
const Anatomy = {
  _all: null, _map: null,
  build() {
    const A = window.SQ_ANATOMY || { systems: [], organs: [] };
    const okv = x => !x.verif || x.verif.status === 'verificado';
    const sys = A.systems.filter(okv).map(s => ({ ...s, kind: 'sistema', type: 'anat', id: 'anat-' + s.id, slug: s.id, title: s.name, cat: 'cuerpo' }));
    const org = A.organs.filter(okv).map(o => ({ ...o, kind: 'organo', type: 'anat', id: 'anat-' + o.id, slug: o.id, title: o.name, cat: 'cuerpo', desc: o.desc || o.what }));
    this._all = [...sys, ...org];
    this._map = Object.fromEntries(this._all.map(x => [x.slug, x]));
    this._all.forEach(x => { x._s = norm([x.name, x.desc, x.intro, x.what, x.where, ...(x.facts || []).flat(), ...(x.conditions || [])].filter(Boolean).join(' ')); });
  },
  all() { if (!this._all) this.build(); return this._all; },
  systems() { return this.all().filter(x => x.kind === 'sistema'); },
  organs() { return this.all().filter(x => x.kind === 'organo').sort((a, b) => a.name.localeCompare(b.name, 'es')); },
  get(id) { this.all(); return this._map[String(id || '').replace(/^anat-/, '')]; },
  search(q) { const t = norm(q).split(/\s+/).filter(x => x.length > 1); return t.length ? this.all().filter(x => t.every(w => x._s.includes(w))) : []; },
  sysOf(o) { return (o.systems || []).map(s => this.get(s)).filter(Boolean); },
  organsOf(s) { return (s.organs || []).map(o => this.get(o)).filter(Boolean); }
};
const anatThumb = x => x.img ? `<img src="${esc(x.img)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : `<span class="anat-ic" style="--ac3:${x.color || '#ff7a6b'}">${x.icon || '🫀'}</span>`;
const anatCard = x => `<a class="anat-card" href="#/anatomia/${x.slug}" style="--cc:${x.color || '#ff7a6b'}"><div class="ph">${anatThumb(x)}</div><div class="in"><span class="ic">${x.icon || ''}</span><b>${esc(x.name)}</b><small>${esc(x.desc)}</small></div></a>`;
const anatRow = x => `<a class="rowc" href="#/anatomia/${x.slug}"><div class="cover">${anatThumb(x)}</div><div><span class="kind" style="color:#ff9a8a">${x.kind === 'sistema' ? 'Sistema del cuerpo' : 'Órgano'}${UserRepo.isSeen(x.id) ? ' · <span style="color:var(--ok)">✓ visto</span>' : ''}</span><h4>${esc(x.name)}</h4><div class="meta"><span>${esc((x.desc || '').slice(0, 90))}${(x.desc || '').length > 90 ? '…' : ''}</span></div></div></a>`;
const anatomyBanner = () => {
  const s = Anatomy.systems(), pics = s.filter(x => x.img).slice(0, 4);
  return `<a class="anat-banner" href="#/anatomia">
  <div class="mosaic">${pics.map(x => `<img src="${esc(x.img)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">`).join('')}</div>
  <div class="txt"><span class="eyebrow" style="color:#ff9a8a">Nuevo · Atlas</span><b>El cuerpo humano</b><span>${s.length} sistemas y ${Anatomy.organs().length} órganos: dónde están, qué hacen y cuándo algo falla.</span><span class="go">Abrir el atlas ${ICON.arrow}</span></div></a>`;
};

Views.anatomy = () => {
  const sys = Anatomy.systems(), org = Anatomy.organs();
  const seen = Anatomy.all().filter(x => UserRepo.isSeen(x.id)).length;
  return `
  <button class="back" data-act="back">${ICON.back} Volver</button>
  <header class="cat-hero" style="--cc:#ff7a6b"><div class="gl">🫀</div><h1 class="h1">Atlas del cuerpo humano</h1><p>Cómo está hecho y cómo funciona tu cuerpo: ${sys.length} sistemas y ${org.length} órganos, cada uno con sus fuentes.${seen ? ` Has explorado ${seen} de ${sys.length + org.length}.` : ''}</p></header>
  ${medNote()}
  <div class="sec"><div><h2>Sistemas del cuerpo</h2><p>Grupos de órganos que trabajan juntos</p></div></div>
  <div class="anat-grid">${sys.map(anatCard).join('')}</div>
  <div class="sec"><div><h2>Órganos de la A a la Z</h2><p>Toca uno para ver dónde está y qué hace</p></div></div>
  <label class="searchbar" for="aq" style="margin-bottom:12px">${ICON.search}<input id="aq" type="search" autocomplete="off" placeholder="Busca un órgano: hígado, ojo, bazo…"></label>
  <div class="ctry-grid" id="agrid">${org.map(o => `<a class="ctry organ" href="#/anatomia/${o.slug}" data-s="${esc(norm(o.name))}"><span class="oi">${o.img ? `<img src="${esc(o.img)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : '🫀'}</span><span><b>${esc(o.name)}</b><small>${esc(Anatomy.sysOf(o).map(s => s.name.replace('Sistema ', '')).join(' · '))}</small></span></a>`).join('')}</div>
  <div id="aempty" hidden>${emptyState('🔎', 'Ningún órgano coincide', 'Prueba con otro nombre.')}</div>
  <div class="sec"><div><h2>Ponte a prueba</h2><p>Preguntas sobre el cuerpo humano</p></div></div>
  <button class="btn ac block" data-act="q-anat">Hacer el quiz del cuerpo humano ${ICON.arrow}</button>
  <p class="foot-note">Textos de elaboración propia verificados contra sus fuentes (enlazadas en cada ficha). Imágenes: Wikimedia Commons, con autor y licencia en cada ficha.</p>`;
};

Views.anatItem = ([slug]) => {
  const x = Anatomy.get(slug);
  if (!x) return Views.notFound();
  if (UserRepo.markSeen(x.id)) renderAvatar();
  const isSys = x.kind === 'sistema';
  const li = a => (a || []).map(t => `<li>${esc(t)}</li>`).join('');
  const parents = isSys ? [] : Anatomy.sysOf(x);
  const kids = isSys ? Anatomy.organsOf(x) : [];
  const siblings = isSys ? Anatomy.systems().filter(s => s !== x).slice(0, 4) : [...new Set(parents.flatMap(p => Anatomy.organsOf(p)))].filter(o => o !== x).slice(0, 6);
  return `<article class="art anat">
    <div class="art-top"><button class="back" data-act="back">${ICON.back} Volver</button>
      <div style="display:flex;gap:8px">${favBtn(x.id, false)}<button class="btn sm" data-act="share" data-id="${x.id}" aria-label="Compartir">${ICON.share}</button></div></div>
    ${x.img ? `<figure class="art-fig" style="margin-top:0"><div class="cover art-hero anat-hero" style="margin-top:0"><img src="${esc(x.img)}" alt="${esc(x.name)}" decoding="async" referrerpolicy="no-referrer"></div>${credit(x)}</figure>` : ''}
    <header class="art-head" style="margin-top:22px">
      <a class="chip" href="#/anatomia" style="color:#ff9a8a"><span class="dot"></span>Atlas del cuerpo · ${isSys ? 'Sistema' : 'Órgano'}</a>
      <h1 style="margin-top:12px">${x.icon && isSys ? x.icon + ' ' : ''}${esc(x.name)}</h1>
      <p class="sub">${esc(isSys ? x.desc : x.what)}</p>
      <div class="claim-row">${claimBadge(x)}</div>
    </header>
    ${toolBtns(x.id)}
    <div class="prose">
      ${isSys ? `<p class="lead">${esc(x.intro)}</p>
        <h2><span class="n">01</span>Para qué sirve</h2><ul class="anat-list">${li(x.functions)}</ul>
        ${(x.curious || []).length ? `<h2><span class="n">02</span>Curiosidades</h2><ul class="anat-list">${li(x.curious)}</ul>` : ''}`
      : `<h2><span class="n">01</span>Dónde está</h2><p>${esc(x.where)}</p>
        ${(x.facts || []).length ? `<h2><span class="n">02</span>En datos</h2><div class="kvs">${x.facts.map(([k, v]) => `<div class="kv"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>` : ''}
        ${(x.curious || []).length ? `<h2><span class="n">03</span>Curiosidades</h2><ul class="anat-list">${li(x.curious)}</ul>` : ''}
        ${(x.conditions || []).length ? `<h2><span class="n">04</span>Cuando algo falla</h2><p>Algunas afecciones conocidas relacionadas con este órgano:</p><ul class="anat-list cond">${li(x.conditions)}</ul>${medNote('sm')}` : ''}`}
      ${refMarks(x.sources)}
    </div>
    ${isSys ? medNote() : ''}
    ${parents.length ? `<div class="sec"><div><h2>Forma parte de</h2></div></div><div class="anat-grid">${parents.map(anatCard).join('')}</div>` : ''}
    ${kids.length ? `<div class="sec"><div><h2>Órganos de este sistema</h2></div></div><div class="list two">${kids.map(anatRow).join('')}</div>` : ''}
    ${sourcesBlock(x.sources, x)}
    <p class="verify">Cada dato de esta ficha se comprobó contra el texto de sus fuentes. Consulta <a href="#/metodologia">cómo verificamos</a>.</p>
    ${siblings.length ? `<div class="sec"><div><h2>${isSys ? 'Otros sistemas' : 'Órganos relacionados'}</h2></div></div><div class="list two">${siblings.map(anatRow).join('')}</div>` : ''}
  </article>`;
};

/* ================= QUÍMICA: TABLA PERIÓDICA Y FUNDAMENTOS =================
 * Datos: chemistry.js (window.SQ_CHEM), cargado bajo demanda: 118 elementos y fundamentos de química, con fuentes verificadas.
 * Identificadores públicos: «elem-<slug>» (elementos) y «quim-<tema>» (fundamentos). */
const CHEM_COLOR = '#5fd3c6';
const CHEM_COMMON = new Set([1, 2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 26, 29, 30, 47, 50, 53, 78, 79, 80, 82, 92]);
const Chem = {
  data: null, map: {}, lessons: [], lmap: {}, fams: {}, famList: [], loading: null,
  load() {
    if (this.data) return Promise.resolve(this.data);
    if (!this.loading) this.loading = new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = 'chemistry.js'; s.async = true;
      s.onload = () => { this.init(window.SQ_CHEM); res(this.data); };
      s.onerror = () => { this.loading = null; rej(new Error('No se pudo cargar')); };
      document.head.appendChild(s);
    });
    return this.loading;
  },
  init(D) {
    D = D || { elements: [], lessons: [], families: [] };
    const okv = x => !x.verif || x.verif.status === 'verificado';
    this.famList = D.families; this.fams = Object.fromEntries(D.families.map(f => [f.id, f]));
    this.data = D.elements.filter(okv).map(e => ({ ...e, id: 'elem-' + e.slug, type: 'elem', title: `${e.name} (${e.sym})`, desc: e.what, cat: 'ciencia',
      _s: norm([e.name, e.sym, e.en, (this.fams[e.fam] || {}).name, e.what, ...e.uses].join(' ')) }));
    this.map = Object.fromEntries(this.data.map(e => [e.slug, e]));
    this.lessons = D.lessons.filter(okv).map((l, k) => {
      const sections = l.sections.map((s, j, a) => ({ h: s.h, p: [s.p], example: j === a.length - 1 ? l.example || '' : '' }));
      return { ...l, n: k + 1, id: 'quim-' + l.id, slug: l.id, type: 'quim', subtitle: l.sub, desc: l.sub, cat: 'ciencia', sections, _s: norm([l.title, l.sub, l.intro, ...l.sections.flatMap(s => [s.h, s.p])].join(' ')) };
    });
    this.lmap = Object.fromEntries(this.lessons.map(l => [l.slug, l]));
  },
  get(id) { id = String(id || ''); if (!this.data) return null; return id.startsWith('quim-') ? this.lmap[id.slice(5)] : this.map[id.replace(/^elem-/, '')]; },
  fam(e) { return this.fams[e.fam] || { name: '', short: '', color: CHEM_COLOR }; },
  search(q) {
    if (!this.data) return { els: [], ls: [] };
    const raw = String(q || '').trim(), t = norm(raw).split(/\s+/).filter(x => x.length > 1);
    const sym = this.data.filter(e => e.sym.toLowerCase() === raw.toLowerCase());
    const els = t.length ? this.data.filter(e => t.every(x => e._s.includes(x))).sort((a, b) => (norm(a.name).startsWith(t[0]) ? -1 : 0) - (norm(b.name).startsWith(t[0]) ? -1 : 0)) : [];
    return { els: [...new Set([...sym, ...els])], ls: t.length ? this.lessons.filter(l => t.every(x => l._s.includes(x))) : [] };
  },
  lvOf: e => CHEM_COMMON.has(e.z) ? 1 : e.z <= 86 ? 2 : 3,
  buildQuiz(level, n = 10) {
    const seen = UserRepo.get().quiz.qSeen;
    let pool = this.data.filter(e => e.z <= 103 && (!level || this.lvOf(e) === level));
    pool = [...shuffle(pool.filter(e => !Object.keys(seen).some(k => k.startsWith('e-' + e.slug + '-')))), ...shuffle(pool)];
    pool = [...new Set(pool)].slice(0, n);
    const pick = (list, ok, key) => { const out = []; for (const x of shuffle(list)) { const v = key(x); if (v && v !== ok && !out.includes(v)) out.push(v); if (out.length === 3) break; } return out; };
    return pool.map(e => {
      const f = this.fam(e), lv = level || this.lvOf(e);
      const kinds = ['sym', 'name', 'fam'];
      if (lv > 1) kinds.push('z');
      if (!/previsto/.test(e.state) && e.state) kinds.push('state');
      const kind = kinds[Math.floor(Math.random() * kinds.length)];
      const near = this.data.filter(x => x !== e && Math.abs(x.z - e.z) <= 20 && x.z <= 103);
      let q, ok, o;
      if (kind === 'sym') { q = `¿Cuál es el símbolo químico del ${e.name.toLowerCase()}?`; ok = e.sym; o = [ok, ...pick(near.filter(x => x.sym[0] === e.sym[0]).concat(near), ok, x => x.sym)]; }
      else if (kind === 'name') { q = `¿Qué elemento tiene el símbolo ${e.sym}?`; ok = e.name; o = [ok, ...pick(near, ok, x => x.name)]; }
      else if (kind === 'z') { q = `¿Qué elemento tiene el número atómico ${e.z}?`; ok = e.name; o = [ok, ...pick(this.data.filter(x => x !== e && Math.abs(x.z - e.z) <= 4), ok, x => x.name)]; }
      else if (kind === 'fam') { q = `¿A qué familia de la tabla periódica pertenece el ${e.name.toLowerCase()}?`; ok = f.name; o = [ok, ...pick(this.famList, ok, x => x.name)]; }
      else { q = `¿En qué estado se encuentra el ${e.name.toLowerCase()} a temperatura ambiente?`; ok = e.state; o = [ok, ...['Sólido', 'Líquido', 'Gas'].filter(s => s !== ok)]; }
      o = shuffle(o.slice(0, 4));
      const exp = `${e.name} (${e.sym}) tiene el número atómico ${e.z}, pertenece a la familia de los ${f.name.toLowerCase()} y a temperatura ambiente es ${(e.state || '').toLowerCase().replace(' (previsto)', ' (según las predicciones)')}. ${e.uses[0] && !/^Solo se usa/.test(e.uses[0]) ? 'Un uso: ' + e.uses[0].charAt(0).toLowerCase() + e.uses[0].slice(1) + '.' : ''}`;
      return { id: `e-${e.slug}-${kind}`, cat: 'quimica', level: lv, q, img: null, o, a: o.indexOf(ok), opts: o.map(t => ({ t, ok: t === ok })), exp, href: '#/quimica/elemento/' + e.slug, src: e.sources[0] };
    });
  }
};
const needChem = () => { Chem.load().then(() => render(true)).catch(() => toast('No se pudo cargar la química. Revisa tu conexión.')); return loadingView('Cargando la tabla periódica…'); };
const fmtDec = (v, d = 2) => v == null || v === '' ? '—' : Number(v).toLocaleString('es-DO', { maximumFractionDigits: d });
const kToC = k => k == null ? null : Math.round((k - 273.15) * 10) / 10;
const elTile = (e, cls = 'pt-c') => `<a class="${cls}" href="#/quimica/elemento/${e.slug}" style="${e.col ? `grid-column:${e.col};grid-row:${e.period + 1}` : `grid-column:${e.fcol};grid-row:${e.period === 6 ? 10 : 11}`};--fc:${Chem.fam(e).color}" data-f="${e.fam}" data-s="${esc(norm(e.name + ' ' + e.sym))}" aria-label="${esc(e.name)}, número atómico ${e.z}"><i>${e.z}</i><b>${e.sym}</b><small>${esc(e.name)}</small></a>`;
const elMini = e => `<a class="el-mini" href="#/quimica/elemento/${e.slug}" style="--fc:${Chem.fam(e).color}"><span class="t"><i>${e.z}</i><b>${e.sym}</b></span><span><b>${esc(e.name)}</b><small>${esc(Chem.fam(e).short)}</small></span></a>`;
const elRow = e => `<a class="rowc" href="#/quimica/elemento/${e.slug}"><div class="cover el-cover" style="--fc:${Chem.fam(e).color}"><i>${e.z}</i><b>${e.sym}</b></div><div><span class="kind" style="color:${Chem.fam(e).color}">Elemento · ${esc(Chem.fam(e).short)}${UserRepo.isSeen(e.id) ? ' · <span style="color:var(--ok)">✓ visto</span>' : ''}</span><h4>${esc(e.name)}</h4><div class="meta"><span>${esc(e.what.length > 95 ? e.what.slice(0, 92).replace(/\s+\S*$/, '') + '…' : e.what)}</span></div></div></a>`;
const lessonRow = l => `<a class="rowc lesson-row" href="#/quimica/tema/${l.slug}"><div class="cover el-cover ls" style="--fc:${CHEM_COLOR}"><b>${String(l.n).padStart(2, '0')}</b></div><div><span class="kind" style="color:${CHEM_COLOR}">Fundamentos de química${UserRepo.isSeen(l.id) ? ' · <span style="color:var(--ok)">✓ visto</span>' : ''}</span><h4>${esc(l.title)}</h4><div class="meta"><span>${esc(l.sub)}</span></div></div></a>`;
const chemBanner = () => {
  const demo = [['H', 1, '#6aa5ff'], ['C', 6, '#6aa5ff'], ['O', 8, '#6aa5ff'], ['Na', 11, '#ff7a6b'], ['Fe', 26, '#e0bd5e'], ['Au', 79, '#e0bd5e'], ['Ne', 10, '#ff7ac2'], ['U', 92, '#45cdd6']];
  return `<a class="chem-banner" href="#/quimica">
  <div class="mosaic">${demo.map(([s, z, c]) => `<span class="mt" style="--fc:${c}"><i>${z}</i><b>${s}</b></span>`).join('')}</div>
  <div class="txt"><span class="eyebrow" style="color:${CHEM_COLOR}">Nuevo · Química</span><b>La tabla periódica</b><span>Los 118 elementos: qué es cada uno, para qué sirve y en qué se usa. Y los fundamentos de la química, paso a paso.</span><span class="go" style="color:${CHEM_COLOR}!important">Abrir la tabla ${ICON.arrow}</span></div></a>`;
};

Views.chem = (p, q) => {
  if (!Chem.data) return needChem();
  const els = Chem.data, seen = els.filter(e => UserRepo.isSeen(e.id)).length;
  const f = q.get('familia') || '';
  return `
  <button class="back" data-act="back">${ICON.back} Volver</button>
  <header class="cat-hero" style="--cc:${CHEM_COLOR}"><div class="gl">⚗️</div><h1 class="h1">Química</h1><p>La tabla periódica completa: los 118 elementos, qué es cada uno, para qué sirve y en qué se usa, con sus fuentes. Y los fundamentos para entenderla.${seen ? ` Has explorado ${seen} de 118 elementos.` : ''}</p></header>
  <div class="sec"><div><h2>La tabla periódica</h2><p>Toca un elemento para ver su ficha. Filtra por familia o busca por nombre o símbolo.</p></div></div>
  <label class="searchbar" for="eq" style="margin-bottom:12px">${ICON.search}<input id="eq" type="search" autocomplete="off" placeholder="Busca un elemento: oro, Fe, neón…"></label>
  <div class="seg pt-legend" role="group" aria-label="Familias">${[['', 'Todas', 'var(--tx2)'], ...Chem.famList.map(x => [x.id, x.name, x.color])].map(([v, l, c]) => `<button class="${f === v ? 'on' : ''}" data-act="pt-fam" data-v="${v}" style="--fc:${c}"><span class="dot" style="background:${c}"></span>${esc(l)}</button>`).join('')}</div>
  <p class="faint pt-hint">Desliza la tabla hacia los lados para verla completa →</p>
  <div class="pt-wrap" role="region" aria-label="Tabla periódica de los elementos" tabindex="0"><div class="pt${f ? ' filtering' : ''}" id="ptable" data-f="${f}">
    ${Array.from({ length: 18 }, (_, k) => `<span class="pt-g" style="grid-column:${k + 1};grid-row:1">${k + 1}</span>`).join('')}
    ${els.map(e => elTile(e)).join('')}
    <span class="pt-ph" style="grid-column:3;grid-row:7;--fc:${Chem.fams.lantanido.color}">57–71</span><span class="pt-ph" style="grid-column:3;grid-row:8;--fc:${Chem.fams.actinido.color}">89–103</span>
    <span class="pt-flab" style="grid-column:1 / span 2;grid-row:10">Lantánidos</span><span class="pt-flab" style="grid-column:1 / span 2;grid-row:11">Actínidos</span>
  </div></div>
  <div id="pt-fam-desc">${f && Chem.fams[f] ? `<p class="pt-fdesc" style="--fc:${Chem.fams[f].color}"><b>${esc(Chem.fams[f].name)}.</b> ${esc(Chem.fams[f].desc)}</p>` : ''}</div>
  <div id="elist" class="list two" style="margin-top:12px" hidden></div>
  <div class="sec"><div><h2>Fundamentos de química</h2><p>${Chem.lessons.length} temas para entender la materia, del átomo a las reacciones</p></div></div>
  <div class="list two">${Chem.lessons.map(lessonRow).join('')}</div>
  <div class="sec"><div><h2>Elementos por familia</h2><p>La misma tabla, ordenada por grupos de elementos parecidos</p></div></div>
  ${Chem.famList.map(x => { const l = els.filter(e => e.fam === x.id); return `<details class="fam-box" style="--fc:${x.color}"><summary><span class="dot" style="background:${x.color}"></span><b>${esc(x.name)}</b><small>${l.length}</small></summary><p>${esc(x.desc)}</p><div class="el-grid">${l.map(elMini).join('')}</div></details>`; }).join('')}
  <div class="sec"><div><h2>Ponte a prueba</h2><p>Símbolos, familias, números atómicos y estados</p></div></div>
  <button class="btn ac block" data-act="q-chem">Hacer el quiz de la tabla periódica ${ICON.arrow}</button>
  <p class="foot-note">Textos de elaboración propia verificados contra sus fuentes: PubChem (Biblioteca Nacional de Medicina de EE. UU.), que reúne los textos de Jefferson Lab, el Laboratorio Nacional de Los Álamos y la CIAAW de la IUPAC; fundamentos: OpenStax Chemistry 2e (CC BY 4.0). Los datos numéricos proceden de la tabla periódica de PubChem.</p>`;
};

Views.element = ([slug]) => {
  if (!Chem.data) return needChem();
  const e = Chem.get(slug);
  if (!e) return Views.notFound();
  if (UserRepo.markSeen(e.id)) renderAvatar();
  const f = Chem.fam(e), mp = kToC(e.mp), bp = kToC(e.bp);
  const prev = Chem.data[e.z - 2], next = Chem.data[e.z];
  const kin = Chem.data.filter(x => x.fam === e.fam && x !== e).sort((a, b) => Math.abs(a.z - e.z) - Math.abs(b.z - e.z)).slice(0, 6).sort((a, b) => a.z - b.z);
  const facts = [['Número atómico', e.z], ['Símbolo', e.sym], ['Masa atómica', e.mass ? fmtDec(e.mass, 4) + ' u' : '—'], ['Familia', f.name], ['Grupo', e.group || '—', e.fcol ? 'Fila de transición interna' : ''], ['Período', e.period], ['Bloque', e.block], ['Estado a 25 °C', e.state || '—'],
    ['Configuración electrónica', e.config || '—'], ['Electronegatividad', e.eneg != null ? fmtDec(e.eneg) + ' (Pauling)' : '—'], ['Punto de fusión', mp != null ? fmtDec(mp, 1) + ' °C' : '—'], ['Punto de ebullición', bp != null ? fmtDec(bp, 1) + ' °C' : '—'],
    ['Densidad', e.density != null ? fmtDec(e.density, 4) + (/^Gas/.test(e.state) ? ' g/cm³ (gas)' : ' g/cm³') : '—'], ['Descubrimiento', /^\d+$/.test(e.year) ? e.year : e.year === 'Ancient' ? 'Antigüedad' : '—']];
  let n = 0; const N = () => `<span class="n">${String(++n).padStart(2, '0')}</span>`;
  return `<article class="art elem">
    <div class="art-top"><button class="back" data-act="back">${ICON.back} Volver</button>
      <div style="display:flex;gap:8px">${favBtn(e.id, false)}<button class="btn sm" data-act="share" data-id="${e.id}" aria-label="Compartir">${ICON.share}</button></div></div>
    <header class="el-hero" style="--fc:${f.color}">
      <div class="el-tile" aria-hidden="true"><i>${e.z}</i><b>${e.sym}</b><span>${esc(e.name)}</span><small>${e.mass ? fmtDec(e.mass, 3) : ''}</small></div>
      <div class="el-head">
        <a class="chip" href="#/quimica?familia=${e.fam}" style="color:${f.color}"><span class="dot"></span>${esc(f.name)}</a>
        <h1>${esc(e.name)}</h1>
        <p class="sub">${esc(e.what)}</p>
        <div class="claim-row">${claimBadge(e)}</div>
      </div>
    </header>
    ${toolBtns(e.id)}
    <div class="prose">
      <h2>${N()}Para qué sirve y en qué se usa</h2><ul class="anat-list">${e.uses.map(u => `<li>${esc(u)}</li>`).join('')}</ul>
      <h2>${N()}En datos</h2><div class="kvs">${facts.map(([k, v, s]) => `<div class="kv"><span>${esc(k)}</span><b>${k === 'Configuración electrónica' ? esc(v).replace(/([spdf])(\d+)/g, '$1<sup>$2</sup>') : esc(v)}</b>${s ? `<small>${esc(s)}</small>` : ''}</div>`).join('')}</div>
      <h2>${N()}Descubrimiento</h2><p>${esc(e.disc)}</p>
      ${e.origin ? `<h2>${N()}Origen del nombre</h2><p>${esc(e.origin)}</p>` : ''}
      ${e.curious ? `<div class="ex"><b>Curiosidad</b><p>${esc(e.curious)}</p></div>` : ''}
      ${e.predicted ? `<aside class="med-note sm" role="note"><b>ℹ️ Nota</b> De este elemento solo se han producido unos pocos átomos que se desintegran enseguida: la mayoría de sus propiedades (estado, densidad, puntos de fusión) son predicciones teóricas, no medidas.</aside>` : ''}
      ${refMarks(e.sources)}
    </div>
    <nav class="el-nav" aria-label="Elementos vecinos">${prev ? `<a href="#/quimica/elemento/${prev.slug}"><small>← ${prev.z}</small><b>${esc(prev.name)}</b></a>` : '<span></span>'}${next ? `<a class="r" href="#/quimica/elemento/${next.slug}"><small>${next.z} →</small><b>${esc(next.name)}</b></a>` : '<span></span>'}</nav>
    ${sourcesBlock(e.sources, e)}
    <p class="verify">Cada dato de esta ficha se comprobó contra el texto de sus fuentes. Consulta <a href="#/metodologia">cómo verificamos</a>.</p>
    ${kin.length ? `<div class="sec"><div><h2>Más ${esc(f.name.toLowerCase())}</h2></div><a class="more" href="#/quimica?familia=${e.fam}">Ver en la tabla</a></div><div class="el-grid">${kin.map(elMini).join('')}</div>` : ''}
    <div class="sec"><div><h2>Para entenderlo mejor</h2></div></div><div class="list two">${['tabla', 'numero-atomico'].map(id => Chem.lmap[id]).filter(Boolean).map(lessonRow).join('')}</div>
  </article>`;
};

Views.chemLesson = ([slug]) => {
  if (!Chem.data) return needChem();
  const l = Chem.get('quim-' + slug);
  if (!l) return Views.notFound();
  if (UserRepo.markSeen(l.id)) renderAvatar();
  const next = Chem.lessons[l.n], prev = Chem.lessons[l.n - 2];
  return `<article class="art">
    <div class="art-top"><button class="back" data-act="back">${ICON.back} Volver</button>
      <div style="display:flex;gap:8px">${favBtn(l.id, false)}<button class="btn sm" data-act="share" data-id="${l.id}" aria-label="Compartir">${ICON.share}</button></div></div>
    <header class="art-head" style="margin-top:12px">
      <a class="chip" href="#/quimica" style="color:${CHEM_COLOR}"><span class="dot"></span>Química · Fundamentos ${l.n} de ${Chem.lessons.length}</a>
      <h1 style="margin-top:12px">${esc(l.title)}</h1>
      <p class="sub">${esc(l.sub)}</p>
      <div class="claim-row">${claimBadge(l)}</div>
    </header>
    ${toolBtns(l.id)}
    <div class="prose">
      <p class="lead">${esc(l.intro)}</p>
      ${l.sections.map((s, k) => `<h2><span class="n">${String(k + 1).padStart(2, '0')}</span>${esc(s.h)}</h2>${s.p.map(t => `<p>${esc(t)}</p>`).join('')}${s.example ? `<div class="ex"><b>Ejemplo</b><p>${esc(s.example)}</p></div>` : ''}`).join('')}
      ${refMarks(l.sources)}
    </div>
    ${sourcesBlock(l.sources, l)}
    <p class="verify">Texto de elaboración propia comprobado contra sus fuentes. Consulta <a href="#/metodologia">cómo verificamos</a>.</p>
    <nav class="el-nav" aria-label="Temas">${prev ? `<a href="#/quimica/tema/${prev.slug}"><small>← Tema anterior</small><b>${esc(prev.title)}</b></a>` : '<span></span>'}${next ? `<a class="r" href="#/quimica/tema/${next.slug}"><small>Siguiente tema →</small><b>${esc(next.title)}</b></a>` : `<a class="r" href="#/quimica"><small>Fin de los fundamentos →</small><b>Volver a la tabla</b></a>`}</nav>
  </article>`;
};

function chemFilter() {
  const pt = $('#ptable'); if (!pt) return;
  const f = (parse().q.get('familia')) || '', inp = $('#eq'), t = norm(inp ? inp.value : '').split(/\s+/).filter(Boolean);
  pt.classList.toggle('filtering', !!(f || t.length));
  const hits = [];
  $$('#ptable .pt-c').forEach(c => { const ok = (!f || c.dataset.f === f) && t.every(x => c.dataset.s.split(' ').some(w => w.startsWith(x))); c.classList.toggle('hit', ok); if (ok && t.length) hits.push(c.getAttribute('href').split('/').pop()); });
  const d = $('#pt-fam-desc'); if (d) d.innerHTML = f && Chem.fams[f] ? `<p class="pt-fdesc" style="--fc:${Chem.fams[f].color}"><b>${esc(Chem.fams[f].name)}.</b> ${esc(Chem.fams[f].desc)}</p>` : '';
  const L = $('#elist'); if (L) { L.hidden = !t.length; L.innerHTML = t.length ? (hits.length ? hits.slice(0, 8).map(s => elRow(Chem.get(s))).join('') : `<p class="muted">Ningún elemento coincide.</p>`) : ''; }
}
function chemAfter() { const inp = $('#eq'); if (inp) inp.addEventListener('input', chemFilter); chemFilter(); }

/* ================= SECCIONES EDITORIALES ================= */

/* Hoy en la historia: efemérides seleccionadas por Wikipedia en español (se actualiza sola cada día). */
const OTD = {
  cache: null,
  async get() {
    if (this.cache) return this.cache;
    const d = new Date(), mm = String(d.getMonth() + 1).padStart(2, '0'), dd = String(d.getDate()).padStart(2, '0'), key = `sq.otd.${mm}${dd}`;
    try { const c = sessionStorage.getItem(key); if (c) return (this.cache = JSON.parse(c)); } catch { }
    const url = `https://es.wikipedia.org/api/rest_v1/feed/onthisday/selected/${mm}/${dd}`;
    let r = await fetch(url).catch(() => null);
    if (!r || !r.ok) { await new Promise(ok => setTimeout(ok, 1800)); r = await fetch(url); }   // un reintento
    if (!r.ok) throw new Error('otd');
    const j = await r.json();
    const ev = (j.selected || []).map(e => {
      const pg = (e.pages || [])[0] || {};
      return { year: e.year, text: String(e.text || '').replace(/\s*\((?:en la|véase la) imagen[^)]*\)/gi, '').trim(), page: (pg.titles && pg.titles.normalized) || '', url: pg.content_urls && pg.content_urls.desktop && pg.content_urls.desktop.page };
    }).filter(e => e.text).sort((a, b) => b.year - a.year);
    this.cache = { day: `${d.getDate()} de ${MONTHS[d.getMonth()]}`, ev };
    try { sessionStorage.setItem(key, JSON.stringify(this.cache)); } catch { }
    return this.cache;
  }
};
const otdSkeleton = () => '<div class="skel" style="height:16px;width:70%;margin:6px 0 10px"></div><div class="skel" style="height:16px;width:90%;margin-bottom:10px"></div><div class="skel" style="height:16px;width:60%"></div>';
const otdItem = e => `<li><span class="yr">${esc(e.year)}</span><span>${esc(e.text)}${e.url ? ` <a class="src" href="${esc(e.url)}" target="_blank" rel="noopener noreferrer">Fuente</a>` : ''}</span></li>`;
function fillOtd(sel, n) {
  const box = $(sel); if (!box) return;
  OTD.get().then(d => {
    const el = $(sel); if (!el) return;
    el.innerHTML = d.ev.length ? `<p class="otd-day">${esc(d.day)}</p><ol class="otd-list">${d.ev.slice(0, n).map(otdItem).join('')}</ol>` : '<p class="faint">Hoy no hay efemérides seleccionadas.</p>';
  }).catch(() => { const el = $(sel); if (el) el.innerHTML = '<p class="faint">No se pudieron cargar las efemérides. Revisa tu conexión.</p>'; });
}
Views.otd = () => `
  <button class="back" data-act="back">${ICON.back} Volver</button>
  <header class="cat-hero" style="--cc:#c8a46a"><div class="gl">📅</div><h1 class="h1">Hoy en la historia</h1><p>Acontecimientos que ocurrieron un día como hoy, seleccionados por la comunidad de Wikipedia en español.</p></header>
  <section class="otd card"><div class="otd-body" id="otd-full">${otdSkeleton()}</div></section>
  <p class="verify">Fuente: Wikipedia en español, sección de efemérides seleccionadas (CC BY-SA 4.0). Cada acontecimiento enlaza a su artículo.</p>`;

/* Dosieres: series temáticas definidas en content.js (series) */
/* Diccionario: búsqueda de palabras (la lógica vive en dict.js) */
Views.dictionary = (p, q) => `
  <button class="back" data-act="back">${ICON.back} Volver</button>
  <header class="cat-hero" style="--cc:#d9a44c"><div class="gl">📖</div><span class="eyebrow" style="color:#e8c873">Lengua y literatura</span><h1 class="h1">Diccionario</h1><p>Busca qué significa una palabra. También puedes seleccionar cualquier palabra mientras lees un artículo o una curiosidad: verás su significado y la frase del texto donde aparece.</p></header>
  <div class="dict-page"><form class="dict-search" role="search"><input type="search" name="w" placeholder="Escribe una palabra…" autocomplete="off" autocapitalize="off" value="${esc((q && q.get('q')) || '')}" aria-label="Palabra"><button class="btn ac" type="submit">Buscar</button></form>
  <div id="dict-result" class="def"></div>
  <p class="faint" style="font-size:13px;margin-top:18px">Las definiciones proceden del Wikcionario en español (CC BY-SA), un diccionario colaborativo. Para la norma académica, cada resultado enlaza al Diccionario de la lengua española de la RAE y a las recomendaciones de la FundéuRAE.</p></div>
  ${footNote()}`;
/* Colección «Lo que pocos saben» */
const RARE = 'lo-que-pocos-saben';
const rareBadge = i => ContentRepo.inCollection(RARE, i.id) ? `<a class="rare-chip" href="#/lo-que-pocos-saben">✦ Lo que pocos saben</a>` : '';
const rareHome = () => {
  const x = ContentRepo.collections().find(c => c.id === RARE);
  if (!x) return '';
  const pick = Services.dailyRotate ? Services.dailyRotate(x.items, 6) : x.items.slice(0, 6);
  return `<section class="rare-home"><div class="sec"><div><h2><span class="rare-mark">✦</span> ${esc(x.title)}</h2><p>${esc(x.desc)}</p></div><a class="more" href="#/lo-que-pocos-saben">Ver la colección</a></div>
  <div class="list two">${pick.map(rowCard).join('')}</div></section>`;
};
Views.collection = ([id]) => {
  const x = ContentRepo.collections().find(c => c.id === (id || RARE));
  if (!x) return Views.notFound();
  const groups = ContentRepo.categories().map(c => ({ c, xs: x.items.filter(i => i.cat === c.id) })).filter(g => g.xs.length);
  return `
  <button class="back" data-act="back">${ICON.back} Volver</button>
  <header class="cat-hero rare-hero" style="--cc:#d8b45a"><div class="gl">✦</div><span class="eyebrow" style="color:#e8c873">Colección editorial</span><h1 class="h1">${esc(x.title)}</h1><p>${esc(x.intro || x.desc)}</p><div class="meta"><span>${plural(x.items.length, 'pieza', 'piezas')}</span><span>${plural(groups.length, 'categoría', 'categorías')}</span></div></header>
  <p class="faint" style="font-size:13.5px;margin:4px 0 6px">Cada pieza tiene fuentes verificables. Lo «poco conocido» no es lo dudoso: es lo documentado que casi nadie cuenta.</p>
  ${groups.map(g => `<div class="sec"><div><h2>${g.c.icon} ${esc(g.c.name)}</h2></div></div><div class="list two">${g.xs.map(rowCard).join('')}</div>`).join('')}
  ${footNote()}`;
};
const seriesCard = x => { const first = x.items.find(i => i.img) || x.items[0]; return `<a class="dossier" href="#/dosier/${x.id}"><div class="cover">${cover(first, { w: 600, h: 400 })}</div><div class="in"><span class="eyebrow" style="color:var(--ac2)">Dosier · ${x.items.length} piezas</span><b>${esc(x.title)}</b><span>${esc(x.desc)}</span></div></a>`; };
Views.series = () => `
  <button class="back" data-act="back">${ICON.back} Volver</button>
  <div class="sec" style="margin-top:6px"><div><h1 class="h1">Dosieres</h1><p>Series temáticas: lecturas agrupadas para entender un tema a fondo.</p></div></div>
  <div class="dossier-grid">${ContentRepo.series().map(seriesCard).join('')}</div>${footNote()}`;
Views.dossier = ([id]) => {
  const x = ContentRepo.series().find(s => s.id === id);
  if (!x) return Views.notFound();
  const arts = x.items.filter(i => i.type === 'articulo'), rest = x.items.filter(i => i.type !== 'articulo');
  return `
  <button class="back" data-act="back">${ICON.back} Volver</button>
  <header class="dossier-hero"><div class="cover">${cover(x.items.find(i => i.img) || x.items[0], { w: 1200, h: 600 })}</div><div class="in"><span class="eyebrow" style="color:var(--ac2)">Dosier</span><h1 class="h1">${esc(x.title)}</h1><p>${esc(x.desc)}</p><div class="meta"><span>${plural(x.items.length, 'pieza', 'piezas')}</span><span>${ICON.clock}${x.items.reduce((n, i) => n + (i.read || 1), 0)} min de lectura</span></div></div></header>
  ${arts.length ? `<div class="sec"><div><h2>Para leer a fondo</h2></div></div><div class="list">${arts.map(rowCard).join('')}</div>` : ''}
  ${rest.length ? `<div class="sec"><div><h2>En pocas palabras</h2></div></div><div class="list two">${rest.map(rowCard).join('')}</div>` : ''}`;
};

/* Cómo verificamos */
Views.method = () => {
  const all = [...ContentRepo.all(), ...Anatomy.all()], srcs = all.flatMap(i => i.sources);
  const uniq = new Set(srcs.map(s => s.u)), inst = all.filter(i => i.verif && i.verif.level === 'institucional').length;
  const kinds = srcs.reduce((m, s) => (m[s.kind || 'otra'] = (m[s.kind || 'otra'] || 0) + 1, m), {});
  const pct = n => Math.round(n / srcs.length * 100) + '%';
  return `<article class="art">
  <button class="back" data-act="back">${ICON.back} Volver</button>
  <header class="art-head"><span class="chip" style="color:var(--ac2)"><span class="dot"></span>Transparencia</span><h1 style="margin-top:12px">Cómo verificamos</h1><p class="sub">Nuestra regla fundamental: todo lo que publicamos debe ser verídico, contrastable y estar respaldado por fuentes que cualquiera pueda consultar. Preferimos menos contenido y más confianza.</p></header>
  <div class="kvs"><div class="kv"><span>Contenidos verificados</span><b>${all.length}</b></div><div class="kv"><span>Fuentes enlazadas</span><b>${uniq.size}</b></div><div class="kv"><span>Correcciones publicadas</span><b>${ContentRepo.corrections().length}</b></div></div>
  <div class="prose">
    <h2><span class="n">01</span>Toda afirmación tiene fuente</h2><p>Cada artículo, curiosidad, mito, ficha del atlas y pregunta del quiz enlaza las fuentes en las que se basa. La sección «Fuentes y referencias» indica la institución o el autor, el título, la fecha de publicación cuando existe y la fecha en que la consultamos. El panel editorial impide publicar un contenido sin fuentes verificadas.</p>
    <h2><span class="n">02</span>Verificación contra el texto original</h2><p>Antes de publicar, descargamos el texto completo de cada fuente y comprobamos que los datos clave (cifras, fechas y nombres) aparecen realmente en ella. Además revisamos las afirmaciones que una búsqueda automática no cubre. Lo que no se puede comprobar no se presenta como hecho: se corrige, se matiza o se elimina. No inventamos investigaciones, autores, estadísticas, fechas, citas ni enlaces.</p>
    <h2><span class="n">03</span>Hechos, teorías y creencias, por separado</h2><p>Cada contenido indica qué tipo de afirmación hace:</p>
    <dl class="claims-dl">${Object.values(CLAIMS).map(([n, c, d]) => `<dt style="--k:${c}"><i></i>${n}</dt><dd>${d}</dd>`).join('')}</dl>
    <p>Cuando un contenido mezcla tipos (por ejemplo, un dato histórico sobre una creencia religiosa), lo explicamos con una nota «Ten en cuenta».</p>
    <h2><span class="n">04</span>El quiz también cita</h2><p>Después de cada respuesta mostramos la respuesta correcta, una explicación y la fuente para profundizar.</p>
    <h2><span class="n">05</span>Dos bases de datos para los países</h2><p>Capitales, monedas e idiomas se contrastan entre Wikidata y una segunda base independiente. Los casos complejos, como capitales múltiples o disputadas, se explican en lugar de simplificarse.</p>
    <h2><span class="n">06</span>Fechas de revisión</h2><p>Cada contenido muestra su fecha de última revisión. Los datos que cambian con el tiempo, como estadísticas, tecnología o economía, se revisan de nuevo y se actualizan con fuentes recientes.</p>
    <h2><span class="n">07</span>Corregimos en público</h2><p>Si detectamos un error después de publicar, lo corregimos y lo registramos en la <a href="#/erratas">fe de erratas</a>. Cada contenido guarda además su historial de cambios.</p>
    <h2><span class="n">08</span>Imágenes con licencia libre</h2><p>Las imágenes proceden de Wikimedia Commons con licencias libres (dominio público o Creative Commons) y cada una indica su autor y su licencia. No usamos fotografías de personas reales.</p>
    <h2><span class="n">09</span>Dónde estamos todavía: nuestras fuentes hoy</h2><p>Queremos priorizar universidades, revistas científicas revisadas por pares, organismos oficiales (NASA, OMS, UNESCO…), museos y archivos. Hoy la mayoría de nuestras referencias son enciclopédicas: ${pct(kinds.enciclopedia || 0)} de las fuentes son enciclopedias de consulta, ${pct((kinds.institucional || 0) + (kinds.academica || 0))} son instituciones oficiales o fuentes académicas y ${pct(kinds.otra || 0)} son de otro tipo. Solo ${inst} de ${all.length} contenidos incluyen ya una fuente institucional o académica.</p><p>Estamos incorporando esas fuentes por lotes, empezando por Medicina y el Atlas del cuerpo humano. Cada contenido indica en su sección de fuentes en qué punto está.</p>
  </div>${footNote()}</article>`;
};

/* Fe de erratas */
Views.errata = () => {
  const list = ContentRepo.corrections();
  return `<article class="art">
  <button class="back" data-act="back">${ICON.back} Volver</button>
  <header class="art-head"><span class="chip" style="color:var(--ac2)"><span class="dot"></span>Transparencia</span><h1 style="margin-top:12px">Fe de erratas</h1><p class="sub">Registro público de las correcciones hechas después de publicar.</p></header>
  <div class="errata">${list.length ? list.map(c => { const i = ContentRepo.get(c.id); return `<div class="err"><div class="meta"><span>${fmtDate(c.date)}</span></div><h3>${i ? `<a href="${href(i)}">${esc(i.title)}</a>` : esc(c.id)}</h3><p><b>Decía:</b> ${esc(c.before)}</p><p><b>Ahora dice:</b> ${esc(c.after)}</p>${c.why ? `<p class="faint">${esc(c.why)}</p>` : ''}</div>`; }).join('') : emptyState('✅', 'Sin correcciones', 'Todavía no ha sido necesario corregir nada.')}</div>
  ${footNote()}</article>`;
};

/* Lectura en voz alta (Web Speech API, sin coste ni servidor) */
const Speech = {
  id: null,
  supported: () => 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined',
  start(i) {
    if (!this.supported()) return toast('Tu navegador no puede leer en voz alta');
    speechSynthesis.cancel();
    const voices = speechSynthesis.getVoices(), voice = voices.find(v => /^es(-|_)(DO|US|MX|419)/i.test(v.lang)) || voices.find(v => /^es/i.test(v.lang));
    const parts = readText(i).match(/[^.!?]+[.!?]*/g) || [];
    parts.forEach((t, k) => { const u = new SpeechSynthesisUtterance(t.trim()); u.lang = voice ? voice.lang : 'es-ES'; if (voice) u.voice = voice; u.rate = 1; if (k === parts.length - 1) u.onend = () => this.stop(); speechSynthesis.speak(u); });
    this.id = i.id; this.paint();
  },
  stop() { if (this.supported()) speechSynthesis.cancel(); this.id = null; this.paint(); },
  paint() { $$('[data-act="listen"]').forEach(b => { const on = b.dataset.id === this.id; b.setAttribute('aria-pressed', on); b.innerHTML = (on ? ICON.stop : ICON.sound) + `<span>${on ? 'Detener' : 'Escuchar'}</span>`; }); }
};

/* Imagen para redes (1080×1350) generada en el teléfono con canvas */
async function makeCard(i) {
  const W = 1080, H = 1350, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const x = cv.getContext('2d');
  const cat = i.type === 'pais' ? { name: 'Países del mundo', color: '#5b8cff', icon: '🌎' } : i.type === 'anat' ? { name: 'Atlas del cuerpo humano', color: '#ff7a6b', icon: i.icon || '🫀' } : i.type === 'elem' ? { name: 'Química · ' + Chem.fam(i).name, color: Chem.fam(i).color, icon: '⚗️' } : i.type === 'quim' ? { name: 'Química · Fundamentos', color: CHEM_COLOR, icon: '⚗️' } : (ContentRepo.cat(i.cat) || { name: '', color: '#8f7cff', icon: '✦' });
  x.fillStyle = '#07080b'; x.fillRect(0, 0, W, H);
  const imgUrl = i.type === 'pais' ? Countries.flag(i.iso) : i.img;
  let drew = false;
  if (imgUrl) {
    try {
      const im = await new Promise((ok, ko) => { const m = new Image(); m.crossOrigin = 'anonymous'; m.referrerPolicy = 'no-referrer'; m.onload = () => ok(m); m.onerror = ko; m.src = imgUrl; });
      const ih = 700, r = Math.max(W / im.width, ih / im.height), w = im.width * r, h = im.height * r;
      x.drawImage(im, (W - w) / 2, (ih - h) / 2, w, h); drew = true;
      const g = x.createLinearGradient(0, 300, 0, 720); g.addColorStop(0, 'rgba(7,8,11,0)'); g.addColorStop(1, 'rgba(7,8,11,1)'); x.fillStyle = g; x.fillRect(0, 300, W, 420);
    } catch { drew = false; }
  }
  if (!drew) { const g = x.createRadialGradient(780, 260, 20, 780, 260, 700); g.addColorStop(0, cat.color + 'aa'); g.addColorStop(1, 'rgba(7,8,11,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H); x.font = '220px serif'; x.textAlign = 'center'; x.fillText(cat.icon, 780, 330); x.textAlign = 'left'; }
  const wrap = (text, font, maxW, lh, y, max) => { x.font = font; const words = String(text).split(' '); let line = '', n = 0; for (const w of words) { const t = line ? line + ' ' + w : w; if (x.measureText(t).width > maxW && line) { if (n === max - 1) { x.fillText(line + '…', 80, y); return y + lh; } x.fillText(line, 80, y); y += lh; n++; line = w; } else line = t; } x.fillText(line, 80, y); return y + lh; };
  let y = 790;
  x.fillStyle = cat.color; x.font = '700 30px -apple-system, system-ui, sans-serif'; x.fillText((i.type === 'mito' ? 'MITO O REALIDAD · ' : '') + cat.name.toUpperCase(), 80, y); y += 70;
  x.fillStyle = '#f3eee6'; y = wrap(i.title, '700 62px Georgia, "Times New Roman", serif', W - 160, 74, y, 5);
  x.fillStyle = '#b9b4ab'; y = wrap(i.desc || (i.type === 'pais' ? `Capital: ${i.capital}` : ''), '400 34px -apple-system, system-ui, sans-serif', W - 160, 46, y + 16, 3);
  x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(80, H - 150, W - 160, 2);
  x.font = '700 44px Georgia, serif'; x.fillStyle = '#8f7cff'; x.fillText('✦ ', 80, H - 80); const w1 = x.measureText('✦ ').width;
  x.fillStyle = '#f3eee6'; x.fillText('Lumbrario', 80 + w1, H - 80);
  x.font = '500 28px -apple-system, system-ui, sans-serif'; x.fillStyle = '#7d7a74'; x.textAlign = 'right'; x.fillText(SITE.replace(/^https?:\/\//, ''), W - 80, H - 84); x.textAlign = 'left';
  return new Promise(ok => cv.toBlob(ok, 'image/png'));
}
async function shareCard(i) {
  toast('Creando imagen…');
  let blob; try { blob = await makeCard(i); } catch { blob = null; }
  if (!blob) return toast('No se pudo crear la imagen');
  const file = new File([blob], `lumbrario-${i.id}.png`, { type: 'image/png' });
  try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: i.title, text: publicUrl(i) }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  const url = URL.createObjectURL(blob);
  Sheet.custom(`<h2 class="claim" id="sheet-title">Imagen para compartir</h2><p class="faint">Mantén pulsada la imagen para guardarla en Fotos, o descárgala.</p><img class="card-preview" src="${url}" alt="Vista previa de la imagen para redes"><div class="acts"><a class="btn ac" href="${url}" download="lumbrario-${esc(i.id)}.png">Descargar</a></div>`);
}

Views.notFound = () => emptyState('🧭', 'No encontramos esa página', 'Puede que el enlace esté mal o que el contenido ya no esté publicado.', '<a class="btn ac" href="#/">Ir al inicio</a>');

/* ================= 7. ROUTER ================= */
const ROUTES = [
  [/^\/?$/, 'home', Views.home, 'inicio'],
  [/^\/explorar$/, 'explore', Views.explore, 'explorar'],
  [/^\/categoria\/([\w-]+)$/, 'category', Views.category, 'explorar'],
  [/^\/buscar$/, 'search', Views.search, 'explorar'],
  [/^\/articulo\/([\w-]+)$/, 'article', Views.article, ''],
  [/^\/dato\/([\w-]+)$/, 'fact', Views.fact, ''],
  [/^\/paises$/, 'countries', Views.countries, 'explorar'],
  [/^\/pais\/([a-z]{2})$/, 'country', Views.country, 'explorar'],
  [/^\/quimica$/, 'chem', Views.chem, 'explorar'],
  [/^\/quimica\/elemento\/([\w-]+)$/, 'element', Views.element, 'explorar'],
  [/^\/quimica\/tema\/([\w-]+)$/, 'chemLesson', Views.chemLesson, 'explorar'],
  [/^\/anatomia$/, 'anatomy', Views.anatomy, 'explorar'],
  [/^\/anatomia\/([\w-]+)$/, 'anatItem', Views.anatItem, 'explorar'],
  [/^\/hoy$/, 'otd', Views.otd, 'inicio'],
  [/^\/diccionario$/, 'dictionary', Views.dictionary, 'explorar'],
  [/^\/lo-que-pocos-saben$/, 'collection', Views.collection, 'explorar'],
  [/^\/coleccion\/([\w-]+)$/, 'collection', Views.collection, 'explorar'],
  [/^\/dosieres$/, 'series', Views.series, 'explorar'],
  [/^\/dosier\/([\w-]+)$/, 'dossier', Views.dossier, 'explorar'],
  [/^\/metodologia$/, 'method', Views.method, ''],
  [/^\/erratas$/, 'errata', Views.errata, ''],
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
  document.title = (match.name === 'home' ? '' : (titleEl ? titleEl.textContent.trim() + ' · ' : '')) + 'Lumbrario';
  afterRender(match.name);
}

function afterRender(name) {
  if (name === 'home') fillOtd('#otd-home .otd-body', 3);
  if (name === 'otd') fillOtd('#otd-full', 40);
  if (Speech.id) Speech.paint();
  $('#progress').style.width = '0';
  if (name === 'search' && !Chem.data) Chem.load().then(() => { const inp = $('#q'); if (current.name === 'search' && inp && inp.value.trim()) $('#results').innerHTML = searchResults(inp.value); }).catch(() => {});
  if (name === 'chem') chemAfter();
  if (name === 'search' && !Countries.data) Countries.load().then(() => { const inp = $('#q'); if (current.name === 'search' && inp && inp.value.trim()) $('#results').innerHTML = searchResults(inp.value); }).catch(() => {});
  if (name === 'countries' && $('#cq')) {
    const inp = $('#cq'), cards = $$('#cgrid .ctry');
    const apply = () => { const t = norm(inp.value).split(/\s+/).filter(Boolean); let n = 0; cards.forEach(el => { const ok = t.every(x => el.dataset.s.includes(x)); el.hidden = !ok; if (ok) n++; }); $('#ccount').textContent = plural(n, 'país', 'países'); $('#cempty').hidden = n > 0; };
    inp.addEventListener('input', apply); if (inp.value) apply();
  }
  if (name === 'anatomy' && $('#aq')) {
    const inp = $('#aq'), cards = $$('#agrid .organ');
    inp.addEventListener('input', () => { const t = norm(inp.value).split(/\s+/).filter(Boolean); let n = 0; cards.forEach(el => { const ok = t.every(x => el.dataset.s.includes(x)); el.hidden = !ok; if (ok) n++; }); $('#aempty').hidden = n > 0; });
  }
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
    case 'claims': e.preventDefault(); Sheet.custom(`<h2 class="claim" id="sheet-title">Tipos de afirmación</h2><p class="faint">Cada contenido indica qué tipo de afirmación hace, para no presentar una teoría, una creencia o un misterio como si fueran hechos demostrados.</p><dl class="claims-dl">${Object.values(CLAIMS).map(([n, c, d]) => `<dt style="--k:${c}"><i></i>${n}</dt><dd>${d}</dd>`).join('')}</dl><p class="faint" style="font-size:13px">Más detalles en <a href="#/metodologia" data-act="sheet-close">Cómo verificamos</a>.</p>`); break;
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
    case 'listen': { const i = getAny(id); if (!i) break; if (Speech.id === i.id) Speech.stop(); else Speech.start(i); break; }
    case 'card': { const i = getAny(id); if (i) shareCard(i.type === 'pais' ? { ...i, title: i.name, desc: `Capital: ${i.capital}` } : i); break; }
    case 'cite': {
      const i = getAny(id); if (!i) break;
      const ref = apa(i.type === 'pais' ? { ...i, title: i.name, date: '2026-11-26' } : i);
      Sheet.custom(`<h2 class="claim" id="sheet-title">Citar este contenido</h2><p class="faint">Formato APA (7.ª edición), listo para trabajos escolares y universitarios.</p><div class="cite-box" id="cite-text">${esc(ref)}</div><div class="acts"><button class="btn ac" data-act="copy-cite">Copiar cita</button></div><p class="faint" style="font-size:13px;margin-top:14px">Para trabajos académicos, consulta también las fuentes originales enlazadas en el contenido.</p>`);
      break;
    }
    case 'copy-cite': { const t = $('#cite-text'); if (t) navigator.clipboard.writeText(t.textContent).then(() => toast('Cita copiada'), () => toast('Selecciona el texto y cópialo')); break; }
    case 'toref': { const li = $('#src-' + el.dataset.n); if (li) { li.scrollIntoView({ behavior: 'smooth', block: 'center' }); li.classList.add('flash'); setTimeout(() => li.classList.remove('flash'), 1400); } break; }
    case 'share': { const i = getAny(id); if (i) share(i.type === 'pais' ? { ...i, title: `${i.name}: capital ${i.capital}` } : i); break; }
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
    case 'q-chem': Quiz.cat = 'quimica'; Quiz.level = 0; Quiz.list = []; location.hash = '#/quiz'; setTimeout(quizStart, 0); break;
    case 'pt-fam': { const v = el.dataset.v || ''; history.replaceState(null, '', '#/quimica' + (v ? '?familia=' + v : '')); $$('.pt-legend button').forEach(b => b.classList.toggle('on', (b.dataset.v || '') === v)); chemFilter(); break; }
    case 'q-anat': Quiz.cat = 'cuerpo'; Quiz.level = 0; Quiz.list = []; if (current.name === 'quiz') quizStart(); else { Object.assign(Quiz, { list: Services.buildQuiz(0, 'cuerpo', 10), i: 0, correct: 0, xp: 0, wrong: [], answered: false, saved: false, isBest: false }); location.hash = '#/quiz'; } break;
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
window.addEventListener('hashchange', () => { if (Speech.id) Speech.stop(); sessionStorage.setItem('sq.nav', '1'); if (Sheet.isOpen()) Sheet.close(); render(); });
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
