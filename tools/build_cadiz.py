"""Genera la sección /cadiz/ de Runiverso a partir de la lista de carreras de abajo.

Uso: python3 tools/build_cadiz.py   (desde la raíz del repositorio)
Para añadir o corregir una carrera, edita RACES y vuelve a ejecutar el script.
"""
import datetime as dt
import html
import json
import pathlib
import re
import sys
import urllib.parse

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from nav import nav  # noqa: E402
from poster import poster_html  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "cadiz"
REVISADO = "6 de noviembre de 2026"
FORM = "https://docs.google.com/forms/d/e/1FAIpQLScWKG5bZNgG__DRS9tZC9J4-f8Osn2-LeMuAn11e-EZyFxO2A/viewform"

# k: 21K (media), pop (popular, urbana o cross), trail, ss (San Silvestre)
# d: fecha exacta AAAA-MM-DD, o m: solo mes AAAA-MM si aún no hay día
# ok: True si la fecha está confirmada por la organización
RACES = [
    dict(id="carrera-por-la-eliminacion-de-la-violencia-contra-las-mujeres-cadiz", n="Carrera por la Eliminación de la Violencia contra las Mujeres", c="Cádiz", d="2026-11-22", k="pop", dist="3 o 6 km", ok=False,
         note="Carrera solidaria con recorridos de 3 y 6 km. Aparece en el calendario de Running.life."),
    dict(id="carrera-popular-acogimiento-familiar-y-adopcion", n="Carrera Popular por el Acogimiento Familiar y Adopción", c="El Puerto de Santa María", m="2026-11", k="pop", dist="9 km", ok=False,
         note="Carrera solidaria de 9 km y marcha de 4 km, a finales de noviembre a las 10:00. Día exacto por anunciar."),
    dict(id="carrera-urbana-sierra-de-lijar", n="Carrera Urbana Sierra de Líjar", c="Algodonales", d="2026-11-28", k="pop", dist="Urbana", ok=False,
         note="16.ª edición. Aparece en el calendario de ClubRunning."),
    dict(id="carrera-solidaria-inmaculada-alcaldesa-perpetua", n="Carrera Solidaria Inmaculada Alcaldesa Perpetua", c="La Línea de la Concepción", d="2026-11-28", k="pop", dist="Solidaria", ok=False,
         note="13.ª edición, carrera solidaria. Aparece en el calendario de ClubRunning."),
    dict(id="fungo-hybrid-race", n="Fungo Hybrid Race", c="El Puerto de Santa María", d="2026-11-28", k="pop", dist="Obstáculos", ok=False,
         note="Carrera de obstáculos. Aparece en el calendario de ClubRunning. Running.life la sitúa en Jerez: confirma la sede en la web oficial."),
    dict(id="cross-pinar-del-rey", n="Cross Pinar del Rey", c="San Roque", d="2026-11-29", k="pop", dist="Cross", ok=False,
         note="7.ª edición, en el Pinar del Rey. Aparece en el calendario de ClubRunning."),
    dict(id="cross-popular-ciudad-de-jerez", n="Cross Popular Ciudad de Jerez", c="Jerez de la Frontera", d="2026-11-29", k="pop", dist="Cross", ok=False,
         note="Aparece en el calendario de Running.life."),
    dict(id="trail-cruz-del-valle", n="Trail Cruz del Valle", c="San José del Valle", d="2026-12-06", k="trail", dist="Trail", ok=False,
         note="12.ª edición. Aparece en el calendario de ClubRunning."),
    dict(id="carrera-del-estrecho-memorial-pepe-serrano", n="Carrera del Estrecho Memorial Pepe Serrano", c="Tarifa", d="2026-12-06", k="pop", dist="Popular", ok=False,
         note="17.ª edición. Aparece en el calendario de ClubRunning."),
    dict(id="cross-popular-ludico-solidario-castellar", n="Cross Popular Lúdico y Solidario de Castellar", c="Castellar de la Frontera", d="2026-12-12", k="pop", dist="Cross", ok=False,
         note="3.ª edición, cross solidario. Aparece en el calendario de ClubRunning."),
    dict(id="cross-rural-asta-regia", n="Cross Rural Asta Regia 8K", c="Jerez de la Frontera", d="2026-12-12", k="pop", dist="8 km", ok=False,
         note="Cross rural de 8 km. Aparece en el calendario de Running.life."),
    dict(id="cross-pinar-publico-la-barrosa", n="Cross Pinar Público La Barrosa", c="Chiclana de la Frontera", d="2026-12-13", k="pop", dist="Cross", ok=False,
         note="33.ª edición, en el pinar de La Barrosa. Aparece en el calendario de ClubRunning."),
    dict(id="carrera-popular-vejer-de-la-frontera", n="Carrera Popular Vejer de la Frontera", c="Vejer de la Frontera", d="2026-12-13", k="pop", dist="Popular", ok=False,
         note="29.ª edición. Aparece en el calendario de ClubRunning."),
    dict(id="carrera-infantil-benefica-bomberos-de-jerez", n="Carrera Infantil Benéfica Bomberos de Jerez", c="Jerez de la Frontera", d="2026-12-13", k="pop", dist="Infantil", ok=False,
         note="6.ª edición, carrera benéfica para niños. Aparece en el calendario de ClubRunning."),
    dict(id="cross-san-sebastian-de-puerto-real", n="Cross San Sebastián de Puerto Real", c="Puerto Real", d="2026-12-19", k="pop", dist="Cross", ok=False,
         note="Aparece en el calendario de Running.life."),
    dict(id="carrera-urbana-navidena-puerto-serrano", n="Carrera Urbana Navideña de Puerto Serrano", c="Puerto Serrano", d="2026-12-20", k="pop", dist="Urbana", ok=False,
         note="7.ª edición, carrera de Navidad. Aparece en el calendario de ClubRunning."),
    dict(id="carrera-solidaria-de-navidad-de-algeciras", n="Carrera Solidaria de Navidad de Algeciras", c="Algeciras", d="2026-12-20", k="pop", dist="Solidaria", ok=False,
         note="13.ª edición. Aparece en el calendario de ClubRunning."),
    dict(id="carrera-popular-de-navidad-villa-de-rota", n="Carrera Popular de Navidad Villa de Rota", c="Rota", d="2026-12-26", k="pop", dist="5 km", ok=False,
         note="22.ª edición, 5 km. Aparece en el calendario de ClubRunning."),
    dict(id="san-silvestre-el-puerto-de-santa-maria", n="San Silvestre El Puerto de Santa María", c="El Puerto de Santa María", d="2026-12-27", k="ss", dist="5 km", ok=False,
         note="5 km por El Puerto. Aparece en el calendario de ClubRunning."),
    dict(id="san-silvestre-chiclanera", n="San Silvestre Chiclanera", c="Chiclana de la Frontera", d="2026-12-30", k="ss", dist="San Silvestre", ok=False,
         note="Aparece en el calendario de Running.life."),
    dict(id="cross-pinar-de-rota", n="Cross Pinar de Rota", c="Rota", d="2027-01-03", k="pop", dist="Cross", ok=False,
         note="Aparece en el calendario de Running.life. Detalles por anunciar."),
    dict(id="maraton-del-pavo-de-espera", n="Maratón del Pavo de Espera", c="Espera", d="2027-01-06", k="pop", dist="Popular", ok=False,
         note="47.ª edición de esta carrera popular de Reyes, pese a su nombre no es una maratón. Aparece en el calendario de ClubRunning."),
    dict(id="torunos-running-series", n="Toruños Running Series", c="El Puerto de Santa María", d="2027-01-10", k="pop", dist="9, 10 o 21 km", ok=False,
         note="Por el Parque de los Toruños, con 9 km, 10 km y media maratón. Aparece en el calendario de Running.life."),
    dict(id="fungo-race", n="Fungo Race", c="El Puerto de Santa María", d="2027-03-14", k="pop", dist="Obstáculos · 7 km", ok=False,
         note="Carrera de obstáculos de 7 km. Aparece en el calendario de ClubRunning."),
    dict(id="fan-pin-civico-militar", n="Fan-Pin Cívico-Militar", c="San Fernando", d="2027-06-19", k="pop", dist="3 u 8 km", ok=False,
         note="Carrera cívico-militar en San Fernando con 3 y 8 km. Aparece en el calendario de GoTrail."),
    dict(id="cerrocross-melkart-gadeiras", n="Cerrocross Melkart Gadeiras", c="San Fernando", d="2027-10-31", k="pop", dist="Cross", ok=False,
         note="Cross por el Cerro de los Mártires. Aparece en el calendario de GoTrail."),
    dict(id="media-maraton-ciudad-de-cadiz", n="Media Maratón Ciudad de Cádiz", c="Cádiz", d="2026-11-08", t="09:00", k="21K", dist="21,1 km", ok=True,
         note="SUSPENDIDA. El Ayuntamiento de Cádiz suspendió la prueba el viernes 6 de noviembre, a dos días de la carrera, tras un informe desfavorable de la Policía Local: los agentes voluntarios para regular el tráfico retiraron su disponibilidad y no se podía garantizar la seguridad del recorrido. De momento no hay nueva fecha ni información sobre la devolución de inscripciones: consulta la web y las redes de la organización. Era la 3.ª edición, con unos 3.000 inscritos, y tenía fin solidario a favor de la Asociación Síndrome de Rett.",
         web="https://mediamaratonciudaddecadiz.com", s="suspendida"),
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
    dict(id="cross-trail-el-cernicalo", n="Cross Trail El Cernícalo", c="Medina Sidonia", d="2026-11-15", k="trail", dist="12 km", ok=True,
         note="2.ª edición, con el Ayuntamiento de Medina Sidonia y la Diputación de Cádiz. 12 km por la Ruta Hijuela de las Ratas, el Camino Nariga y el Padrón El Cernícalo. Cronometra Cronosesca."),
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
    dict(feat=True, id="media-maraton-el-puerto", n="Media Maratón y 10K El Puerto", c="El Puerto de Santa María", d="2027-01-31", t="09:00", k="21K", dist="21,1 km y 10 km", ok=True,
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

TYPES = {"21K": "Media maratón", "10K": "10K", "pop": "Popular", "trail": "Trail", "ss": "San Silvestre"}
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
    ("GoTrail (Cádiz)", "https://gotrail.run/calendario-montana/espana/andalucia/cadiz"),
    ("Running.life (Cádiz)", "https://running.life/running-calendar/spain/andalucia/cadiz"),
]

e = lambda x: html.escape(str(x), quote=True)


def sort_key(r):
    if "d" in r:
        return r["d"]
    return r["m"] + "-28"


def ics(r, slug="cadiz", prov="Cádiz"):
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
    desc = (r["note"] + ("" if r["ok"] else " Fecha por confirmar.") + f" Más info: https://runiverso.com/{slug}/#{r['id']}").replace(",", "\\,").replace(";", "\\;")
    lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Runiverso//Cadiz//ES", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
             f"UID:{uid}", "DTSTAMP:20261103T120000Z", start, end,
             f"SUMMARY:{r['n']}".replace(",", "\\,"), f"LOCATION:{r['c']}\\, {prov}", f"DESCRIPTION:{desc}",
             f"URL:https://runiverso.com/{slug}/#{r['id']}", "END:VEVENT", "END:VCALENDAR"]
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


FICHA_ID = {"cross-pinar-del-hierro": "cross-pinar-del-hierro-y-la-espartosa", "media-maraton-el-puerto": "media-maraton-y-10k-el-puerto"}


def ficha_id(r):
    import unicodedata
    by_name = re.sub(r"[^a-z0-9]+", "-", "".join(c for c in unicodedata.normalize("NFD", r["n"].lower()) if unicodedata.category(c) != "Mn")).strip("-")
    for fid in (FICHA_ID.get(r["id"], r["id"]), by_name):
        if (ROOT / "carreras" / fid / "index.html").exists():
            return fid
    return None


PK = {"21K": "21K", "10K": "10K", "pop": "POP", "trail": "TR", "ss": "SS"}


def card(r, slug="cadiz"):
    share = urllib.parse.quote(f"{r['n']} · {when(r)} · {r['c']}\nhttps://runiverso.com/{slug}/#{r['id']}")
    st = '<span class="st prov">Suspendida</span>' if r.get("s") else ('<span class="st ok">Confirmada</span>' if r["ok"] else '<span class="st prov">Por confirmar</span>')
    acts = []
    if r.get("web"):
        acts.append(f'<a class="btn" href="{e(r["web"])}" target="_blank" rel="noopener">Web oficial</a>')
    else:
        q = urllib.parse.quote(f"{r['n']} {r.get('d', r.get('m'))[:4]} inscripción")
        acts.append(f'<a class="btn alt" href="https://www.google.com/search?q={q}" target="_blank" rel="noopener">Inscripción</a>')
    if "d" in r:
        acts.append(f'<a class="btn alt" href="{r["id"]}.ics" download>+ Calendario</a>')
    fid = ficha_id(r)
    if fid:
        acts.insert(0, f'<a class="btn alt" href="../carreras/{fid}/">Ficha completa</a>')
    if r.get("also"):
        acts.append(f'<a class="btn alt" href="{e(r["also"])}">Ver en el especial</a>')
    acts.append(f'<a class="btn alt" href="https://wa.me/?text={share}" target="_blank" rel="noopener">Compartir</a>')
    end = r.get("d", r.get("m", "") + "-28")
    if "d" in r:
        d = dt.date.fromisoformat(r["d"])
        dd = f"{d.day:02d}/{d.month:02d}/{d.year}" + (f" · {r['t']}" if r.get("t") else "")
    else:
        y, m = map(int, r["m"].split("-"))
        dd = f"{MES_L[m-1].capitalize()} {y}"
    poster = poster_html(r["id"], r["n"], r["c"], PK[r["k"]], r["dist"], r.get("d"), r.get("m"), r["ok"], tag="button", root="../")
    poster = poster.replace('type="button"', f'type="button" data-tog="{r["id"]}"', 1)
    if r.get("s"):
        poster = poster.replace('</button>', '<span class="pprov">Suspendida</span></button>', 1) if 'class="pprov"' not in poster else poster.replace('Por confirmar', 'Suspendida')
    return (f'<article class="pcard" id="{r["id"]}" data-k="{r["k"]}" data-end="{end}">{poster}'
            f'<div class="pinfo"><h3>{(f'<a href="../carreras/{fid}/">{e(r["n"])}</a>') if fid else e(r["n"])}</h3><p class="pl">{e(r["c"])}</p><p class="pd">{dd}{st}</p>'
            f'<details class="pmore" id="m-{r["id"]}"><summary>Ver más</summary><p>{e(r["note"])}</p><div class="acts">{"".join(acts)}</div></details></div></article>')


PROVS = ["Almería", "Cádiz", "Córdoba", "Granada", "Huelva", "Jaén", "Málaga", "Sevilla"]
SLUGS = {"Almería": "almeria", "Cádiz": "cadiz", "Córdoba": "cordoba", "Granada": "granada", "Huelva": "huelva", "Jaén": "jaen", "Málaga": "malaga", "Sevilla": "sevilla"}
LEADS = {
    "Cádiz": "Las carreras de la provincia en un solo sitio: de La Caleta a la Sierra de Grazalema, con medias, populares, trail y San Silvestres. Fecha, distancia y web oficial de cada una.",
    "Sevilla": "De la Carrera de la Mujer al Medio Maratón y la San Silvestre Sevillana: medias, populares y San Silvestres de la capital y de los pueblos de toda la provincia.",
    "Málaga": "De la Costa del Sol a la Axarquía y Antequera: medias, populares, carreras de Navidad y San Silvestres de toda la provincia.",
    "Granada": "De la capital a la Vega, el Valle de Lecrín y la Alpujarra: carreras de fondo, populares y San Silvestres de toda la provincia.",
    "Córdoba": "De la capital a la Campiña y la Subbética: medias, populares, millas y San Silvestres de toda la provincia.",
    "Jaén": "De la Media Maratón de Jaén a Linares, Bailén y la Sierra Sur: medias, populares y San Silvestres de toda la provincia.",
    "Huelva": "De la capital al Condado, el Andévalo y la raya del Guadiana: populares, millas y San Silvestres de toda la provincia.",
    "Almería": "Del Poniente a Níjar y la capital: medias, populares y San Silvestres de toda la provincia.",
}
AND_K = {"21K": "21K", "10K": "10K", "POP": "pop", "SS": "ss", "TR": "trail"}


def from_andalucia(lst):
    import unicodedata
    out = []
    for r in lst:
        rid = re.sub(r"[^a-z0-9]+", "-", "".join(c for c in unicodedata.normalize("NFD", r["n"].lower()) if unicodedata.category(c) != "Mn")).strip("-")
        x = dict(id=rid, n=r["n"], c=r["c"], d=r["d"], k=AND_K[r["k"]], dist=r["dist"], ok=r["ok"], note=r["t"])
        if r.get("w"):
            x["web"] = r["w"]
        if r.get("h"):
            x["t"] = r["h"]
        if r.get("s"):
            x["s"] = r["s"]
        out.append(x)
    return out


def tabs(cur, counts):
    h = '<nav class="ptabs" aria-label="Provincias de Andalucía">'
    for p in PROVS:
        a = ' aria-current="page"' if p == cur else ""
        h += f'<a href="../{SLUGS[p]}/"{a}>{p}<span>{counts.get(p, 0)}</span></a>'
    return h + "</nav>"


def all_provinces():
    import andalucia
    data = {"Cádiz": list(RACES)}
    for p, lst in andalucia.PROVINCIAS.items():
        data[p] = from_andalucia(lst)
    # carreras andaluzas de la lista de la portada que no estén ya (p. ej. Medio Maratón de Sevilla)
    try:
        js = (ROOT / "app" / "data.js").read_text()
        app = json.loads(re.search(r"RV_RACES = (\[.*?\]);", js, re.S).group(1))
        have = {r["n"] for lst in data.values() for r in lst}
        for a in app:
            if a.get("r") == "Andalucía" and a.get("p") in SLUGS and a["n"] not in have and a["k"] in AND_K:
                x = dict(id=a["id"], n=a["n"], c=a["c"], d=a["d"], k=AND_K[a["k"]], dist=a.get("dist") or "", ok=a["ok"], note=a.get("t") or "")
                if a.get("w"):
                    x["web"] = a["w"]
                if a.get("h"):
                    x["t"] = a["h"]
                data.setdefault(a["p"], []).append(x)
    except Exception as ex:  # noqa: BLE001
        print("aviso: sin app/data.js", ex)
    return data


def build():
    data = all_provinces()
    today = dt.date.today().isoformat()
    counts_all = {p: sum(1 for r in lst if sort_key(r) >= today) for p, lst in data.items()}
    for p in PROVS:
        if data.get(p):
            build_province(p, data[p], counts_all)


def build_province(prov, plist, counts_all):
    slug = SLUGS[prov]
    out_dir = ROOT / slug
    races = sorted(plist, key=sort_key)
    today = dt.date.today().isoformat()
    up = [r for r in races if "d" in r and r["d"] >= today and not r.get("s")]
    feat = (next((r for r in up if r.get("feat")), None) or next((r for r in up if r["k"] == "21K" and r["ok"]), None)
            or next((r for r in up if r["k"] == "21K"), None) or (up[0] if up else races[0]))
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
                      f'<div class="pgrid">{"".join(card(r, slug) for r in items)}</div></section>\n')

    fd = dt.date.fromisoformat(feat["d"])
    segs = [("", "Todas", len(races)), ("21K", "Medias", counts["21K"]), ("10K", "10K", counts["10K"]), ("pop", "Populares", counts["pop"]),
            ("trail", "Trail", counts["trail"]), ("ss", "San Silvestre", counts["ss"])]
    seg = "".join(f'<button type="button" data-k="{k}" aria-pressed="{str(k == "").lower()}">{lab}<span class="n">{n}</span></button>'
                  for k, lab, n in segs if n or k == "")
    events = []
    for r in races:
        if "d" not in r:
            continue
        ev = {"@type": "SportsEvent", "name": r["n"], "startDate": r["d"] + (f"T{r['t']}:00+01:00" if r.get("t") else ""),
              "eventStatus": "https://schema.org/EventCancelled" if r.get("s") else "https://schema.org/EventScheduled", "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
              "location": {"@type": "Place", "name": r["c"], "address": {"@type": "PostalAddress", "addressLocality": re.split(r" \(| →", r["c"])[0], "addressRegion": prov, "addressCountry": "ES"}},
              "url": f"https://runiverso.com/{slug}/#{r['id']}", "description": r["note"]}
        if r.get("web"):
            ev["sameAs"] = r["web"]
        events.append(ev)
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Runiverso", "item": "https://runiverso.com/"},
            {"@type": "ListItem", "position": 2, "name": f"Carreras en {prov}", "item": f"https://runiverso.com/{slug}/"}]}] + events}

    fdl = f"{DIAS_L[fd.weekday()].capitalize()} {fd.day} de {MES_L[fd.month-1]}" + (f" · {feat['t']}" if feat.get("t") else "")
    lis = [fdl, feat["c"], feat["dist"] or TYPES[feat["k"]], "Fecha confirmada" if feat["ok"] else "Fecha por confirmar"]
    ftext = feat["note"].split(". ")[0].rstrip(".") + "." if feat.get("note") else ""
    fweb = f'<a class="btn alt" href="{e(feat["web"])}" target="_blank" rel="noopener">Web oficial</a>' if feat.get("web") else ""
    lab3, n3 = ("Trails", counts["trail"]) if counts["trail"] else ("San Silvestres", counts["ss"])
    desc = (f"Calendario de carreras de running en la provincia de {prov}: {counts['21K']} medias maratones, populares, 10K y "
            f"{counts['ss']} San Silvestres en {len(towns)} localidades, con fecha, web oficial y aviso antes de cada carrera.")
    tpl = (ROOT / "tools" / "cadiz_template.html").read_text()
    page = (tpl.replace("{{HEAD_TAIL}}", (ROOT / "tools" / "head_tail.html").read_text())
               .replace("{{BAR}}", (ROOT / "tools" / "bar.html").read_text().replace("{{NAV}}", nav("../", "and")))
               .replace("{{LD}}", json.dumps(ld, ensure_ascii=False))
               .replace("{{TITLE}}", f"Carreras en {prov} 2026/27: medias, populares y San Silvestres · Runiverso")
               .replace("{{DESC}}", e(desc)).replace("{{SLUG}}", slug).replace("{{PROV}}", prov)
               .replace("{{TABS}}", tabs(prov, counts_all)).replace("{{LEAD}}", e(LEADS.get(prov, "")))
               .replace("{{N}}", str(len(races))).replace("{{N21}}", str(counts["21K"]))
               .replace("{{LAB3}}", lab3).replace("{{NTR}}", str(n3)).replace("{{NTOWN}}", str(len(towns)))
               .replace("{{SEG}}", seg).replace("{{LIST}}", list_html)
               .replace("{{FEAT_NAME}}", e(feat["n"])).replace("{{FEAT_TEXT}}", e(ftext)).replace("{{FEAT_WEB}}", fweb)
               .replace("{{FEAT_LIS}}", "".join(f"<li>{e(x)}</li>" for x in lis))
               .replace("{{FEAT_MON}}", MES_C[fd.month - 1])
               .replace("{{FEAT_ID}}", feat["id"]).replace("{{FEAT_DATE}}", feat["d"])
               .replace("{{FEAT_DOW}}", DIAS_L[fd.weekday()]).replace("{{FEAT_DAY}}", str(fd.day))
               .replace("{{REVISADO}}", REVISADO).replace("{{FORM}}", FORM)
               .replace("{{SOURCES}}", "".join(f'<a href="{e(u)}" target="_blank" rel="noopener">{e(t)}</a>' for t, u in SOURCES)))
    out_dir.mkdir(exist_ok=True)
    (out_dir / "index.html").write_text(page)
    for r in races:
        if "d" in r:
            (out_dir / f"{r['id']}.ics").write_bytes(ics(r, slug, prov).encode())
    import fix_events
    fix_events.fix_file(out_dir / "index.html")
    print(f"{prov}: {len(races)} carreras · {counts} · {len(towns)} municipios")


if __name__ == "__main__":
    build()
