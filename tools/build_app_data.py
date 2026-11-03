"""Genera app/data.js con las carreras de la web para la app.

Junta las carreras de la portada (index.html), las de la sección de Cádiz y las
clasificaciones. Ejecutar tras actualizar cualquiera de ellas:
    python3 tools/build_app_data.py
"""
import json
import pathlib
import re
import subprocess
import sys
import unicodedata

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
import build_cadiz  # noqa: E402
import build_results  # noqa: E402

JS = r"""
const fs=require("fs");const h=fs.readFileSync(process.argv[1],"utf8");
const s=h.slice(h.indexOf("var R = ["));const end=s.indexOf("var KN");
const d=(new Function(s.slice(0,end)+";return {R,MARCAS};"))();
process.stdout.write(JSON.stringify(d));
"""
CADIZ_K = {"21K": "21K", "pop": "POP", "trail": "TR", "ss": "SS"}

# Provincia de cada localidad (las que no estén aquí se toman como provincia propia)
PROV = {
    "Algeciras": "Cádiz", "Cazorla": "Jaén", "Chiclana de la Frontera": "Cádiz", "Chipiona": "Cádiz", "Chipiona → Rota": "Cádiz", "Cádiz": "Cádiz",
    "El Gastor": "Cádiz", "El Puerto de Santa María": "Cádiz", "Facinas (Tarifa)": "Cádiz", "Grazalema": "Cádiz", "Jerez de la Frontera": "Cádiz",
    "Medina Sidonia": "Cádiz", "Prado del Rey": "Cádiz", "Puerto Serrano": "Cádiz", "San Roque": "Cádiz", "Tarifa": "Cádiz", "Rota": "Cádiz",
    "Villaluenga del Rosario": "Cádiz", "Zahara de los Atunes": "Cádiz", "San Fernando": "Cádiz", "Torremolinos": "Málaga",
    "Alquézar": "Huesca", "Benasque": "Huesca", "Gijón": "Asturias", "Oviedo": "Asturias", "Sobrescobio": "Asturias",
    "Adeje": "Santa Cruz de Tenerife", "El Hierro": "Santa Cruz de Tenerife", "Fuencaliente": "Santa Cruz de Tenerife", "San Cristóbal de La Laguna": "Santa Cruz de Tenerife",
    "Lanzarote": "Las Palmas", "Las Palmas de Gran Canaria": "Las Palmas", "Laredo": "Cantabria", "Santander": "Cantabria",
    "Bagà": "Barcelona", "Bausen": "Lleida", "Canovelles": "Barcelona", "Collbató": "Barcelona", "Granollers": "Barcelona", "Ribes de Freser": "Girona",
    "Roses": "Girona", "Vall de Boí": "Lleida", "Vall de Núria": "Girona", "Vielha e Mijaran": "Lleida",
    "Alcoi": "Alicante", "Alcoy": "Alicante", "Castellón de la Plana": "Castellón", "Chulilla": "Valencia", "Eslida": "Castellón", "Santa Pola": "Alicante",
    "Vistabella del Maestrazgo": "Castellón", "Santiago de Compostela": "A Coruña", "Vigo": "Pontevedra",
    "Eivissa": "Illes Balears", "Es Capdellà": "Illes Balears", "Ibiza": "Illes Balears", "Palma": "Illes Balears", "Sant Josep de sa Talaia": "Illes Balears", "Sóller": "Illes Balears",
    "Logroño": "La Rioja", "Pamplona": "Navarra", "Bilbao": "Bizkaia", "San Sebastián": "Gipuzkoa", "Santa Cruz de Campezo": "Álava", "Vitoria-Gasteiz": "Álava",
    "Zeanuri": "Bizkaia", "Zegama": "Gipuzkoa", "Murcia": "Murcia", "Madrid": "Madrid", "Valencia": "Valencia",
}
ZONES = {
    "Andalucía": ["Almería", "Cádiz", "Córdoba", "Granada", "Huelva", "Jaén", "Málaga", "Sevilla"],
    "Aragón": ["Huesca", "Teruel", "Zaragoza"], "Asturias": ["Asturias"], "Illes Balears": ["Illes Balears"],
    "Canarias": ["Las Palmas", "Santa Cruz de Tenerife"], "Cantabria": ["Cantabria"],
    "Castilla y León": ["Ávila", "Burgos", "León", "Palencia", "Salamanca", "Segovia", "Soria", "Valladolid", "Zamora"],
    "Castilla-La Mancha": ["Albacete", "Ciudad Real", "Cuenca", "Guadalajara", "Toledo"],
    "Cataluña": ["Barcelona", "Girona", "Lleida", "Tarragona"], "Comunidad Valenciana": ["Alicante", "Castellón", "Valencia"],
    "Extremadura": ["Badajoz", "Cáceres"], "Galicia": ["A Coruña", "Lugo", "Ourense", "Pontevedra"],
    "Comunidad de Madrid": ["Madrid"], "Región de Murcia": ["Murcia"], "Navarra": ["Navarra"],
    "País Vasco": ["Álava", "Bizkaia", "Gipuzkoa"], "La Rioja": ["La Rioja"], "Ceuta": ["Ceuta"], "Melilla": ["Melilla"],
}


def prov(city):
    return PROV.get(city, city.split(" (")[0])


def slug(t):
    t = unicodedata.normalize("NFD", t.lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")


def main():
    raw = subprocess.run(["node", "-e", JS, str(ROOT / "index.html")], capture_output=True, text=True, check=True).stdout
    data = json.loads(raw)
    races, seen = [], set()
    for r in data["R"]:
        k = r.get("k", "21K")
        item = {"id": slug(r["n"]), "n": r["n"], "c": r["c"], "r": r["r"], "d": r["d"], "ok": bool(r.get("ok")), "k": k,
                "dist": r.get("dist") or {"21K": "21,1 km", "42K": "42,2 km", "10K": "10 km"}.get(k, ""), "t": r.get("t", ""),
                "x": r.get("x", []), "w": r.get("w", ""), "h": r.get("h", "")}
        m = data["MARCAS"].get(r["n"])
        if m:
            item["m"] = m
        races.append(item)
        seen.add(slug(r["n"]))
    for r in build_cadiz.RACES:
        if "d" not in r or slug(r["n"]) in seen:
            continue
        races.append({"id": slug(r["n"]), "n": r["n"], "c": r["c"], "r": "Andalucía", "d": r["d"], "ok": r["ok"], "k": CADIZ_K[r["k"]],
                      "dist": r["dist"], "t": r["note"], "x": [], "w": r.get("web", ""), "h": r.get("t", ""), "cadiz": True})
        seen.add(slug(r["n"]))
    for r in races:
        r["p"] = prov(r["c"])
        r.pop("cadiz", None)
    races.sort(key=lambda r: (r["d"], r["n"]))
    results = sorted(build_results.RESULTS, key=lambda r: r["d"], reverse=True)
    for r in results:
        r["p"] = prov(r["c"])
    out = ROOT / "app" / "data.js"
    out.write_text("/* Generado por tools/build_app_data.py: no editar a mano */\n"
                   "window.RV_RACES = " + json.dumps(races, ensure_ascii=False) + ";\n"
                   "window.RV_RESULTS = " + json.dumps(results, ensure_ascii=False) + ";\n"
                   "window.RV_ZONES = " + json.dumps(ZONES, ensure_ascii=False) + ";\n")
    print(f"{len(races)} carreras ({sum(1 for r in races if r['p'] == 'Cádiz')} de Cádiz) · {len(results)} clasificaciones")


if __name__ == "__main__":
    main()
