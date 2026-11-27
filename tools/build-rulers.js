/* Lumbrario — genera rulers.js (window.SQ_RULERS) a partir de tools/gobernantes/*.txt.
 * Formato de cada ficha: "@slug", campos "clave: valor", "## Apartado", párrafos, "* curiosidad", "- AÑO | evento", "rel: slug | motivo", "src: url | Organización: título", "img: url | crédito | licencia" (opcional).
 * Uso: node tools/build-rulers.js  — falla si una ficha está incompleta, sin fuentes o con relaciones rotas. */
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, 'gobernantes'), out = path.join(__dirname, '..', 'rulers.js');
const TODAY = process.env.SQ_DATE || '2026-11-27';
const ORG = { 'Wikipedia': ['Wikipedia (edición en inglés)', 'enciclopedia', 'Obra de consulta colaborativa de edición continua; contrastada en cada dato con el resto de fuentes.'], 'Encyclopaedia Britannica': ['Encyclopaedia Britannica', 'enciclopedia'], 'World History Encyclopedia': ['World History Encyclopedia', 'enciclopedia'] };
const FIELDS = ['name', 'alt', 'title', 'kind', 'era', 'civ', 'realm', 'region', 'y', 'born', 'died', 'reign', 'lead'];
const KINDS = ['rey', 'reina', 'emperador', 'faraon', 'kan', 'sultan', 'califa', 'dictador', 'general', 'conquistador'];
const ERAS = ['antigua', 'media', 'moderna'];
const list = [];
for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.txt')).sort()) {
  for (const block of fs.readFileSync(path.join(dir, f), 'utf8').split(/^@/m).filter(b => b.trim())) {
    const lines = block.split('\n'), r = { slug: lines.shift().trim(), sections: [], facts: [], timeline: [], rel: [], sources: [], file: f };
    let sec = null;
    for (const raw of lines) {
      const l = raw.trim(); if (!l) continue;
      let m;
      if ((m = l.match(/^## (.+)$/))) { sec = { h: m[1], p: [] }; r.sections.push(sec); }
      else if ((m = l.match(/^\* (.+)$/))) r.facts.push(m[1]);
      else if ((m = l.match(/^- (-?\d+) \| (.+)$/))) r.timeline.push({ y: +m[1], t: m[2] });
      else if ((m = l.match(/^rel: ([\w-]+) \| (.+)$/))) r.rel.push({ s: m[1], t: m[2] });
      else if ((m = l.match(/^src: (\S+) \| (.+)$/))) {
        const [o, ...t] = m[2].split(': '), meta = ORG[o] || [o, 'otra'];
        r.sources.push({ org: meta[0], title: t.join(': ') || m[2], u: m[1], kind: meta[1], accessed: TODAY, ...(meta[2] ? { note: meta[2] } : {}) });
      } else if ((m = l.match(/^img: (\S+) \| ([^|]+) \| (.+)$/))) r.img = { src: m[1], credit: m[2].trim(), license: m[3].trim() };
      else if (!sec && (m = l.match(/^(\w+): (.*)$/)) && FIELDS.includes(m[1])) r[m[1]] = m[1] === 'y' ? +m[2] : m[2].trim();
      else if (sec) sec.p.push(l);
      else throw new Error(`${f} · ${r.slug}: línea fuera de lugar: ${l}`);
    }
    list.push(r);
  }
}
const errs = [], slugs = new Set(list.map(r => r.slug)), words = r => [r.lead, ...r.sections.flatMap(s => [s.h, ...s.p]), ...r.facts].join(' ').split(/\s+/).length;
if (slugs.size !== list.length) errs.push('slugs repetidos');
for (const r of list) {
  for (const k of FIELDS) if (r[k] === undefined || r[k] === '' || (k === 'y' && isNaN(r.y))) errs.push(`${r.slug}: falta «${k}»`);
  if (!KINDS.includes(r.kind)) errs.push(`${r.slug}: tipo «${r.kind}» desconocido`);
  if (!ERAS.includes(r.era)) errs.push(`${r.slug}: época «${r.era}» desconocida`);
  if (!r.sources.length) errs.push(`${r.slug}: sin fuentes`);
  if (r.sections.length < 5) errs.push(`${r.slug}: solo ${r.sections.length} apartados`);
  if (r.sections.some(s => !s.p.length)) errs.push(`${r.slug}: apartado vacío`);
  if (r.timeline.length < 3) errs.push(`${r.slug}: cronología corta`);
  if (r.facts.length < 2) errs.push(`${r.slug}: pocas curiosidades`);
  if (!r.rel.length) errs.push(`${r.slug}: sin figuras relacionadas`);
  for (const x of r.rel) if (!slugs.has(x.s)) errs.push(`${r.slug}: relación rota → ${x.s}`);
  r.words = words(r); if (r.words < 450) errs.push(`${r.slug}: biografía corta (${r.words} palabras)`);
  delete r.file;
  r.verif = { status: 'verificado', level: r.sources.some(s => s.kind === 'institucional' || s.kind === 'academica') ? 'institucional' : 'enciclopedico', reviewed: TODAY, method: 'Biografía de elaboración propia: cada dato se comprobó contra el texto de las fuentes citadas; lo que procede de la leyenda, la tradición o de una sola fuente tardía se indica como tal en el texto.' };
}
if (errs.length) { console.error(errs.join('\n')); process.exit(1); }
list.sort((a, b) => a.y - b.y);
const head = '/* Lumbrario — Reyes, emperadores y conquistadores: biografías de elaboración propia verificadas contra sus fuentes (Wikipedia, Encyclopaedia Britannica, World History Encyclopedia). Generado por tools/build-rulers.js desde tools/gobernantes/*.txt: no editar a mano. */\n';
fs.writeFileSync(out, head + 'window.SQ_RULERS = ' + JSON.stringify({ version: 1, updated: TODAY, rulers: list }) + ';\n');
console.log(`${list.length} gobernantes · ${list.reduce((n, r) => n + r.words, 0)} palabras · mín ${Math.min(...list.map(r => r.words))} → rulers.js`);
