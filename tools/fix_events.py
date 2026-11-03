"""Completa los datos estructurados de eventos (SportsEvent) de todas las páginas.

Añade lo que Search Console pide y se puede rellenar con datos ciertos:
- endDate: el mismo día de la salida (o el último día, si la prueba dura varios)
- image: la imagen para compartir de la página (o og.png de Runiverso)
- description: si falta, una frase con nombre, lugar y fecha
- organizer: Runiverso no organiza, así que no se inventa; se deja fuera

No añade "offers" ni "performer": en una carrera popular no hay artistas y
los precios cambian por tramos, así que poner datos inventados sería peor
que dejarlos vacíos (son avisos no críticos).

Uso: python3 tools/fix_events.py   (idempotente, se puede ejecutar varias veces)
"""
import datetime as dt
import glob
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
DEFAULT_IMG = "https://runiverso.com/og.png"
MULTIDAY = {"100 Millas Sierras del Bandolero": "2027-03-07"}
MES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
LD = re.compile(r'(<script type="application/ld\+json">)(.*?)(</script>)', re.S)


def fix_event(ev, page_img):
    sd = ev.get("startDate", "")
    day = sd[:10]
    if "endDate" not in ev and day:
        ev["endDate"] = MULTIDAY.get(ev.get("name"), day)
    if "image" not in ev:
        ev["image"] = [page_img]
    if "description" not in ev and day:
        d = dt.date.fromisoformat(day)
        place = ev.get("location", {}).get("name", "")
        ev["description"] = f"{ev['name']} en {place}, {d.day} de {MES[d.month - 1]} de {d.year}. Fecha, distancia y web oficial en Runiverso."
    return ev


def fix_file(path):
    s = path.read_text()
    m = re.search(r'<meta property="og:image" content="([^"]+)"', s)
    img = m.group(1).replace("&amp;", "&") if m and m.group(1).startswith("https://") else DEFAULT_IMG
    changed = 0

    def repl(mm):
        nonlocal changed
        data = json.loads(mm.group(2))
        items = data.get("@graph", [data])
        for it in items:
            if it.get("@type") == "SportsEvent":
                before = json.dumps(it, sort_keys=True)
                fix_event(it, img)
                changed += before != json.dumps(it, sort_keys=True)
        return mm.group(1) + json.dumps(data, ensure_ascii=False) + mm.group(3)

    new = LD.sub(repl, s)
    if new != s:
        path.write_text(new)
    return changed


def main():
    files = [ROOT / "index.html", ROOT / "san-silvestre-2026" / "index.html", ROOT / "cadiz" / "index.html"]
    files += [pathlib.Path(p) for p in sorted(glob.glob(str(ROOT / "carreras" / "*" / "index.html")))]
    total = sum(fix_file(f) for f in files if f.exists())
    print(f"Eventos completados: {total}")


if __name__ == "__main__":
    main()
