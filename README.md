# Runiverso

**Todas las carreras de running de España, en un solo sitio.**

Calendario de medias maratones, maratones, 10K y trail en España, con fechas, mapa, marcas de la última edición y calculadora de ritmo.

🌐 Web: [runiverso.com](https://runiverso.com)
🎵 TikTok: [@runiverso_](https://www.tiktok.com/@runiverso_)
💬 Canal de WhatsApp: «Runiverso»

---

## Cómo está hecha

Es una web estática, sin servidor ni base de datos, publicada con GitHub Pages.

| Archivo | Qué contiene |
|---|---|
| `index.html` | La estructura de la página |
| `styles.css` | Colores, tipografías y diseño |
| `app.js` | Calendario, filtros, mapa, marcas y calculadora |
| `data.js` | **Las carreras y las marcas** (aquí se añaden o corrigen) |
| `sources.js` | Fuentes consultadas |

## Añadir o corregir una carrera

Abre `data.js` y añade una línea dentro de `window.RACES` siguiendo este formato:

```js
{"n":"Nombre de la carrera","c":"Ciudad","r":"Comunidad","d":"2027-03-14","ok":true,"k":"21K","dist":"21,1 km","x":[],"t":"Nota breve","w":"https://web-oficial.com"}
```

- `d`: fecha en formato año-mes-día
- `ok`: `true` si la fecha está confirmada en la web oficial, `false` si es provisional
- `k`: tipo de prueba: `21K` (media), `42K` (maratón), `10K` o `TR` (trail)

Si la ciudad es nueva, añade también su posición en `window.MAP.cities` para que salga en el mapa.
