"""Cartel Runiverso de cada carrera (el mismo diseño que usa la portada en JavaScript).

poster_html(...) devuelve el cartel; si hay cartel oficial en CARTELES, devuelve la imagen.
"""
import datetime as dt
import html

# Carteles oficiales autorizados: identificador de la carrera -> archivo en /carteles/
CARTELES = {"media-maraton-ciudad-de-cadiz": "media-maraton-ciudad-de-cadiz.jpg", "media-maraton-ciudad-de-jaen": "media-maraton-ciudad-de-jaen.jpg", "cross-trail-el-cernicalo": "cross-trail-el-cernicalo.jpg", "desafio-sierra-de-villaluenga": "desafio-sierra-de-villaluenga.jpg", "carrera-de-la-mujer-de-sevilla": "carrera-de-la-mujer-de-sevilla.jpg", "carrera-solidaria-por-la-diabetes-de-corrales": "carrera-solidaria-por-la-diabetes-de-corrales.jpg", "cross-pinar-del-hierro-y-la-espartosa": "cross-pinar-del-hierro-y-la-espartosa.jpg", "cross-pinar-del-hierro": "cross-pinar-del-hierro-y-la-espartosa.jpg", "carrera-popular-los-chamuscaos": "carrera-popular-los-chamuscaos.jpg", "epora-trail-montoro": "epora-trail-montoro.jpg", "castillo-trail-la-calahorra": "castillo-trail-la-calahorra.jpg", "gran-vuelta-del-valle-del-genal": "gran-vuelta-del-valle-del-genal.jpg", "carrera-popular-de-reyes-de-penaflor": "carrera-popular-de-reyes-de-penaflor.jpg", "carrera-popular-isla-redonda": "carrera-popular-isla-redonda.jpg", "san-silvestre-de-velez-malaga": "san-silvestre-de-velez-malaga.jpg", "maraton-del-pavo-de-espera": "maraton-del-pavo-de-espera.jpg", "san-silvestre-real-club-mediterraneo": "san-silvestre-real-club-mediterraneo.jpg", "san-silvestre-vegas-del-genil": "san-silvestre-vegas-del-genil.jpg", "san-silvestre-de-bailen": "san-silvestre-de-bailen.jpg", "san-silvestre-ojen-en-navidad": "san-silvestre-ojen-en-navidad.jpg", "san-silvestre-de-atarfe": "san-silvestre-de-atarfe.jpg", "cross-pinar-publico-la-barrosa": "cross-pinar-publico-la-barrosa.jpg", "carrera-solidaria-de-guaro": "carrera-solidaria-de-guaro.jpg", "carrera-nocturna-de-camas": "carrera-nocturna-de-camas.jpg", "ruta-091-ecija": "ruta-091-ecija.jpg", "carrera-urbana-velez-malaga": "carrera-urbana-velez-malaga.jpg", "carrera-de-bonares-memorial-manolo-marquez": "carrera-de-bonares-memorial-manolo-marquez.jpg", "carrera-popular-vejer-de-la-frontera": "carrera-popular-vejer-de-la-frontera.jpg", "carrera-urbana-rafael-del-riego": "carrera-urbana-rafael-del-riego.jpg", "carrera-urbana-sierra-de-lijar": "carrera-urbana-sierra-de-lijar.jpg", "carrera-urbana-navidena-de-puerto-serrano": "carrera-urbana-navidena-de-puerto-serrano.jpg", "san-silvestre-chipionera": "san-silvestre-chipionera.jpg", "san-silvestre-el-puerto-de-santa-maria": "san-silvestre-el-puerto-de-santa-maria.jpg", "carrera-navidena-de-escuzar": "carrera-navidena-de-escuzar.jpg", "san-silvestre-de-armilla": "san-silvestre-de-armilla.jpg", "subida-a-la-cruz-de-la-atalaya": "subida-a-la-cruz-de-la-atalaya.jpg", "legua-urbana-nocturna-la-bellota": "legua-urbana-nocturna-la-bellota.jpg", "cross-popular-ludico-y-solidario-de-castellar": "cross-popular-ludico-y-solidario-de-castellar.jpg", "carrera-urbana-ciudad-de-chiclana": "carrera-urbana-ciudad-de-chiclana.jpg", "we-run-uma": "we-run-uma.jpg", "carrera-popular-ruta-carlos-iii-ciudad-del-sol": "carrera-popular-ruta-carlos-iii-ciudad-del-sol.jpg", "carrera-solidaria-de-navidad-de-algeciras": "carrera-solidaria-de-navidad-de-algeciras.jpg", "carrera-navidena-de-bellavista": "carrera-navidena-de-bellavista.jpg", "carrera-de-fondo-peligros-suena": "carrera-de-fondo-peligros-suena.jpg", "carrera-de-fondo-villa-de-cajar": "carrera-de-fondo-villa-de-cajar.jpg", "san-roque-corre-contra-la-violencia-de-genero": "san-roque-corre-contra-la-violencia-de-genero.jpg", "carrera-solidaria-inmaculada-alcaldesa-perpetua": "carrera-solidaria-inmaculada-alcaldesa-perpetua.jpg", "san-silvestre-tarifena": "san-silvestre-tarifena.jpg", "media-maraton-costa-de-la-luz": "media-maraton-costa-de-la-luz.jpg", "eco-maraton-de-montana-la-donaira": "eco-maraton-de-montana-la-donaira.jpg", "carrera-cruz-roja-granada": "carrera-cruz-roja-granada.jpg", "carrera-de-navidad-de-cartama": "carrera-de-navidad-de-cartama.jpg", "trail-cruz-del-valle": "trail-cruz-del-valle.jpg", "media-maraton-ciudad-de-roquetas": "media-maraton-ciudad-de-roquetas.jpg", "carrera-infantil-benefica-bomberos-de-jerez": "carrera-infantil-benefica-bomberos-de-jerez.jpg", "carrera-del-estrecho-memorial-pepe-serrano": "carrera-del-estrecho-memorial-pepe-serrano.jpg", "prueba-de-fondo-villa-romana-de-salar": "prueba-de-fondo-villa-romana-de-salar.jpg", "carrera-popular-de-torreperogil": "carrera-popular-de-torreperogil.jpg", "carrera-popular-de-navidad-villa-de-rota": "carrera-popular-de-navidad-villa-de-rota.jpg", "cross-pinar-del-rey": "cross-pinar-del-rey.jpg", "fungo-race": "fungo-race.jpg", "media-maraton-ciudad-de-lucena": "media-maraton-ciudad-de-lucena.jpg", "fungo-hybrid-race": "fungo-hybrid-race.jpg", "carrera-popular-ciudad-de-jerez": "carrera-popular-ciudad-de-jerez.jpg", "carrera-popular-puerto-menesteo": "carrera-popular-puerto-menesteo.jpg", "media-maraton-y-10k-el-puerto": "media-maraton-y-10k-el-puerto.jpg", "media-maraton-internacional-de-torremolinos": "media-maraton-internacional-de-torremolinos.jpg", "montesierra-trail-la-teja": "montesierra-trail-la-teja.jpg"}

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
