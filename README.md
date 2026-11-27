# Lumbrario — v1

Plataforma gratuita de cultura general con fuentes verificables.
HTML + CSS + JavaScript puro. Sin dependencias ni compilación.

## Archivos
| Archivo | Qué es |
|---|---|
| `index.html` | La app (Inicio, Explorar, Artículo, Quiz, Guardados, Perfil) |
| `app.js` | Motor por capas: datos → servicios → vistas → router |
| `styles.css` | Sistema de diseño |
| `content.js` | Base de contenido: categorías, artículos, curiosidades, mitos, preguntas |
| `admin.html` | Panel para editar contenido y exportar un `content.js` nuevo |
| `countries.js` | 195 países: capital, moneda, idiomas, población, resumen, origen del nombre e historia (se carga solo al entrar en Países) |
| `flags/` | 195 banderas SVG (flag-icons, licencia MIT) |
| `schema.sql` | Base de datos para la fase con cuentas (Supabase/PostgreSQL) |

## Publicar (desde el iPhone)
1. Crea un repositorio en GitHub → **Add file → Upload files** → sube los 6 archivos.
2. En Vercel: **Add New → Project** → importa el repositorio → Deploy (sin configuración).

## Actualizar contenido
`tu-sitio/admin.html` → edita → **Publicar → Descargar content.js** → súbelo a GitHub reemplazando el anterior.

## Reglas editoriales
- Nada se publica sin al menos una fuente con URL (el panel lo bloquea).
- Solo fuentes que respalden literalmente la afirmación.
- Cifras discutidas se presentan como discutidas.

## Fuentes de Países
- **Wikidata**: nombres en español, capitales y población.
- **world-countries (mledoze)**: idiomas oficiales, monedas y regiones, contrastado con Wikidata.
- **Wikipedia en español**: resumen, origen del nombre e historia (extractos, CC BY-SA 4.0).
- Correcciones manuales: capitales múltiples o disputadas, monedas actualizadas (Bulgaria → euro, Sierra Leona → SLE, Cuba, Zimbabue) e idiomas (Uruguay, Israel).

## Química (chemistry.js)
Tabla periódica con los 118 elementos (qué es, usos, datos, descubrimiento y origen del nombre) y 13 temas de fundamentos.
Textos propios verificados contra PubChem (NIH: Jefferson Lab, Los Álamos, CIAAW-IUPAC) y OpenStax Chemistry 2e (CC BY 4.0).
Se carga bajo demanda en `#/quimica`. Páginas estáticas en `/quimica/<elemento>/` y `/quimica/tema/<tema>/` (`node tools/build-pages.js`).
