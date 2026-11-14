"""Carreras de Andalucía (fuera de Cádiz, que va en build_cadiz.py).

Una lista por provincia. Campos: n (nombre), c (municipio), d (fecha AAAA-MM-DD), k (21K, 10K, POP, SS),
dist, ok (fecha confirmada en fuente oficial), h (hora), t (nota), w (web oficial).
Si ok es False, la fecha sale de calendarios de carreras (ClubRunning, Sportplan) y se muestra «Por confirmar».
Revisado: 6 de noviembre de 2026.
"""

CAL = "Fecha según los calendarios de carreras de la provincia. Confírmala en la web oficial antes de inscribirte."
ELEC = " El 29 de noviembre hay elecciones generales y varias carreras de ese día se han aplazado: comprueba la fecha."

SEVILLA = [
    dict(n="Gran Prix Solidario Kambia", c="Sevilla", d="2026-11-21", k="10K", dist="10 y 5 km", ok=False, t="5.ª edición, en el Parque del Alamillo, a beneficio de la Fundación Kambia. " + CAL),
    dict(n="San Silvestre de Fuentes", c="Fuentes de Andalucía", d="2026-12-26", k="SS", dist="5,5 km", ok=False, t="Por la tarde. " + CAL),
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
    dict(n="Carrera Popular Los Chamuscaos", c="Fuentes de Andalucía", d="2026-11-15", k="POP", dist="16 km", ok=True, h="10:00", t="30.ª edición. Une dos pueblos: sale de Fuentes de Andalucía y llega a La Campana, 16 km en total."),
    dict(n="Carrera Popular Los Molinos", c="Alcalá de Guadaíra", d="2026-11-15", k="POP", dist="Popular", ok=False, t=CAL),
    dict(n="Carrera Fran Castillo", c="Villanueva del Ariscal", d="2026-11-15", k="POP", dist="Popular", ok=False, t=CAL),
    dict(n="Memorial Miguel Ángel Gómez Campuzano", c="Mairena del Alcor", d="2026-11-15", k="POP", dist="Popular", ok=False, t=CAL),
    dict(n="Ruta 091 Écija", c="Écija", d="2026-11-22", k="POP", dist="Solidaria", ok=False, w="https://ruta091.es", t="Carrera solidaria de la Policía Nacional. " + CAL),
    dict(n="Carrera Popular de Santiponce", c="Santiponce", d="2026-11-29", k="POP", dist="Popular", ok=False, t=CAL + ELEC),
    dict(n="Media Maratón Entreparques", c="La Rinconada", d="2027-01-24", k="21K", dist="21,1 km", ok=True, w="https://inscripciones.tecnocrono.com/inscripcion/viii-media-maraton-entreparques-la-rinconada/", h="10:00",
         t="Los calendarios no coinciden en el día (29 de noviembre o 1 de diciembre). " + CAL + ELEC),
    dict(n="Carrera Nocturna de Camas", c="Camas", d="2026-12-04", k="POP", dist="Nocturna", ok=False, t="9.ª edición. " + CAL),
    dict(n="Carrera Villa de Villaverde", c="Villaverde del Río", d="2026-12-05", k="POP", dist="Popular", ok=False, t=CAL),
    dict(n="Media Maratón Sevilla-Los Palacios", c="Los Palacios y Villafranca", d="2026-12-20", k="21K", dist="21,1 km", ok=True, w="https://mediamaratonlospalacios.com", h="11:00",
         t="43.ª edición, una de las medias más veteranas de Andalucía. Los calendarios no coinciden en el día (13 o 20 de diciembre). " + CAL),
    dict(n="Carrera de Papá Noel de Sevilla", c="Sevilla", d="2026-12-20", k="POP", dist="Navideña", ok=False, t=CAL),
    dict(n="Carrera Navideña de Bellavista", c="Sevilla", d="2026-12-27", k="POP", dist="Navideña", ok=False, t=CAL),
    dict(n="La San Silvestre más Bestia", c="Los Palacios y Villafranca", d="2026-12-27", k="SS", dist="San Silvestre", ok=False, t=CAL),
    dict(n="San Silvestre de Espartinas", c="Espartinas", d="2026-12-27", k="SS", dist="San Silvestre", ok=False, t=CAL),
    dict(n="San Silvestre de Paradas", c="Paradas", d="2026-12-27", k="SS", dist="San Silvestre", ok=False, t=CAL),
    dict(n="Carrera Popular Clásica de Castilblanco", c="Castilblanco de los Arroyos", d="2026-12-29", k="POP", dist="Popular", ok=False, t=CAL),
    dict(n="Carrera Popular Isla Redonda", c="Isla Redonda-La Aceñuela", d="2026-12-06", k="POP", dist="Popular", ok=False, t="Pedanía de Écija. " + CAL),
    dict(n="San Silvestre Herrereña", c="Herrera", d="2026-12-27", k="SS", dist="San Silvestre", ok=False, t=CAL),
    dict(n="Carrera Popular de Reyes de Peñaflor", c="Peñaflor", d="2027-01-03", k="POP", dist="Popular", ok=False, t=CAL),
    dict(n="Carrera Popular Ruta Carlos III Ciudad del Sol", c="Écija", d="2027-01-17", k="POP", dist="Popular", ok=False, t="34.ª edición. " + CAL),
]

MALAGA = [
    dict(n="San Silvestre Arriatena", c="Arriate", d="2026-12-27", k="SS", dist="San Silvestre", ok=False, t=CAL),
    dict(n="Gran Vuelta del Valle del Genal", c="Parauta", d="2026-11-14", k="TR", dist="Ultra · Relevos", ok=True, t="13.ª edición. La ultra y los relevos se corren el 14 y 15 de noviembre con salida en Parauta, por los pueblos del Valle del Genal. El Trail Genal ya se corrió el 7 de noviembre en Benalauría. Con la Diputación de Málaga (Málaga Compite)."),
    dict(n="Carrera Popular Villa de Árchez", c="Árchez", d="2026-11-08", k="POP", dist="Popular", ok=False, t=CAL),
    dict(n="Carrera Solidaria Ruta 091 Estepona", c="Estepona", d="2026-11-08", k="POP", dist="Solidaria", ok=False, t="Carrera solidaria de la Policía Nacional. " + CAL),
    dict(n="Media Maratón Ciudad de Fuengirola", c="Fuengirola", d="2026-11-08", k="21K", dist="21,1 km", ok=False, t="9.ª edición. " + CAL),
    dict(n="Carrera de la Prensa de Málaga", c="Málaga", d="2026-11-15", k="POP", dist="7 km", ok=True, h="8:30", t="9.ª edición. " + CAL),
    dict(n="Marea Rosa Marbella", c="Marbella", d="2026-11-15", k="POP", dist="Solidaria", ok=False, t="Carrera solidaria contra el cáncer de mama. " + CAL),
    dict(n="Carrera Urbana Vélez-Málaga", c="Vélez-Málaga", d="2026-11-22", k="POP", dist="10 y 5 km", ok=False, w="https://www.atletismovelez.es", t="43.ª edición, junto a la Caminata de la Esperanza. " + CAL),
    dict(n="We Run UMA", c="Málaga", d="2026-11-22", k="POP", dist="Popular", ok=False, w="https://www.uma.es/uma-deportes/", t="Carrera de la Universidad de Málaga. " + CAL),
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
    dict(n="San Silvestre de Vélez-Málaga", c="Vélez-Málaga", d="2026-12-26", k="SS", dist="5 km", ok=False, w="https://www.atletismovelez.es", t=CAL),
    dict(n="San Silvestre Archidonesa", c="Archidona", d="2026-12-27", k="SS", dist="San Silvestre", ok=False, t=CAL),
    dict(n="San Silvestre de Villanueva del Rosario", c="Villanueva del Rosario", d="2026-12-27", k="SS", dist="San Silvestre", ok=False, t=CAL),
    dict(n="San Silvestre de Rincón de la Victoria", c="Rincón de la Victoria", d="2026-12-27", k="SS", dist="San Silvestre", ok=False, t=CAL),
    dict(n="San Silvestre Competeña", c="Cómpeta", d="2026-12-27", k="SS", dist="8,5 km", ok=True, h="12:15", t=CAL),
    dict(n="San Silvestre Real Club Mediterráneo", c="Málaga", d="2026-12-30", k="SS", dist="San Silvestre", ok=False, t="8.ª edición, solidaria. " + CAL),
    dict(n="San Silvestre de Torremolinos", c="Torremolinos", d="2026-12-30", k="SS", dist="San Silvestre", ok=False, t=CAL),
    dict(n="San Silvestre Antequerana", c="Antequera", d="2026-12-31", k="SS", dist="San Silvestre", ok=False, t=CAL),
]

GRANADA = [
    dict(n="Carrera de Reyes de Trasmulas", c="Pinos Puente", d="2027-01-03", k="POP", dist="6 km", ok=False, t="En Trasmulas (Pinos Puente). " + CAL),
    dict(n="Castillo Trail La Calahorra", c="La Calahorra", d="2026-11-15", k="TR", dist="24 km · 15 km · 12 km", ok=True, w="https://nortedelsur.es/trail-lacalahorra", t="8.ª edición de esta carrera por montaña junto al castillo de La Calahorra. Trail de 24 km (+850 m), minitrail de 15 km (+350 m), ruta de senderismo de 12 km y trail infantil. Organizan el Ayuntamiento de La Calahorra, Norte del Sur y el Club de Atletismo La Calahorra."),
    dict(n="Carrera Urbana Universidad Ciudad de Granada", c="Granada", d="2026-11-08", k="POP", dist="Urbana", ok=True,
         t="12.ª edición, organizada por la Universidad de Granada y el Ayuntamiento. Fecha según el Centro de Actividades Deportivas de la UGR.",
         w="https://deportes.ugr.es"),
    dict(n="Carrera Solidaria Ponte en Marcha Ya", c="Lecrín", d="2026-11-08", k="POP", dist="Solidaria", ok=False, t="10.ª edición. " + CAL),
    dict(n="Carrera Universitaria San Alberto Magno", c="Granada", d="2026-11-12", k="POP", dist="Popular", ok=False, t="22.ª edición, entre semana. " + CAL),
    dict(n="Carrera de Fondo Villa de Cájar", c="Cájar", d="2026-11-15", k="POP", dist="Fondo", ok=False, w="https://www.global-tempo.com/carreras.php?id=3305", h="10:00", t="34.ª edición. " + CAL),
    dict(n="Carrera Cruz Roja Granada", c="Granada", d="2026-11-15", k="POP", dist="Solidaria", ok=False, t=CAL),
    dict(n="Prueba de Fondo Villa Romana de Salar", c="Salar", d="2026-11-15", k="POP", dist="Fondo", ok=False, t="15.ª edición. " + CAL),
    dict(n="Carrera de Fondo Peligros Suena", c="Peligros", d="2026-11-22", k="POP", dist="10 km", ok=False, w="https://www.global-tempo.com/carreras.php?id=3299", h="11:00", t="10.ª edición. " + CAL),
    dict(n="Subida a la Cruz de la Atalaya", c="Padul", d="2026-11-22", k="POP", dist="Subida", ok=False, t="13.ª edición. " + CAL),
    dict(n="San Silvestre de Armilla", c="Armilla", d="2026-12-12", k="SS", dist="3 km", ok=False, w="https://www.global-tempo.com/carreras.php?id=3319", h="19:00", t=CAL),
    dict(n="Carrera Nocturna de Granada", c="Granada", d="2026-12-18", k="POP", dist="Nocturna", ok=False, t=CAL),
    dict(n="Carrera Solidaria de Albolote", c="Albolote", d="2026-12-19", k="POP", dist="Solidaria", ok=False, t=CAL),
    dict(n="San Silvestre de Atarfe", c="Atarfe", d="2026-12-20", k="SS", dist="San Silvestre", ok=False, t=CAL),
    dict(n="San Silvestre de Pulianas", c="Pulianas", d="2026-12-20", k="SS", dist="San Silvestre", ok=False, t=CAL),
    dict(n="Carrera Nocturna de Las Gabias", c="Las Gabias", d="2026-12-30", k="POP", dist="Nocturna", ok=True, w="https://www.global-tempo.com/carreras.php?id=3322", h="18:30", t=CAL),
    dict(n="San Silvestre Otureña", c="Otura", d="2026-12-25", k="SS", dist="San Silvestre", ok=False, t=CAL),
    dict(n="San Silvestre de Dúrcal", c="Dúrcal", d="2026-12-26", k="SS", dist="San Silvestre", ok=False, t=CAL),
    dict(n="Carrera Navideña de Escúzar", c="Escúzar", d="2026-12-27", k="POP", dist="6 km", ok=False, w="https://www.global-tempo.com/carreras.php?id=3314", h="11:00", t=CAL),
    dict(n="San Silvestre Cañonera", c="Lanjarón", d="2026-12-27", k="SS", dist="San Silvestre", ok=False, t=CAL),
    dict(n="San Silvestre Vegas del Genil", c="Belicena", d="2026-12-30", k="SS", dist="San Silvestre", ok=False, t="En Belicena (Vegas del Genil). " + CAL),
]

CORDOBA = [
    dict(n="Carrera Popular de Torrecampo", c="Torrecampo", d="2026-11-14", k="POP", dist="4 km", ok=True, t="17.ª edición, del Circuito Provincial de Carreras Populares de la Diputación de Córdoba."),
    dict(n="SP Running Series AJE Córdoba", c="Córdoba", d="2026-11-15", k="10K", dist="10 km", ok=True, t="Del Circuito Provincial de la Diputación de Córdoba.", w="https://ajeandalucia.org"),
    dict(n="Carrera El Kilo de Benamejí", c="Benamejí", d="2026-11-28", k="POP", dist="7 km", ok=True, t="14.ª edición, del Circuito Provincial de la Diputación de Córdoba."),
    dict(n="Carrera Popular Rute en Navidad", c="Rute", d="2026-12-07", k="POP", dist="5,5 km", ok=True, t="16.ª edición, del Circuito Provincial de la Diputación de Córdoba. Inscripción en la FAA."),
    dict(n="Epora Trail Montoro", c="Montoro", d="2026-11-15", k="TR", dist="23 km · 14 km · 13 km", ok=True, w="https://www.eporatrail.com", t="6.ª edición de esta carrera por montaña en Montoro. Trail largo de 23 km (+1.000 m), trail corto de 14 km (+400 m) y ruta de senderismo de 13 km."),
    dict(n="Carrera Popular de Otoño de Nueva Carteya", c="Nueva Carteya", d="2026-11-07", k="POP", dist="Popular", ok=False, t=CAL),
    dict(n="Carrera Solidaria Ruta 091 Córdoba", c="Córdoba", d="2026-11-21", k="POP", dist="6,3 km", ok=True, w="https://ruta091.es", h="10:30",
         t="Carrera solidaria de la Policía Nacional. Los calendarios no coinciden en el día (21 o 22 de noviembre). " + CAL),
    dict(n="Carrera El Cerebro no es Gris", c="Córdoba", d="2026-11-22", k="POP", dist="Solidaria", ok=False, t="3.ª edición. " + CAL),
    dict(n="Carrera Popular Cañada Real Soriana", c="Villarrubia", d="2026-11-22", k="POP", dist="11 km", ok=True, t="En Villarrubia (Córdoba). " + CAL),
    dict(n="Carrera Popular de Palma del Río", c="Palma del Río", d="2026-12-06", k="POP", dist="10 km", ok=True, t=CAL),
    dict(n="Milla de Montilla", c="Montilla", d="2026-12-07", k="POP", dist="1 milla", ok=False, t=CAL),
    dict(n="San Silvestre Aguilarense", c="Aguilar de la Frontera", d="2026-12-31", k="SS", dist="San Silvestre", ok=False, t=CAL),
    dict(n="San Silvestre de Posadas", c="Posadas", d="2026-12-31", k="SS", dist="San Silvestre", ok=False, t=CAL),
    dict(n="Carrera Popular Día de Reyes de Santaella", c="Santaella", d="2027-01-03", k="POP", dist="Popular", ok=False, t=CAL),
    dict(n="Media Maratón Ciudad de Lucena", c="Lucena", d="2027-03-14", k="21K", dist="21,1 km", ok=False, t="13.ª edición. " + CAL),
]

HUELVA = [
    dict(n="Carrera de Empresas Huelva24", c="Huelva", d="2026-11-22", k="POP", dist="7,5 km", ok=True, h="10:00", t="Primera edición, en el Parque Moret, organizada por ABC y Huelva24 con el Ayuntamiento. Se puede correr solo o en equipos de tres."),
    dict(n="Carrera Popular de San Silvestre de Guzmán", c="San Silvestre de Guzmán", d="2026-12-27", k="POP", dist="Popular", ok=True, t="Del Circuito de Carreras de la Diputación de Huelva. El nombre es el del pueblo: no es una San Silvestre de fin de año."),
    dict(n="Carrera Solidaria por la Diabetes de Corrales", c="Corrales", d="2026-11-15", k="POP", dist="Running, caminata, marcha nórdica y mascotas", ok=True, h="11:00", w="https://www.croniussport.es", t="5.ª edición, en la plaza Rutherford de Corrales (Aljaraque). Organiza Dulces Unidos con el Ayuntamiento de Aljaraque, a beneficio de la Fundación DiabetesCERO. Dorsal con camiseta 8 €, pañuelo para mascotas 5 € y dorsal 0. Inscripción en Cronius Sport o en la tienda Ibhola Trail Running de Corrales."),
    dict(n="X Millas Guadiana", c="Ayamonte", d="2026-11-08", k="POP", dist="10 millas", ok=False, t=CAL),
    dict(n="Carrera de Bonares Memorial Manolo Márquez", c="Bonares", d="2026-11-15", k="POP", dist="Popular", ok=False, t=CAL),
    dict(n="Carrera Popular del Pavo de Ayamonte", c="Ayamonte", d="2026-12-13", k="POP", dist="Navideña", ok=False, t=CAL),
    dict(n="Carrera Fin de Año de Moguer", c="Moguer", d="2026-12-19", k="POP", dist="Navideña", ok=True, t=CAL),
    dict(n="Carrera Popular de Villanueva de los Castillejos", c="Villanueva de los Castillejos", d="2027-01-03", k="POP", dist="6 km", ok=True, t=CAL),
    dict(n="San Silvestre de Huelva", c="Huelva", d="2026-12-30", k="SS", dist="San Silvestre", ok=False, w="https://www.onupolis.es/", t=CAL),
]

ALMERIA = [
    dict(n="Carrera de Navidad de Vera", c="Vera", d="2026-12-12", k="10K", dist="3 y 10 km", ok=False, t="13.ª edición. " + CAL),
    dict(n="San Silvestre de Huércal-Overa", c="Huércal-Overa", d="2026-12-26", k="SS", dist="9 km", ok=False, t="38.ª edición. " + CAL),
    dict(n="Carrera Solidaria Todos con Martín", c="Albox", d="2027-01-17", k="POP", dist="10 km", ok=False, t="Con ruta de senderismo el mismo día. " + CAL),
    dict(n="Media Maratón Ciudad de Roquetas", c="Roquetas de Mar", d="2026-11-22", k="21K", dist="21,1 km", ok=False, t=CAL),
    dict(n="Carrera Cortijo del Fraile", c="Níjar", d="2026-12-13", k="POP", dist="Popular", ok=False, t=CAL + ELEC),
    dict(n="Carrera Popular de Albánchez", c="Albánchez", d="2026-12-13", k="POP", dist="Popular", ok=False, t=CAL + ELEC),
    dict(n="San Silvestre de Almería", c="Almería", d="2026-12-27", k="SS", dist="San Silvestre", ok=False, t=CAL),
    dict(n="San Silvestre de El Ejido", c="El Ejido", d="2026-12-27", k="SS", dist="San Silvestre", ok=True, t=CAL),
]

JAEN = [
    dict(n="Carrera Fundación José Luis Martín López", c="Linares", d="2026-11-22", k="POP", dist="Solidaria", ok=False, t=CAL),
    dict(n="Carrera a los Puentes", c="Jaén", d="2026-12-17", k="POP", dist="Popular", ok=False, t=CAL),
    dict(n="Carrera Ibero Navideña", c="Ibros", d="2026-12-22", k="POP", dist="Navideña", ok=False, t=CAL),
    dict(n="Carrera Popular de Torreperogil", c="Torreperogil", d="2026-12-26", k="POP", dist="Popular", ok=False, t=CAL),
    dict(n="San Silvestre de Bailén", c="Bailén", d="2026-12-26", k="SS", dist="San Silvestre", ok=False, t=CAL),
    dict(n="Subida al Castillo de Santa Catalina", c="Jaén", d="2026-12-31", k="POP", dist="Subida", ok=False, t="Subida popular de fin de año al castillo. " + CAL),
    dict(n="Legua Urbana Nocturna La Bellota", c="Baños de la Encina", d="2027-01-09", k="POP", dist="1 legua", ok=False, t=CAL),
    dict(n="San Silvestre Alcalá Pro Cáritas", c="Alcalá la Real", d="2026-12-26", k="SS", dist="San Silvestre", ok=False, t="Solidaria a favor de Cáritas. " + CAL),
]

import pathlib as _pl, sys as _sys
_sys.path.insert(0, str(_pl.Path(__file__).resolve().parent))
from poster import confirma as _confirma  # noqa: E402
for _l in (SEVILLA, MALAGA, GRANADA, CORDOBA, JAEN, HUELVA, ALMERIA):
    _confirma(_l, CAL)

PROVINCIAS = {"Sevilla": SEVILLA, "Málaga": MALAGA, "Granada": GRANADA, "Córdoba": CORDOBA, "Jaén": JAEN, "Huelva": HUELVA, "Almería": ALMERIA}
