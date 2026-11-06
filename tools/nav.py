"""Barra de navegación común (para las páginas generadas)."""


def nav(rel, cur=""):
    items = [("Calendario", f"{rel or './'}#calendario", "", ""), ("Clasificaciones", f"{rel}clasificaciones/", "", "clas"),
             ("Andalucía", f"{rel or './'}#andalucia", "", "and"), ("San Silvestre", f"{rel}san-silvestre-2026/", "opt", "ss"), ("Ritmo", f"{rel or './'}#calc", "opt", "")]
    h = '<nav class="rv-nav" aria-label="Secciones">'
    for lab, href, cls, key in items:
        c = ' class="opt"' if cls else ""
        a = ' aria-current="page"' if key and key == cur else ""
        h += f'<a{c} href="{href}"{a}>{lab}</a>'
    h += f'<a class="app" href="{rel}app/">App</a>'
    return h + "</nav>"
