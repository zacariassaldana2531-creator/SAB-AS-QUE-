/* ¿SABÍAS QUE? — Generador de páginas estáticas indexables.
 * Crea una página HTML real por artículo, dato y país, con título, descripción,
 * vista previa para redes (Open Graph) y datos estructurados (JSON-LD), más sitemap.xml y robots.txt.
 * Uso:  node tools/build-pages.js            (desde la carpeta del proyecto)
 * Vuelve a ejecutarlo cada vez que cambie content.js o countries.js.
 */
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SITE = (process.env.SITE || 'https://cultura-khaki.vercel.app').replace(/\/$/, '');
global.window = {};
require(path.join(ROOT, 'content.js'));
require(path.join(ROOT, 'countries.js'));
const C = window.SQ_CONTENT, P = window.SQ_COUNTRIES || [];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const cats = Object.fromEntries(C.categories.map(c => [c.id, c]));
const TYPE = { articulo: 'Artículo', curiosidad: 'Curiosidad', mito: 'Mito o realidad' };
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const fdate = s => { const d = new Date(s + 'T12:00:00'); return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`; };
const clip = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length <= n ? s : s.slice(0, n).replace(/\s+\S*$/, '') + '…'; };

function page({ url, appUrl, title, desc, image, type, jsonld, body }) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)} · ¿SABÍAS QUE?</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#07080b">
<meta property="og:site_name" content="¿SABÍAS QUE?">
<meta property="og:locale" content="es_ES">
<meta property="og:type" content="${type}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${esc(image)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(image)}">
<link rel="icon" href="/icons/icon-192.png">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="stylesheet" href="/styles.css">
<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>
<style>body{padding-bottom:40px}.sp-top{display:flex;align-items:center;justify-content:space-between;gap:12px;max-width:760px;margin:0 auto;padding:calc(env(safe-area-inset-top) + 14px) 18px 10px}.sp-cta{margin:26px 0 8px;display:flex;gap:10px;flex-wrap:wrap}.view{animation:none}</style>
</head>
<body>
<header class="sp-top"><a class="logo" href="/"><i>¿</i>SABÍAS QUE<i>?</i></a><a class="btn sm ac" href="${appUrl}">Abrir en la app</a></header>
<main class="view"><article class="art">${body}
<div class="sp-cta"><a class="btn ac" href="${appUrl}">Leer en la app</a><a class="btn" href="/#/quiz">Jugar al quiz</a><a class="btn" href="/#/metodologia">Cómo verificamos</a></div>
<p class="foot-note">¿SABÍAS QUE? · Cultura general gratuita y con fuentes verificables.</p>
</article></main>
</body>
</html>
`;
}
const figure = (o, alt) => o.img ? `<figure class="art-fig"><div class="cover art-hero"><img src="${esc(o.img)}" alt="${esc(alt)}" referrerpolicy="no-referrer"></div>${o.imgCredit ? `<figcaption class="credit">Imagen: ${esc(o.imgCredit.artist)} · <a href="${esc(o.imgCredit.page)}" rel="noopener">${esc(o.imgCredit.license)} · Wikimedia Commons</a></figcaption>` : ''}</figure>` : '';
const sources = ss => ss && ss.length ? `<div class="sources"><h3>Fuentes consultadas</h3><ol>${ss.map(s => `<li><a href="${esc(s.u)}" rel="noopener">${esc(s.t)}</a></li>`).join('')}</ol></div>` : '';
const write = (rel, html) => { const f = path.join(ROOT, rel, 'index.html'); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html); };

/* Limpiar las carpetas generadas para no dejar páginas de contenido borrado */
for (const d of ['articulo', 'dato', 'pais']) fs.rmSync(path.join(ROOT, d), { recursive: true, force: true });

const urls = [{ loc: `${SITE}/`, pri: '1.0' }];
const items = C.items.filter(i => i.status === 'publicado');
for (const i of items) {
  const kind = i.type === 'articulo' ? 'articulo' : 'dato';
  const url = `${SITE}/${kind}/${i.id}/`, appUrl = `/#/${kind}/${i.id}`;
  const cat = cats[i.cat] || {};
  const desc = clip(i.desc, 200);
  const head = `<header class="art-head"><span class="chip" style="color:${esc(cat.color || '#b3a6ff')}"><span class="dot"></span>${esc(cat.name || '')} · ${TYPE[i.type]}</span><h1 style="margin-top:12px">${esc(i.title)}</h1><p class="sub">${esc(i.subtitle || i.desc)}</p><div class="meta"><span>Redacción ¿Sabías que?</span><span>${fdate(i.date)}</span></div></header>`;
  const body = i.type === 'articulo'
    ? `${head}${figure(i, i.title)}<div class="prose"><p class="lead">${esc(i.intro)}</p>${(i.sections || []).map(s => `<h2>${esc(s.h)}</h2>${(s.p || []).map(t => `<p>${esc(t)}</p>`).join('')}`).join('')}${(i.facts || []).length ? `<aside class="box"><h3>Datos complementarios</h3><ul>${i.facts.map(f => `<li>${esc(f)}</li>`).join('')}</ul></aside>` : ''}${i.conclusion ? `<h2>Conclusión</h2><p class="conclusion">${esc(i.conclusion)}</p>` : ''}</div>${sources(i.sources)}`
    : `${head}${figure(i, i.title)}<div class="prose"><p>${esc(i.body)}</p></div>${sources(i.sources)}`;
  const jsonld = { '@context': 'https://schema.org', '@type': i.type === 'articulo' ? 'Article' : 'CreativeWork', headline: clip(i.title, 110), description: desc, datePublished: i.date, dateModified: C.updated || i.date, inLanguage: 'es', url, image: i.img || `${SITE}/og-default.png`, author: { '@type': 'Organization', name: 'Redacción ¿Sabías que?' }, publisher: { '@type': 'Organization', name: '¿SABÍAS QUE?', logo: { '@type': 'ImageObject', url: `${SITE}/icons/icon-512.png` } }, citation: (i.sources || []).map(s => s.u), isAccessibleForFree: true };
  write(`${kind}/${i.id}`, page({ url, appUrl, title: i.title, desc, image: i.img || `${SITE}/og-default.png`, type: 'article', jsonld, body }));
  urls.push({ loc: url, pri: i.type === 'articulo' ? '0.8' : '0.6', mod: i.date });
}
for (const c of P) {
  const iso = c.iso.toLowerCase(), url = `${SITE}/pais/${iso}/`, appUrl = `/#/pais/${iso}`;
  const desc = clip(`${c.name}: capital ${c.capital}. Moneda: ${c.currencies.map(x => x.n).join(', ')}. Idioma: ${c.languages.join(', ')}. ${c.lead || ''}`, 200);
  const kv = (k, v) => v ? `<div class="kv"><span>${k}</span><b>${v}</b></div>` : '';
  const body = `<div class="flag-hero"><img src="/flags/${iso}.svg" alt="Bandera de ${esc(c.name)}"></div>
<header class="art-head" style="margin-top:20px"><span class="chip" style="color:#b3a6ff"><span class="dot"></span>${esc(c.region)} · ${esc(c.subregion)}</span><h1 style="margin-top:12px">${esc(c.name)}</h1></header>
<div class="kvs">${kv('Capital', esc(c.capital))}${kv('Moneda', esc(c.currencies.map(x => `${x.n} (${x.c})`).join(', ')))}${kv('Idiomas oficiales', esc(c.languages.join(', ')))}${kv('Continente', esc(c.trans || c.region))}${kv('Superficie', c.area ? Number(c.area).toLocaleString('es') + ' km²' : '')}${kv('Población', c.pop ? Number(c.pop).toLocaleString('es') + (c.popYear ? ` (${c.popYear})` : '') : '')}</div>
<div class="prose">${c.lead ? `<h2>Resumen</h2><p>${esc(c.lead)}</p>` : ''}${c.name_origin ? `<h2>Origen del nombre</h2><p>${esc(c.name_origin)}</p>` : ''}${c.history ? `<h2>Un poco de historia</h2><p>${esc(c.history)}</p>` : ''}</div>
<div class="sources"><h3>Fuentes</h3><ol>${c.wiki ? `<li><a href="${esc(c.wiki)}" rel="noopener">Wikipedia en español — ${esc(c.name)} (CC BY-SA 4.0)</a></li>` : ''}<li><a href="${esc(c.wikidata)}" rel="noopener">Wikidata</a></li></ol></div>`;
  const jsonld = { '@context': 'https://schema.org', '@type': 'WebPage', name: `${c.name}: bandera, capital, moneda e historia`, description: desc, inLanguage: 'es', url, about: { '@type': 'Country', name: c.name, sameAs: [c.wiki, c.wikidata].filter(Boolean) } };
  write(`pais/${iso}`, page({ url, appUrl, title: `${c.name}: bandera, capital, moneda e historia`, desc, image: `${SITE}/og-default.png`, type: 'article', jsonld, body }));
  urls.push({ loc: url, pri: '0.5' });
}
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `<url><loc>${u.loc}</loc>${u.mod ? `<lastmod>${u.mod}</lastmod>` : ''}<priority>${u.pri}</priority></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin.html\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`Páginas: ${items.length} contenidos + ${P.length} países · sitemap con ${urls.length} direcciones`);
