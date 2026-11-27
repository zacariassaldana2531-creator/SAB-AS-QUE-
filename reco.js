/* ¿SABÍAS QUE? — Motor de recomendaciones (compartido por la app y por tools/build-pages.js).
 * Para cada contenido elige 3 relacionados de la biblioteca publicada:
 *   1. enlaces editoriales explícitos (campo "related" y "concepts" del contenido),
 *   2. series compartidas, 3. mismo subtema, 4. palabras clave en común, 5. misma categoría.
 * Evita llenar la lista con una sola categoría cuando hay alternativas sólidas. */
(function (root) {
  'use strict';
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const STOPW = new Set('sobre entre desde hasta donde cuando porque tambien mucho muchos muchas otros otras puede pueden tiene tienen hacia segun mismo misma cada todos todas antes despues mundo historia nuestro nuestra tanto parte forma veces cosas dicen hecho'.split(' '));
  const keywords = i => new Set(norm([i.title, i.subtitle, i.desc, i.sub, (i.concepts || []).map(c => c.t).join(' ')].join(' '))
    .split(/[^a-z0-9ñ]+/).filter(w => w.length > 4 && !STOPW.has(w)).map(w => w.slice(0, 6)));
  function build(items, series) {
    const kw = new Map(items.map(i => [i.id, keywords(i)]));
    return function recommend(i, n = 3) {
      if (!i) return [];
      const mine = kw.get(i.id) || keywords(i);
      const inSer = new Set((series || []).filter(x => (x.ids || []).includes(i.id)).flatMap(x => x.ids));
      const pinned = [...(i.related || []), ...(i.concepts || []).map(c => c.id)].filter(Boolean);
      const scored = items.filter(x => x.id !== i.id).map(x => {
        let sc = 0;
        if (pinned.includes(x.id)) sc += 100 - pinned.indexOf(x.id);
        if (inSer.has(x.id)) sc += 6;
        if (x.sub && x.sub === i.sub) sc += 4;
        if (x.cat === i.cat) sc += 2;
        let k = 0; for (const w of kw.get(x.id)) if (mine.has(w)) k++;
        sc += Math.min(k, 4) * 2.5;
        if (x.type === 'articulo') sc += 0.5;
        return { x, sc };
      }).filter(o => o.sc > 0).sort((a, b) => b.sc - a.sc || String(b.x.date || '').localeCompare(String(a.x.date || '')) || a.x.id.localeCompare(b.x.id));
      const out = [], perCat = {};
      for (const { x, sc } of scored) {
        if (out.length >= n || sc < 5) break;
        if (sc < 100 && (perCat[x.cat] || 0) >= 2) continue;
        out.push(x); perCat[x.cat] = (perCat[x.cat] || 0) + 1;
      }
      for (const { x } of scored) { if (out.length >= n) break; if (!out.includes(x)) out.push(x); }
      return out;
    };
  }
  const api = { build, keywords };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.SQ_RECO = api;
})(typeof window !== 'undefined' ? window : globalThis);
