"""Páginas para buscadores: una ficha por carrera, páginas por zona y por tipo de prueba.

Lee app/data.js (lo genera build_app_data.py a partir de la portada) y escribe:
- carreras/<id>/index.html + <id>.ics   (todas las carreras; mantiene las URL que ya existían)
- carreras-en/<zona>/index.html          (comunidades y provincias con al menos 3 carreras)
- maratones/, medias-maratones/, trail/, carreras-10k/, carreras-populares/
- tools/seo_pages.json                   (lista de páginas, para la portada y el sitemap)

Uso: python3 tools/build_seo.py   (idempotente)
"""
import datetime as dt
import html
import json
import pathlib
import re
import sys
import unicodedata
import urllib.parse
from zoneinfo import ZoneInfo

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from nav import nav  # noqa: E402
from poster import poster_html, LABEL, CARTELES  # noqa: E402
import fix_events  # noqa: E402

SITE = "https://runiverso.com"
TODAY = dt.date.today()
REVISADO = None  # se rellena en main()
FORM = "https://docs.google.com/forms/d/e/1FAIpQLScWKG5bZNgG__DRS9tZC9J4-f8Osn2-LeMuAn11e-EZyFxO2A/viewform"
CANAL = "https://whatsapp.com/channel/0029VbDrJk2InlqSVj746L0L"
MES_L = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
MES_C = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
DIAS_L = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
DIAS_C = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"]
CANARIAS = {"Las Palmas", "Santa Cruz de Tenerife"}
UNIPROV = {"Asturias", "Cantabria", "La Rioja", "Navarra", "Illes Balears", "Región de Murcia", "Comunidad de Madrid"}
MIN_ZONE = 3

# Tipo de prueba -> (carpeta, nombre en plural, frase para el título)
TYPES = {
    "42K": ("maratones", "Maratones", "Maratones en España"),
    "21K": ("medias-maratones", "Medias maratones", "Medias maratones en España"),
    "10K": ("carreras-10k", "Carreras de 10 km", "Carreras de 10 km en España"),
    "TR": ("trail", "Trail y montaña", "Carreras de trail y montaña en España"),
    "POP": ("carreras-populares", "Carreras populares", "Carreras populares en España"),
    "SS": ("san-silvestre-2026", "San Silvestres", "San Silvestres 2026"),  # página especial ya existente
}
KIND_TXT = {"42K": "maratón", "21K": "media maratón", "10K": "carrera de 10 km", "TR": "carrera de trail", "SS": "San Silvestre", "POP": "carrera popular"}

e = lambda x: html.escape(str(x), quote=True)


def slug(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def load():
    s = (ROOT / "app" / "data.js").read_text()
    return json.loads(re.search(r"RV_RACES = (\[.*?\]);", s, re.S).group(1))


def ddate(r):
    return dt.date.fromisoformat(r["d"])


def fecha_larga(r):
    d = ddate(r)
    return f"{DIAS_L[d.weekday()]} {d.day} de {MES_L[d.month - 1]} de {d.year}"


def km_of(r):
    if r["k"] == "42K":
        return 42.195
    if r["k"] == "21K":
        return 21.0975
    if r["k"] == "TR":
        return None
    m = re.match(r"^(\d+(?:,\d+)?) km$", r["dist"])
    return float(m.group(1).replace(",", ".")) if m else None


def hms(sec):
    sec = int(round(sec))
    h, rem = divmod(sec, 3600)
    m, s = divmod(rem, 60)
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m}:{s:02d}"


def secs(t):
    p = [int(x) for x in t.split(":")]
    return p[0] * 3600 + p[1] * 60 + p[2] if len(p) == 3 else p[0] * 60 + p[1]


def is_past(r):
    return ddate(r) < TODAY


# ---------------------------------------------------------------- piezas comunes
HEAD_TAIL = (ROOT / "tools" / "head_tail.html").read_text()
BAR = (ROOT / "tools" / "bar.html").read_text()
REDIRECT = '<script>if(/^(runiverso|carrerasdeespana)\\.pages\\.dev$/.test(location.hostname))location.replace("https://runiverso.com"+location.pathname+location.search+location.hash);</script>'
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&display=swap">')
WA_SVG = ('<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.5-.3z"/></svg>')


def canal(title, text):
    return (f'<a class="rv-canal" href="{CANAL}" target="_blank" rel="noopener"><span class="ci">{WA_SVG}</span>'
            f'<span class="ct"><b>{e(title)}</b><span>{e(text)}</span></span><span class="cb">Unirme al canal</span></a>')


def footer():
    return (f'<footer>\n    <p>Proyecto independiente, sin relación con las organizaciones de las carreras. Comprueba siempre fecha, precio y plazos en la web oficial antes de inscribirte.</p>\n'
            f'    <p>Última revisión: {REVISADO}. <a href="{FORM}" target="_blank" rel="noopener">Avisar de un error</a></p>\n  </footer>')


def head(rel, title, desc, url, img, img_alt, ld):
    return f"""<!doctype html>
<html lang="es">
<head>
{REDIRECT}
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_ES">
<meta property="og:site_name" content="Runiverso">
<meta property="og:title" content="{e(title.split(' · ')[0])}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{e(img)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{e(img_alt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#F4F6FA" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0A0E1A" media="(prefers-color-scheme: dark)">
<link rel="icon" href="{rel}favicon.svg" type="image/svg+xml">
{FONTS}
<link rel="stylesheet" href="{rel}assets/races.css">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
{HEAD_TAIL.strip().replace('href="../assets/', f'href="{rel}assets/')}
</head>
<body>
<div class="wrap">
  {BAR.strip().replace("{{NAV}}", nav(rel, ""))}
"""


TAIL = """</div>
<!-- Cloudflare Pages Analytics --><script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "40ca04a8b7a9431abd85aeb6243e2c21"}'></script><!-- Cloudflare Pages Analytics --></body>
</html>
"""


def crumbs(rel, items):
    """items: [(nombre, ruta relativa a la raíz o None)]"""
    h = f'<nav class="crumbs" aria-label="Ruta"><a href="{rel}">Runiverso</a>'
    for name, path in items:
        h += '<span aria-hidden="true">/</span>'
        h += f'<a href="{rel}{path}">{e(name)}</a>' if path else f"<span>{e(name)}</span>"
    return h + "</nav>"


def crumbs_ld(items):
    out = [{"@type": "ListItem", "position": 1, "name": "Runiverso", "item": SITE + "/"}]
    for i, (name, path) in enumerate(items, 2):
        it = {"@type": "ListItem", "position": i, "name": name}
        if path is not None:
            it["item"] = f"{SITE}/{path}"
        out.append(it)
    return {"@type": "BreadcrumbList", "itemListElement": out}


# ---------------------------------------------------------------- fotos (las mismas que ya usaban las fichas)
def load_photos():
    src = {"42K": "generali-maraton-malaga", "21K": "generali-maraton-malaga-21-km", "10K": "10k-valencia-ibercaja", "TR": "transvulcania"}
    out = {}
    for k, rid in src.items():
        s = (ROOT / "carreras" / rid / "index.html").read_text()
        fig = re.search(r'<figure class="photo">.*?</figure>', s, re.S).group(0)
        og = re.search(r'<meta property="og:image" content="([^"]+)"', s).group(1).replace("&amp;", "&")
        alt = re.search(r'<meta property="og:image:alt" content="([^"]+)"', s).group(1)
        out[k] = (fig, og, html.unescape(alt))
    out["SS"] = out["POP"] = out["10K"]
    return out


# ---------------------------------------------------------------- zonas
def zones(races):
    """Devuelve {clave: info} con las páginas de zona que se generan."""
    Z = {}
    by_r, by_p = {}, {}
    for r in races:
        by_r.setdefault(r["r"], []).append(r)
        by_p.setdefault((r["r"], r["p"]), []).append(r)
    for com, items in by_r.items():
        if len(items) >= MIN_ZONE:
            Z[("r", com)] = {"name": com, "path": f"carreras-en/{slug(com)}/", "races": items, "kind": "r"}
    for (com, prov), items in by_p.items():
        if com in UNIPROV:
            continue
        if prov == "Cádiz":
            Z[("p", prov)] = {"name": prov, "path": "cadiz/", "races": items, "kind": "p", "com": com, "external": True}
        elif len(items) >= MIN_ZONE:
            Z[("p", prov)] = {"name": prov, "path": f"carreras-en/{slug(prov)}/", "races": items, "kind": "p", "com": com}
    return Z


def zone_path(Z, kind, name):
    z = Z.get((kind, name))
    return z["path"] if z else None


# ---------------------------------------------------------------- tarjetas
def card(r, rel):
    href = f"{rel}carreras/{r['id']}/"
    d = ddate(r)
    poster = poster_html(r["id"], r["n"], r["c"], r["k"], r["dist"], r["d"], None, r["ok"], href=href, root=rel)
    st = ('<span class="st">Celebrada</span>' if is_past(r) else
          '<span class="st ok">Confirmada</span>' if r["ok"] else '<span class="st prov">Por confirmar</span>')
    dd = f"{d.day:02d}/{d.month:02d}/{d.year}" + (f" · {r['h']}" if r.get("h") else "")
    return (f'<article class="pcard" data-end="{r["d"]}">{poster}<div class="pinfo"><h3><a href="{href}">{e(r["n"])}</a></h3>'
            f'<p class="pl">{e(r["c"])} · {e(r["p"])}</p><p class="pd">{dd}{st}</p></div></article>')


def months_html(items, rel, hlevel="h2"):
    out, cur = "", None
    groups = []
    for r in items:
        key = r["d"][:7]
        if not groups or groups[-1][0] != key:
            groups.append((key, []))
        groups[-1][1].append(r)
    for key, rs in groups:
        y, m = map(int, key.split("-"))
        out += (f'<section class="zmonth"><{hlevel}>{MES_L[m - 1].capitalize()} {y}<span class="mc">{len(rs)} '
                f'{"carrera" if len(rs) == 1 else "carreras"}</span></{hlevel}><div class="pgrid">{"".join(card(r, rel) for r in rs)}</div></section>\n')
    return out


# ---------------------------------------------------------------- ficha de carrera
def ics(r):
    d = ddate(r)
    end = d + dt.timedelta(days=1)
    desc = f"{r['dist']} · {r['c']}"
    if r.get("w"):
        desc += f"\\n{r['w']}"
    desc += f"\\n{SITE}/carreras/{r['id']}/"
    esc = lambda s: s.replace(",", "\\,").replace(";", "\\;")
    lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Runiverso//ES", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
             f"UID:{r['id']}-{r['d']}@runiverso.com", f"DTSTAMP:{TODAY.strftime('%Y%m%d')}T120000Z"]
    if r.get("h"):
        hh, mm = r["h"].split(":")
        tz = "Atlantic/Canary" if r["p"] in CANARIAS else "Europe/Madrid"
        lines += [f"DTSTART;TZID={tz}:{d.strftime('%Y%m%d')}T{hh}{mm}00", f"DTEND;TZID={tz}:{d.strftime('%Y%m%d')}T{int(hh) + 3:02d}{mm}00"]
    else:
        lines += [f"DTSTART;VALUE=DATE:{d.strftime('%Y%m%d')}", f"DTEND;VALUE=DATE:{end.strftime('%Y%m%d')}"]
    lines += [f"SUMMARY:{esc(r['n'])}", f"LOCATION:{esc(r['c'] + ', ' + r['r'])}", f"DESCRIPTION:{esc(desc)}", "END:VEVENT", "END:VCALENDAR"]
    out = []
    for ln in lines:  # plegado a 75 octetos aprox.
        while len(ln.encode()) > 74:
            cut = 60
            out.append(ln[:cut])
            ln = " " + ln[cut:]
        out.append(ln)
    return "\r\n".join(out) + "\r\n"


def start_iso(r):
    if not r.get("h"):
        return r["d"]
    tz = ZoneInfo("Atlantic/Canary" if r["p"] in CANARIAS else "Europe/Madrid")
    hh, mm = map(int, r["h"].split(":"))
    return dt.datetime.combine(ddate(r), dt.time(hh, mm), tz).isoformat()


def marks_html(r, km):
    m = r.get("m")
    if not m:
        return ""
    rows = ""
    for lab, key in (("Hombres", "h"), ("Mujeres", "f")):
        v = m.get(key)
        if not v:
            continue
        name, nat, t = (v + ["", "", ""])[:3]
        pc = ""
        if km and t:
            p = secs(t) / km
            pc = f'<span class="pc">{int(p // 60)}:{int(round(p % 60)):02d} min/km</span>'
        who = e(name) + (f" ({e(nat)})" if nat else "")
        rows += f'<div class="mrow"><span class="l">{lab}</span><span>{who}</span><span class="tm">{e(t)}</span>{pc}</div>'
    note = f'<p class="muted" style="margin-top:12px">{e(m["p"])}</p>' if m.get("p") else ""
    ed = e(m.get("ed", "anterior"))
    return f'<section class="box" aria-labelledby="mk"><h2 id="mk">Última edición · {ed}</h2>{rows}{note}</section>'


def pace_html(r, km):
    if not km or km < 2:
        return ""
    paces = [(3, 30), (4, 0), (4, 30), (5, 0), (5, 30), (6, 0), (6, 30), (7, 0)]
    rows = "".join(f'<tr><td>{a}:{b:02d} min/km</td><td>{hms((a * 60 + b) * km)}</td></tr>' for a, b in paces)
    dist = r["dist"] if r["k"] not in ("42K", "21K") else ("42,195 km" if r["k"] == "42K" else "21,097 km")
    return (f'<section class="box" aria-labelledby="pz"><h2 id="pz">¿Cuánto tardarás?</h2>'
            f'<p class="muted">Tiempo final en {e(dist)} según tu ritmo medio. Para una predicción con tus marcas, usa la '
            f'<a href="../../#calc">calculadora de ritmo</a> o la <a href="../../app/">app</a>.</p>'
            f'<table class="ptab"><thead><tr><th scope="col">Ritmo</th><th scope="col">Tiempo final</th></tr></thead><tbody>{rows}</tbody></table></section>')


def faq_html(r, zone_name):
    d = fecha_larga(r)
    y = ddate(r).year
    hora = f", con salida a las {r['h']}" if r.get("h") else ""
    if is_past(r):
        q1 = f"Se corrió el {d}{hora}. En cuanto se anuncie la próxima edición, actualizamos la fecha."
    elif r["ok"]:
        q1 = f"Se corre el {d}{hora}. La fecha está confirmada según las fuentes consultadas."
    else:
        q1 = (f"Está prevista para el {d}{hora}, pero la fecha aún está por confirmar: sale de calendarios de carreras o de ediciones "
              "anteriores. Compruébala en la web oficial antes de organizarte.")
    dist = r["dist"] + (f" (también {', '.join(r['x'])})" if r.get("x") else "")
    if r.get("w"):
        host = urllib.parse.urlparse(r["w"]).netloc.replace("www.", "")
        q4 = f'Desde la web oficial de la organización, <a href="{e(r["w"])}" target="_blank" rel="noopener">{e(host)}</a>. Allí están los precios por tramos y los plazos.'
    else:
        q4 = "Todavía no hemos verificado la web oficial. Busca la inscripción con el botón de arriba y confirma siempre que sea la página de la organización."
    qs = [(f"¿Cuándo es la {r['n']} {y}?", e(q1)),
          (f"¿Dónde se corre?", e(f"En {r['c']} (provincia de {r['p']}, {r['r']}).")),
          ("¿Qué distancia tiene?", e(dist[0].upper() + dist[1:] + ".")),
          ("¿Cómo me inscribo?", q4)]
    items = "".join(f"<details><summary>{e(q)}</summary><p>{a}</p></details>" for q, a in qs)
    return f'<section class="box faq" aria-labelledby="fq"><h2 id="fq">Preguntas frecuentes</h2>{items}</section>'


def related(r, races, n=6):
    up = [x for x in races if x["id"] != r["id"] and not is_past(x)]
    pick, seen = [], set()
    for f in (lambda x: x["p"] == r["p"], lambda x: x["r"] == r["r"], lambda x: x["k"] == r["k"]):
        for x in up:
            if len(pick) >= n:
                break
            if x["id"] not in seen and f(x):
                pick.append(x)
                seen.add(x["id"])
    return sorted(pick, key=lambda x: x["d"])


def ficha(r, races, Z, photos):
    rel = "../../"
    rid = r["id"]
    url = f"{SITE}/carreras/{rid}/"
    d = ddate(r)
    y = d.year
    km = km_of(r)
    lab = LABEL.get(r["k"], "Carrera")
    fig, og, alt = photos[r["k"]]
    if rid in CARTELES:
        src = r.get("w") or ""
        cred = f'<a href="{e(src)}" target="_blank" rel="noopener">{e(r["n"])}</a>' if src else e(r["n"])
        fig = (f'<figure class="cartel"><img src="{rel}carteles/{e(CARTELES[rid])}" alt="Cartel oficial de la {e(r["n"])} {y}" '
               f'width="900" height="1108" loading="eager"><figcaption>Cartel oficial · cedido por la organización ({cred})</figcaption></figure>')
    estado = "ya celebrada" if is_past(r) else ("fecha confirmada" if r["ok"] else "fecha por confirmar")
    title = f"{r['n']} {y}: fecha, distancia e inscripción · Runiverso"
    desc = (f"{r['n']} {y} en {r['c']} ({r['p']}): {fecha_larga(r)}, {r['dist']}. "
            f"{estado.capitalize()}, web oficial, tabla de ritmos y carreras cercanas.")
    pr = zone_path(Z, "p", r["p"])
    cr = zone_path(Z, "r", r["r"])
    trail = [(r["r"], cr)]
    if r["r"] not in UNIPROV and r["p"] != r["r"]:
        trail.append((r["p"], pr))
    trail.append((r["n"], None))

    ev = {"@type": "SportsEvent", "name": r["n"], "startDate": start_iso(r),
          "description": desc, "eventStatus": "https://schema.org/EventScheduled",
          "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
          "location": {"@type": "Place", "name": r["c"], "address": {"@type": "PostalAddress", "addressLocality": r["c"].split(" (")[0],
                                                                    "addressRegion": r["p"], "addressCountry": "ES"}},
          "url": url, "sport": "Running"}
    if r.get("w"):
        ev["sameAs"] = r["w"]
    ld = {"@context": "https://schema.org", "@graph": [crumbs_ld([(n, p) for n, p in trail[:-1]] + [(r["n"], f"carreras/{rid}/")]), ev]}

    if is_past(r):
        st = '<span class="st">Ya celebrada</span>'
    elif r["ok"]:
        st = '<span class="st ok">Fecha confirmada</span>'
    else:
        st = '<span class="st prov">Por confirmar</span>'
    facts = [f'<div><dt>Fecha</dt><dd>{fecha_larga(r)} {st}</dd></div>']
    if r.get("h"):
        facts.append(f'<div><dt>Salida</dt><dd>{e(r["h"])} h</dd></div>')
    facts.append(f'<div><dt>Distancia</dt><dd>{e(r["dist"])}</dd></div>')
    facts.append(f'<div><dt>Lugar</dt><dd>{e(r["c"])}, {e(r["p"])} ({e(r["r"])})</dd></div>')
    if r.get("x"):
        facts.append(f'<div><dt>También en el evento</dt><dd>{e(", ".join(r["x"]))}</dd></div>')

    if r["ok"]:
        nota = "La fecha está confirmada según las fuentes consultadas."
    else:
        nota = "La fecha está por confirmar: compruébala en la web oficial antes de inscribirte."
    nota += " La web oficial está verificada." if r.get("w") else " Aún no hemos verificado la web oficial."

    share = urllib.parse.quote(f"{r['n']} · {fecha_larga(r)} · {r['c']}\n{url}")
    acts = []
    if r.get("w"):
        acts.append(f'<a class="btn" href="{e(r["w"])}" target="_blank" rel="noopener">Web oficial</a>')
    else:
        q = urllib.parse.quote(f"{r['n']} {y} inscripción")
        acts.append(f'<a class="btn" href="https://www.google.com/search?q={q}" target="_blank" rel="noopener">Buscar inscripción</a>')
    acts.append(f'<a class="btn alt" href="{rid}.ics" download>Añadir al calendario</a>')
    acts.append(f'<a class="btn alt" href="https://wa.me/?text={share}" target="_blank" rel="noopener">Compartir por WhatsApp</a>')
    acts.append(f'<a class="btn alt" href="{rel}app/#carreras">Guárdala en la app</a>')

    rel_items = related(r, races)
    more = []
    zp = pr or cr
    if zp:
        zn = r["p"] if pr else r["r"]
        more.append(f'<a href="{rel}{zp}">Carreras en {e(zn)}</a>')
    tp = TYPES.get(r["k"])
    if tp:
        more.append(f'<a href="{rel}{tp[0]}/">{e(tp[1])}</a>')
    more.append(f'<a href="{rel}#calendario">Calendario completo</a>')

    body = f"""  {crumbs(rel, trail)}
  <header class="hero">
    <span class="kicker">{e(lab)} · {e(r["c"])} · {e(r["r"])}</span>
    <h1>{e(r["n"])} {y}</h1>
    <div class="lanes" aria-hidden="true"></div>
  </header>
  {fig}
  <section class="facts" aria-label="Datos principales">
    <div class="bib" aria-hidden="true"><span class="dow">{DIAS_C[d.weekday()]}</span><span class="day">{d.day}</span><span class="mon">{MES_C[d.month - 1]} {y}</span></div>
    <dl>
      {"".join(facts)}
    </dl>
  </section>
  <div class="acts">{"".join(acts)}</div>
  <section class="box" aria-labelledby="info"><h2 id="info">Lo que sabemos</h2><p>{e(r["t"])}</p><p class="muted">{e(nota)}</p></section>
  {marks_html(r, km)}
  {pace_html(r, km)}
  {faq_html(r, r["p"])}
  <section class="related" aria-labelledby="rl"><h2 id="rl">Carreras cerca de {e(r["c"].split(" (")[0])}</h2><div class="pgrid">{"".join(card(x, rel) for x in rel_items)}</div><p class="chips">{"".join(more)}</p></section>
  {canal("Avisos de esta carrera en WhatsApp", "Recogida de dorsales, horarios, subidas de precio y cambios de última hora. Gratis.")}
  {footer()}
"""
    out = ROOT / "carreras" / rid
    out.mkdir(parents=True, exist_ok=True)
    (out / "index.html").write_text(head(rel, title, desc, url, og, alt, ld) + body + TAIL)
    (out / f"{rid}.ics").write_bytes(ics(r).encode())
    fix_events.fix_file(out / "index.html")


# ---------------------------------------------------------------- listados (zona y tipo)
def counts_txt(items):
    c = {}
    for r in items:
        c[r["k"]] = c.get(r["k"], 0) + 1
    names = {"42K": ("maratón", "maratones"), "21K": ("media", "medias"), "10K": ("10K", "10K"), "TR": ("trail", "trails"),
             "SS": ("San Silvestre", "San Silvestres"), "POP": ("popular", "populares")}
    parts = [f"{n} {names[k][0] if n == 1 else names[k][1]}" for k, n in sorted(c.items(), key=lambda kv: -kv[1])]
    return ", ".join(parts[:-1]) + (" y " + parts[-1] if len(parts) > 1 else parts[0] if parts else "")


def listing(path, rel, title, desc, h1, kicker, intro, items, trail, chips, canal_t, photos, img_k):
    url = f"{SITE}/{path}"
    up = [r for r in items if not is_past(r)]
    past = [r for r in items if is_past(r)][::-1]
    events = []
    for r in up[:40]:
        events.append({"@type": "SportsEvent", "name": r["n"], "startDate": start_iso(r), "url": f"{SITE}/carreras/{r['id']}/",
                       "eventStatus": "https://schema.org/EventScheduled", "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
                       "location": {"@type": "Place", "name": r["c"], "address": {"@type": "PostalAddress", "addressLocality": r["c"].split(" (")[0],
                                                                                 "addressRegion": r["p"], "addressCountry": "ES"}}})
    ld = {"@context": "https://schema.org", "@graph": [
        crumbs_ld(trail[:-1] + [(trail[-1][0], path)]),
        {"@type": "CollectionPage", "name": h1, "url": url, "description": desc, "inLanguage": "es-ES"},
        {"@type": "ItemList", "itemListElement": [{"@type": "ListItem", "position": i, "url": f"{SITE}/carreras/{r['id']}/", "name": r["n"]}
                                                  for i, r in enumerate(up, 1)]}] + events}
    _, og, alt = photos[img_k]
    nxt = up[0] if up else None
    stats = (f'<dl class="hstats"><div><dt>Próximas</dt><dd>{len(up)}</dd></div>'
             f'<div><dt>Confirmadas</dt><dd>{sum(1 for r in up if r["ok"])}</dd></div>'
             f'<div><dt>Localidades</dt><dd>{len({r["c"] for r in up})}</dd></div></dl>')
    nxt_html = ""
    if nxt:
        nxt_html = (f'<p class="znext">La próxima: <a href="{rel}carreras/{nxt["id"]}/"><b>{e(nxt["n"])}</b></a>, '
                    f'{fecha_larga(nxt)} en {e(nxt["c"])}.</p>')
    past_html = ""
    if past:
        past_html = (f'<details class="zpast"><summary>Ya celebradas ({len(past)})</summary>'
                     f'<div class="pgrid">{"".join(card(r, rel) for r in past)}</div></details>')
    body = f"""  {crumbs(rel, trail)}
  <header class="hero zhero">
    <span class="kicker">{e(kicker)}</span>
    <h1>{h1}</h1>
    <p class="zintro">{intro}</p>
    {stats}
    <div class="lanes" aria-hidden="true"></div>
  </header>
  {nxt_html}
{months_html(up, rel)}
  {past_html}
  <section class="box" aria-labelledby="mz"><h2 id="mz">Más carreras</h2><p class="chips">{chips}</p></section>
  {canal(canal_t, "Cada semana: qué se corre, cuándo abren y suben los dorsales y novedades. Gratis.")}
  {footer()}
"""
    out = ROOT / path
    out.mkdir(parents=True, exist_ok=True)
    (out / "index.html").write_text(head(rel, title, desc, url, og, alt, ld) + body + TAIL)


def year_span(items):
    ys = sorted({ddate(r).year for r in items if not is_past(r)}) or [TODAY.year]
    return f"{ys[0]}-{ys[-1]}" if ys[0] != ys[-1] else str(ys[0])


def main():
    global REVISADO
    REVISADO = f"{TODAY.day} de {MES_L[TODAY.month - 1]} de {TODAY.year}"
    races = sorted(load(), key=lambda r: (r["d"], r["n"]))
    photos = load_photos()
    Z = zones(races)
    for r in races:
        ficha(r, races, Z, photos)

    # chips comunes
    zlist = sorted([z for z in Z.values() if z["kind"] == "r"], key=lambda z: -len(z["races"]))
    plist = sorted([z for z in Z.values() if z["kind"] == "p"], key=lambda z: -len(z["races"]))

    def chips(rel, skip=None):
        h = "".join(f'<a href="{rel}{z["path"]}">{e(z["name"])}</a>' for z in zlist + plist if z["path"] != skip)
        h += "".join(f'<a href="{rel}{p}/">{e(n)}</a>' for k, (p, n, _) in TYPES.items() if f"{p}/" != skip)
        return h

    pages = []
    for z in zlist + plist:
        if z.get("external"):
            pages.append({"path": z["path"], "name": z["name"], "kind": z["kind"], "n": len([r for r in z["races"] if not is_past(r)])})
            continue
        items = z["races"]
        rel = "../../"
        up = [r for r in items if not is_past(r)]
        span = year_span(items)
        if z["kind"] == "r":
            where = z["name"]
            trail = [(z["name"], None)]
            kicker = "Comunidad · " + ", ".join(sorted({r["p"] for r in items})) if z["name"] not in UNIPROV else "Calendario de running"
        else:
            where = z["name"]
            trail = [(z["com"], zone_path(Z, "r", z["com"])), (z["name"], None)]
            kicker = f"Provincia de {z['name']} · {z['com']}"
        title = f"Carreras de running en {where} {span}: calendario · Runiverso"
        desc = (f"{len(up)} carreras de running en {where}: {counts_txt(up)}. Fechas, distancias, web oficial e inscripción, "
                f"actualizado {REVISADO}.")
        intro = (f"{len(up)} carreras próximas en {e(where)}: {e(counts_txt(up))}. Cada una con su ficha: fecha, distancia, "
                 f"web oficial, tabla de ritmos y botón para añadirla a tu calendario.")
        listing(z["path"], rel, title, desc, f"Carreras de running en <em>{e(where)}</em>", kicker, intro, items, trail,
                chips(rel, z["path"]), f"Las carreras de {where}, en tu WhatsApp", photos, items[0]["k"] if items[0]["k"] in photos else "21K")
        pages.append({"path": z["path"], "name": z["name"], "kind": z["kind"], "n": len(up)})

    for k, (folder, plural, phrase) in TYPES.items():
        if k == "SS":
            pages.append({"path": f"{folder}/", "name": plural, "kind": "t", "n": len([r for r in races if r["k"] == k and not is_past(r)])})
            continue
        items = [r for r in races if r["k"] == k]
        up = [r for r in items if not is_past(r)]
        rel = "../"
        span = year_span(items)
        regs = sorted({r["r"] for r in up})
        title = f"{phrase} {span}: calendario y fechas · Runiverso"
        desc = (f"{len(up)} {plural.lower()} en España con fecha, lugar y web oficial: {', '.join(regs[:4])}"
                f"{' y más' if len(regs) > 4 else ''}. Actualizado {REVISADO}.")
        intro = (f"{len(up)} {e(plural.lower())} próximas en {len(regs)} comunidades. Elige la tuya: cada ficha trae fecha, "
                 f"distancia, web oficial y una tabla con tu tiempo final según el ritmo.")
        h1 = e(phrase).replace(" en España", " en <em>España</em>")
        listing(f"{folder}/", rel, title, desc, h1, "Calendario por tipo de prueba", intro, items, [(plural, None)],
                chips(rel, f"{folder}/"), f"{plural}: avisos en tu WhatsApp", photos, k)
        pages.append({"path": f"{folder}/", "name": plural, "kind": "t", "n": len(up)})

    update_home(races, pages)
    update_sitemap(races, pages)
    (ROOT / "tools" / "seo_pages.json").write_text(json.dumps(pages, ensure_ascii=False, indent=1))
    print(f"{len(races)} fichas · {len(pages)} páginas de listado")
    for p in pages:
        print(f"  {p['kind']} {p['n']:3d} {p['path']}")


def update_home(races, pages):
    """Portada: lista de fichas (botón «Ficha completa») y bloque estático «Explora» con enlaces."""
    f = ROOT / "index.html"
    s = f.read_text()
    s = re.sub(r"var PAGES = \{[^;]*\};", "var PAGES = " + json.dumps({r["id"]: 1 for r in races}, sort_keys=True) + ";", s, count=1)
    groups = [("Por comunidad", [p for p in pages if p["kind"] == "r"]),
              ("Por provincia", [p for p in pages if p["kind"] == "p"]),
              ("Por tipo de prueba", [p for p in pages if p["kind"] == "t"])]
    block = ('<section class="explora" id="explora" aria-labelledby="exptitle"><div class="sechead"><h2 id="exptitle">Explora las carreras de running en España</h2></div>')
    for lab, items in groups:
        block += f'<h3>{lab}</h3><p class="chips">' + "".join(
            f'<a href="{p["path"]}">{e(p["name"])}<span class="n">{p["n"]}</span></a>' for p in items) + "</p>"
    block += "</section>"
    mark = re.compile(r"<!--EXP-START-->.*?<!--EXP-END-->", re.S)
    full = "<!--EXP-START-->" + block + "<!--EXP-END-->"
    if mark.search(s):
        s = mark.sub(lambda m: full, s, 1)
    else:
        s = s.replace('  <section class="results" id="clasificaciones"', "  " + full + "\n\n  <section class=\"results\" id=\"clasificaciones\"", 1)
    f.write_text(s)


def update_sitemap(races, pages):
    sm = ROOT / "sitemap.xml"
    old = dict(re.findall(r"<loc>([^<]+)</loc><lastmod>([^<]+)</lastmod>", sm.read_text()))
    today = TODAY.isoformat()
    urls = [f"{SITE}/", f"{SITE}/app/", f"{SITE}/clasificaciones/"]
    urls += [f"{SITE}/{p['path']}" for p in pages]
    urls += [f"{SITE}/carreras/{r['id']}/" for r in races]
    urls += [u for u in old if u not in urls]
    seen, out = set(), []
    for u in urls:
        if u in seen:
            continue
        seen.add(u)
        lm = today if (u.startswith(f"{SITE}/carreras") or u == f"{SITE}/" or any(u == f"{SITE}/{p['path']}" for p in pages)) else old.get(u, today)
        out.append(f"  <url><loc>{u}</loc><lastmod>{lm}</lastmod></url>")
    sm.write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "\n".join(out) + "\n</urlset>\n")
    print(f"sitemap: {len(out)} URL")


if __name__ == "__main__":
    main()
