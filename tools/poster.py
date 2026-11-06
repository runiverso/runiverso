"""Cartel Runiverso de cada carrera (el mismo diseño que usa la portada en JavaScript).

poster_html(...) devuelve el cartel; si hay cartel oficial en CARTELES, devuelve la imagen.
"""
import datetime as dt
import html

# Carteles oficiales autorizados: identificador de la carrera -> archivo en /carteles/
CARTELES = {"media-maraton-ciudad-de-cadiz": "media-maraton-ciudad-de-cadiz.jpg", "media-maraton-ciudad-de-jaen": "media-maraton-ciudad-de-jaen.jpg"}

MES_C = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
LABEL = {"21K": "Media", "42K": "Maratón", "10K": "10K", "TR": "Trail", "SS": "San Silvestre", "POP": "Popular"}
MARK = ('<svg viewBox="12 12 96 96" aria-hidden="true"><path d="M44 30V90M44 30H64a17 17 0 0 1 0 34H44" fill="none" '
        'stroke="#FFFFFF" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><path d="M60 64L82 90" fill="none" '
        'stroke="#7FA6FF" stroke-width="11" stroke-linecap="round"/></svg>')

e = lambda x: html.escape(str(x), quote=True)


def poster_html(rid, name, city, k, dist="", date=None, month=None, ok=True, href=None, root="../", tag="a"):
    """k: 21K, 42K, 10K, TR, SS o POP. date: AAAA-MM-DD, o month: AAAA-MM si aún no hay día."""
    attrs = f'class="poster{" has-img" if rid in CARTELES else ""}" data-k="{e(k)}"'
    if tag == "a":
        attrs += f' href="{e(href or "#" + rid)}"'
    else:
        attrs += ' type="button"'
    attrs += f' aria-label="{e(name)}"'
    if rid in CARTELES:
        return f'<{tag} {attrs}><img src="{root}carteles/{e(CARTELES[rid])}" alt="Cartel oficial: {e(name)}" loading="lazy"></{tag}>'
    if date:
        d = dt.date.fromisoformat(date)
        big, mon, yr = f"{d.day:02d}", MES_C[d.month - 1], str(d.year)
    else:
        y, m = map(int, month.split("-"))
        big, mon, yr = MES_C[m - 1].capitalize(), "día por", "anunciar"
    show_dist = dist and dist not in ("Trail", "Popular", "San Silvestre")
    dist_html = '<span class="pdist">' + e(dist) + "</span>" if show_dist else ""
    prov_html = "" if ok else '<span class="pprov">Por confirmar</span>'
    return (f'<{tag} {attrs}><span class="pt">{MARK}{e(LABEL.get(k, ""))}{dist_html}</span>'
            f'<span class="pn">{e(name)}</span><span class="pc">{e(city)}</span>'
            f'<span class="pdate"><b>{e(big)}</b><span>{e(mon)}<small>{e(yr)}</small></span></span>'
            f'{prov_html}</{tag}>')
