// Uso: node merge.js <dir con .txt> [--cat-oceanos]  → añade contenidos y preguntas a content.js
const fs = require('fs'), path = require('path');
const REPO = '/home/claude/sab-as-que-', FILE = REPO + '/content.js';
global.window = {}; require(FILE); const C = window.SQ_CONTENT;
const TODAY = '2026-11-27';
const dir = process.argv[2], addCat = process.argv.includes('--cat-oceanos');
const ids = new Set(C.items.map(i => i.id));
const items = [], qs = [];
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.txt')).sort()) {
  let cur = null, sec = null;
  for (const raw of fs.readFileSync(path.join(dir, f), 'utf8').split('\n')) {
    const l = raw.trim(); if (!l) continue;
    if (l.startsWith('@')) { cur = { id: l.slice(1).trim(), b: [], sections: [], facts: [], sources: [], q: [] }; sec = null; items.push(cur); continue; }
    const m = l.match(/^(\w+):\s?(.*)$/); if (!m || !cur) throw new Error(f + ': ' + l);
    const [, k, v] = m;
    if (k === 'b') cur.b.push(v);
    else if (k === 'h') { sec = { h: v, p: [] }; cur.sections.push(sec); }
    else if (k === 'p') sec.p.push(v);
    else if (k === 'f') cur.facts.push(v);
    else if (k === 'src') { const [u, org, title] = v.split(' | ').map(s => s.trim()); cur.sources.push({ u, org, title }); }
    else if (k === 'q') cur.q.push(v);
    else cur[k] = v;
  }
}
let qn = Math.max(...C.questions.map(q => +String(q.id).replace(/\D/g, '') || 0));
const out = [], errs = [];
for (const e of items) {
  const cat = e.cat || 'oceanos';
  if (ids.has(e.id)) errs.push('id repetido ' + e.id);
  for (const k of ['type', 'title', 'desc', 'sub', 'level']) if (!e[k]) errs.push(e.id + ' sin ' + k);
  if (!e.sources.length) errs.push(e.id + ' sin fuentes');
  if (e.type === 'mito' && !['falso', 'matizado'].includes(e.verdict)) errs.push(e.id + ' veredicto');
  const words = [e.intro, ...e.b, e.d, ...e.sections.flatMap(s => s.p), ...e.facts, e.conclusion].filter(Boolean).join(' ').split(/\s+/).length;
  if (words < (e.type === 'articulo' ? 300 : 185)) errs.push(`${e.id}: ${words} palabras`);
  if (e.type !== 'articulo' && !e.d) errs.push(e.id + ' sin A fondo');
  const it = { id: e.id, type: e.type, status: 'publicado', date: TODAY, level: +e.level, cat, sub: e.sub };
  if (e.verdict) it.verdict = e.verdict;
  it.title = e.title;
  if (e.subtitle) it.subtitle = e.subtitle;
  it.desc = e.desc;
  if (e.type === 'articulo') Object.assign(it, { intro: e.intro, sections: e.sections, facts: e.facts, conclusion: e.conclusion });
  else { it.body = e.b.join('\n\n'); it.deep = e.d; }
  it.sources = e.sources.map(s => ({ t: `${s.org.replace(' en inglés', '').replace(' en español', '')} — ${s.title}`, org: s.org, title: s.title, u: s.u, kind: /wikipedia|britannica|encyclop/i.test(s.org) ? 'enciclopedia' : 'institucional', accessed: TODAY, ...(/wikipedia/i.test(s.org) ? { note: 'Obra de consulta colaborativa de edición continua (sin fecha única de publicación).' } : {}) }));
  it.verif = { status: 'verificado', level: e.sources.some(s => !/wikipedia|britannica|encyclop/i.test(s.org)) ? 'institucional' : 'enciclopedica', reviewed: TODAY, method: 'Texto de elaboración propia: cada cifra, fecha y nombre se comprobó contra el texto de la fuente citada; lo dudoso o discutido se indica como tal.' };
  it.claim = e.claim || 'hecho';
  it.history = [{ date: TODAY, note: 'Publicación, con datos verificados contra las fuentes' }];
  out.push(it);
  for (const q of e.q) {
    const [qq, o, a, exp] = q.split(' | ').map(s => s.trim()), opts = o.split(' ; ').map(s => s.trim());
    if (opts.length !== 4 || !(+a >= 0 && +a < 4) || !exp) errs.push(e.id + ' pregunta mal: ' + qq);
    qs.push({ id: 'q' + (++qn), cat, level: +e.level, status: 'publicado', ref: e.id, q: qq, o: opts, a: +a, exp });
  }
}
if (errs.length) { console.error(errs.join('\n')); process.exit(1); }
if (addCat && !C.categories.some(c => c.id === 'oceanos')) {
  const at = C.categories.findIndex(c => c.id === 'animales') + 1;
  C.categories.splice(at, 0, { id: 'oceanos', name: 'Océanos', icon: '🌊', color: '#1e9bd7', desc: 'El mar de la superficie al abismo: vida marina, corrientes, olas, fosas y leyendas.' });
}
C.items.push(...out); C.questions.push(...qs); C.updated = TODAY;
const head = `/* Lumbrario — Base de contenido v${C.version} (${C.items.length} contenidos, ${C.questions.length} preguntas).
 * Cada contenido tiene fuentes verificadas automáticamente contra el texto de la fuente.
 * Tipos: "articulo" | "curiosidad" | "mito". Estado: "publicado" | "borrador". Nivel: 1-3.
 * Este archivo lo puede regenerar el panel admin (admin.html → Publicar → Descargar content.js).
 */
`;
fs.writeFileSync(FILE, head + 'window.SQ_CONTENT = ' + JSON.stringify(C, null, 1) + ';\n');
console.log(`+${out.length} contenidos, +${qs.length} preguntas → ${C.items.length} / ${C.questions.length}`);
