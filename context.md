# Contexto del Proyecto (`context.md`)

## 1. Objetivo General
El proyecto resuelve una necesidad habitual en juntadas de amigos (partidos de PlayStation como EA FC / FIFA / PES, campeonatos de Truco o fútbol): **armar equipos o parejas de forma 100% imparcial**, definir **quién juega contra quién (`VS`)**, determinar **quién espera afuera si sobran jugadores** y, opcionalmente, **sortear qué club o selección usa cada equipo**.

---

## 2. Evolución del Proyecto
- **Versión inicial (`parejas para truco o play.py`):** Script de consola en Python que pedía nombres por `input()`, solicitaba un tamaño de equipo y extraía elementos con `random.choice()` + `.remove()`. No contemplaba jugadores sobrantes, no armaba enfrentamientos `VS`, no sorteaba clubes de fútbol y requería reescribir los nombres en cada ejecución.
- **Versión actual (`index.html`, `css/styles.css`, `js/*.js`):** Aplicación Web client-side sin dependencias externas (Vanilla HTML5/CSS3/JS ES6+), modularizada en 6 archivos JavaScript por dominio funcional, optimizada para abrirse localmente (`file://`) o desplegarse directamente vía **GitHub Pages** / **Vercel** y persistir los datos en `localStorage`.

---

## 3. Arquitectura Modular y Flujo de Datos

### Modularización de JavaScript (`js/`)
Para mantener cada archivo acotado, legible y fácil de mantener, el código JavaScript está dividido en 6 módulos cargados en orden en [`index.html`](./index.html):
1. **`js/state.js` (337 líneas):** Define `DEFAULT_PRESETS`, `STORAGE_KEY`, el objeto global `state`, referencias a elementos del DOM, `shuffleArray` (Fisher-Yates), `saveState`, `loadState`, utilidades de alerta (`showAlert` / `hideAlert`), `runViewTransition` (View Transitions API con enrutamiento de foco) y `showToast` / `updateToastStackOffsets` (notificaciones `popover="manual"`).
2. **`js/players-clubs.js` (336 líneas):** Maneja el alta/baja/activación de jugadores (`addPlayersFromString`, `togglePlayerActive`, `removePlayer`) con `view-transition-name` por jugador y clase `.vt-chip`, el cálculo de estadísticas en vivo (`updateStats`), la asignación y re-sorteo de clubes (`assignClubsToTeams`, `rerollSingleTeamClub`) y el modal de edición de presets (`renderClubsModal`).
3. **`js/draw.js` (347 líneas):** Contiene la lógica principal del sorteo (`generateDraw`) con spinner `<progress>` y transiciones, creación de tarjetas `VS` (`renderDrawResults`, `createTeamElement`) con clase `.vt-card`, limpieza de interfaz (`clearDrawUI`) y exportación a WhatsApp (`copySummaryToClipboard`).
4. **`js/tournament.js` (517 líneas):** Motor completo de torneos: fixture Round-Robin (`generateRoundRobinRounds`), tabla de posiciones en vivo (`computeGroupStandings`), cuadro eliminatorio con `BYE` automático (`createKnockoutBracket`, `propagateBracketWinners`), renderizado con `runViewTransition` y exportación del torneo (`copyTournamentToClipboard`).
5. **`js/truco.js` (190 líneas):** Anotador de Truco global a 30 o 15 puntos con renderizado SVG de cajoncitos de 5 fósforos (`createMatchstickBoxSVG`), división en *Malas* y *Buenas* y festejo con confeti (`launchTrucoConfetti`).
6. **`js/app.js` (352 líneas):** Punto de entrada que registra los Event Listeners (con guardia IME en `#customSizeInput`), gestiona el cierre del popover `#footballDropdownMenu` (`hidePopover?.()`), implementa el selector de tema de 2 estados con sincronización entre pestañas (`storage`), provee `closeTopLayer()` / `canTransitionDisplay()` y fallback `pointerdown`/`pointerup` para `<dialog>`, e inicializa la aplicación.

### Estado Global (`state` en `js/state.js`)
Toda la aplicación gira en torno a un único objeto de estado sincronizado en `localStorage` bajo la clave `armador_parejas_state_v1`:
- `teamSize` (`number`): Tamaño de integrantes por equipo (`1`, `2`, `3`, `5`, `7`, `8`, `11` o personalizado libre).
- `splitTwoTeams` (`boolean`): Modo inteligente "Dividir en 2 equipos parejos" que calcula `getEffectiveTeamSize()` en vivo (`Math.floor(activeCount / 2)`).
- `customTeamSize` (`number | null`): Valor numérico asignado manualmente por el usuario.
- `players` (`Array<{ id, name, active }>`): Lista de jugadores registrados. El flag `active` permite desactivar amigos ausentes en una juntada sin eliminarlos de la base guardada.
- `assignClubs` (`boolean`): Activa o desactiva la asignación de clubes de fútbol.
- `currentPresetKey` (`"argentina" | "europa" | "selecciones" | "mix5" | "custom"`): Categoría de clubes activa.
- `noRepeatClubs` (`boolean`): Evita que dos equipos reciban el mismo club mientras alcancen los clubes disponibles en la bolsa.
- `customPresets` (`Object`): Diccionario de listas de clubes editables por el usuario, inicializado a partir de `DEFAULT_PRESETS`.
- `lastDraw` (`{ teamSize, teams, matches, waitingTeam, benchPlayers } | null`): Resultado del último sorteo en memoria, lo que permite **re-sortear únicamente los clubes** sin desarmar las parejas ya formadas.
- `tournament` (`{ format, groupCount, advanceCount, teams, groups, bracket } | null`): Estado completo del torneo activo.
- `truco` (`{ target, nameA, nameB, scoreA, scoreB }`): Estado persistente del anotador global de Truco.

---

## 4. Reglas de Negocio y Algoritmos Clave

1. **Mezcla Aleatoria Sin Sesgo (Fisher-Yates):**
   - Implementado en `shuffleArray(array)`. A diferencia de `Array.sort(() => Math.random() - 0.5)`, garantiza que todas las permutaciones tengan exactamente la misma probabilidad.
2. **Formación de Equipos y Cruces (`generateDraw` y `getEffectiveTeamSize`):**
   - Se filtran los jugadores con `active === true`.
   - Se determina el tamaño efectivo (`getEffectiveTeamSize`): si `splitTwoTeams` está activo calcula `Math.floor(activeCount / 2)` para armar siempre exactamente 2 equipos (dejando suplente solo si es impar); si no, toma `state.teamSize`.
   - Se valida que haya al menos `effectiveTeamSize * 2` jugadores activos (mínimo 2 equipos para 1 partido `VS`).
   - Se agrupan de a `effectiveTeamSize` jugadores formando `totalTeams = Math.floor(N / effectiveTeamSize)`.
   - **Jugadores al banco (`bench`):** El resto `N % effectiveTeamSize` queda asignado al banco de suplentes.
   - **Partidos (`matches`):** Los equipos se emparejan de a pares (`teams[0] vs teams[1]`, `teams[2] vs teams[3]`, etc.).
   - **Equipo en espera (`waitingTeam`):** Si `teams.length % 2 === 1`, el último equipo completo queda esperando al ganador.
3. **Asignación, Re-sorteo, Reinicio y Edición Manual:**
   - **`#btnGenerate` y `#btnRerollAll`:** Ejecutan un nuevo sorteo completo barajando jugadores y clubes con Fisher-Yates.
   - **`#btnRerollClubs`:** Vuelve a barajar únicamente los clubes asignados a los equipos ya existentes sin alterar parejas ni cruces.
   - **`#btnResetDraw` (`clearDrawUI`):** Resetea `state.lastDraw = null` y `state.tournament = null`, vacía los nodos de partidos y suplentes en el DOM y oculta los contenedores de resultados restaurando la vista inicial sin borrar los jugadores registrados.
   - **`rerollSingleTeamClub` (`🔄`):** Permite cambiar el club de un único equipo individualmente.
   - **Intercambio de Jugadores (`swapDrawPlayers` / `⇄`):** Permite cambiar o intercambiar cualquier jugador entre parejas o con el banco de suplentes post-sorteo mediante un `<select>` sin alterar el resto de los equipos.
   - **Elección Manual de Club (`setTeamManualClub` / `✏️`):** Permite hacer clic sobre el club de una pareja para seleccionarlo a mano desde un desplegable con todos los clubes disponibles del preset.
4. **Motor de Torneos (`state.tournament`):**
   - **Modalidades soportadas:** `groups` (Solo Fase de Grupos), `knockout` (Solo Cuadro Eliminatorio) y `both` (Fase de Grupos + Cuadro Eliminatorio).
   - **Fixture Round-Robin (`generateRoundRobinRounds`):** Implementa el *Circle Method* (algoritmo de Berger) para generar las fechas todos contra todos de cada zona, asignando automáticamente fecha libre (`byeTeamId`) si el grupo tiene cantidad impar de equipos.
   - **Tabla de Posiciones en vivo (`computeGroupStandings`):** Calcula `PJ`, `G`, `E`, `P`, `GF`, `GC`, `DG` y `PTS` (3 pts por victoria, 1 pt por empate) y ordena por `PTS` → `DG` → `GF` → orden alfabético.
   - **Cuadro Eliminatorio Dinámico (`createKnockoutBracket` y `propagateBracketWinners`):** Calcula la potencia de 2 inmediata superior (`bracketSize` = 2, 4, 8 o 16) para rotular automáticamente **Octavos de Final**, **Cuartos de Final**, **Semifinales** y **Final**. Asigna pases directos (`isBye: true`) a los mejores preclasificados cuando el número de equipos no es potencia de 2 y propaga los ganadores ronda a ronda (por resultado numérico o selección directa con `✓ Ganó`) hasta coronar al campeón.
5. **Anotador de Truco Global (`state.truco` y `createMatchstickBoxSVG`):**
   - Accesible únicamente desde el botón fijo del encabezado (`#btnOpenTrucoGlobal`) como tanteador global independiente para cualquier partida (*Nosotros vs Ellos*), sin botones ni vinculación por partido.
   - **Diseño sin scroll:** Soporta partidas a **30 puntos** (divididas a la mitad en 15 *Malas* arriba y 15 *Buenas* abajo) o a **15 puntos**, ubicando los 3 cajoncitos de cada mitad en una fila horizontal compacta (`.truco-column-boxes`) para que todo el tablero y los controles `-1` / `+1` entren en una única pantalla sin desplazamiento vertical.
   - **Interactividad del Ganador (`launchTrucoConfetti`):** Al alcanzar el puntaje objetivo, lanza animación de confeti, ilumina la tarjeta ganadora (`.winner-card`) y despliega acciones directas de **Revancha (`0 - 0`)**, **Copiar Victoria para WhatsApp** y **Deshacer último punto**.

---

## 5. Estándares Web Modernos y Arquitectura Responsive
- **Tema Dual Oscuro/Claro, `light-dark()` y Prevención de FOUC:** `<meta name="color-scheme" content="light dark">` junto con un script inline síncrono en `<head>` restaura el valor de `localStorage.getItem('color-scheme')` antes del primer pintado. En CSS `:root` mapea el atributo `content` del `<meta>` con `:has(> head > meta[name="color-scheme"][content="..."])`, utiliza `light-dark()` dentro de `@supports (color: light-dark(white, black))` y mantiene fallbacks con `@media (prefers-color-scheme: dark)`. El botón `#btnThemeToggle` opera como control de 2 estados que elimina la clave guardada al volver al esquema del sistema y sincroniza cambios vía evento `storage`.
- **Popover API y CSS Anchor Positioning (`#footballDropdownMenu`):** El menú de Cancha / Fútbol usa `popover="auto"` invocado declarativamente con `popovertarget="footballDropdownMenu"` (sin `aria-haspopup`) y se posiciona con `position-area: block-end span-inline-start` + `position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline` encapsulados dentro de `@supports (position-area: block-end)`, con fallback centrado en `@supports not`.
- **`<dialog closedby="any">` y Animaciones Top Layer (`@starting-style` + `allow-discrete`):** Tanto el gestor de clubes como el anotador de Truco usan `<dialog>` modal (`showModal()`) con contención de scroll (`dialog:modal { overscroll-behavior: contain }` y `dialog::backdrop { overflow: hidden; overscroll-behavior: contain }`), transiciones de entrada/salida con `transition-behavior: allow-discrete`, `overlay`, `display` y `@starting-style`, más helper `closeTopLayer()` (usando `data-closing` cuando falta `overlay`/transición discreta de `display`) y fallback `pointerdown`/`pointerup` contra `getBoundingClientRect()` para navegadores sin `closedBy`.
- **View Transitions API (`runViewTransition` y `view-transition-class`):** Los cambios de estado en lista de jugadores, sorteos y torneo se envuelven en `document.startViewTransition` con fallback síncrono, asignando `view-transition-name` único por elemento más clases compartidas `.vt-chip` / `.vt-card`, `::view-transition { pointer-events: none }`, y enrutamiento de foco hacia encabezados con `tabindex="-1"` (`#results-heading` y `#tournament-heading`) al concluir la transición.
- **Indicador de Carga (`<progress>`) y Toasts (`popover="manual"`):** `#drawSpinner` utiliza un `<progress>` nativo indeterminado estilizado con `conic-gradient`, `@property`, `background-clip: border-area` (con fallback `mask-image`), soporte `forced-colors` y desaceleración a `6s` en `prefers-reduced-motion: reduce`. `showToast()` apila notificaciones con `popover="manual"` en `#toastRegion` (`role="region"`), pausa el auto-cierre al recibir foco, se suprime si hay un modal abierto y anuncia mediante `ariaNotify` / `#srAnnouncer` (`aria-live="polite"`).
- **Bento Grid, Propiedades Lógicas CSS y Container Queries (`@container`):** El resumen matemático `#playerStats` emplea layout Bento Grid (`.bento-stats` / `.bento-card`) con `font-variant-numeric: tabular-nums`. Las dimensiones, márgenes, rellenos y bordes usan propiedades lógicas CSS (`inline-size`, `block-size`, `padding-block`, `padding-inline`, `margin-block-end`, `border-block-*`, `inset-inline-start`), y tanto `.panel` como `.group-card` y `.match-card` definen `container-type: inline-size` para adaptar grillas y acciones según su propio ancho disponible.
- **Tablas de Posiciones Responsivas:** Las tablas de grupos usan `.table-wrapper` con `container-type: inline-size`, encabezados `position: sticky` en `thead` y `tbody th`, y `@container (width < 440px)` para transformar filas en tarjetas apiladas con `td:nth-child(n)::before` y variables `--label-*`.
- **Seguridad IME, Unidades Dinámicas y Ergonomía Táctil:** El listener `keydown` en `#customSizeInput` verifica `e.isComposing || e.keyCode === 229` antes de procesar `Enter`. La interfaz utiliza `100dvh`, `env(safe-area-inset-*)`, `clamp()`, inputs con `font-size: max(16px, 0.95rem)`, `touch-action: manipulation`, `@media (pointer: coarse)`, `overscroll-behavior: contain`, `scrollbar-gutter: stable` y `flex-wrap: balance`.

---

## 6. Posibles Extensiones Futuras
- **Historial de Campeones / Ranking de Amigos:** Guardar estadísticas históricas de quién ganó más torneos en el grupo de amigos.
