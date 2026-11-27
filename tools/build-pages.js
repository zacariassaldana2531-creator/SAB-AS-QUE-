/* Lumbrario — Generador de páginas estáticas indexables.
 * Crea una página HTML real por artículo, dato y país, con título, descripción,
 * vista previa para redes (Open Graph) y datos estructurados (JSON-LD), más sitemap.xml y robots.txt.
 * Uso:  node tools/build-pages.js            (desde la carpeta del proyecto)
 * Vuelve a ejecutarlo cada vez que cambie content.js, countries.js o anatomy.js.
 */
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SITE = (process.env.SITE || 'https://cultura-khaki.vercel.app').replace(/\/$/, '');
global.window = {};
require(path.join(ROOT, 'content.js'));
require(path.join(ROOT, 'countries.js'));
require(path.join(ROOT, 'anatomy.js'));
const { build: buildReco } = require(path.join(ROOT, 'reco.js'));
const C = window.SQ_CONTENT, P = window.SQ_COUNTRIES || [], AN = window.SQ_ANATOMY || { systems: [], organs: [] };
const MED = 'Contenido educativo y de divulgación. No sustituye el diagnóstico, el tratamiento ni el consejo de un profesional de la salud.';
const medNote = `<aside class="med-note" role="note"><b>⚕️ Aviso</b> ${MED}</aside>`;
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
<title>${esc(title)} · Lumbrario</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#07080b">
<meta property="og:site_name" content="Lumbrario">
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
<header class="sp-top"><a class="logo" href="/"><i>✦</i>Lumbrario</a><a class="btn sm ac" href="${appUrl}">Abrir en la app</a></header>
<main class="view"><article class="art">${body}
<div class="sp-cta"><a class="btn ac" href="${appUrl}">Leer en la app</a><a class="btn" href="/#/quiz">Jugar al quiz</a><a class="btn" href="/#/metodologia">Cómo verificamos</a></div>
<p class="foot-note">Lumbrario · Cultura general gratuita y con fuentes verificables.</p>
</article></main>
</body>
</html>
`;
}
const figure = (o, alt) => o.img ? `<figure class="art-fig"><div class="cover art-hero"><img src="${esc(o.img)}" alt="${esc(alt)}" referrerpolicy="no-referrer"></div>${o.imgCredit ? `<figcaption class="credit">Imagen: ${esc(o.imgCredit.artist)} · <a href="${esc(o.imgCredit.page)}" rel="noopener">${esc(o.imgCredit.license)} · Wikimedia Commons</a></figcaption>` : ''}</figure>` : '';
const CLAIMS = { hecho: 'Hecho comprobado', teoria: 'Teoría científica respaldada', hipotesis: 'Hipótesis', interpretacion: 'Interpretación histórica', creencia: 'Creencia religiosa', leyenda: 'Leyenda', especulacion: 'Especulación', misterio: 'Misterio sin resolver', debate: 'Debate filosófico abierto' };
const claimLine = i => i.claim ? `<p class="claim-note"><b>Tipo de afirmación:</b> ${CLAIMS[i.claim] || ''}${i.claimNote ? '. ' + esc(i.claimNote) : ''}</p>` : '';
const sources = (ss, i) => ss && ss.length ? `<div class="sources"><h3>Fuentes y referencias</h3><ol>${ss.map((s, k) => `<li id="src-${k + 1}"><b>${esc(s.org || '')}</b>${s.org ? ' — ' : ''}<a href="${esc(s.u)}" rel="noopener">«${esc(s.title || s.t)}»</a>${s.date ? ` (${esc(s.date)})` : ''}.${s.note ? ' ' + esc(s.note) : ''}${s.accessed ? ` Consultado el ${fdate(s.accessed)}.` : ''}</li>`).join('')}</ol>${i && i.verif ? `<p class="verify">Verificado · Última revisión: ${fdate(i.verif.reviewed)}.</p>` : ''}</div>` : '';
const refs = ns => (ns || []).length ? `<p class="sec-src">Fuente${ns.length > 1 ? 's' : ''}: ${ns.map(n => `<a href="#src-${n}">[${n}]</a>`).join(' ')}</p>` : '';
const secFig = im => im && im.src ? `<figure class="sec-fig"><img src="${esc(im.src)}" alt="${esc(im.alt || '')}" loading="lazy" referrerpolicy="no-referrer">${im.caption ? `<figcaption class="cap">${esc(im.caption)}</figcaption>` : ''}${im.credit ? `<figcaption class="credit">Imagen: ${esc(im.credit.artist)} · <a href="${esc(im.credit.page)}" rel="noopener">${esc(im.credit.license)} · Wikimedia Commons</a></figcaption>` : ''}</figure>` : '';
const conceptsBox = i => (i.concepts || []).length ? `<aside class="box concepts"><h3>Conceptos relacionados</h3><dl>${i.concepts.map(c => { const x = c.id && C.items.find(y => y.id === c.id && y.status === 'publicado'); return `<div><dt>${x ? `<a href="/${x.type === 'articulo' ? 'articulo' : 'dato'}/${x.id}/">${esc(c.t)}</a>` : esc(c.t)}</dt><dd>${esc(c.d || '')}</dd></div>`; }).join('')}</dl></aside>` : '';
const write = (rel, html) => { const f = path.join(ROOT, rel, 'index.html'); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html); };

/* Limpiar las carpetas generadas para no dejar páginas de contenido borrado */
for (const d of ['articulo', 'dato', 'pais', 'anatomia']) fs.rmSync(path.join(ROOT, d), { recursive: true, force: true });

const urls = [{ loc: `${SITE}/`, pri: '1.0' }];
const items = C.items.filter(i => i.status === 'publicado' && (!i.verif || i.verif.status === 'verificado'));
const recommend = buildReco(items, C.series || []);
const hrefOf = x => `/${x.type === 'articulo' ? 'articulo' : 'dato'}/${x.id}/`;
const recoBlock = i => { const r = recommend(i, 3); return r.length ? `<section class="reco"><h3>Sigue leyendo</h3><ul class="anat-list">${r.map(x => `<li><a href="${hrefOf(x)}">${esc(x.title)}</a> — ${esc((cats[x.cat] || {}).name || '')} · ${TYPE[x.type]}</li>`).join('')}</ul></section>` : ''; };
for (const i of items) {
  const kind = i.type === 'articulo' ? 'articulo' : 'dato';
  const url = `${SITE}/${kind}/${i.id}/`, appUrl = `/#/${kind}/${i.id}`;
  const cat = cats[i.cat] || {};
  const desc = clip(i.desc, 200);
  const head = `<header class="art-head"><span class="chip" style="color:${esc(cat.color || '#b3a6ff')}"><span class="dot"></span>${esc(cat.name || '')} · ${TYPE[i.type]}</span><h1 style="margin-top:12px">${esc(i.title)}</h1><p class="sub">${esc(i.subtitle || i.desc)}</p><div class="meta"><span>Redacción Lumbrario</span><span>${fdate(i.date)}</span></div>${claimLine(i)}</header>`;
  const body = i.type === 'articulo'
    ? `${head}${figure(i, i.title)}<div class="prose"><p class="lead">${esc(i.intro)}</p>${(i.sections || []).map(s => `<h2>${esc(s.h)}</h2>${(s.p || []).map(t => `<p>${esc(t)}</p>`).join('')}${secFig(s.img)}${s.example ? `<aside class="ex"><b>Ejemplo</b><p>${esc(s.example)}</p></aside>` : ''}${refs(s.src)}`).join('')}${(i.timeline || []).length ? `<h2>${esc(i.timelineTitle || 'Línea de tiempo')}</h2><ol class="tl">${i.timeline.map(e => `<li><span class="tl-y">${esc(e.y)}</span><div><p>${esc(e.t)}</p>${refs(e.src)}</div></li>`).join('')}</ol>` : ''}${(i.facts || []).length ? `<aside class="box"><h3>Datos complementarios</h3><ul>${i.facts.map(f => `<li>${esc(f)}</li>`).join('')}</ul></aside>` : ''}${i.conclusion ? `<h2>Conclusión</h2><p class="conclusion">${esc(i.conclusion)}</p>` : ''}${conceptsBox(i)}</div>${sources(i.sources, i)}`
    : `${head}${figure(i, i.title)}<div class="prose"><p>${esc(i.body)}</p></div>${sources(i.sources, i)}`;
  const bodyFull = (i.cat === 'medicina' ? body.replace('<div class="sources">', medNote + '<div class="sources">') : body) + recoBlock(i);
  const jsonld = { '@context': 'https://schema.org', '@type': i.type === 'articulo' ? 'Article' : 'CreativeWork', headline: clip(i.title, 110), description: desc, datePublished: i.date, dateModified: C.updated || i.date, inLanguage: 'es', url, image: i.img || `${SITE}/og-default.png`, author: { '@type': 'Organization', name: 'Redacción Lumbrario' }, publisher: { '@type': 'Organization', name: 'Lumbrario', logo: { '@type': 'ImageObject', url: `${SITE}/icons/icon-512.png` } }, citation: (i.sources || []).map(s => s.u), isAccessibleForFree: true };
  write(`${kind}/${i.id}`, page({ url, appUrl, title: i.title, desc, image: i.img || `${SITE}/og-default.png`, type: 'article', jsonld, body: bodyFull }));
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
/* Atlas del cuerpo humano */
const anMap = Object.fromEntries([...AN.systems, ...AN.organs].map(x => [x.id, x]));
const ul = a => (a || []).length ? `<ul class="anat-list">${a.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : '';
{
  const url = `${SITE}/anatomia/`;
  const desc = `Atlas del cuerpo humano: ${AN.systems.length} sistemas y ${AN.organs.length} órganos explicados con fuentes. Dónde están, qué hacen y cuándo algo falla.`;
  const list = a => `<ul class="anat-list">${a.map(x => `<li><a href="/anatomia/${x.id}/">${esc(x.name)}</a> — ${esc(clip(x.desc || x.what, 110))}</li>`).join('')}</ul>`;
  const body = `<header class="art-head"><span class="chip" style="color:#ff9a8a"><span class="dot"></span>Atlas</span><h1 style="margin-top:12px">Atlas del cuerpo humano</h1><p class="sub">${esc(desc)}</p></header>${medNote}<div class="prose"><h2>Sistemas</h2>${list(AN.systems)}<h2>Órganos</h2>${list([...AN.organs].sort((a, b) => a.name.localeCompare(b.name, 'es')))}</div>`;
  write('anatomia', page({ url, appUrl: '/#/anatomia', title: 'Atlas del cuerpo humano', desc, image: (AN.systems.find(s => s.img) || {}).img || `${SITE}/og-default.png`, type: 'website', jsonld: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Atlas del cuerpo humano', description: desc, inLanguage: 'es', url }, body }));
  urls.push({ loc: url, pri: '0.8' });
}
for (const x of [...AN.systems, ...AN.organs]) {
  const isSys = !!x.functions, url = `${SITE}/anatomia/${x.id}/`, appUrl = `/#/anatomia/${x.id}`;
  const desc = clip(isSys ? `${x.desc} ${x.intro}` : `${x.what} ${x.where}`, 200);
  const rel = isSys ? (x.organs || []).map(o => anMap[o]).filter(Boolean) : (x.systems || []).map(s => anMap[s]).filter(Boolean);
  const body = `<header class="art-head"><span class="chip" style="color:#ff9a8a"><span class="dot"></span>Atlas del cuerpo · ${isSys ? 'Sistema' : 'Órgano'}</span><h1 style="margin-top:12px">${esc(x.name)}</h1><p class="sub">${esc(isSys ? x.desc : x.what)}</p></header>${figure(x, x.name)}
<div class="prose">${isSys ? `<p class="lead">${esc(x.intro)}</p><h2>Para qué sirve</h2>${ul(x.functions)}${(x.curious || []).length ? `<h2>Curiosidades</h2>${ul(x.curious)}` : ''}`
    : `<h2>Dónde está</h2><p>${esc(x.where)}</p>${(x.facts || []).length ? `<h2>En datos</h2><div class="kvs">${x.facts.map(([k, v]) => `<div class="kv"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>` : ''}${(x.curious || []).length ? `<h2>Curiosidades</h2>${ul(x.curious)}` : ''}${(x.conditions || []).length ? `<h2>Cuando algo falla</h2><p>Algunas afecciones conocidas relacionadas con este órgano:</p>${ul(x.conditions)}` : ''}`}
${rel.length ? `<h2>${isSys ? 'Órganos de este sistema' : 'Forma parte de'}</h2><ul class="anat-list">${rel.map(r => `<li><a href="/anatomia/${r.id}/">${esc(r.name)}</a></li>`).join('')}</ul>` : ''}</div>${medNote}${sources(x.sources, x)}`;
  const jsonld = { '@context': 'https://schema.org', '@type': 'MedicalWebPage', name: x.name, description: desc, inLanguage: 'es', url, about: { '@type': 'AnatomicalStructure', name: x.name }, citation: (x.sources || []).map(s => s.u), isAccessibleForFree: true };
  write(`anatomia/${x.id}`, page({ url, appUrl, title: `${x.name}: qué es, dónde está y qué hace`, desc, image: x.img || `${SITE}/og-default.png`, type: 'article', jsonld, body }));
  urls.push({ loc: url, pri: '0.6' });
}
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `<url><loc>${u.loc}</loc>${u.mod ? `<lastmod>${u.mod}</lastmod>` : ''}<priority>${u.pri}</priority></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin.html\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`Páginas: ${items.length} contenidos + ${P.length} países + ${AN.systems.length + AN.organs.length + 1} del atlas · sitemap con ${urls.length} direcciones`);
