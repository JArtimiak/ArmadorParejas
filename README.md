# 🃏⚽ Armador de Parejas & Cruces (Truco, Play & Fútbol)

Aplicación web interactiva para armar **parejas o equipos aleatorios**, generar **enfrentamientos (`VS`)** y **sortear clubes de fútbol** (ideal para juntadas de Truco, EA FC / FIFA, eFootball / PES o partidos de fútbol entre amigos).

---

## ✨ Características Principales

- **Formatos de juego rápidos y Cancha / Fútbol:**
  - **Mesa & Play:** Selector directo para **1 vs 1** (mano a mano), **2 vs 2** (parejas) y **3 vs 3** (tríos).
  - **⚽ Cancha & Fútbol (Menú flotante):**
    - ⚡ **Dividir en 2 equipos parejos (Picado):** Calcula automáticamente la división exacta a la mitad según los amigos presentes (ej: si son 10 arma 5v5; si son 13 arma 6v6 + 1 al banco).
    - **Presets de Fútbol:** Acceso a **Fútbol 5 (5 vs 5)**, **Fútbol 7 (7 vs 7)**, **Fútbol 8 (8 vs 8)** y **Fútbol 11 (11 vs 11)**.
    - ✏️ **Personalizado libre:** Podés ingresar cualquier número de integrantes por equipo (ej: 4, 6, 9) y el sorteo se adapta automáticamente.
- **Cruces automáticos (`VS`) y Edición Flexible:**
  - No solo agrupa a los jugadores, sino que arma los partidos listos para jugar (`Equipo 1 VS Equipo 2`).
  - **Intercambio de Jugadores (`⇄`):** Podés cambiar o intercambiar a cualquier integrante de una pareja con otro jugador (o con un suplente del banco) con un solo clic.
  - **Elección Manual de Club (`✏️`):** Además de sortear al azar con `🔄`, podés hacer clic sobre el club de cualquier equipo para elegirlo a mano desde el listado.
- **Manejo inteligente de sobrantes:**
  - **Equipo en espera:** Si se forma una cantidad impar de equipos (ej. 3 parejas = 6 jugadores), el tercer equipo queda asignado como *"Espera ganador"*.
  - **Jugadores al banco:** Si el total de jugadores no es múltiplo del tamaño de equipo (ej. 5 jugadores para un `2 vs 2`), elige al azar quién queda en el banco para entrar en el próximo partido.
- **Sorteo de Clubes / Equipos (Play / Fútbol):**
  - Categorías predefinidas: **🇦🇷 Fútbol Argentino**, **🌍 Gigantes de Europa (Champions)**, **🏆 Selecciones Nacionales**, **⭐ Mix Élite 5 Estrellas** y **✏️ Personalizado**.
  - **Editor de clubes integrado:** Podés agregar o quitar clubes de cada lista o restaurar los valores por defecto.
  - **Re-sorteo independiente:** Botón para **volver a sortear todos los clubes** sin desarmar las parejas ya armadas, o botón `🔄` en cada tarjeta para **cambiar el club de un solo equipo**.
  - Opción para **evitar clubes repetidos** en el mismo sorteo.
- **🃏 Anotador de Truco Integrado (30 o 15 puntos con Fósforos, Sin Scroll):**
  - **Botón siempre visible arriba (`🃏 Anotador Truco`):** Permite abrir el tanteador en cualquier momento para anotar un partido (*Nosotros vs Ellos*).
  - **Cajoncitos de 5 Fósforos en vista única:** Los 3 cajoncitos de **Malas (primeros 15)** y los 3 cajoncitos de **Buenas (segundos 15)** se disponen en fila horizontal para que todo el partido a 30 puntos y los botones `-1` / `+1` entren en pantalla sin necesidad de scrollear.
  - **Suma de a 1 (`+1` / `-1` o toque directo):** Podés usar los botones `-1` / `+1` o tocar directamente los cajoncitos del pizarrón de cada equipo para sumar.
  - **Festejo Interactivo del Ganador:** Al llegar a 30 (o 15) puntos se lanza una lluvia de confeti, se ilumina la tarjeta del ganador y se habilitan acciones rápidas para **🔁 Jugar Revancha**, **📲 Copiar Victoria para WhatsApp** o **↩️ Deshacer punto**.
- **🏆 Seguimiento Completo de Torneo (Fase de Grupos y/o Eliminatorias):**
  - Una vez conformadas las parejas/equipos (y sus clubes), podés presionar **✅ Confirmar Equipos y Generar Torneo** eligiendo entre 3 modalidades:
    1. **📊 Solo Fase de Grupos (Liga):** Fixture por fechas todos contra todos (1, 2 o 4 zonas) con **Tabla de Posiciones en vivo** (`PJ`, `G`, `E`, `P`, `GF`, `GC`, `DG`, `PTS`).
    2. **🥊 Solo Cuadro Eliminatorio (Playoffs):** Arma automáticamente las llaves de **Octavos de Final**, **Cuartos de Final**, **Semifinales** y **Final** según la cantidad de equipos, asignando pases directos (*BYE*) si el número de equipos es impar o no es potencia de 2.
    3. **🏆 Fase de Grupos + Cuadro Eliminatorio (Estilo Copa / Mundial):** Se juega primero la fase de grupos y, con un clic en **⚡ Cerrar Grupos y Generar Cuadro Final**, clasifica automáticamente a los mejores equipos (cruzando `1° Zona A vs 2° Zona B`, etc.) hacia las llaves eliminatorias.
  - **Definición por goles/tantos o penales:** En las llaves eliminatorias podés cargar el resultado numérico o tocar el botón **`✓ Ganó`** para avanzar un equipo por penales o partido de Truco.
- **Control y Re-sorteo:**
  - **🎲 ¡Armar Parejas y Cruces! / 🔄 Re-sortear todo:** Cada vez que se presiona, vuelve a mezclar de cero a los jugadores activos y sus clubes.
  - **⚽ Solo Clubes:** Mantiene fijas las parejas y cruces ya armados y solo vuelve a barajar los equipos de fútbol.
  - **🧹 Reiniciar:** Oculta los resultados y vuelve al estado inicial de espera, manteniendo intactos a tus amigos en la lista.
  - **Limpiar:** Si deseás borrar la lista completa de jugadores para una nueva juntada.
  - Agregá un jugador o varios a la vez separados por coma (ej. `Jony, Lucas, Mati, Nico`).
  - Clic sobre cualquier jugador para marcarlo como **presente/ausente** sin borrarlo de tu lista habitual.
  - Guardado automático en el navegador (`localStorage`).
- **Exportación para WhatsApp:** Botón **📋 Copiar resumen** que genera el listado de partidos, clubes y suplentes con emojis listo para pegar en el grupo.
- **Interfaz Moderna, Accesible y Tema Dual (Oscuro / Claro):**
  - Selector de tema claro/oscuro de alto contraste (`🌙` / `☀️`) que respeta la preferencia del sistema y evita destellos (FOUC) al cargar.
  - Métricas en vivo con diseño **Bento Grid**, menú flotante de cancha con **Popover API** nativa y **Anchor Positioning**, indicador `<progress>` al sortear, notificaciones **Toast** no intrusivas (`popover="manual"`) y transiciones fluidas con **View Transitions API**.

---

## 🚀 Cómo usar

1. Abrí el archivo [`index.html`](./index.html) con doble clic en cualquier navegador web (PC o celular). No requiere servidor ni instalación de paquetes.
2. Ingresá los nombres de los jugadores (o usá el botón **+ Ejemplo** para probar).
3. Elegí el modo en la barra superior: **1 vs 1**, **2 vs 2** o **3 vs 3**.
4. *(Opcional)* Si van a jugar a la Play, activá **⚽ Sortear Clubes / Equipos** y elegí la liga o editá los clubes con **⚙️ Editar clubes**.
5. Presioná **🎲 ¡Armar Parejas y Cruces!**.

---


## 📁 Estructura de Archivos

```text
├── index.html                  # Estructura principal, popover de cancha, <dialog> nativos y región de toasts
├── css/
│   └── styles.css              # Tema dual Oscuro/Claro, Bento Grid, Container Queries y View Transitions
├── js/
│   ├── state.js                # Estado global, DOM refs, localStorage, runViewTransition() y showToast()
│   ├── players-clubs.js        # Gestión de jugadores y presets de clubes de fútbol
│   ├── draw.js                 # Algoritmo de sorteo de parejas, cruces VS, spinner y copia WhatsApp
│   ├── tournament.js           # Motor de Torneo (Fase de Grupos Round-Robin y Eliminatorias)
│   ├── truco.js                # Anotador de Truco (30/15 pts con fósforos SVG y confeti)
│   └── app.js                  # Punto de entrada: eventos (IME-safe), toggle de tema y modales Top Layer
├── README.md                   # Documentación de uso y estructura del proyecto
├── GEMINI.md                   # Guía técnica de stack, arquitectura y convenciones
└── context.md                  # Contexto técnico, arquitectura y decisiones de diseño
```
