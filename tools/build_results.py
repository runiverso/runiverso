"""Genera la sección /clasificaciones/ y el bloque «Últimas clasificaciones» de la portada.

Cada carrera terminada enlaza a su clasificación oficial (web de la organización o del
cronometrador). Runiverso no copia las listas: solo lleva a la fuente.
Para añadir una carrera terminada, añádela a RESULTS (la más reciente puede ir en cualquier
posición: se ordenan por fecha) y ejecuta:  python3 tools/build_results.py
"""
import datetime as dt
import html
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from nav import nav  # noqa: E402
from poster import poster_html  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent
REVISADO = "3 de noviembre de 2026"
FORM = "https://docs.google.com/forms/d/e/1FAIpQLScWKG5bZNgG__DRS9tZC9J4-f8Osn2-LeMuAn11e-EZyFxO2A/viewform"

# k: 21K, 42K, 10K, TR, SS o POP · src: dónde está la clasificación
RESULTS = [
    dict(id="medio-maraton-valencia-2026", n="Medio Maratón Valencia Trinidad Alfonso", c="Valencia", r="Comunidad Valenciana", d="2026-10-25", k="21K", dist="21,1 km",
         url="https://www.valenciaciudaddelrunning.com", src="Web oficial", extra="25.733 finalistas"),
    dict(id="medio-maraton-de-jerez-2026", n="Medio Maratón de Jerez", c="Jerez de la Frontera", r="Andalucía", d="2026-10-18", k="21K", dist="21,1 km",
         url="https://www.runnink.com/clasificaciones/", src="Runnink", extra="30.ª edición"),
    dict(id="movistar-madrid-medio-maraton-2026", n="Movistar Madrid Medio Maratón", c="Madrid", r="Comunidad de Madrid", d="2026-03-22", k="21K", dist="21,1 km",
         url="https://www.mediomaratonmadrid.es/", src="Web oficial", extra="Unos 28.000 inscritos"),
    dict(id="media-maraton-de-leon-2026", n="Media Maratón de León", c="León", r="Castilla y León", d="2026-03-22", k="21K", dist="21,1 km",
         url="https://www.lamedialeon.com", src="Web oficial", extra="Récord de participación"),
    dict(id="medio-maraton-de-malaga-2026", n="TotalEnergies Medio Maratón de Málaga", c="Málaga", r="Andalucía", d="2026-03-15", k="21K", dist="21,1 km",
         url="https://www.mediamaratonmalaga.com", src="Web oficial", extra="Cerca de 12.000 inscritos"),
    dict(id="zurich-marato-de-barcelona-2026", n="Zurich Marató de Barcelona", c="Barcelona", r="Cataluña", d="2026-03-15", k="42K", dist="42,2 km",
         url="https://zurichmaratobarcelona.es/es/", src="Web oficial", extra=""),
    dict(id="mitja-marato-barcelona-2026", n="Hyundai Mitja Marató Barcelona", c="Barcelona", r="Cataluña", d="2026-02-15", k="21K", dist="21,1 km",
         url="https://www.mitjamarato.barcelona/es/", src="Web oficial", extra="Unos 36.000 dorsales"),
    dict(id="maraton-valencia-2025", n="Maratón Valencia Trinidad Alfonso", c="Valencia", r="Comunidad Valenciana", d="2025-12-07", k="42K", dist="42,2 km",
         url="https://www.valenciaciudaddelrunning.com", src="Web oficial", extra="30.777 finalistas"),
]

MES_L = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
e = lambda x: html.escape(str(x), quote=True)


def card(r, root):
    d = dt.date.fromisoformat(r["d"])
    poster = poster_html(r["id"], r["n"], r["c"], r["k"], r["dist"], r["d"], ok=True, href=r["url"], root=root)
    poster = poster.replace(f'href="{e(r["url"])}"', f'href="{e(r["url"])}" target="_blank" rel="noopener"', 1)
    poster = poster.replace(f'aria-label="{e(r["n"])}"', f'aria-label="{e(r["n"])}: clasificación oficial"', 1)
    extra = f'<span>{e(r["extra"])}</span>' if r.get("extra") else ""
    return (f'<article class="pcard rcard" data-k="{r["k"]}">{poster}<div class="pinfo"><h3>{e(r["n"])}</h3>'
            f'<p class="pl">{e(r["c"])} ({e(r["r"])})</p><p class="pd">{d.day:02d}/{d.month:02d}/{d.year}{extra}</p>'
            f'<div class="pact"><a class="go solid" href="{e(r["url"])}" target="_blank" rel="noopener">Clasificación</a>'
            f'<span class="src">{e(r["src"])}</span></div></div></article>')


EXTRA_CSS = """<style>
.rcard .poster::after { content: "Terminada"; position: absolute; right: 10px; top: 40px; font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; padding: 3px 7px; border-radius: 6px; background: rgba(255, 255, 255, 0.9); color: #0E1630; }
.rcard .pd span { font-family: var(--font-body, inherit); }
.rcard .src { font-size: 12px; color: var(--muted); margin-left: 4px; }
</style>"""


def homepage_block(results):
    return "<div class=\"pgrid\">" + "".join(card(r, "") for r in results[:4]) + "</div>"


def page(results):
    head_tail = (ROOT / "tools" / "head_tail.html").read_text()
    bar = (ROOT / "tools" / "bar.html").read_text().replace("{{NAV}}", nav("../", "clas"))
    years = {}
    for r in results:
        years.setdefault(r["d"][:4], []).append(r)
    blocks = "".join(f'<section class="month"><h2>Temporada {y}<span class="mc">{len(v)} {"carrera" if len(v) == 1 else "carreras"}</span></h2>'
                     f'<div class="pgrid">{"".join(card(r, "../") for r in v)}</div></section>' for y, v in sorted(years.items(), reverse=True))
    return f"""<!doctype html>
<html lang="es">
<head>
<script>if(/^(runiverso|carrerasdeespana)\\.pages\\.dev$/.test(location.hostname))location.replace("https://runiverso.com"+location.pathname+location.search+location.hash);</script>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Clasificaciones de carreras de running en España · Runiverso</title>
<meta name="description" content="Clasificaciones oficiales de las últimas carreras de running en España: medias maratones, maratones y carreras de Cádiz, con enlace directo a los resultados de cada organización.">
<link rel="canonical" href="https://runiverso.com/clasificaciones/">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_ES">
<meta property="og:site_name" content="Runiverso">
<meta property="og:title" content="Clasificaciones · Runiverso">
<meta property="og:description" content="Los resultados oficiales de las últimas carreras, a un clic.">
<meta property="og:url" content="https://runiverso.com/clasificaciones/">
<meta property="og:image" content="https://runiverso.com/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#F4F6FA" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0A0E1A" media="(prefers-color-scheme: dark)">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&family=Fraunces:opsz,wght,SOFT,WONK@9..144,600..900,100,1&family=Nunito:wght@500..900&display=swap">
<link rel="stylesheet" href="../assets/races.css">
<style>
.wrap {{ max-width: 1040px !important; }}
.hero h1 {{ font-size: clamp(2.4rem, 8vw, 4.2rem) !important; letter-spacing: -0.05em !important; line-height: 1 !important; }}
.hero h1 em {{ font-style: normal; color: var(--accent); }}
.hero .lead {{ margin: 0; color: var(--muted); max-width: 58ch; font-size: clamp(16px, 2.2vw, 18px); }}
.list {{ display: flex; flex-direction: column; gap: 30px; }}
.month h2 {{ margin: 0 0 14px !important; font-size: 1.25rem !important; display: flex; gap: 10px; align-items: baseline; border-bottom: 1px solid var(--line); padding-bottom: 8px; }}
.month h2 .mc {{ font-family: var(--font-mono); font-size: 12px; font-weight: 400; color: var(--muted); }}
.note {{ background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 18px 20px; font-size: 15px; display: flex; flex-direction: column; gap: 8px; }}
.note p {{ margin: 0; max-width: 72ch; }}
.note a {{ color: var(--accent); font-weight: 600; }}
</style>
{EXTRA_CSS}
{head_tail}
</head>
<body>
<div class="wrap">
  {bar}
  <nav class="crumbs" aria-label="Ruta"><a href="../">Runiverso</a><span aria-hidden="true">/</span><span>Clasificaciones</span></nav>
  <header class="hero">
    <span class="kicker">Resultados oficiales</span>
    <h1>Clasificaciones</h1>
    <p class="lead">Las últimas carreras terminadas, con enlace directo a su clasificación oficial: la publica cada organización o empresa de cronometraje.</p>
  </header>
  <main class="list">{blocks}</main>
  <section class="note" aria-label="Para organizadores">
    <p><b>¿Organizas una carrera?</b> Envíanos el cartel oficial y el enlace a tu clasificación y aparecerá aquí y en el calendario. <a href="{FORM}" target="_blank" rel="noopener">Escríbenos</a>.</p>
    <p>¿Falta una carrera que ya se ha corrido? <a href="{FORM}" target="_blank" rel="noopener">Avísanos</a> y la añadimos.</p>
  </section>
  <footer>
    <p>Runiverso no publica clasificaciones propias: cada enlace lleva a la web de la organización o del cronometrador, que son la fuente oficial.</p>
    <p>Proyecto independiente, sin relación con las organizaciones de las carreras. Última revisión: {REVISADO}.</p>
  </footer>
</div>
<!-- Cloudflare Pages Analytics --><script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{{"token": "40ca04a8b7a9431abd85aeb6243e2c21"}}'></script><!-- Cloudflare Pages Analytics --></body>
</html>
"""


def main():
    today = dt.date.today().isoformat()
    results = sorted([r for r in RESULTS if r["d"] <= today], key=lambda r: r["d"], reverse=True)
    out = ROOT / "clasificaciones"
    out.mkdir(exist_ok=True)
    (out / "index.html").write_text(page(results))
    idx = ROOT / "index.html"
    s = idx.read_text()
    block = EXTRA_CSS + homepage_block(results)
    s = re.sub(r"<!--RES-START-->.*?<!--RES-END-->", lambda m: "<!--RES-START-->" + block + "<!--RES-END-->", s, flags=re.S)
    idx.write_text(s)
    sm = ROOT / "sitemap.xml"
    t = sm.read_text()
    if "/clasificaciones/" not in t:
        t = t.replace("<url><loc>https://runiverso.com/cadiz/</loc>",
                      f"<url><loc>https://runiverso.com/clasificaciones/</loc><lastmod>{today}</lastmod></url>\n  <url><loc>https://runiverso.com/cadiz/</loc>", 1)
        sm.write_text(t)
    print(f"{len(results)} clasificaciones")


if __name__ == "__main__":
    main()
