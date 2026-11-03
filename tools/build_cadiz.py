"""Genera la sección /cadiz/ de Runiverso a partir de la lista de carreras de abajo.

Uso: python3 tools/build_cadiz.py   (desde la raíz del repositorio)
Para añadir o corregir una carrera, edita RACES y vuelve a ejecutar el script.
"""
import datetime as dt
import html
import json
import pathlib
import re
import urllib.parse

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "cadiz"
REVISADO = "3 de noviembre de 2026"
FORM = "https://docs.google.com/forms/d/e/1FAIpQLScWKG5bZNgG__DRS9tZC9J4-f8Osn2-LeMuAn11e-EZyFxO2A/viewform"

# k: 21K (media), pop (popular, urbana o cross), trail, ss (San Silvestre)
# d: fecha exacta AAAA-MM-DD, o m: solo mes AAAA-MM si aún no hay día
# ok: True si la fecha está confirmada por la organización
RACES = [
    dict(id="media-maraton-ciudad-de-cadiz", n="Media Maratón Ciudad de Cádiz", c="Cádiz", d="2026-11-08", t="09:00", k="21K", dist="21,1 km", ok=True,
         note="3.ª edición, con récord de participación: unos 3.000 inscritos. Salida en La Caleta y meta en la Catedral, a dos vueltas por el casco urbano. Recogida de dorsales del jueves 5 al sábado 7 de noviembre, de 12:00 a 20:00, en El Corte Inglés de Cádiz; el domingo no se entregan. Tiempo máximo: 2 h 30 min.",
         web="https://mediamaratonciudaddecadiz.com", feat=True),
    dict(id="trail-sierra-de-facinas", n="Trail Sierra de Facinas", c="Facinas (Tarifa)", d="2026-11-07", k="trail", dist="Trail", ok=False,
         note="4.ª edición, por la sierra de Facinas."),
    dict(id="carrera-urbana-ciudad-de-algeciras", n="Carrera Urbana Ciudad de Algeciras", c="Algeciras", d="2026-11-08", k="pop", dist="Urbana", ok=False,
         note="26.ª edición."),
    dict(id="carrera-popular-playas-de-zahara", n="Carrera Popular Playas de Zahara", c="Zahara de los Atunes", d="2026-11-08", k="pop", dist="Popular", ok=False,
         note="12.ª edición."),
    dict(id="carrera-popular-villa-de-grazalema", n="Carrera Popular Villa de Grazalema", c="Grazalema", d="2026-11-08", k="pop", dist="Popular", ok=False,
         note="46.ª edición, en plena Sierra de Grazalema."),
    dict(id="trail-valle-del-guadiaro", n="Trail Valle del Guadiaro", c="San Roque", d="2026-11-08", k="trail", dist="Trail", ok=False,
         note="2.ª edición."),
    dict(id="carrera-popular-ciudad-de-jerez", n="Carrera Popular Ciudad de Jerez", c="Jerez de la Frontera", d="2026-11-15", k="pop", dist="8,5 km", ok=True,
         note="46.ª edición, con carreras de menores desde 150 m. La inscripción cierra el 11 de noviembre o al llegar a 2.000 inscritos, y no hay inscripción el mismo día. Vestuarios y duchas en el Estadio de Chapín."),
    dict(id="desafio-sierra-de-villaluenga", n="Desafío Sierra de Villaluenga", c="Villaluenga del Rosario", d="2026-11-15", k="trail", dist="Trail", ok=False,
         note="11.ª edición."),
    dict(id="cross-pinar-del-hierro", n="Cross Pinar del Hierro y la Espartosa", c="Chiclana de la Frontera", d="2026-11-15", k="pop", dist="Cross", ok=False,
         note="20.ª edición."),
    dict(id="cross-urbano-medina-sidonia", n="Cross Urbano Medina Sidonia", c="Medina Sidonia", d="2026-11-15", k="pop", dist="Cross", ok=False,
         note="2.ª edición."),
    dict(id="san-roque-corre-contra-la-violencia-de-genero", n="San Roque Corre contra la Violencia de Género", c="San Roque", d="2026-11-21", k="pop", dist="Popular", ok=False,
         note="Carrera solidaria, 7.ª edición."),
    dict(id="eco-maraton-de-montana-la-donaira", n="Eco Maratón de Montaña La Donaira", c="El Gastor", d="2026-11-21", k="trail", dist="Maratón de montaña", ok=False,
         note="7.ª edición."),
    dict(id="carrera-urbana-ciudad-de-chiclana", n="Carrera Urbana Ciudad de Chiclana", c="Chiclana de la Frontera", d="2026-11-22", k="pop", dist="Urbana", ok=False,
         note="44.ª edición."),
    dict(id="carrera-popular-puerto-menesteo", n="Carrera Popular Puerto Menesteo", c="El Puerto de Santa María", d="2026-11-22", k="pop", dist="Popular", ok=False,
         note="30.ª edición."),
    dict(id="cxm-toleta", n="CxM Toleta", c="Puerto Serrano", d="2026-11-22", k="trail", dist="Carrera por montaña", ok=False,
         note="6.ª edición."),
    dict(id="montesierra-trail-la-teja", n="Montesierra Trail La Teja", c="Jerez de la Frontera", d="2026-12-06", k="trail", dist="Trail", ok=False,
         note="Trail por la zona de Montesierra, en Jerez."),
    dict(id="san-silvestre-gaditana", n="San Silvestre Gaditana", c="Cádiz", d="2026-12-27", k="ss", dist="5,4 km", ok=False,
         note="La organiza el Club de Atletismo Olimpo. En 2025 se corrió el sábado 27 de diciembre, con unos 1.000 participantes.",
         also="../san-silvestre-2026/#san-silvestre-gaditana"),
    dict(id="san-silvestre-tarifena", n="San Silvestre Tarifeña", c="Tarifa", d="2026-12-27", k="ss", dist="San Silvestre", ok=False,
         note="5.ª edición."),
    dict(id="san-silvestre-chipionera", n="San Silvestre Chipionera", c="Chipiona", d="2026-12-29", k="ss", dist="San Silvestre", ok=False,
         note="33.ª edición."),
    dict(id="media-maraton-el-puerto", n="Media Maratón y 10K El Puerto", c="El Puerto de Santa María", d="2027-01-31", t="09:00", k="21K", dist="21,1 km y 10 km", ok=True,
         note="Salida y meta en el Centro Comercial El Paseo. Hasta 4.500 dorsales entre media y 10K; la inscripción cierra el 17 de enero de 2027 o al agotarse. La media cuesta de 20 a 30 € y el 10K de 15 a 25 €, según el tramo."),
    dict(id="trail-guerrera-valentina", n="Trail Guerrera Valentina", c="Jerez de la Frontera", d="2027-02-13", k="trail", dist="Trail", ok=False,
         note="Trail solidario en Jerez."),
    dict(id="100-millas-sierras-del-bandolero", n="100 Millas Sierras del Bandolero", c="Prado del Rey", d="2027-03-05", k="trail", dist="100 millas, maratón y Bandolerita", ok=True,
         note="Del 5 al 7 de marzo de 2027 por la Sierra de Grazalema, entre Cádiz y Málaga. 15.ª edición, con las 100 millas, la Maratón Bandolera y la Bandolerita.",
         web="https://www.clubtriton.es/cienmillassb/"),
    dict(id="media-maraton-costa-de-la-luz", n="Media Maratón Costa de la Luz", c="Chipiona → Rota", d="2027-03-14", t="09:30", k="21K", dist="21,1 km", ok=False,
         note="40.ª edición, de Chipiona a Rota: salida en la avenida de la Constitución y meta en el Castillo de Luna. En 2026 la inscripción subía de 18 a 28 € por tramos. Hora de 2026."),
    dict(id="media-maraton-bahia-de-cadiz", n="Media Maratón Bahía de Cádiz", c="San Fernando ↔ Cádiz", m="2027-03", k="21K", dist="21,1 km", ok=False,
         note="La media que une San Fernando y Cádiz desde hace más de 35 ediciones. Suele correrse en marzo; la fecha de 2027 aún no está publicada."),
    dict(id="media-maraton-ciudad-de-chiclana", n="Media Maratón Ciudad de Chiclana", c="Chiclana de la Frontera", d="2027-04-11", t="09:00", k="21K", dist="21,1 km", ok=True,
         note="4.ª edición. Salida y meta en el Centro Deportivo Urbano Costa Sancti Petri, en un circuito llano y homologado por la RFEA, con 3 horas de tiempo máximo. Inscripción desde 14 €."),
    dict(id="sherry-maraton", n="Sherry Maratón", c="Jerez de la Frontera", d="2027-04-18", k="trail", dist="Trail", ok=False,
         note="10.ª edición."),
    dict(id="medio-maraton-de-jerez", n="Medio Maratón de Jerez", c="Jerez de la Frontera", m="2027-10", k="21K", dist="21,1 km", ok=False,
         note="La edición de 2026 se corrió el 18 de octubre. La de 2027 suele ser a finales de octubre; la fecha aún no está publicada."),
]

TYPES = {"21K": "Media maratón", "pop": "Popular", "trail": "Trail", "ss": "San Silvestre"}
DIAS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"]
DIAS_L = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
MES_C = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
MES_L = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
SOURCES = [
    ("ClubRunning (Cádiz)", "https://www.clubrunning.es/calendario/?provincia=Cadiz"),
    ("Runnea (Cádiz)", "https://www.runnea.com/carreras-populares/calendario/cadiz/"),
    ("Media Maratón Ciudad de Cádiz", "https://mediamaratonciudaddecadiz.com/preguntas-frecuentes/"),
    ("Onda Cádiz", "https://ondacadiz.es/noticias/2026-10/la-media-maraton-ciudad-de-cadiz-llega-los-3000-inscritos-en-su-tercera-edicion"),
    ("Running.life (Jerez)", "https://running.life/es/carrera/carrera-popular-ciudad-de-jerez"),
    ("HAID (El Puerto)", "https://haid.app/en/events/media-maraton-and-10k-el-puerto-mq8s87v5"),
    ("HAID (Chiclana)", "https://haid.app/en/events/iv-media-maraton-ciudad-de-chiclana-mq8s9a82"),
    ("Reglamento Costa de la Luz 2026", "https://mediasmaratones.com/wp-content/uploads/Reglamento-Media-Maraton-Costa-de-la-Luz-2026.pdf"),
    ("Diario Bahía de Cádiz", "https://www.diariobahiadecadiz.com/deportes/todo-listo-para-la-xxxvi-media-maraton-bahia-de-cadiz-de-este-domingo-una-gran-fiesta-del-deporte-que-une-a-san-fernando-y-cadiz"),
    ("Finishers (Jerez)", "https://www.finishers.com/es/evento/medio-maraton-de-jerez"),
    ("GoTrail (Bandolero)", "https://gotrail.run/es/carrera/100-millas-sierras-del-bandolero"),
]

e = lambda x: html.escape(str(x), quote=True)


def sort_key(r):
    if "d" in r:
        return r["d"]
    return r["m"] + "-28"


def ics(r):
    d = dt.date.fromisoformat(r["d"])
    uid = f"{r['id']}-{d.year}@runiverso.com"
    if r.get("t"):
        hh, mm = r["t"].split(":")
        start = f"DTSTART;TZID=Europe/Madrid:{d:%Y%m%d}T{hh}{mm}00"
        end_h = int(hh) + 3
        end = f"DTEND;TZID=Europe/Madrid:{d:%Y%m%d}T{end_h:02d}{mm}00"
    else:
        start = f"DTSTART;VALUE=DATE:{d:%Y%m%d}"
        end = f"DTEND;VALUE=DATE:{(d + dt.timedelta(days=1)):%Y%m%d}"
    desc = (r["note"] + ("" if r["ok"] else " Fecha por confirmar.") + f" Más info: https://runiverso.com/cadiz/#{r['id']}").replace(",", "\\,").replace(";", "\\;")
    lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Runiverso//Cadiz//ES", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
             f"UID:{uid}", "DTSTAMP:20261103T120000Z", start, end,
             f"SUMMARY:{r['n']}".replace(",", "\\,"), f"LOCATION:{r['c']}\\, Cádiz", f"DESCRIPTION:{desc}",
             f"URL:https://runiverso.com/cadiz/#{r['id']}", "END:VEVENT", "END:VCALENDAR"]
    out = []
    for ln in lines:  # plegado de líneas largas (RFC 5545)
        b = ln.encode()
        while len(b) > 74:
            cut = 74
            while (b[cut] & 0xC0) == 0x80:
                cut -= 1
            out.append(b[:cut].decode())
            b = b" " + b[cut:]
        out.append(b.decode())
    return "\r\n".join(out) + "\r\n"


def bib(r):
    if "d" in r:
        d = dt.date.fromisoformat(r["d"])
        return (f'<div class="bib{"" if r["ok"] else " prov"}" aria-hidden="true"><span class="dow">{DIAS[d.weekday()]}</span>'
                f'<span class="day">{d.day}</span><span class="mon">{MES_C[d.month-1]}</span></div>')
    y, m = map(int, r["m"].split("-"))
    return (f'<div class="bib prov" aria-hidden="true"><span class="dow">fecha</span>'
            f'<span class="day mo">{MES_C[m-1]}</span><span class="mon">{y}</span></div>')


def when(r):
    if "d" in r:
        d = dt.date.fromisoformat(r["d"])
        s = f"{DIAS_L[d.weekday()]} {d.day} de {MES_L[d.month-1]} de {d.year}"
        return s + (f", {r['t']}" if r.get("t") else "")
    y, m = map(int, r["m"].split("-"))
    return f"{MES_L[m-1]} de {y}, día por anunciar"


def card(r):
    share = urllib.parse.quote(f"{r['n']} · {when(r)} · {r['c']}\nhttps://runiverso.com/cadiz/#{r['id']}")
    st = '<span class="st ok">Fecha confirmada</span>' if r["ok"] else '<span class="st prov">Por confirmar</span>'
    acts = []
    if r.get("web"):
        acts.append(f'<a class="btn" href="{e(r["web"])}" target="_blank" rel="noopener">Web oficial</a>')
    else:
        q = urllib.parse.quote(f"{r['n']} {r.get('d', r.get('m'))[:4]} inscripción")
        acts.append(f'<a class="btn alt" href="https://www.google.com/search?q={q}" target="_blank" rel="noopener">Inscripción</a>')
    if "d" in r:
        acts.append(f'<a class="btn alt" href="{r["id"]}.ics" download>+ Calendario</a>')
    if r.get("also"):
        acts.append(f'<a class="btn alt" href="{e(r["also"])}">Ver en el especial</a>')
    acts.append(f'<a class="btn alt" href="https://wa.me/?text={share}" target="_blank" rel="noopener">Compartir</a>')
    end = r.get("d", r.get("m", "") + "-28")
    dist_pill = "" if r["dist"] in ("Trail", "Popular", "San Silvestre") else f'<span class="pill">{e(r["dist"])}</span>'
    return (f'<article class="cz" id="{r["id"]}" data-k="{r["k"]}" data-end="{end}">{bib(r)}'
            f'<div class="czb"><h3>{e(r["n"])}</h3><p class="place">{e(r["c"])} · {e(when(r))}</p>'
            f'<div class="meta"><span class="pill ty">{TYPES[r["k"]]}</span>{dist_pill}{st}</div>'
            f'<p>{e(r["note"])}</p><div class="acts">{"".join(acts)}</div></div></article>')


def build():
    races = sorted(RACES, key=sort_key)
    feat = next(r for r in races if r.get("feat"))
    towns = {re.split(r" \(| →| ↔", r["c"])[0] for r in races}
    for r in races:
        for part in re.split(r" → | ↔ ", r["c"]):
            towns.add(part.split(" (")[0])
    towns = sorted(towns)
    counts = {k: sum(1 for r in races if r["k"] == k) for k in TYPES}

    months = []
    for r in races:
        key = r.get("d", r.get("m"))[:7]
        if not months or months[-1][0] != key:
            months.append((key, []))
        months[-1][1].append(r)
    list_html = ""
    for key, items in months:
        y, m = map(int, key.split("-"))
        list_html += (f'<section class="month" data-m="{key}"><h2>{MES_L[m-1].capitalize()} {y}'
                      f'<span class="mc">{len(items)} {"carrera" if len(items) == 1 else "carreras"}</span></h2>'
                      f'<div class="rows">{"".join(card(r) for r in items)}</div></section>\n')

    fd = dt.date.fromisoformat(feat["d"])
    seg = "".join(f'<button type="button" data-k="{k}" aria-pressed="{str(k == "").lower()}">{lab}<span class="n">{n}</span></button>'
                  for k, lab, n in [("", "Todas", len(races)), ("21K", "Medias", counts["21K"]), ("pop", "Populares", counts["pop"]),
                                    ("trail", "Trail", counts["trail"]), ("ss", "San Silvestre", counts["ss"])])
    events = []
    for r in races:
        if "d" not in r:
            continue
        ev = {"@type": "SportsEvent", "name": r["n"], "startDate": r["d"] + (f"T{r['t']}:00+01:00" if r.get("t") else ""),
              "eventStatus": "https://schema.org/EventScheduled", "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
              "location": {"@type": "Place", "name": r["c"], "address": {"@type": "PostalAddress", "addressLocality": re.split(r" \(| →", r["c"])[0], "addressRegion": "Cádiz", "addressCountry": "ES"}},
              "url": f"https://runiverso.com/cadiz/#{r['id']}"}
        if r.get("web"):
            ev["sameAs"] = r["web"]
        events.append(ev)
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Runiverso", "item": "https://runiverso.com/"},
            {"@type": "ListItem", "position": 2, "name": "Carreras en Cádiz", "item": "https://runiverso.com/cadiz/"}]}] + events}

    tpl = (ROOT / "tools" / "cadiz_template.html").read_text()
    page = (tpl.replace("{{HEAD_TAIL}}", (ROOT / "tools" / "head_tail.html").read_text())
               .replace("{{BAR}}", (ROOT / "tools" / "bar.html").read_text())
               .replace("{{LD}}", json.dumps(ld, ensure_ascii=False))
               .replace("{{N}}", str(len(races))).replace("{{N21}}", str(counts["21K"]))
               .replace("{{NTR}}", str(counts["trail"])).replace("{{NTOWN}}", str(len(towns)))
               .replace("{{SEG}}", seg).replace("{{LIST}}", list_html)
               .replace("{{FEAT_ID}}", feat["id"]).replace("{{FEAT_DATE}}", feat["d"])
               .replace("{{FEAT_DOW}}", DIAS_L[fd.weekday()]).replace("{{FEAT_DAY}}", str(fd.day))
               .replace("{{REVISADO}}", REVISADO).replace("{{FORM}}", FORM)
               .replace("{{SOURCES}}", "".join(f'<a href="{e(u)}" target="_blank" rel="noopener">{e(t)}</a>' for t, u in SOURCES)))
    OUT.mkdir(exist_ok=True)
    (OUT / "index.html").write_text(page)
    for r in races:
        if "d" in r:
            (OUT / f"{r['id']}.ics").write_bytes(ics(r).encode())
    print(f"{len(races)} carreras · {counts} · {len(towns)} municipios: {', '.join(towns)}")


if __name__ == "__main__":
    build()
