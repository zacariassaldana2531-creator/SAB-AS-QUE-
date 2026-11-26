/* ¿SABÍAS QUE? — Base de contenido v1
 * Tipos: "articulo" | "curiosidad" | "mito"  (preguntas en QUESTIONS)
 * Estado: "publicado" | "borrador"
 * Nivel: 1 = básico, 2 = intermedio, 3 = avanzado
 * Este archivo lo puede regenerar el panel admin (admin.html → Exportar).
 */
window.SQ_CONTENT = {
version: 1,
updated: "2026-11-25",

categories: [
  { id: "ciencia",    name: "Ciencia",         icon: "⚗️", color: "#7c6cff", desc: "Química, física y fenómenos de la naturaleza." },
  { id: "historia",   name: "Historia",        icon: "🏛️", color: "#c8a46a", desc: "Lo que pasó y casi nadie te contó." },
  { id: "psicologia", name: "Psicología",      icon: "🧠", color: "#e07aa8", desc: "Cómo piensa, decide y se engaña la mente." },
  { id: "universo",   name: "Universo",        icon: "🪐", color: "#5b8cff", desc: "Planetas, estrellas y la escala del cosmos." },
  { id: "tecnologia", name: "Tecnología",      icon: "💡", color: "#4cc9d8", desc: "Inventos, internet y la historia digital." },
  { id: "cuerpo",     name: "Cuerpo humano",   icon: "🫀", color: "#ff7a6b", desc: "La máquina que llevas puesta." },
  { id: "geografia",  name: "Geografía",       icon: "🌎", color: "#4fbf8f", desc: "Países, extremos y formas del planeta." },
  { id: "animales",   name: "Animales",        icon: "🐙", color: "#8fcf5a", desc: "Las rarezas del reino animal." },
  { id: "filosofia",  name: "Filosofía",       icon: "🏺", color: "#b89cff", desc: "Las preguntas que llevan siglos sin cerrarse." },
  { id: "misterios",  name: "Misterios",       icon: "🔍", color: "#9aa3b8", desc: "Enigmas reales que siguen abiertos." },
  { id: "economia",   name: "Economía",        icon: "📈", color: "#f2b84b", desc: "El dinero, los precios y sus historias." },
  { id: "religion",   name: "Religión",        icon: "📜", color: "#d9a679", desc: "Historia de las creencias y sus textos." },
  { id: "cultura",    name: "Cultura general", icon: "🎭", color: "#ef8a5c", desc: "Idioma, tradiciones y República Dominicana." }
],

items: [
/* ======================= ARTÍCULOS ======================= */
{
  id: "a-rayo-sol", type: "articulo", status: "publicado", date: "2026-11-24", level: 1,
  cat: "ciencia", sub: "Fenómenos naturales",
  title: "Un rayo está cinco veces más caliente que la superficie del Sol",
  subtitle: "Durante menos de un segundo, el aire alcanza una temperatura que ninguna estrella tiene en su superficie.",
  desc: "El canal de un rayo puede llegar a unos 27.700 °C. La superficie del Sol ronda los 5.500 °C.",
  intro: "Pensamos en el Sol como lo más caliente que conocemos. Pero cada tormenta produce, durante una fracción de segundo, algo mucho más caliente que su superficie: el aire por donde pasa un rayo.",
  sections: [
    { h: "Cuánto calienta un rayo", p: [
      "Según el Servicio Meteorológico Nacional de Estados Unidos (NOAA), un rayo puede calentar el aire que lo rodea hasta unos 27.700 °C (50.000 °F).",
      "La fotosfera, la capa visible del Sol, está a unos 5.500 °C. Por eso se dice que un rayo es unas cinco veces más caliente que la superficie solar. El núcleo del Sol sí es muchísimo más caliente: unos 15 millones de grados."
    ]},
    { h: "Por qué suena el trueno", p: [
      "Ese calentamiento es tan repentino que el aire se expande de golpe, como una explosión. Esa expansión crea una onda de choque que viaja por el aire: eso es el trueno.",
      "Vemos el relámpago antes de oír el trueno porque la luz viaja casi un millón de veces más rápido que el sonido."
    ]},
    { h: "Cómo calcular a qué distancia está la tormenta", p: [
      "El sonido recorre aproximadamente un kilómetro cada 3 segundos. Cuenta los segundos entre el destello y el trueno y divide entre 3: ese es, aproximadamente, la distancia en kilómetros.",
      "Ejemplo: si cuentas 9 segundos, la tormenta está a unos 3 km. Si oyes el trueno, estás lo bastante cerca como para que te alcance un rayo: lo recomendable es buscar refugio."
    ]}
  ],
  facts: [
    "Un rayo puede estar formado por varias descargas sucesivas por el mismo canal, por eso a veces parece parpadear.",
    "El Empire State Building de Nueva York recibe en promedio unos 23 rayos al año, según NOAA."
  ],
  conclusion: "La próxima vez que veas un relámpago, piensa que acabas de ver, por un instante, un trozo de aire más caliente que la superficie de una estrella.",
  sources: [
    { t: "NOAA / National Weather Service — Understanding Lightning: Thunder", u: "https://www.weather.gov/safety/lightning-science-thunder" },
    { t: "NOAA / National Weather Service — Lightning Myths", u: "https://www.weather.gov/safety/lightning-myths" },
    { t: "Wikipedia — Fotosfera", u: "https://es.wikipedia.org/wiki/Fotosfera" }
  ]
},
{
  id: "a-diamante-grafito", type: "articulo", status: "publicado", date: "2026-11-20", level: 2,
  cat: "ciencia", sub: "Química",
  title: "Tu lápiz y un diamante están hechos de lo mismo",
  subtitle: "El material más duro de la naturaleza y la punta que se gasta al escribir son el mismo elemento: carbono.",
  desc: "Diamante y grafito son carbono puro. Lo único que cambia es cómo se ordenan sus átomos.",
  intro: "Un diamante puede rayar casi cualquier cosa. La punta de un lápiz se deshace sobre el papel. Parecen opuestos, pero químicamente son el mismo material.",
  sections: [
    { h: "Mismo elemento, distinta arquitectura", p: [
      "Tanto el diamante como el grafito están formados solo por átomos de carbono. A estas formas distintas de un mismo elemento se les llama alótropos.",
      "En el diamante, cada átomo se une con fuerza a otros cuatro formando una red tridimensional rígida. Por eso es tan duro."
    ]},
    { h: "Por qué el grafito escribe", p: [
      "En el grafito, los átomos forman láminas planas, como hojas apiladas. Las láminas se sujetan entre sí de forma débil y se deslizan con facilidad.",
      "Al escribir, vas dejando capas de grafito sobre el papel. Por esa misma razón el grafito se usa como lubricante seco."
    ]},
    { h: "El lápiz nunca tuvo plomo", p: [
      "Aunque en muchos países se le dice «lápiz de plomo», la mina es de grafito mezclado con arcilla. El nombre viene de que, cuando se descubrió el grafito, se confundió con un mineral de plomo."
    ]},
    { h: "Una lámina de un átomo que ganó un Nobel", p: [
      "Si se separa una sola lámina de grafito, se obtiene el grafeno: una capa de carbono de un átomo de espesor. Andre Geim y Konstantin Novoselov recibieron el Premio Nobel de Física 2010 por sus experimentos con este material, que llegaron a aislar con cinta adhesiva."
    ]}
  ],
  facts: [
    "Otras formas del carbono son los fullerenos (moléculas con forma de balón) y los nanotubos.",
    "El diamante no es eterno: a presión normal es menos estable que el grafito, pero la transformación es tan lenta que en la práctica no ocurre."
  ],
  conclusion: "Lo que hace valioso a un diamante no es de qué está hecho, sino cómo están ordenados sus átomos.",
  sources: [
    { t: "Wikipedia — Allotropes of carbon", u: "https://en.wikipedia.org/wiki/Allotropes_of_carbon" },
    { t: "Wikipedia — Pencil", u: "https://en.wikipedia.org/wiki/Pencil" },
    { t: "NobelPrize.org — The Nobel Prize in Physics 2010", u: "https://www.nobelprize.org/prizes/physics/2010/summary/" }
  ]
},
{
  id: "a-cleopatra-luna", type: "articulo", status: "publicado", date: "2026-11-22", level: 1,
  cat: "historia", sub: "Antigüedad",
  title: "Cleopatra vivió más cerca de la llegada a la Luna que de las pirámides",
  subtitle: "El antiguo Egipto duró tanto que, para Cleopatra, la Gran Pirámide ya era una antigüedad.",
  desc: "Entre la Gran Pirámide y Cleopatra hay unos 2.500 años. Entre Cleopatra y la llegada a la Luna, unos 2.000.",
  intro: "Solemos imaginar el antiguo Egipto como un solo momento: faraones, pirámides y Cleopatra, todo junto. En realidad, entre unos y otros pasó más tiempo que entre Cleopatra y nosotros.",
  sections: [
    { h: "Las cuentas", p: [
      "La Gran Pirámide de Guiza, la del faraón Keops, se terminó hacia el año 2560 a. C.",
      "Cleopatra VII murió en el año 30 a. C. Es decir, vivió unos 2.500 años después de que se construyera la pirámide.",
      "La misión Apolo 11 llegó a la Luna en 1969. Desde la muerte de Cleopatra hasta entonces pasaron unos 2.000 años."
    ]},
    { h: "Cleopatra no era egipcia de origen", p: [
      "Cleopatra pertenecía a la dinastía ptolemaica, de origen griego macedonio, que gobernó Egipto tras la muerte de Alejandro Magno.",
      "Según el historiador Plutarco, fue la primera gobernante de su dinastía que aprendió la lengua egipcia."
    ]},
    { h: "Otro choque de tiempos", p: [
      "Cuando se levantó la Gran Pirámide, todavía existían mamuts lanudos: una población sobrevivió en la isla de Wrangel, en el Ártico, hasta hace unos 4.000 años."
    ]}
  ],
  facts: [
    "La Gran Pirámide fue la estructura más alta construida por el ser humano durante más de 3.800 años.",
    "Cleopatra fue la última gobernante activa del Egipto ptolemaico; tras su muerte, Egipto pasó a ser provincia romana."
  ],
  conclusion: "La historia antigua no es un bloque: es una línea larguísima, y nosotros estamos más cerca de Cleopatra de lo que ella estaba de los constructores de pirámides.",
  sources: [
    { t: "Wikipedia — Great Pyramid of Giza", u: "https://en.wikipedia.org/wiki/Great_Pyramid_of_Giza" },
    { t: "Wikipedia — Cleopatra", u: "https://en.wikipedia.org/wiki/Cleopatra" },
    { t: "Wikipedia — Woolly mammoth (supervivencia en la isla de Wrangel)", u: "https://en.wikipedia.org/wiki/Woolly_mammoth" }
  ]
},
{
  id: "a-guerra-zanzibar", type: "articulo", status: "publicado", date: "2026-11-12", level: 2,
  cat: "historia", sub: "Edad contemporánea",
  title: "La guerra más corta de la historia duró menos de una hora",
  subtitle: "En 1896, el Reino Unido y el sultanato de Zanzíbar se enfrentaron en un conflicto de unos 40 minutos.",
  desc: "La guerra anglo-zanzibarí del 27 de agosto de 1896 duró entre 38 y 45 minutos, según la fuente.",
  intro: "Hay guerras que duran décadas. La que se considera la más corta registrada empezó y terminó en una sola mañana.",
  sections: [
    { h: "Qué la provocó", p: [
      "El 25 de agosto de 1896 murió el sultán Hamad bin Thuwaini, aliado del Imperio británico. Su primo Khalid bin Barghash tomó el poder sin la aprobación de los británicos, que tenían gran influencia sobre Zanzíbar.",
      "El Reino Unido le dio un ultimátum: retirarse antes de las 9:00 de la mañana del 27 de agosto."
    ]},
    { h: "Lo que pasó esa mañana", p: [
      "Khalid no se retiró. Pocos minutos después de las 9:00, barcos de la Marina Real empezaron a bombardear el palacio.",
      "El bombardeo terminó alrededor de las 9:40, cuando se bajó la bandera del palacio. Las cifras más citadas hablan de unas 500 bajas entre muertos y heridos del lado zanzibarí y un solo marino británico herido."
    ]},
    { h: "Qué pasó después", p: [
      "Khalid se refugió en el consulado alemán y luego huyó. Los británicos colocaron en el trono a un sultán favorable a ellos, Hamud bin Muhammed."
    ]}
  ],
  facts: [
    "Zanzíbar hoy forma parte de Tanzania, en la costa oriental de África.",
    "La duración exacta varía según las fuentes, entre 38 y 45 minutos."
  ],
  conclusion: "Fue breve, pero no fue una anécdota inocente: muestra el enorme desequilibrio de poder de la época colonial.",
  sources: [
    { t: "Wikipedia — Anglo-Zanzibar War", u: "https://en.wikipedia.org/wiki/Anglo-Zanzibar_War" }
  ]
},
{
  id: "a-dunning-kruger", type: "articulo", status: "publicado", date: "2026-11-23", level: 2,
  cat: "psicologia", sub: "Sesgos cognitivos",
  title: "Por qué quien menos sabe suele creer que sabe más",
  subtitle: "El efecto Dunning-Kruger es uno de los hallazgos más citados de la psicología. Y también uno de los más malinterpretados.",
  desc: "En 1999, un estudio mostró que las personas con peor desempeño tendían a sobrestimar mucho su habilidad.",
  intro: "Todos conocemos a alguien que opina con total seguridad de algo que no entiende. En 1999, dos psicólogos pusieron a prueba esa intuición en un laboratorio.",
  sections: [
    { h: "El experimento", p: [
      "David Dunning y Justin Kruger, de la Universidad de Cornell, pidieron a estudiantes que hicieran pruebas de razonamiento lógico, gramática y sentido del humor, y que luego estimaran qué tan bien les había ido comparados con los demás.",
      "Quienes quedaron en el cuarto con peores resultados estaban, en promedio, alrededor del percentil 12. Pero creían estar cerca del percentil 60: pensaban que lo habían hecho mejor que la mayoría."
    ]},
    { h: "La explicación que propusieron", p: [
      "Según los autores, las habilidades que hacen falta para hacer bien una tarea son las mismas que hacen falta para darse cuenta de que la estás haciendo mal. Sin ellas, cuesta ver los propios errores.",
      "El estudio también encontró algo menos citado: los que mejor lo hicieron tendían a subestimarse un poco, porque suponían que a los demás también les resultaba fácil."
    ]},
    { h: "Lo que no dice el estudio", p: [
      "La famosa gráfica de la «montaña de la estupidez» que circula en internet no aparece en el artículo original; es una ilustración popular posterior.",
      "Además, algunos investigadores han argumentado que parte del efecto puede explicarse por artefactos estadísticos, como la regresión a la media. El debate sigue abierto, aunque la tendencia básica a sobrestimarse con poca habilidad se ha observado en muchos estudios."
    ]}
  ],
  facts: [
    "El artículo se tituló «Unskilled and Unaware of It» (Incompetentes e inconscientes de ello).",
    "Dunning y Kruger recibieron un premio Ig Nobel en 2000 por este trabajo."
  ],
  conclusion: "La lección más útil no es señalar a otros, sino sospechar de nuestra propia seguridad en los temas que menos dominamos.",
  sources: [
    { t: "Kruger & Dunning (1999), Journal of Personality and Social Psychology", u: "https://doi.org/10.1037/0022-3514.77.6.1121" },
    { t: "Wikipedia — Dunning–Kruger effect", u: "https://en.wikipedia.org/wiki/Dunning%E2%80%93Kruger_effect" }
  ]
},
{
  id: "a-venus-dia", type: "articulo", status: "publicado", date: "2026-11-25", level: 2,
  cat: "universo", sub: "Planetas",
  title: "En Venus, un día dura más que un año",
  subtitle: "El planeta vecino gira tan despacio, y al revés, que sus calendarios desafían la intuición.",
  desc: "Venus tarda unos 243 días terrestres en girar sobre sí mismo y solo unos 225 en dar la vuelta al Sol.",
  intro: "En la Tierra, un año tiene 365 días. En Venus, el planeta tarda más en dar una vuelta sobre sí mismo que en completar su órbita alrededor del Sol.",
  sections: [
    { h: "Las cifras", p: [
      "Venus completa una rotación sobre su eje en unos 243 días terrestres. Su órbita alrededor del Sol dura unos 225 días.",
      "Además, gira en sentido contrario al de casi todos los planetas. Desde su superficie, el Sol saldría por el oeste y se pondría por el este."
    ]},
    { h: "Un matiz importante", p: [
      "Esos 243 días son la rotación medida respecto a las estrellas. Como Venus gira al revés mientras avanza en su órbita, el tiempo entre un amanecer y el siguiente es más corto: unos 117 días terrestres.",
      "Así que, según cómo se mida el «día», la frase es literal (243 frente a 225) o una forma de hablar."
    ]},
    { h: "El planeta más caliente", p: [
      "Aunque Mercurio está más cerca del Sol, Venus es el planeta más caliente del sistema solar: su superficie ronda los 465 °C.",
      "La razón es su atmósfera densísima de dióxido de carbono, que atrapa el calor. La presión en su superficie es unas 90 veces la de la Tierra al nivel del mar."
    ]}
  ],
  facts: [
    "Venus es el objeto natural más brillante del cielo nocturno después de la Luna.",
    "Sus nubes contienen ácido sulfúrico."
  ],
  conclusion: "Venus es casi del mismo tamaño que la Tierra, pero es un recordatorio de lo distinto que puede ser un planeta con otra atmósfera.",
  sources: [
    { t: "NASA Science — Venus", u: "https://science.nasa.gov/venus/" },
    { t: "Wikipedia — Venus", u: "https://en.wikipedia.org/wiki/Venus" }
  ]
},
{
  id: "a-luz-pasado", type: "articulo", status: "publicado", date: "2026-11-18", level: 1,
  cat: "universo", sub: "Luz y distancias",
  title: "Mirar el cielo es mirar el pasado",
  subtitle: "Nada de lo que ves en el cielo lo estás viendo como es ahora mismo.",
  desc: "La luz del Sol tarda unos 8 minutos en llegar. La de la galaxia de Andrómeda, unos 2,5 millones de años.",
  intro: "La luz es lo más rápido que existe, pero no es instantánea. Cuando las distancias son enormes, ese pequeño retraso convierte el cielo en una máquina del tiempo.",
  sections: [
    { h: "La velocidad de la luz", p: [
      "La luz viaja a casi 300.000 kilómetros por segundo. A esa velocidad podría dar más de siete vueltas a la Tierra en un segundo.",
      "Aun así, el universo es tan grande que a la luz le toma tiempo cruzarlo. Por eso las distancias astronómicas se miden en años luz: la distancia que recorre la luz en un año."
    ]},
    { h: "Cuánto pasado ves", p: [
      "La luz de la Luna tarda poco más de un segundo en llegar. La del Sol, unos 8 minutos y 20 segundos: si el Sol desapareciera, tardaríamos ese tiempo en notarlo.",
      "La estrella más cercana después del Sol, Próxima Centauri, está a unos 4,2 años luz: la vemos como era hace más de cuatro años."
    ]},
    { h: "Ejemplo: una luz de antes de la humanidad", p: [
      "En un cielo oscuro, sin contaminación lumínica, la galaxia de Andrómeda se ve a simple vista como una mancha tenue. Su luz salió hace unos 2,5 millones de años.",
      "Esa luz empezó su viaje antes de que existiera nuestra especie, el Homo sapiens."
    ]}
  ],
  facts: [
    "Andrómeda es el objeto más lejano que la mayoría de la gente puede ver sin telescopio.",
    "Un año luz equivale a unos 9,46 billones de kilómetros.",
    "La luz tarda unos 8 minutos desde la superficie del Sol, pero la energía producida en su núcleo puede tardar decenas de miles de años en llegar a esa superficie."
  ],
  conclusion: "Cada vez que miras una estrella, recibes un mensaje que salió hace años, siglos o milenios.",
  sources: [
    { t: "Wikipedia — Sunlight", u: "https://en.wikipedia.org/wiki/Sunlight" },
    { t: "Wikipedia — Light-year", u: "https://en.wikipedia.org/wiki/Light-year" },
    { t: "Wikipedia — Andromeda Galaxy", u: "https://en.wikipedia.org/wiki/Andromeda_Galaxy" }
  ]
},
{
  id: "a-primer-bug", type: "articulo", status: "publicado", date: "2026-11-15", level: 2,
  cat: "tecnologia", sub: "Historia de la informática",
  title: "El primer «bug» informático fue un insecto de verdad",
  subtitle: "En 1947, una polilla atrapada en una computadora se convirtió en la anécdota más famosa de la programación.",
  desc: "El equipo de la computadora Harvard Mark II encontró una polilla en un relé y la pegó en su bitácora.",
  intro: "Cuando un programa falla, los programadores dicen que tiene un «bug», que en inglés significa bicho. La historia de esa palabra incluye un bicho real.",
  sections: [
    { h: "La polilla del 9 de septiembre de 1947", p: [
      "Los operadores de la Harvard Mark II, una de las primeras computadoras electromecánicas, encontraron una polilla atrapada en uno de sus relés.",
      "La pegaron con cinta en la bitácora de trabajo y escribieron al lado: «First actual case of bug being found» (primer caso real de un bicho encontrado)."
    ]},
    { h: "La palabra ya existía", p: [
      "La broma funcionaba justamente porque «bug» ya se usaba para hablar de fallos técnicos. Thomas Edison, por ejemplo, lo usó en cartas de la década de 1870.",
      "Por eso la polilla no inventó el término: lo hizo famoso."
    ]},
    { h: "El papel de Grace Hopper", p: [
      "La científica Grace Hopper, pionera de los lenguajes de programación, trabajaba en ese equipo y popularizó la historia. Ella misma aclaró que no fue quien encontró la polilla.",
      "La página de la bitácora con la polilla se conserva en el Museo Nacional de Historia Estadounidense del Smithsonian."
    ]}
  ],
  facts: [
    "De ahí viene también «debugging» (depurar): quitar los bichos de un programa.",
    "Grace Hopper dirigió el desarrollo de uno de los primeros compiladores."
  ],
  conclusion: "Una de las palabras más usadas en el software nació como chiste en una bitácora, con un insecto como prueba.",
  sources: [
    { t: "Wikipedia — Software bug (historia del término)", u: "https://en.wikipedia.org/wiki/Software_bug" },
    { t: "Wikipedia — Grace Hopper", u: "https://en.wikipedia.org/wiki/Grace_Hopper" }
  ]
},
{
  id: "a-chimborazo", type: "articulo", status: "publicado", date: "2026-11-10", level: 2,
  cat: "geografia", sub: "Extremos del planeta",
  title: "El punto más alejado del centro de la Tierra no está en el Everest",
  subtitle: "Por la forma achatada del planeta, la cima del Chimborazo, en Ecuador, es la que más se aleja del centro.",
  desc: "El Everest es el más alto sobre el nivel del mar, pero la cima del Chimborazo está unos 2 km más lejos del centro terrestre.",
  intro: "Si te preguntan cuál es el punto más alto del planeta, la respuesta correcta depende de desde dónde lo midas.",
  sections: [
    { h: "La Tierra no es una esfera perfecta", p: [
      "Al girar, la Tierra se ensancha en el ecuador y se achata en los polos. Su radio en el ecuador es unos 21 km mayor que en los polos.",
      "Eso significa que un punto cerca del ecuador ya parte con ventaja: está más lejos del centro."
    ]},
    { h: "Everest contra Chimborazo", p: [
      "El Everest mide unos 8.849 metros sobre el nivel del mar. El Chimborazo, un volcán de Ecuador casi sobre la línea ecuatorial, mide unos 6.263 metros.",
      "Pero, según NOAA, la cima del Chimborazo está unos 2 kilómetros más lejos del centro de la Tierra que la del Everest."
    ]},
    { h: "Y un tercer campeón", p: [
      "Si se mide desde la base hasta la cima, la montaña más alta es Mauna Kea, en Hawái: más de 10.000 metros, aunque la mayor parte está bajo el océano."
    ]}
  ],
  facts: [
    "Por la misma razón, la cima del Chimborazo es uno de los puntos de tierra firme más cercanos al espacio.",
    "Everest: más alto sobre el mar. Chimborazo: más lejos del centro. Mauna Kea: más alto de la base a la cima."
  ],
  conclusion: "«Más alto» no es una sola medida. Cada pregunta tiene su propia montaña ganadora.",
  sources: [
    { t: "NOAA Ocean Service — What is the highest point on Earth as measured from Earth's center?", u: "https://oceanservice.noaa.gov/facts/highestpoint.html" },
    { t: "Wikipedia — Chimborazo", u: "https://en.wikipedia.org/wiki/Chimborazo" }
  ]
},
{
  id: "a-huesos-bebe", type: "articulo", status: "publicado", date: "2026-11-21", level: 1,
  cat: "cuerpo", sub: "Esqueleto",
  title: "Naciste con casi 100 huesos más de los que tienes ahora",
  subtitle: "Un bebé tiene alrededor de 300 piezas óseas. Un adulto, 206. Ninguno se pierde: se fusionan.",
  desc: "Muchos huesos del recién nacido son todavía cartílago y se van uniendo durante la infancia y la adolescencia.",
  intro: "El esqueleto de un bebé no es una versión pequeña del de un adulto. Está diseñado para ser flexible, y por eso tiene muchas más piezas.",
  sections: [
    { h: "De unos 300 a 206", p: [
      "Al nacer, el cuerpo tiene alrededor de 270 a 300 piezas óseas, muchas de ellas formadas en parte por cartílago, un tejido más flexible.",
      "Con el crecimiento, el cartílago se convierte en hueso y varias piezas se unen. Al llegar a la edad adulta quedan 206 huesos."
    ]},
    { h: "El cráneo, un rompecabezas", p: [
      "El cráneo del recién nacido tiene placas separadas y zonas blandas llamadas fontanelas, las famosas «molleras».",
      "Esa flexibilidad ayuda en el parto y deja espacio para que el cerebro crezca muy rápido durante los primeros años. Las fontanelas se cierran, normalmente, antes de los dos años."
    ]},
    { h: "Otros ejemplos de fusión", p: [
      "El sacro, en la base de la columna, empieza como cinco vértebras separadas que se fusionan en un solo hueso.",
      "La cadera también se forma por la unión de tres huesos: ilion, isquion y pubis."
    ]}
  ],
  facts: [
    "El hueso más largo del cuerpo es el fémur, en el muslo.",
    "El más pequeño es el estribo, en el oído medio: mide unos 3 milímetros."
  ],
  conclusion: "Crecer no es solo hacerse más grande: es también una lenta reorganización del esqueleto.",
  sources: [
    { t: "Wikipedia — Human skeleton", u: "https://en.wikipedia.org/wiki/Human_skeleton" },
    { t: "Wikipedia — Fontanelle", u: "https://en.wikipedia.org/wiki/Fontanelle" }
  ]
},
{
  id: "a-pulpo", type: "articulo", status: "publicado", date: "2026-11-19", level: 2,
  cat: "animales", sub: "Vida marina",
  title: "Tres corazones, sangre azul y brazos que «piensan»: así es el pulpo",
  subtitle: "Pocos animales son tan distintos de nosotros y, a la vez, tan inteligentes.",
  desc: "El pulpo tiene tres corazones, sangre azul por el cobre, y la mayoría de sus neuronas están en los brazos.",
  intro: "Si quisieras diseñar un extraterrestre creíble, podrías empezar por el pulpo. Su cuerpo resuelve los mismos problemas que el nuestro, pero de una forma completamente distinta.",
  sections: [
    { h: "Tres corazones", p: [
      "Dos corazones bombean sangre hacia las branquias, donde se oxigena. El tercero la envía al resto del cuerpo.",
      "Curiosamente, el corazón principal deja de latir cuando el pulpo nada a propulsión. Eso puede ser una razón por la que prefiere desplazarse arrastrándose por el fondo."
    ]},
    { h: "Sangre azul", p: [
      "Nuestra sangre usa hemoglobina, una proteína con hierro, para transportar oxígeno, y por eso es roja.",
      "El pulpo usa hemocianina, que contiene cobre. Al oxigenarse, su sangre se vuelve azulada. La hemocianina funciona bien en aguas frías y con poco oxígeno."
    ]},
    { h: "Un cerebro repartido", p: [
      "Un pulpo común tiene unos 500 millones de neuronas, y aproximadamente dos tercios están en sus brazos, no en la cabeza.",
      "Por eso cada brazo puede reaccionar al tacto y al sabor con bastante independencia. En experimentos, los pulpos han aprendido a abrir frascos y a resolver laberintos."
    ]}
  ],
  facts: [
    "Pueden cambiar de color y de textura de la piel en fracciones de segundo para camuflarse.",
    "La mayoría de las especies de pulpo vive solo uno o dos años."
  ],
  conclusion: "El pulpo demuestra que la inteligencia puede evolucionar por caminos muy diferentes al nuestro.",
  sources: [
    { t: "Wikipedia — Octopus", u: "https://en.wikipedia.org/wiki/Octopus" },
    { t: "Wikipedia — Hemocyanin", u: "https://en.wikipedia.org/wiki/Hemocyanin" }
  ]
},
{
  id: "a-barco-teseo", type: "articulo", status: "publicado", date: "2026-11-16", level: 2,
  cat: "filosofia", sub: "Identidad",
  title: "Si cambias todas las piezas de un barco, ¿sigue siendo el mismo barco?",
  subtitle: "La paradoja del barco de Teseo lleva más de dos mil años incomodando a filósofos. Y también habla de ti.",
  desc: "Una pregunta antigua sobre la identidad: qué hace que algo siga siendo lo mismo aunque cambie por completo.",
  intro: "Imagina un barco al que, con los años, le cambian tabla por tabla hasta que no queda ninguna original. ¿Es el mismo barco? La respuesta parece fácil hasta que la intentas defender.",
  sections: [
    { h: "El origen", p: [
      "El historiador griego Plutarco contó que los atenienses conservaron durante siglos el barco del héroe Teseo, reemplazando las tablas podridas por otras nuevas.",
      "Según Plutarco, los filósofos lo usaban como ejemplo para discutir: unos decían que seguía siendo el mismo barco y otros, que no."
    ]},
    { h: "La vuelta de tuerca de Hobbes", p: [
      "En el siglo XVII, el filósofo inglés Thomas Hobbes complicó aún más el problema: ¿y si alguien guardara todas las tablas viejas y armara con ellas otro barco?",
      "Ahora habría dos barcos. ¿Cuál es el verdadero barco de Teseo: el que se fue reparando o el que tiene las piezas originales?"
    ]},
    { h: "Por qué te afecta", p: [
      "Tu cuerpo también renueva células constantemente, aunque a ritmos muy distintos: algunas en días y otras, como muchas neuronas, duran casi toda la vida. La idea popular de que «todo el cuerpo se renueva cada siete años» no es correcta.",
      "Aun así, la pregunta sigue en pie: ¿eres la misma persona que hace diez años? Muchos filósofos responden que lo que da continuidad no son las piezas, sino la historia, la memoria o la organización."
    ]}
  ],
  facts: [
    "El mismo problema se aplica a bandas de música que cambian a todos sus integrantes o a empresas centenarias.",
    "En filosofía, este campo se llama «identidad a través del tiempo»."
  ],
  conclusion: "La paradoja no tiene una respuesta única, y por eso sigue siendo útil: obliga a definir qué significa «ser lo mismo».",
  sources: [
    { t: "Wikipedia — Ship of Theseus", u: "https://en.wikipedia.org/wiki/Ship_of_Theseus" },
    { t: "Stanford Encyclopedia of Philosophy — Identity Over Time", u: "https://plato.stanford.edu/entries/identity-time/" }
  ]
},
{
  id: "a-voynich", type: "articulo", status: "publicado", date: "2026-11-17", level: 2,
  cat: "misterios", sub: "Enigmas sin resolver",
  title: "El libro que nadie en el mundo ha logrado leer",
  subtitle: "El manuscrito Voynich tiene unos 600 años, un alfabeto desconocido y dibujos de plantas que no existen.",
  desc: "Escrito en el siglo XV con un sistema de escritura desconocido, ha resistido a lingüistas y a descifradores profesionales.",
  intro: "En la Universidad de Yale se guarda un libro de unas 240 páginas que nadie ha podido descifrar con certeza. No se sabe quién lo escribió, en qué idioma ni para qué.",
  sections: [
    { h: "Qué es", p: [
      "Es un manuscrito de pergamino, lleno de texto en una escritura que no coincide con ningún alfabeto conocido y de ilustraciones de plantas, diagramas astronómicos y figuras humanas en estanques.",
      "Lleva el nombre de Wilfrid Voynich, un librero que lo compró en 1912. Hoy está en la Biblioteca Beinecke de la Universidad de Yale, catalogado como MS 408."
    ]},
    { h: "Lo que sí se sabe", p: [
      "En 2009, una prueba de carbono-14 realizada en la Universidad de Arizona fechó el pergamino entre 1404 y 1438.",
      "Eso descarta, al menos para el material, que fuera una falsificación moderna hecha por el propio Voynich, aunque no dice cuándo se escribió el texto."
    ]},
    { h: "Por qué sigue siendo un misterio", p: [
      "Criptógrafos profesionales, incluidos descifradores de códigos de la Segunda Guerra Mundial, lo estudiaron sin éxito.",
      "Cada cierto tiempo alguien anuncia haberlo resuelto, pero ninguna propuesta ha sido aceptada por la comunidad académica. Hay quien piensa que es un idioma cifrado, un idioma inventado o incluso un texto sin significado."
    ]}
  ],
  facts: [
    "Muchas de las plantas dibujadas no han podido identificarse con especies reales.",
    "La Biblioteca Beinecke tiene el manuscrito digitalizado y es consultable en línea."
  ],
  conclusion: "En una época en la que casi todo parece estar en internet, sigue existiendo un libro que nadie sabe leer.",
  sources: [
    { t: "Wikipedia — Voynich manuscript", u: "https://en.wikipedia.org/wiki/Voynich_manuscript" }
  ]
},
{
  id: "a-wow-signal", type: "articulo", status: "publicado", date: "2026-11-08", level: 3,
  cat: "misterios", sub: "Espacio",
  title: "La señal «Wow!»: 72 segundos que nadie ha vuelto a escuchar",
  subtitle: "En 1977, un radiotelescopio captó una señal tan extraña que el astrónomo que la vio escribió «Wow!» al lado.",
  desc: "Una señal de radio intensa y breve que nunca se repitió. Sigue sin una explicación confirmada.",
  intro: "La búsqueda de vida inteligente fuera de la Tierra ha producido muchas falsas alarmas. Pero hay una señal que, casi 50 años después, todavía no se ha explicado del todo.",
  sections: [
    { h: "La noche del 15 de agosto de 1977", p: [
      "El radiotelescopio Big Ear, de la Universidad Estatal de Ohio, registró una señal de radio muy intensa procedente de la constelación de Sagitario.",
      "Días después, el astrónomo Jerry Ehman revisó las impresiones de datos, rodeó la secuencia «6EQUJ5» y escribió al margen «Wow!»."
    ]},
    { h: "Por qué llamó tanto la atención", p: [
      "La señal estaba muy cerca de la frecuencia de 1.420 MHz, la que emite el hidrógeno, el elemento más abundante del universo. Los científicos habían propuesto que una civilización que quisiera ser detectada podría usar justamente esa frecuencia.",
      "Duró unos 72 segundos, que es lo que tardaba un punto del cielo en cruzar el campo de visión del telescopio por la rotación de la Tierra. Eso sugiere que venía del espacio y no de una interferencia local."
    ]},
    { h: "Lo que pasó después", p: [
      "Se buscó la señal en esa zona del cielo muchas veces, con telescopios más potentes, y nunca se volvió a detectar.",
      "No hay pruebas de que fuera de origen artificial. En 2024, un equipo de investigadores propuso que pudo deberse a una nube de hidrógeno que brilló de forma repentina por un evento astrofísico. Es una hipótesis, todavía no confirmada."
    ]}
  ],
  facts: [
    "La hoja original con el «Wow!» escrito a mano se conserva en archivos de la Universidad Estatal de Ohio.",
    "Una señal que no se repite no puede verificarse, y por eso la ciencia no puede sacar conclusiones firmes."
  ],
  conclusion: "La señal Wow! no prueba que haya alguien ahí fuera, pero es un recordatorio de cuánto falta por entender del cielo.",
  sources: [
    { t: "Wikipedia — Wow! signal", u: "https://en.wikipedia.org/wiki/Wow!_signal" }
  ]
},
{
  id: "a-monopoly", type: "articulo", status: "publicado", date: "2026-11-14", level: 2,
  cat: "economia", sub: "Historia económica",
  title: "El Monopoly se inventó para criticar a los monopolios",
  subtitle: "Su creadora original fue una mujer que quería mostrar lo injusto de acumular tierras y rentas.",
  desc: "Elizabeth Magie patentó en 1904 «The Landlord's Game», el antecedente directo del Monopoly.",
  intro: "El juego en el que ganas arruinando a los demás nació, irónicamente, como una lección contra esa misma idea.",
  sections: [
    { h: "Lizzie Magie y su juego", p: [
      "Elizabeth «Lizzie» Magie, una estadounidense que trabajaba como taquígrafa y escribía, patentó en 1904 un juego de mesa llamado The Landlord's Game (El juego del terrateniente).",
      "Quería ilustrar las ideas del economista Henry George, que criticaba que unos pocos se enriquecieran cobrando renta por la tierra."
    ]},
    { h: "Dos formas de jugar", p: [
      "El juego tenía dos conjuntos de reglas. En uno, se ganaba acumulando propiedades y dejando a los demás en la ruina. En el otro, la riqueza creada se repartía y todos salían beneficiados.",
      "La idea era que los jugadores vieran por sí mismos qué sistema era más justo."
    ]},
    { h: "Cómo se convirtió en Monopoly", p: [
      "El juego se difundió y se modificó de forma casera durante años. Charles Darrow vendió una versión a la empresa Parker Brothers, que lanzó Monopoly en 1935 y lo presentó como invento suyo.",
      "Parker Brothers compró la patente de Magie por unos 500 dólares. Su papel quedó casi olvidado hasta que investigaciones posteriores lo recuperaron."
    ]}
  ],
  facts: [
    "Solo la versión «monopolista» de las reglas sobrevivió en el juego comercial.",
    "La periodista Mary Pilon contó la historia completa en el libro The Monopolists (2015)."
  ],
  conclusion: "Detrás de un juego familiar hay un debate económico que sigue vigente: quién se queda con la riqueza que genera la tierra.",
  sources: [
    { t: "Wikipedia — The Landlord's Game", u: "https://en.wikipedia.org/wiki/The_Landlord%27s_Game" },
    { t: "Wikipedia — Lizzie Magie", u: "https://en.wikipedia.org/wiki/Lizzie_Magie" }
  ]
},
{
  id: "a-ano-cero", type: "articulo", status: "publicado", date: "2026-11-11", level: 2,
  cat: "religion", sub: "Historia del calendario",
  title: "Nuestro calendario no tiene año cero",
  subtitle: "Contamos los años desde el nacimiento de Jesús, pero el cálculo lo hizo un monje siglos después, y casi seguro con un pequeño error.",
  desc: "Del año 1 a. C. se pasa directamente al 1 d. C. Y muchos historiadores sitúan el nacimiento de Jesús entre el 6 y el 4 a. C.",
  intro: "Decimos que vivimos en el año 2026 «después de Cristo». Pero ese sistema no existió en la época de Jesús: se inventó unos 500 años más tarde.",
  sections: [
    { h: "Un monje hace las cuentas", p: [
      "En el año 525, el monje Dionisio el Exiguo propuso contar los años a partir del nacimiento de Jesús, en lugar de hacerlo según el reinado de emperadores romanos.",
      "Su sistema, llamado Anno Domini («año del Señor»), se difundió siglos después, en gran parte gracias al historiador inglés Beda el Venerable en el siglo VIII."
    ]},
    { h: "Por qué no hay año cero", p: [
      "En esa época, el número cero no se usaba en Europa. Así que el sistema pasa directamente del año 1 antes de Cristo al año 1 después de Cristo.",
      "Por eso, en sentido estricto, el siglo XXI empezó el 1 de enero de 2001, no en el 2000. Los astrónomos, para hacer cálculos, sí usan un año 0."
    ]},
    { h: "El probable desfase", p: [
      "Según los evangelios de Mateo y Lucas, Jesús nació cuando reinaba Herodes el Grande. Basándose en el historiador Flavio Josefo, la mayoría de los historiadores sitúan la muerte de Herodes hacia el 4 a. C.",
      "Por eso muchos estudiosos ubican el nacimiento de Jesús entre el 6 y el 4 a. C. La fecha exacta no se conoce."
    ]}
  ],
  facts: [
    "Hoy también se usan las abreviaturas «a. e. c.» y «e. c.» (antes de la era común y era común), que cuentan los mismos años.",
    "El 25 de diciembre como fecha de Navidad se estableció siglos después; los evangelios no indican el día."
  ],
  conclusion: "El calendario que usa casi todo el mundo es una herramienta humana, con sus aciertos y sus pequeños errores de cálculo.",
  sources: [
    { t: "Wikipedia — Anno Domini", u: "https://en.wikipedia.org/wiki/Anno_Domini" },
    { t: "Wikipedia — Dionysius Exiguus", u: "https://en.wikipedia.org/wiki/Dionysius_Exiguus" },
    { t: "Wikipedia — Chronology of Jesus", u: "https://en.wikipedia.org/wiki/Chronology_of_Jesus" }
  ]
},
{
  id: "a-ciudad-colonial", type: "articulo", status: "publicado", date: "2026-11-25", level: 1,
  cat: "cultura", sub: "República Dominicana",
  title: "Santo Domingo guarda muchos de los «primeros» de América",
  subtitle: "La primera catedral, uno de los primeros hospitales y una de las primeras calles del continente están en la Ciudad Colonial.",
  desc: "La Ciudad Colonial de Santo Domingo es Patrimonio de la Humanidad desde 1990.",
  intro: "Muchos dominicanos pasan por la Zona Colonial sin saber que caminan por el primer asentamiento europeo permanente de América que todavía conserva su trazado original.",
  sections: [
    { h: "Una ciudad fundada en 1498", p: [
      "Santo Domingo fue fundada a finales del siglo XV por Bartolomé Colón, hermano de Cristóbal Colón, y trasladada a su ubicación actual, en la orilla oeste del río Ozama, en 1502.",
      "Según la UNESCO, allí se construyeron la primera catedral, el primer hospital, la primera aduana y la primera universidad de América."
    ]},
    { h: "La Catedral Primada", p: [
      "La Catedral de Santa María de la Encarnación, conocida como Catedral Primada de América, se construyó aproximadamente entre 1512 y 1540, y fue consagrada en 1541.",
      "Combina el estilo gótico tardío con elementos renacentistas, y es la catedral más antigua del continente americano."
    ]},
    { h: "Qué ver con otros ojos", p: [
      "La calle Las Damas, considerada una de las primeras calles trazadas por europeos en América.",
      "Las ruinas del Hospital San Nicolás de Bari, de los primeros hospitales del continente, y el Alcázar de Colón, residencia de Diego Colón, hijo del almirante."
    ]}
  ],
  facts: [
    "La UNESCO inscribió la Ciudad Colonial en la lista del Patrimonio Mundial en 1990.",
    "Su trazado en cuadrícula sirvió de modelo para muchas ciudades fundadas después en América."
  ],
  conclusion: "La Zona Colonial no es solo un lugar bonito: es una página fundamental de la historia de todo el continente.",
  sources: [
    { t: "UNESCO World Heritage Centre — Colonial City of Santo Domingo", u: "https://whc.unesco.org/en/list/526" },
    { t: "Wikipedia — Cathedral of Santa María la Menor", u: "https://en.wikipedia.org/wiki/Cathedral_of_Santo_Domingo" }
  ]
},

/* ======================= CURIOSIDADES RÁPIDAS ======================= */
{ id: "c-platano", type: "curiosidad", status: "publicado", date: "2026-11-24", level: 1, cat: "ciencia", sub: "Física",
  title: "Los plátanos son ligeramente radiactivos",
  desc: "Contienen potasio, y una pequeña parte es potasio-40, un isótopo radiactivo natural.",
  body: "El potasio es esencial para el cuerpo, y una fracción mínima del potasio natural es potasio-40, que es radiactivo. Por eso el plátano, rico en potasio, emite una radiactividad diminuta. Es tan baja que comer plátanos es completamente seguro: tu propio cuerpo contiene potasio-40. Incluso se ha usado, de forma informal, la «dosis equivalente a un plátano» para explicar cantidades pequeñas de radiación.",
  sources: [{ t: "Wikipedia — Banana equivalent dose", u: "https://en.wikipedia.org/wiki/Banana_equivalent_dose" }] },
{ id: "c-miel", type: "curiosidad", status: "publicado", date: "2026-11-23", level: 1, cat: "ciencia", sub: "Química de los alimentos",
  title: "La miel bien guardada puede durar miles de años",
  desc: "Se ha encontrado miel en tumbas egipcias que, según los arqueólogos, seguía en buen estado.",
  body: "La miel tiene muy poca agua y mucha azúcar, lo que deshidrata a las bacterias. Además es ácida y las abejas añaden una enzima que produce pequeñas cantidades de peróxido de hidrógeno. Mientras esté bien cerrada y no absorba humedad, prácticamente no se echa a perder. Si se cristaliza, no está dañada: basta con calentarla suavemente.",
  sources: [{ t: "Wikipedia — Honey (conservación)", u: "https://en.wikipedia.org/wiki/Honey" }] },
{ id: "c-oxigeno-mar", type: "curiosidad", status: "publicado", date: "2026-11-21", level: 1, cat: "ciencia", sub: "Océanos",
  title: "Buena parte del oxígeno que respiras viene del mar",
  desc: "Los científicos estiman que el océano produce alrededor de la mitad del oxígeno de la Tierra.",
  body: "La mayor parte de ese oxígeno lo producen organismos microscópicos llamados fitoplancton, que hacen fotosíntesis como las plantas. Uno de ellos, la bacteria Prochlorococcus, es tan abundante que se considera uno de los organismos fotosintéticos más numerosos del planeta. Por eso la salud de los océanos importa incluso a quien vive lejos de la costa.",
  sources: [{ t: "NOAA Ocean Service — How much oxygen comes from the ocean?", u: "https://oceanservice.noaa.gov/facts/ocean-oxygen.html" }] },
{ id: "c-estrella-neutrones", type: "curiosidad", status: "publicado", date: "2026-11-20", level: 2, cat: "universo", sub: "Estrellas",
  title: "Una cucharadita de estrella de neutrones pesaría miles de millones de toneladas",
  desc: "Son los restos de estrellas que explotaron, comprimidos hasta un tamaño de unos 20 km.",
  body: "Cuando una estrella muy grande explota como supernova, su núcleo puede colapsar y formar una estrella de neutrones: con más masa que el Sol, pero del tamaño de una ciudad. La materia queda tan comprimida que una porción del tamaño de una cucharadita pesaría miles de millones de toneladas en la Tierra. Algunas giran cientos de veces por segundo.",
  sources: [{ t: "Wikipedia — Neutron star", u: "https://en.wikipedia.org/wiki/Neutron_star" }] },
{ id: "c-australia-luna", type: "curiosidad", status: "publicado", date: "2026-11-19", level: 1, cat: "geografia", sub: "Escalas",
  title: "Australia es más ancha que la Luna",
  desc: "Australia mide unos 4.000 km de este a oeste. El diámetro de la Luna es de unos 3.475 km.",
  body: "Aunque la Luna parece enorme en el cielo, es bastante pequeña: su diámetro es de unos 3.475 km, poco más de una cuarta parte del de la Tierra. Australia continental, de este a oeste, mide unos 4.000 km. Eso no significa que Australia sea «más grande» que la Luna: la superficie lunar es mucho mayor, porque es una esfera.",
  sources: [{ t: "NASA Science — Moon Facts", u: "https://science.nasa.gov/moon/facts/" }, { t: "Wikipedia — Australia", u: "https://en.wikipedia.org/wiki/Australia" }] },
{ id: "c-francia-husos", type: "curiosidad", status: "publicado", date: "2026-11-18", level: 2, cat: "geografia", sub: "Países",
  title: "El país con más husos horarios es Francia",
  desc: "Contando sus territorios de ultramar, Francia abarca 12 husos horarios. Rusia tiene 11.",
  body: "Francia no es solo el territorio europeo: también incluye lugares como la Guayana Francesa, Martinica, Guadalupe, la isla de la Reunión, la Polinesia Francesa y Nueva Caledonia, repartidos por todo el planeta. Si se cuenta su reclamación en la Antártida, la cifra sube a 13.",
  sources: [{ t: "Wikipedia — Time in France", u: "https://en.wikipedia.org/wiki/Time_in_France" }] },
{ id: "c-desierto-antartida", type: "curiosidad", status: "publicado", date: "2026-11-17", level: 1, cat: "geografia", sub: "Climas",
  title: "El desierto más grande del mundo es de hielo",
  desc: "Un desierto se define por lo poco que llueve, no por el calor. La Antártida es el mayor.",
  body: "La Antártida recibe tan poca precipitación que cumple la definición de desierto, y con unos 14 millones de km² es el más grande del mundo. El Ártico ocupa el segundo lugar. El Sahara es el desierto cálido más grande, en tercer lugar.",
  sources: [{ t: "Wikipedia — List of deserts by area", u: "https://en.wikipedia.org/wiki/List_of_deserts_by_area" }] },
{ id: "c-tiburones-arboles", type: "curiosidad", status: "publicado", date: "2026-11-16", level: 2, cat: "animales", sub: "Evolución",
  title: "Los tiburones existen desde antes que los árboles",
  desc: "Los primeros tiburones aparecieron hace unos 450 millones de años; los primeros árboles, unos 60 millones de años después.",
  body: "El registro fósil indica que los tiburones o sus parientes más cercanos aparecieron hace unos 450 millones de años. Los primeros árboles verdaderos surgieron hace unos 385 millones de años, en el período Devónico. Los tiburones también son mucho más antiguos que los dinosaurios, que aparecieron hace unos 230 millones de años, y sobrevivieron a varias extinciones masivas.",
  sources: [{ t: "Wikipedia — Shark (evolución)", u: "https://en.wikipedia.org/wiki/Shark" }, { t: "Wikipedia — Tree (evolución)", u: "https://en.wikipedia.org/wiki/Tree" }] },
{ id: "c-wombat", type: "curiosidad", status: "publicado", date: "2026-11-15", level: 1, cat: "animales", sub: "Rarezas",
  title: "El wombat hace caca en forma de cubo",
  desc: "Es el único animal conocido que produce excrementos cúbicos.",
  body: "El wombat es un marsupial australiano. Investigadores descubrieron que la forma cúbica se crea en la parte final de su intestino, cuyas paredes tienen zonas con distinta rigidez que moldean las esquinas. El estudio ganó el premio Ig Nobel de Física en 2019. Se cree que los cubos, que no ruedan, le sirven para marcar su territorio.",
  sources: [{ t: "Wikipedia — Wombat", u: "https://en.wikipedia.org/wiki/Wombat" }, { t: "Improbable Research — Ig Nobel Prize winners", u: "https://improbable.com/ig/winners/" }] },
{ id: "c-flamencos", type: "curiosidad", status: "publicado", date: "2026-11-14", level: 1, cat: "animales", sub: "Aves",
  title: "Los flamencos no nacen rosados",
  desc: "Las crías son grises o blancas. El color viene de lo que comen.",
  body: "Los flamencos se alimentan de algas y pequeños crustáceos ricos en carotenoides, los mismos pigmentos que dan color a la zanahoria. Su cuerpo los procesa y los deposita en las plumas, la piel y el pico. Si su alimentación cambia, pueden perder parte del color. En los zoológicos se les añaden carotenoides a la comida para que no se pongan pálidos.",
  sources: [{ t: "Wikipedia — Flamingo", u: "https://en.wikipedia.org/wiki/Flamingo" }] },
{ id: "c-cornea", type: "curiosidad", status: "publicado", date: "2026-11-13", level: 2, cat: "cuerpo", sub: "Ojos",
  title: "Una parte de tu ojo no tiene vasos sanguíneos",
  desc: "La córnea es transparente precisamente porque no tiene vasos sanguíneos.",
  body: "La córnea es la capa transparente de la parte delantera del ojo. Si tuviera vasos sanguíneos, bloquearían la luz. En lugar de recibir oxígeno de la sangre, lo toma en gran parte directamente del aire, disuelto en la película de lágrimas, y sus nutrientes llegan desde el líquido interior del ojo.",
  sources: [{ t: "Wikipedia — Cornea", u: "https://en.wikipedia.org/wiki/Cornea" }] },
{ id: "c-estribo", type: "curiosidad", status: "publicado", date: "2026-11-12", level: 1, cat: "cuerpo", sub: "Esqueleto",
  title: "El hueso más pequeño del cuerpo está en tu oído",
  desc: "Se llama estribo y mide unos 3 milímetros.",
  body: "El estribo es uno de los tres huesecillos del oído medio, junto con el martillo y el yunque. Juntos transmiten y amplifican las vibraciones del sonido desde el tímpano hacia el oído interno. Su nombre viene de su forma, parecida al estribo de una montura de caballo.",
  sources: [{ t: "Wikipedia — Stapes", u: "https://en.wikipedia.org/wiki/Stapes" }] },
{ id: "c-primer-sms", type: "curiosidad", status: "publicado", date: "2026-11-22", level: 1, cat: "tecnologia", sub: "Telefonía",
  title: "El primer mensaje de texto de la historia decía «Merry Christmas»",
  desc: "Se envió el 3 de diciembre de 1992, desde una computadora a un teléfono móvil.",
  body: "El ingeniero Neil Papworth envió el mensaje «Merry Christmas» (Feliz Navidad) desde una computadora a un teléfono de Vodafone en el Reino Unido. En esa época los teléfonos todavía no podían escribir mensajes, solo recibirlos. Los SMS tenían un límite de 160 caracteres.",
  sources: [{ t: "Wikipedia — SMS (historia)", u: "https://en.wikipedia.org/wiki/SMS" }] },
{ id: "c-youtube-zoo", type: "curiosidad", status: "publicado", date: "2026-11-11", level: 1, cat: "tecnologia", sub: "Internet",
  title: "El primer video de YouTube dura 19 segundos y es en un zoológico",
  desc: "Se llama «Me at the zoo» y se subió el 23 de abril de 2005.",
  body: "Lo publicó Jawed Karim, uno de los tres fundadores de YouTube. En él aparece frente a los elefantes del Zoológico de San Diego, comentando que tienen trompas muy largas. Sigue disponible en la plataforma y acumula cientos de millones de reproducciones.",
  sources: [{ t: "Wikipedia — Me at the zoo", u: "https://en.wikipedia.org/wiki/Me_at_the_zoo" }] },
{ id: "c-oxford-aztecas", type: "curiosidad", status: "publicado", date: "2026-11-10", level: 2, cat: "historia", sub: "Cronologías sorprendentes",
  title: "La Universidad de Oxford es más antigua que el Imperio azteca",
  desc: "En Oxford ya se enseñaba hacia 1096. Tenochtitlan se fundó en 1325.",
  body: "No hay una fecha exacta de fundación de Oxford, pero hay evidencia de enseñanza allí desde 1096. Tenochtitlan, la capital de los mexicas o aztecas, se fundó en 1325, y su imperio alcanzó su máximo poder en el siglo XV. Es decir, cuando nació la gran capital azteca, Oxford ya llevaba más de dos siglos funcionando.",
  sources: [{ t: "Wikipedia — University of Oxford", u: "https://en.wikipedia.org/wiki/University_of_Oxford" }, { t: "Wikipedia — Tenochtitlan", u: "https://en.wikipedia.org/wiki/Tenochtitlan" }] },
{ id: "c-ojala", type: "curiosidad", status: "publicado", date: "2026-11-09", level: 1, cat: "cultura", sub: "Idioma",
  title: "Cada vez que dices «ojalá», hablas árabe",
  desc: "Viene de una expresión árabe que significa «si Dios quiere».",
  body: "Según el Diccionario de la lengua española, «ojalá» procede del árabe hispánico «law šá lláh», que significa «si Dios quiere». Tras casi ocho siglos de presencia musulmana en la península ibérica, el español incorporó miles de palabras de origen árabe, como almohada, azúcar, aceite, alcalde o algodón.",
  sources: [{ t: "RAE — Diccionario de la lengua española: ojalá", u: "https://dle.rae.es/ojal%C3%A1" }] },
{ id: "c-taino", type: "curiosidad", status: "publicado", date: "2026-11-08", level: 1, cat: "cultura", sub: "Idioma",
  title: "Huracán, hamaca y barbacoa son palabras taínas",
  desc: "Los taínos de La Española y otras islas del Caribe dejaron palabras que hoy se usan en todo el mundo.",
  body: "Los taínos fueron los habitantes de la isla donde hoy están República Dominicana y Haití cuando llegaron los europeos. De su lengua vienen palabras como huracán, hamaca, barbacoa, canoa y maíz, que pasaron al español y desde ahí al inglés y a muchos otros idiomas. Por ejemplo, el inglés «hurricane» viene de «huracán».",
  sources: [{ t: "RAE — Diccionario de la lengua española: huracán", u: "https://dle.rae.es/hurac%C3%A1n" }, { t: "Wikipedia — Taíno language", u: "https://en.wikipedia.org/wiki/Ta%C3%ADno_language" }] },
{ id: "c-merengue", type: "curiosidad", status: "publicado", date: "2026-11-07", level: 1, cat: "cultura", sub: "República Dominicana",
  title: "El merengue es Patrimonio Cultural Inmaterial de la Humanidad",
  desc: "La UNESCO lo inscribió en 2016.",
  body: "La UNESCO incluyó «la música y el baile del merengue en la República Dominicana» en su Lista Representativa del Patrimonio Cultural Inmaterial de la Humanidad en 2016. La bachata recibió el mismo reconocimiento en 2019. El merengue se considera un elemento central de la identidad dominicana.",
  sources: [{ t: "UNESCO — Music and dance of Dominican merengue", u: "https://ich.unesco.org/en/RL/music-and-dance-of-dominican-merengue-01162" }] },
{ id: "c-bandera-biblia", type: "curiosidad", status: "publicado", date: "2026-11-06", level: 1, cat: "cultura", sub: "República Dominicana",
  title: "La bandera dominicana es la única con una Biblia",
  desc: "Su escudo muestra una Biblia abierta, algo que no aparece en ninguna otra bandera nacional.",
  body: "El escudo en el centro de la bandera de la República Dominicana incluye una Biblia abierta, una cruz, lanzas y banderas, junto al lema «Dios, Patria, Libertad». Se considera la única bandera nacional del mundo que representa una Biblia.",
  sources: [{ t: "Wikipedia — Flag of the Dominican Republic", u: "https://en.wikipedia.org/wiki/Flag_of_the_Dominican_Republic" }] },
{ id: "c-pico-duarte", type: "curiosidad", status: "publicado", date: "2026-11-05", level: 1, cat: "geografia", sub: "República Dominicana",
  title: "La montaña más alta del Caribe está en República Dominicana",
  desc: "El Pico Duarte mide unos 3.098 metros.",
  body: "El Pico Duarte, en la Cordillera Central, es el punto más alto de todas las islas del Caribe. En la cima pueden registrarse temperaturas bajo cero en invierno, algo sorprendente para un país tropical. Lleva el nombre de Juan Pablo Duarte, uno de los padres de la patria.",
  sources: [{ t: "Wikipedia — Pico Duarte", u: "https://en.wikipedia.org/wiki/Pico_Duarte" }] },
{ id: "c-enriquillo", type: "curiosidad", status: "publicado", date: "2026-11-04", level: 2, cat: "geografia", sub: "República Dominicana",
  title: "El punto más bajo del Caribe también está en RD",
  desc: "El lago Enriquillo está a más de 40 metros por debajo del nivel del mar.",
  body: "El lago Enriquillo, en el suroeste del país, es un lago salado cuya superficie se encuentra varias decenas de metros por debajo del nivel del mar. Es el punto más bajo de las islas del Caribe y el lago más grande de la región. Alberga la mayor población de cocodrilo americano del Caribe, además de iguanas.",
  sources: [{ t: "Wikipedia — Lake Enriquillo", u: "https://en.wikipedia.org/wiki/Lake_Enriquillo" }] },
{ id: "c-larimar", type: "curiosidad", status: "publicado", date: "2026-11-03", level: 1, cat: "cultura", sub: "República Dominicana",
  title: "El larimar solo se encuentra en República Dominicana",
  desc: "Esta piedra azul celeste se extrae en la provincia de Barahona.",
  body: "El larimar es una variedad azul del mineral pectolita. Hasta donde se conoce, solo se extrae de forma comercial en la República Dominicana, en la zona montañosa de Barahona. Su nombre lo dio Miguel Méndez, que combinó el nombre de su hija Larissa con la palabra «mar».",
  sources: [{ t: "Wikipedia — Larimar", u: "https://en.wikipedia.org/wiki/Larimar" }] },
{ id: "c-mera-exposicion", type: "curiosidad", status: "publicado", date: "2026-11-20", level: 2, cat: "psicologia", sub: "Preferencias",
  title: "Te gusta más algo solo por verlo muchas veces",
  desc: "Se llama efecto de mera exposición y lo describió el psicólogo Robert Zajonc en 1968.",
  body: "En sus experimentos, las personas valoraban de forma más positiva palabras, caras o símbolos que habían visto más veces, aunque no recordaran haberlos visto. Es una de las razones por las que una canción que al principio no te convencía termina gustándote, y por las que la publicidad repite los mismos anuncios. El efecto tiene límites: con demasiada repetición puede aparecer el cansancio.",
  sources: [{ t: "Wikipedia — Mere-exposure effect", u: "https://en.wikipedia.org/wiki/Mere-exposure_effect" }] },
{ id: "c-ilusion-frecuencia", type: "curiosidad", status: "publicado", date: "2026-11-18", level: 1, cat: "psicologia", sub: "Atención",
  title: "Cuando aprendes una palabra nueva, de pronto la ves en todas partes",
  desc: "Es la ilusión de frecuencia, también llamada fenómeno Baader-Meinhof.",
  body: "Después de fijarte en algo nuevo, como una palabra o un modelo de carro, tu atención lo detecta con más facilidad, y además tiendes a recordar las veces que lo ves. El resultado es la sensación de que ahora aparece mucho más, aunque su frecuencia real no haya cambiado. El lingüista Arnold Zwicky la llamó «ilusión de frecuencia» en 2005.",
  sources: [{ t: "Wikipedia — Frequency illusion", u: "https://en.wikipedia.org/wiki/Frequency_illusion" }] },
{ id: "c-hungria-inflacion", type: "curiosidad", status: "publicado", date: "2026-11-16", level: 3, cat: "economia", sub: "Inflación",
  title: "La peor inflación de la historia duplicaba los precios cada 15 horas",
  desc: "Ocurrió en Hungría en 1946, tras la Segunda Guerra Mundial.",
  body: "En julio de 1946, la inflación mensual en Hungría alcanzó cifras de miles de billones por ciento (las estimaciones varían según la fuente). Los precios se duplicaban aproximadamente cada 15 horas. El país llegó a imprimir un billete de 100 trillones de pengő (un 1 seguido de 20 ceros), el billete de mayor valor nominal jamás emitido. En agosto de 1946 se sustituyó por una nueva moneda, el forinto, que se usa hasta hoy.",
  sources: [{ t: "Wikipedia — Hungarian pengő", u: "https://en.wikipedia.org/wiki/Hungarian_peng%C5%91" }, { t: "Wikipedia — Hyperinflation", u: "https://en.wikipedia.org/wiki/Hyperinflation" }] },
{ id: "c-zimbabue-billete", type: "curiosidad", status: "publicado", date: "2026-11-09", level: 2, cat: "economia", sub: "Inflación",
  title: "Zimbabue imprimió un billete de 100 billones de dólares",
  desc: "Fue en 2009, durante una de las peores hiperinflaciones del siglo XXI.",
  body: "El billete de 100 billones de dólares zimbabuenses (100.000.000.000.000) apenas alcanzaba para comprar algunos productos básicos. En 2009, el país dejó de usar su moneda y empezó a operar con divisas extranjeras como el dólar estadounidense. Hoy esos billetes se venden como objetos de colección.",
  sources: [{ t: "Wikipedia — Hyperinflation in Zimbabwe", u: "https://en.wikipedia.org/wiki/Hyperinflation_in_Zimbabwe" }] },
{ id: "c-caverna", type: "curiosidad", status: "publicado", date: "2026-11-13", level: 2, cat: "filosofia", sub: "Platón",
  title: "Hace 2.400 años, Platón describió prisioneros que solo veían sombras",
  desc: "La alegoría de la caverna sigue usándose para hablar de educación, medios y realidad.",
  body: "En su obra La República, Platón imagina personas encadenadas en una cueva desde su nacimiento, que solo ven sombras proyectadas en una pared y creen que eso es todo lo que existe. Uno de ellos escapa, ve el mundo real y vuelve para contarlo, pero los demás no le creen. Para Platón, representaba el paso de la ignorancia al conocimiento.",
  sources: [{ t: "Wikipedia — Allegory of the cave", u: "https://en.wikipedia.org/wiki/Allegory_of_the_cave" }] },
{ id: "c-arameo", type: "curiosidad", status: "publicado", date: "2026-11-10", level: 2, cat: "religion", sub: "Idiomas antiguos",
  title: "Jesús probablemente hablaba arameo",
  desc: "Era la lengua cotidiana de Galilea en el siglo I. El Nuevo Testamento se escribió en griego.",
  body: "La mayoría de los historiadores coincide en que Jesús hablaba arameo en su vida diaria y probablemente conocía el hebreo de las escrituras. Los evangelios conservan algunas palabras en arameo, como «Talitha koum» («niña, levántate»). Sin embargo, los textos del Nuevo Testamento que han llegado hasta nosotros se escribieron en griego. Hoy todavía existen comunidades que hablan variantes modernas del arameo.",
  sources: [{ t: "Wikipedia — Language of Jesus", u: "https://en.wikipedia.org/wiki/Language_of_Jesus" }] },

/* ======================= MITOS Y REALIDADES ======================= */
{ id: "m-cerebro-10", type: "mito", status: "publicado", date: "2026-11-24", level: 1, cat: "cuerpo", sub: "Cerebro", verdict: "falso",
  title: "«Solo usamos el 10% del cerebro»",
  desc: "Falso. Prácticamente todas las regiones del cerebro tienen funciones conocidas.",
  body: "Las técnicas de imagen cerebral muestran actividad en todas las zonas del cerebro a lo largo del día, aunque no todas a la vez. Además, una lesión en casi cualquier parte del cerebro produce algún efecto, lo que no ocurriría si el 90% no se usara. El cerebro consume alrededor del 20% de la energía del cuerpo: sería un desperdicio enorme mantener sin uso la mayor parte.",
  sources: [{ t: "Wikipedia — Ten percent of the brain myth", u: "https://en.wikipedia.org/wiki/Ten_percent_of_the_brain_myth" }] },
{ id: "m-muralla", type: "mito", status: "publicado", date: "2026-11-23", level: 1, cat: "historia", sub: "Monumentos", verdict: "falso",
  title: "«La Gran Muralla China se ve desde el espacio a simple vista»",
  desc: "Falso. Es muy larga, pero demasiado estrecha y del color del terreno.",
  body: "La muralla mide miles de kilómetros de largo, pero en general solo unos pocos metros de ancho y se confunde con el paisaje. Astronautas, incluido el primer astronauta chino, Yang Liwei, han dicho que no pudieron verla a simple vista desde la órbita. Con cámaras y lentes de aumento sí se puede fotografiar.",
  sources: [{ t: "Wikipedia — Great Wall of China (visibilidad desde el espacio)", u: "https://en.wikipedia.org/wiki/Great_Wall_of_China" }] },
{ id: "m-vikingos", type: "mito", status: "publicado", date: "2026-11-22", level: 1, cat: "historia", sub: "Edad Media", verdict: "falso",
  title: "«Los vikingos usaban cascos con cuernos»",
  desc: "Falso. No hay evidencia arqueológica de que los usaran en combate.",
  body: "El único casco vikingo casi completo encontrado, el de Gjermundbu (Noruega), es redondo y no tiene cuernos. La imagen popular se difundió en el siglo XIX, especialmente con el vestuario diseñado por Carl Emil Doepler para la ópera El anillo del nibelungo de Wagner, en 1876. Unos cuernos serían, además, poco prácticos en una pelea.",
  sources: [{ t: "Wikipedia — Gjermundbu helmet", u: "https://en.wikipedia.org/wiki/Gjermundbu_helmet" }, { t: "Wikipedia — Horned helmet", u: "https://en.wikipedia.org/wiki/Horned_helmet" }] },
{ id: "m-rayo-dos-veces", type: "mito", status: "publicado", date: "2026-11-21", level: 1, cat: "ciencia", sub: "Fenómenos naturales", verdict: "falso",
  title: "«Un rayo nunca cae dos veces en el mismo lugar»",
  desc: "Falso. Los lugares altos y aislados reciben rayos una y otra vez.",
  body: "Los rayos buscan el camino más fácil hacia el suelo, así que los objetos altos, puntiagudos y aislados reciben muchos impactos. Según NOAA, el Empire State Building recibe en promedio unos 23 rayos al año. Por eso, durante una tormenta, no es seguro refugiarse bajo un árbol solitario.",
  sources: [{ t: "NOAA / National Weather Service — Lightning Myths", u: "https://www.weather.gov/safety/lightning-myths" }] },
{ id: "m-sangre-azul", type: "mito", status: "publicado", date: "2026-11-20", level: 1, cat: "cuerpo", sub: "Sangre", verdict: "falso",
  title: "«La sangre de las venas es azul»",
  desc: "Falso. La sangre humana siempre es roja, más oscura cuando lleva menos oxígeno.",
  body: "La hemoglobina le da a la sangre su color rojo: rojo brillante cuando está cargada de oxígeno y rojo oscuro cuando tiene menos. Las venas se ven azuladas a través de la piel por la forma en que la piel absorbe y refleja las distintas longitudes de onda de la luz, no porque la sangre sea azul.",
  sources: [{ t: "Wikipedia — Blood (color)", u: "https://en.wikipedia.org/wiki/Blood" }] },
{ id: "m-murcielagos", type: "mito", status: "publicado", date: "2026-11-19", level: 1, cat: "animales", sub: "Mamíferos", verdict: "falso",
  title: "«Los murciélagos son ciegos»",
  desc: "Falso. Todas las especies de murciélagos pueden ver.",
  body: "Todos los murciélagos tienen ojos funcionales. Muchas especies, además, usan la ecolocalización: emiten sonidos y escuchan el eco para orientarse y cazar en la oscuridad. Algunos murciélagos frugívoros grandes no usan ecolocalización y dependen sobre todo de la vista y del olfato.",
  sources: [{ t: "Wikipedia — Bat (sentidos)", u: "https://en.wikipedia.org/wiki/Bat" }] },
{ id: "m-toros-rojo", type: "mito", status: "publicado", date: "2026-11-18", level: 1, cat: "animales", sub: "Mamíferos", verdict: "falso",
  title: "«Los toros se enfurecen con el color rojo»",
  desc: "Falso. Los toros no distinguen bien el rojo; reaccionan al movimiento.",
  body: "El ganado vacuno es dicromático: no percibe el rojo como lo vemos nosotros. En las corridas, lo que provoca la embestida es el movimiento del capote o la muleta. Se usa el color rojo por tradición, y según una explicación común porque disimula las manchas de sangre.",
  sources: [{ t: "Wikipedia — Cattle (visión)", u: "https://en.wikipedia.org/wiki/Cattle" }] },
{ id: "m-chicle", type: "mito", status: "publicado", date: "2026-11-17", level: 1, cat: "cuerpo", sub: "Digestión", verdict: "falso",
  title: "«Un chicle tragado se queda siete años en el estómago»",
  desc: "Falso. El cuerpo no lo digiere, pero lo expulsa en pocos días.",
  body: "La base del chicle no se digiere del todo, pero el sistema digestivo la mueve como a cualquier otra cosa no digerible y sale de forma natural, normalmente en unos días. Solo tragar grandes cantidades de forma repetida, sobre todo en niños pequeños, ha causado obstrucciones en casos raros.",
  sources: [{ t: "Wikipedia — Chewing gum", u: "https://en.wikipedia.org/wiki/Chewing_gum" }] },
{ id: "m-napoleon", type: "mito", status: "publicado", date: "2026-11-16", level: 2, cat: "historia", sub: "Personajes", verdict: "falso",
  title: "«Napoleón era muy bajito»",
  desc: "Falso. Medía entre 1,67 y 1,70 m, una estatura cercana al promedio de su época.",
  body: "La confusión vino en parte de las unidades: su estatura se registró como 5 pies y 2 pulgadas en medidas francesas, que eran más largas que las inglesas. Convertida correctamente, equivale a unos 1,67 m; otros historiadores estiman 1,70 m. También influyeron las caricaturas británicas, como las de James Gillray, que lo dibujaban pequeño para ridiculizarlo.",
  sources: [{ t: "Wikipedia — Napoleon complex", u: "https://en.wikipedia.org/wiki/Napoleon_complex" }] },
{ id: "m-avestruz", type: "mito", status: "publicado", date: "2026-11-15", level: 1, cat: "animales", sub: "Aves", verdict: "falso",
  title: "«Los avestruces esconden la cabeza en la tierra»",
  desc: "Falso. Nunca lo hacen.",
  body: "Los avestruces ponen sus huevos en un hoyo en el suelo y bajan la cabeza para darles vuelta con el pico. Desde lejos parece que la tienen enterrada. Ante el peligro, lo que hacen es huir corriendo, y son muy rápidos, o tumbarse pegados al suelo para pasar desapercibidos.",
  sources: [{ t: "Wikipedia — Common ostrich (comportamiento)", u: "https://en.wikipedia.org/wiki/Common_ostrich" }] },
{ id: "m-camaleon", type: "mito", status: "publicado", date: "2026-11-14", level: 2, cat: "animales", sub: "Reptiles", verdict: "matizado",
  title: "«Los camaleones cambian de color para camuflarse»",
  desc: "Solo en parte. Lo hacen sobre todo para comunicarse y regular su temperatura.",
  body: "Los camaleones ya tienen colores que les ayudan a pasar desapercibidos. Sus cambios de color más llamativos están relacionados con su estado: para mostrarse ante rivales o parejas, indicar estrés, o para absorber o reflejar más calor. Lo consiguen reorganizando unos nanocristales en células de su piel, que cambian cómo reflejan la luz.",
  sources: [{ t: "Wikipedia — Chameleon (cambio de color)", u: "https://en.wikipedia.org/wiki/Chameleon" }] }
],

/* ======================= QUIZ ======================= */
/* a = índice de la respuesta correcta; ref = contenido relacionado */
questions: [
{ id: "q1", cat: "ciencia", level: 1, status: "publicado", ref: "a-rayo-sol", q: "¿Qué está más caliente?", o: ["La superficie del Sol", "El canal de un rayo", "La lava de un volcán", "El núcleo de la Tierra"], a: 1, exp: "Un rayo puede calentar el aire a unos 27.700 °C, unas cinco veces más que la superficie del Sol." },
{ id: "q2", cat: "ciencia", level: 2, status: "publicado", ref: "a-diamante-grafito", q: "¿De qué está hecha la mina de un lápiz?", o: ["Plomo", "Carbón vegetal", "Grafito y arcilla", "Plástico negro"], a: 2, exp: "Es grafito, una forma del carbono, mezclado con arcilla. Nunca tuvo plomo." },
{ id: "q3", cat: "ciencia", level: 1, status: "publicado", ref: "c-platano", q: "¿Qué fruta común es ligeramente radiactiva?", o: ["La manzana", "El plátano", "La piña", "La uva"], a: 1, exp: "Por su potasio, del que una pequeña parte es potasio-40. La dosis es inofensiva." },
{ id: "q4", cat: "ciencia", level: 2, status: "publicado", ref: "a-rayo-sol", q: "Si cuentas 6 segundos entre el relámpago y el trueno, ¿a qué distancia aproximada está la tormenta?", o: ["600 metros", "2 kilómetros", "6 kilómetros", "18 kilómetros"], a: 1, exp: "El sonido recorre aproximadamente un kilómetro cada 3 segundos: 6 ÷ 3 = 2 km." },
{ id: "q5", cat: "ciencia", level: 3, status: "publicado", ref: "a-diamante-grafito", q: "¿Qué material de un átomo de espesor se obtuvo a partir del grafito y ganó el Nobel de Física 2010?", o: ["El silicio", "El grafeno", "El fullereno", "El kevlar"], a: 1, exp: "Andre Geim y Konstantin Novoselov ganaron el Nobel por sus experimentos con el grafeno." },
{ id: "q6", cat: "historia", level: 1, status: "publicado", ref: "a-cleopatra-luna", q: "¿Cleopatra vivió más cerca en el tiempo de cuál de estos hechos?", o: ["La construcción de la Gran Pirámide", "La llegada del ser humano a la Luna", "Están a la misma distancia", "La fundación de Babilonia"], a: 1, exp: "Unos 2.500 años la separan de la pirámide y unos 2.000 de la llegada a la Luna." },
{ id: "q7", cat: "historia", level: 2, status: "publicado", ref: "a-guerra-zanzibar", q: "¿Cuánto duró aproximadamente la guerra anglo-zanzibarí de 1896?", o: ["Menos de una hora", "Tres días", "Dos semanas", "Seis meses"], a: 0, exp: "Entre 38 y 45 minutos, según la fuente." },
{ id: "q8", cat: "historia", level: 1, status: "publicado", ref: "m-vikingos", q: "¿Cómo era el único casco vikingo casi completo encontrado?", o: ["Con dos cuernos", "Con alas", "Redondo y sin cuernos", "De oro macizo"], a: 2, exp: "El casco de Gjermundbu, en Noruega, no tiene cuernos. La imagen con cuernos se popularizó en el siglo XIX." },
{ id: "q9", cat: "historia", level: 2, status: "publicado", ref: "c-oxford-aztecas", q: "¿Qué es más antiguo?", o: ["La ciudad de Tenochtitlan", "La enseñanza en la Universidad de Oxford", "Fueron fundadas el mismo año", "El Imperio inca"], a: 1, exp: "En Oxford se enseñaba hacia 1096. Tenochtitlan se fundó en 1325." },
{ id: "q10", cat: "historia", level: 2, status: "publicado", ref: "m-napoleon", q: "¿Cuánto medía Napoleón, aproximadamente?", o: ["Alrededor de 1,52 m", "Entre 1,67 y 1,70 m", "Alrededor de 1,85 m", "Más de 1,90 m"], a: 1, exp: "Cerca del promedio de su época. El mito viene en parte de la diferencia entre pulgadas francesas e inglesas y de las caricaturas británicas." },
{ id: "q11", cat: "psicologia", level: 2, status: "publicado", ref: "a-dunning-kruger", q: "En el estudio de Dunning y Kruger, ¿qué hacían quienes tuvieron peores resultados?", o: ["Se subestimaban mucho", "Se estimaban con precisión", "Se sobrestimaban mucho", "No querían participar"], a: 2, exp: "Estaban cerca del percentil 12, pero creían estar cerca del 60." },
{ id: "q12", cat: "psicologia", level: 2, status: "publicado", ref: "c-mera-exposicion", q: "¿Cómo se llama el efecto por el que algo nos gusta más cuanto más lo vemos?", o: ["Efecto placebo", "Efecto de mera exposición", "Efecto mariposa", "Efecto halo"], a: 1, exp: "Lo describió Robert Zajonc en 1968." },
{ id: "q13", cat: "psicologia", level: 1, status: "publicado", ref: "c-ilusion-frecuencia", q: "Aprendes una palabra nueva y de pronto la ves en todas partes. ¿Qué está pasando?", o: ["La palabra se puso de moda justo ese día", "Es la ilusión de frecuencia: tu atención la detecta más", "Es una coincidencia estadística imposible", "Es un déjà vu"], a: 1, exp: "Su frecuencia real no cambió; cambió tu atención hacia ella." },
{ id: "q14", cat: "psicologia", level: 3, status: "publicado", ref: "a-dunning-kruger", q: "¿Qué crítica se ha hecho al efecto Dunning-Kruger?", o: ["Que nunca se publicó", "Que parte podría explicarse por artefactos estadísticos", "Que solo se estudió en animales", "Que lo inventó una red social"], a: 1, exp: "Algunos investigadores sostienen que efectos como la regresión a la media explican parte del patrón. El debate sigue." },
{ id: "q15", cat: "universo", level: 2, status: "publicado", ref: "a-venus-dia", q: "¿Cuál es el planeta más caliente del sistema solar?", o: ["Mercurio", "Venus", "Marte", "Júpiter"], a: 1, exp: "Venus, por su atmósfera densa de dióxido de carbono, ronda los 465 °C aunque está más lejos del Sol que Mercurio." },
{ id: "q16", cat: "universo", level: 1, status: "publicado", ref: "a-luz-pasado", q: "¿Cuánto tarda la luz del Sol en llegar a la Tierra?", o: ["Es instantánea", "Unos 8 minutos", "Unas 8 horas", "Unos 8 días"], a: 1, exp: "Unos 8 minutos y 20 segundos." },
{ id: "q17", cat: "universo", level: 2, status: "publicado", ref: "a-venus-dia", q: "Desde la superficie de Venus, ¿por dónde saldría el Sol?", o: ["Por el este", "Por el oeste", "Por el norte", "Nunca sale"], a: 1, exp: "Venus gira en sentido contrario a casi todos los planetas." },
{ id: "q18", cat: "universo", level: 3, status: "publicado", ref: "a-luz-pasado", q: "La luz de la galaxia de Andrómeda que vemos hoy salió hace aproximadamente…", o: ["2.500 años", "250.000 años", "2,5 millones de años", "2.500 millones de años"], a: 2, exp: "Andrómeda está a unos 2,5 millones de años luz." },
{ id: "q19", cat: "universo", level: 3, status: "publicado", ref: "c-estrella-neutrones", q: "¿Qué tamaño aproximado tiene una estrella de neutrones?", o: ["El de un balón", "El de una ciudad, unos 20 km", "El de la Tierra", "El del Sol"], a: 1, exp: "Tiene más masa que el Sol, comprimida en unos 20 km de diámetro." },
{ id: "q20", cat: "tecnologia", level: 1, status: "publicado", ref: "c-primer-sms", q: "¿Qué decía el primer SMS de la historia?", o: ["Hola mundo", "Merry Christmas", "¿Me oyes?", "Test 123"], a: 1, exp: "Lo envió Neil Papworth el 3 de diciembre de 1992." },
{ id: "q21", cat: "tecnologia", level: 2, status: "publicado", ref: "a-primer-bug", q: "¿Qué encontraron en 1947 dentro de la computadora Harvard Mark II?", o: ["Un ratón", "Una polilla", "Una cucaracha", "Agua"], a: 1, exp: "La pegaron en la bitácora como «primer caso real de un bug encontrado»." },
{ id: "q22", cat: "tecnologia", level: 1, status: "publicado", ref: "c-youtube-zoo", q: "¿Dónde se grabó el primer video de YouTube?", o: ["En un estudio de TV", "En un zoológico", "En una playa", "En una oficina"], a: 1, exp: "«Me at the zoo», grabado frente a los elefantes del Zoológico de San Diego en 2005." },
{ id: "q23", cat: "tecnologia", level: 3, status: "publicado", ref: "a-primer-bug", q: "¿Qué científica popularizó la historia del «primer bug»?", o: ["Ada Lovelace", "Grace Hopper", "Marie Curie", "Hedy Lamarr"], a: 1, exp: "Grace Hopper trabajaba en ese equipo, aunque ella aclaró que no fue quien encontró la polilla." },
{ id: "q24", cat: "cuerpo", level: 1, status: "publicado", ref: "c-estribo", q: "¿Dónde está el hueso más pequeño del cuerpo?", o: ["En el dedo meñique del pie", "En el oído", "En la nariz", "En la muñeca"], a: 1, exp: "El estribo, en el oído medio, mide unos 3 mm." },
{ id: "q25", cat: "cuerpo", level: 1, status: "publicado", ref: "a-huesos-bebe", q: "¿Cuántos huesos tiene un adulto?", o: ["150", "206", "300", "412"], a: 1, exp: "206. Un recién nacido tiene alrededor de 300 piezas que luego se fusionan." },
{ id: "q26", cat: "cuerpo", level: 2, status: "publicado", ref: "c-cornea", q: "¿Qué parte del ojo no tiene vasos sanguíneos?", o: ["La retina", "El iris", "La córnea", "El nervio óptico"], a: 2, exp: "La córnea es transparente porque no tiene vasos; toma oxígeno en gran parte del aire." },
{ id: "q27", cat: "cuerpo", level: 1, status: "publicado", ref: "m-cerebro-10", q: "¿Qué porcentaje del cerebro usamos?", o: ["10%", "Alrededor de la mitad", "Prácticamente todo, aunque no todo a la vez", "Solo el 1%"], a: 2, exp: "El mito del 10% es falso: todas las regiones tienen función." },
{ id: "q28", cat: "geografia", level: 1, status: "publicado", ref: "c-desierto-antartida", q: "¿Cuál es el desierto más grande del mundo?", o: ["El Sahara", "La Antártida", "El Gobi", "Atacama"], a: 1, exp: "Un desierto se define por la poca precipitación. El Sahara es el mayor desierto cálido." },
{ id: "q29", cat: "geografia", level: 2, status: "publicado", ref: "c-francia-husos", q: "¿Qué país tiene más husos horarios?", o: ["Rusia", "Estados Unidos", "Francia", "China"], a: 2, exp: "Francia, con 12, gracias a sus territorios de ultramar. Rusia tiene 11." },
{ id: "q30", cat: "geografia", level: 3, status: "publicado", ref: "a-chimborazo", q: "¿Qué cima está más lejos del centro de la Tierra?", o: ["Everest", "Chimborazo", "K2", "Aconcagua"], a: 1, exp: "Por el abultamiento ecuatorial, el Chimborazo está unos 2 km más lejos del centro que el Everest." },
{ id: "q31", cat: "geografia", level: 1, status: "publicado", ref: "c-pico-duarte", q: "¿Cuál es la montaña más alta del Caribe?", o: ["El Pico Turquino", "El Pico Duarte", "El Monte Pelée", "La Sierra de Luquillo"], a: 1, exp: "El Pico Duarte, en República Dominicana, mide unos 3.098 m." },
{ id: "q32", cat: "geografia", level: 2, status: "publicado", ref: "c-australia-luna", q: "¿Qué es más ancho: Australia de este a oeste o el diámetro de la Luna?", o: ["La Luna", "Australia", "Son exactamente iguales", "Depende de la fase lunar"], a: 1, exp: "Australia mide unos 4.000 km; la Luna, unos 3.475 km de diámetro." },
{ id: "q33", cat: "animales", level: 1, status: "publicado", ref: "a-pulpo", q: "¿Cuántos corazones tiene un pulpo?", o: ["Uno", "Dos", "Tres", "Ocho"], a: 2, exp: "Dos para las branquias y uno para el resto del cuerpo." },
{ id: "q34", cat: "animales", level: 2, status: "publicado", ref: "a-pulpo", q: "¿Por qué la sangre del pulpo es azulada?", o: ["Por el hierro", "Por el cobre de la hemocianina", "Por el agua salada", "Por la falta de oxígeno"], a: 1, exp: "Usa hemocianina, una proteína con cobre, en lugar de hemoglobina." },
{ id: "q35", cat: "animales", level: 1, status: "publicado", ref: "c-flamencos", q: "¿Por qué los flamencos son rosados?", o: ["Nacen así", "Por lo que comen", "Por el sol", "Por la edad"], a: 1, exp: "Por los carotenoides de las algas y crustáceos de su dieta." },
{ id: "q36", cat: "animales", level: 2, status: "publicado", ref: "c-tiburones-arboles", q: "¿Qué apareció primero en la Tierra?", o: ["Los árboles", "Los tiburones", "Los dinosaurios", "Las flores"], a: 1, exp: "Tiburones, hace unos 450 millones de años; árboles, hace unos 385 millones." },
{ id: "q37", cat: "animales", level: 1, status: "publicado", ref: "c-wombat", q: "¿Qué animal hace excrementos en forma de cubo?", o: ["El canguro", "El koala", "El wombat", "El ornitorrinco"], a: 2, exp: "El estudio que lo explicó ganó el Ig Nobel de Física en 2019." },
{ id: "q38", cat: "filosofia", level: 2, status: "publicado", ref: "a-barco-teseo", q: "¿Qué pregunta plantea la paradoja del barco de Teseo?", o: ["Si un barco puede volar", "Si algo sigue siendo lo mismo cuando cambian todas sus partes", "Quién inventó el primer barco", "Por qué flotan los barcos"], a: 1, exp: "Es un problema clásico sobre la identidad a través del tiempo." },
{ id: "q39", cat: "filosofia", level: 1, status: "publicado", ref: "c-caverna", q: "¿Qué filósofo escribió la alegoría de la caverna?", o: ["Aristóteles", "Sócrates", "Platón", "Descartes"], a: 2, exp: "Aparece en La República, de Platón." },
{ id: "q40", cat: "filosofia", level: 3, status: "publicado", ref: "a-barco-teseo", q: "¿Qué filósofo añadió la idea de armar un segundo barco con las tablas viejas?", o: ["Thomas Hobbes", "Immanuel Kant", "Friedrich Nietzsche", "Confucio"], a: 0, exp: "Thomas Hobbes, en el siglo XVII." },
{ id: "q41", cat: "misterios", level: 2, status: "publicado", ref: "a-voynich", q: "¿Entre qué años se fechó el pergamino del manuscrito Voynich?", o: ["1104–1138", "1404–1438", "1704–1738", "1904–1938"], a: 1, exp: "Una prueba de carbono-14 de la Universidad de Arizona lo fechó en 2009." },
{ id: "q42", cat: "misterios", level: 3, status: "publicado", ref: "a-wow-signal", q: "¿Cuánto duró la señal Wow! de 1977?", o: ["7 segundos", "72 segundos", "7 minutos", "72 horas"], a: 1, exp: "Unos 72 segundos, lo que tardaba un punto del cielo en cruzar el campo del telescopio." },
{ id: "q43", cat: "misterios", level: 2, status: "publicado", ref: "a-wow-signal", q: "¿Qué se sabe con certeza sobre el origen de la señal Wow!?", o: ["Que era de extraterrestres", "Que era un avión", "Todavía no hay una explicación confirmada", "Que fue una broma"], a: 2, exp: "Nunca se repitió. Hay hipótesis naturales recientes, pero ninguna confirmada." },
{ id: "q44", cat: "economia", level: 2, status: "publicado", ref: "a-monopoly", q: "¿Con qué intención se creó el antecedente del Monopoly?", o: ["Enseñar a invertir en bolsa", "Criticar la acumulación de tierras y rentas", "Promocionar una inmobiliaria", "Enseñar matemáticas"], a: 1, exp: "Lizzie Magie lo diseñó en 1904 para ilustrar las ideas de Henry George." },
{ id: "q45", cat: "economia", level: 3, status: "publicado", ref: "c-hungria-inflacion", q: "¿Qué país sufrió la peor hiperinflación registrada?", o: ["Zimbabue", "Venezuela", "Hungría", "Alemania"], a: 2, exp: "Hungría en 1946: los precios se duplicaban cada 15 horas aproximadamente." },
{ id: "q46", cat: "economia", level: 1, status: "publicado", ref: "c-zimbabue-billete", q: "¿Qué país imprimió un billete de 100 billones de dólares en 2009?", o: ["Argentina", "Zimbabue", "Brasil", "Haití"], a: 1, exp: "Zimbabue, durante una hiperinflación extrema." },
{ id: "q47", cat: "religion", level: 2, status: "publicado", ref: "a-ano-cero", q: "¿Qué año viene justo después del 1 a. C. en nuestro calendario?", o: ["El año 0", "El 1 d. C.", "El 2 d. C.", "Depende del país"], a: 1, exp: "No existe el año cero en el calendario de uso común." },
{ id: "q48", cat: "religion", level: 2, status: "publicado", ref: "c-arameo", q: "¿Qué idioma hablaba Jesús en su vida diaria, según la mayoría de los historiadores?", o: ["Latín", "Griego", "Arameo", "Árabe"], a: 2, exp: "El arameo era la lengua cotidiana de Galilea en el siglo I." },
{ id: "q49", cat: "religion", level: 3, status: "publicado", ref: "a-ano-cero", q: "¿Quién propuso contar los años desde el nacimiento de Jesús?", o: ["El emperador Constantino", "Dionisio el Exiguo", "San Agustín", "El papa Gregorio XIII"], a: 1, exp: "El monje Dionisio el Exiguo, en el año 525." },
{ id: "q50", cat: "cultura", level: 1, status: "publicado", ref: "c-ojala", q: "¿De qué idioma viene la palabra «ojalá»?", o: ["Latín", "Árabe", "Taíno", "Griego"], a: 1, exp: "Del árabe hispánico «law šá lláh», «si Dios quiere»." },
{ id: "q51", cat: "cultura", level: 1, status: "publicado", ref: "c-taino", q: "¿Cuál de estas palabras viene del taíno?", o: ["Chocolate", "Huracán", "Almohada", "Fútbol"], a: 1, exp: "Huracán, hamaca y barbacoa son de origen taíno. Chocolate viene del náhuatl." },
{ id: "q52", cat: "cultura", level: 1, status: "publicado", ref: "c-merengue", q: "¿En qué año la UNESCO declaró al merengue Patrimonio Cultural Inmaterial?", o: ["1990", "2005", "2016", "2022"], a: 2, exp: "En 2016. La bachata lo fue en 2019." },
{ id: "q53", cat: "cultura", level: 2, status: "publicado", ref: "a-ciudad-colonial", q: "¿Dónde está la catedral más antigua de América?", o: ["Ciudad de México", "Santo Domingo", "La Habana", "Lima"], a: 1, exp: "La Catedral Primada de América, construida aproximadamente entre 1512 y 1540." },
{ id: "q54", cat: "cultura", level: 2, status: "publicado", ref: "c-larimar", q: "¿Qué piedra azul se extrae comercialmente solo en República Dominicana?", o: ["El lapislázuli", "El larimar", "La turquesa", "El zafiro"], a: 1, exp: "El larimar, en la provincia de Barahona." }
]
};
