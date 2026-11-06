"""Carreras de Andalucía (fuera de Cádiz, que va en build_cadiz.py).

Una lista por provincia. Campos: n (nombre), c (municipio), d (fecha AAAA-MM-DD), k (21K, 10K, POP, SS),
dist, ok (fecha confirmada en fuente oficial), h (hora), t (nota), w (web oficial).
Si ok es False, la fecha sale de calendarios de carreras (ClubRunning, Sportplan) y se muestra «Por confirmar».
Revisado: 6 de noviembre de 2026.
"""

CAL = "Fecha según los calendarios de carreras de la provincia. Confírmala en la web oficial antes de inscribirte."

SEVILLA = [
    dict(n="Carrera Solidaria Guerreros Spatanos", c="Sevilla", d="2026-11-07", k="POP", dist="Solidaria", ok=True, h="10:30",
         t="Primera edición, en el Parque del Alamillo. Fecha y hora según la agenda del Instituto Municipal de Deportes de Sevilla."),
    dict(n="Carrera Popular Corre por la Esclerosis Múltiple", c="Sevilla", d="2026-11-08", k="POP", dist="Solidaria", ok=True, h="10:30",
         t="13.ª edición. Fecha y hora según la agenda del Instituto Municipal de Deportes de Sevilla."),
    dict(n="Coria en Marcha contra el Cáncer", c="Coria del Río", d="2026-11-08", k="POP", dist="Solidaria", ok=False, t=CAL),
    dict(n="Carrera por la Diabetes de Sevilla", c="Sevilla", d="2026-11-14", k="POP", dist="Solidaria", ok=False, t=CAL),
    dict(n="Carrera de la Mujer de Sevilla", c="Sevilla", d="2026-11-15", k="POP", dist="6,4 km", ok=True, h="10:00",
         t="Carrera de la Mujer Central Lechera Asturiana, solo para mujeres. Fecha según la agenda del Instituto Municipal de Deportes de Sevilla.",
         w="https://www.carreradelamujer.com"),
    dict(n="Carrera Urbana Rafael del Riego", c="Las Cabezas de San Juan", d="2026-11-15", k="POP", dist="Urbana", ok=False, t="38.ª edición. " + CAL),
    dict(n="Carrera Popular Los Chamuscaos", c="Fuentes de Andalucía", d="2026-11-15", k="POP", dist="Popular", ok=False, t="30.ª edición. " + CAL),
    dict(n="Carrera Popular Los Molinos", c="Alcalá de Guadaíra", d="2026-11-15", k="POP", dist="Popular", ok=False, t=CAL),
    dict(n="Carrera Fran Castillo", c="Villanueva del Ariscal", d="2026-11-15", k="POP", dist="Popular", ok=False, t=CAL),
    dict(n="Memorial Miguel Ángel Gómez Campuzano", c="Mairena del Alcor", d="2026-11-15", k="POP", dist="Popular", ok=False, t=CAL),
    dict(n="La Pretoriana", c="Tomares", d="2026-11-21", k="POP", dist="Popular", ok=False, t=CAL),
    dict(n="Ruta 091 Écija", c="Écija", d="2026-11-22", k="POP", dist="Solidaria", ok=False, t="Carrera solidaria de la Policía Nacional. " + CAL),
    dict(n="Carrera Popular de Santiponce", c="Santiponce", d="2026-11-29", k="POP", dist="Popular", ok=False, t=CAL),
    dict(n="Media Maratón Entreparques", c="La Rinconada", d="2026-11-29", k="21K", dist="21,1 km", ok=False,
         t="Los calendarios no coinciden en el día (29 de noviembre o 1 de diciembre). " + CAL),
    dict(n="Carrera Nocturna de Camas", c="Camas", d="2026-12-04", k="POP", dist="Nocturna", ok=False, t="9.ª edición. " + CAL),
    dict(n="Carrera Villa de Villaverde", c="Villaverde del Río", d="2026-12-05", k="POP", dist="Popular", ok=False, t=CAL),
    dict(n="Media Maratón Sevilla-Los Palacios", c="Los Palacios y Villafranca", d="2026-12-20", k="21K", dist="21,1 km", ok=False,
         t="43.ª edición, una de las medias más veteranas de Andalucía. Los calendarios no coinciden en el día (13 o 20 de diciembre). " + CAL),
    dict(n="Carrera de Papá Noel de Sevilla", c="Sevilla", d="2026-12-20", k="POP", dist="Navideña", ok=False, t=CAL),
    dict(n="Carrera Navideña de Bellavista", c="Sevilla", d="2026-12-27", k="POP", dist="Navideña", ok=False, t=CAL),
    dict(n="La San Silvestre más Bestia", c="Los Palacios y Villafranca", d="2026-12-27", k="SS", dist="San Silvestre", ok=False, t=CAL),
    dict(n="San Silvestre de Espartinas", c="Espartinas", d="2026-12-27", k="SS", dist="San Silvestre", ok=False, t=CAL),
    dict(n="San Silvestre de Paradas", c="Paradas", d="2026-12-27", k="SS", dist="San Silvestre", ok=False, t=CAL),
    dict(n="Carrera Popular Clásica de Castilblanco", c="Castilblanco de los Arroyos", d="2026-12-29", k="POP", dist="Popular", ok=False, t=CAL),
    dict(n="Carrera Popular Ruta Carlos III Ciudad del Sol", c="Écija", d="2027-01-17", k="POP", dist="Popular", ok=False, t="34.ª edición. " + CAL),
]

MALAGA = [
    dict(n="Carrera Popular Villa de Árchez", c="Árchez", d="2026-11-08", k="POP", dist="Popular", ok=False, t=CAL),
    dict(n="Carrera Solidaria Ruta 091 Estepona", c="Estepona", d="2026-11-08", k="POP", dist="Solidaria", ok=False, t="Carrera solidaria de la Policía Nacional. " + CAL),
    dict(n="Media Maratón Ciudad de Fuengirola", c="Fuengirola", d="2026-11-08", k="21K", dist="21,1 km", ok=False, t="9.ª edición. " + CAL),
    dict(n="Carrera de la Prensa de Málaga", c="Málaga", d="2026-11-15", k="POP", dist="Popular", ok=False, t="9.ª edición. " + CAL),
    dict(n="Marea Rosa Marbella", c="Marbella", d="2026-11-15", k="POP", dist="Solidaria", ok=False, t="Carrera solidaria contra el cáncer de mama. " + CAL),
    dict(n="Carrera Urbana Vélez-Málaga", c="Vélez-Málaga", d="2026-11-22", k="POP", dist="Urbana", ok=False, t="43.ª edición, junto a la Caminata de la Esperanza. " + CAL),
    dict(n="We Run UMA", c="Málaga", d="2026-11-22", k="POP", dist="Popular", ok=False, t="Carrera de la Universidad de Málaga. " + CAL),
    dict(n="Carrera Fuengirola contra la Violencia Machista", c="Fuengirola", d="2026-11-22", k="POP", dist="Solidaria", ok=False, t=CAL),
    dict(n="Medio Maratón Holiday World Benalmádena", c="Benalmádena", d="2026-11-22", k="21K", dist="21,1 km", ok=False,
         t="8.ª edición, a favor de Proyecto Hombre, con carrera corta el mismo día. " + CAL),
    dict(n="Carrera Solidaria de Guaro", c="Guaro", d="2026-12-05", k="POP", dist="Solidaria", ok=False, t=CAL),
    dict(n="Carrera Urbana del Pavo de Benalmádena", c="Benalmádena", d="2026-12-13", k="POP", dist="Navideña", ok=False, t=CAL),
    dict(n="Carrera Villa de Nescania", c="Valle de Abdalajís", d="2026-12-19", k="POP", dist="Popular", ok=False, t=CAL),
    dict(n="Milla de Navidad de Nerja", c="Nerja", d="2026-12-19", k="POP", dist="1 milla", ok=False, t=CAL),
    dict(n="Carrera de Navidad de Cártama", c="Cártama", d="2026-12-20", k="10K", dist="10 km", ok=False, t="En Cártama Estación. " + CAL),
    dict(n="Carrera de Navidad de Fuengirola", c="Fuengirola", d="2026-12-20", k="POP", dist="Navideña", ok=False, t=CAL),
    dict(n="San Silvestre de Benamargosa", c="Benamargosa", d="2026-12-20", k="SS", dist="San Silvestre", ok=False, t=CAL),
    dict(n="San Silvestre de Comares", c="Comares", d="2026-12-26", k="SS", dist="San Silvestre", ok=False, t=CAL),
    dict(n="San Silvestre Ojén en Navidad", c="Ojén", d="2026-12-26", k="SS", dist="San Silvestre", ok=False, t=CAL),
    dict(n="San Silvestre de Vélez-Málaga", c="Vélez-Málaga", d="2026-12-26", k="SS", dist="San Silvestre", ok=False, t=CAL),
    dict(n="San Silvestre Archidonesa", c="Archidona", d="2026-12-27", k="SS", dist="San Silvestre", ok=False, t=CAL),
    dict(n="San Silvestre de Villanueva del Rosario", c="Villanueva del Rosario", d="2026-12-27", k="SS", dist="San Silvestre", ok=False, t=CAL),
    dict(n="San Silvestre de Rincón de la Victoria", c="Rincón de la Victoria", d="2026-12-27", k="SS", dist="San Silvestre", ok=False, t=CAL),
    dict(n="San Silvestre Competeña", c="Cómpeta", d="2026-12-28", k="SS", dist="San Silvestre", ok=False, t=CAL),
    dict(n="San Silvestre Real Club Mediterráneo", c="Málaga", d="2026-12-30", k="SS", dist="San Silvestre", ok=False, t="8.ª edición, solidaria. " + CAL),
    dict(n="San Silvestre de Torremolinos", c="Torremolinos", d="2026-12-30", k="SS", dist="San Silvestre", ok=False, t=CAL),
    dict(n="San Silvestre Antequerana", c="Antequera", d="2026-12-31", k="SS", dist="San Silvestre", ok=False, t=CAL),
]

PROVINCIAS = {"Sevilla": SEVILLA, "Málaga": MALAGA}
