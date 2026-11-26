# ¿SABÍAS QUE? — v1

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
