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
1. **`js/state.js` (~236 líneas):** Define `DEFAULT_PRESETS`, `STORAGE_KEY`, el objeto global `state`, todas las referencias a elementos del DOM, `shuffleArray` (Fisher-Yates), `saveState`, `loadState` y utilidades de alerta (`showAlert` / `hideAlert`).
2. **`js/players-clubs.js` (~233 líneas):** Maneja el alta/baja/activación de jugadores (`addPlayersFromString`, `togglePlayerActive`, `removePlayer`), el cálculo de estadísticas en vivo (`updateStats`), la asignación y re-sorteo de clubes (`assignClubsToTeams`, `rerollSingleTeamClub`) y el modal de edición de presets (`renderClubsModal`).
3. **`js/draw.js` (~251 líneas):** Contiene la lógica principal del sorteo (`generateDraw`), creación de tarjetas `VS` (`renderDrawResults`, `createTeamElement`), limpieza de interfaz (`clearDrawUI`) y exportación a WhatsApp (`copySummaryToClipboard`).
4. **`js/tournament.js` (~355 líneas):** Motor completo de torneos: fixture Round-Robin (`generateRoundRobinRounds`), tabla de posiciones en vivo (`computeGroupStandings`), cuadro eliminatorio con `BYE` automático (`createKnockoutBracket`, `propagateBracketWinners`), renderizado y exportación del torneo.
5. **`js/truco.js` (~231 líneas):** Anotador de Truco a 30 o 15 puntos con renderizado SVG de cajoncitos de 5 fósforos (`createMatchstickBoxSVG`), división en *Malas* y *Buenas*, festejo con confeti (`launchTrucoConfetti`) y vinculación directa con partidos del Torneo (`saveTrucoToLinkedMatch`).
6. **`js/app.js` (~241 líneas):** Punto de entrada que registra todos los Event Listeners de la interfaz e inicializa la aplicación.

### Estado Global (`state` en `js/state.js`)
Toda la aplicación gira en torno a un único objeto de estado sincronizado en `localStorage` bajo la clave `armador_parejas_state_v1`:
- `teamSize` (`1 | 2 | 3`): Define el formato actual (`1 vs 1`, `2 vs 2` o `3 vs 3`).
- `players` (`Array<{ id, name, active }>`): Lista de jugadores registrados. El flag `active` permite desactivar amigos ausentes en una juntada sin eliminarlos de la base guardada.
- `assignClubs` (`boolean`): Activa o desactiva la asignación de clubes de fútbol.
- `currentPresetKey` (`"argentina" | "europa" | "selecciones" | "mix5" | "custom"`): Categoría de clubes activa.
- `noRepeatClubs` (`boolean`): Evita que dos equipos reciban el mismo club mientras alcancen los clubes disponibles en la bolsa.
- `customPresets` (`Object`): Diccionario de listas de clubes editables por el usuario, inicializado a partir de `DEFAULT_PRESETS`.
- `lastDraw` (`{ teamSize, teams, matches, waitingTeam, benchPlayers } | null`): Resultado del último sorteo en memoria, lo que permite **re-sortear únicamente los clubes** sin desarmar las parejas ya formadas.
- `tournament` (`{ format, groupCount, advanceCount, teams, groups, bracket } | null`): Estado completo del torneo activo.
- `truco` (`{ target, nameA, nameB, scoreA, scoreB, linkedMatch }`): Estado persistente del anotador de Truco.

---

## 4. Reglas de Negocio y Algoritmos Clave

1. **Mezcla Aleatoria Sin Sesgo (Fisher-Yates):**
   - Implementado en `shuffleArray(array)`. A diferencia de `Array.sort(() => Math.random() - 0.5)`, garantiza que todas las permutaciones tengan exactamente la misma probabilidad.
2. **Formación de Equipos y Cruces (`generateDraw`):**
   - Se filtran los jugadores con `active === true`.
   - Se valida que haya al menos `teamSize * 2` jugadores activos (mínimo 2 equipos para 1 partido `VS`).
   - Se agrupan de a `teamSize` jugadores formando `totalTeams = Math.floor(N / teamSize)`.
   - **Jugadores al banco (`bench`):** El resto `N % teamSize` queda asignado al banco de suplentes.
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
5. **Anotador de Truco (`state.truco`, `match.truco` y `createMatchstickBoxSVG`):**
   - Accesible globalmente desde el botón fijo del encabezado (`#btnOpenTrucoGlobal`) para partidas libres independientes o vinculado a un cruce (`linkedMatch`).
   - **Visibilidad Condicional y Persistencia Aislada:** El botón `🃏 Anotar Truco` en las cards de partidos y en el torneo **solo se muestra cuando NO se asignan clubes** (`!state.assignClubs`). Cada partido almacena su propio tanteador (`match.truco = { scoreA, scoreB, target }`) y lo sincroniza en tiempo real, mostrándolo en la cabecera de la tarjeta (`🃏 18 - 12` o `🏆 30 - 22`).
   - **Diseño sin scroll:** Soporta partidas a **30 puntos** (divididas a la mitad en 15 *Malas* arriba y 15 *Buenas* abajo) o a **15 puntos**, ubicando los 3 cajoncitos de cada mitad en una fila horizontal compacta (`.truco-column-boxes`) para que todo el tablero y los controles `-1` / `+1` entren en una única pantalla sin desplazamiento vertical.
   - **Interactividad del Ganador (`launchTrucoConfetti`):** Al alcanzar el puntaje objetivo, lanza animación de confeti, ilumina la tarjeta ganadora (`.winner-card`) y despliega acciones directas de **Revancha (`0 - 0`)**, **Copiar Victoria para WhatsApp** y **Deshacer último punto**.

---

## 5. Estándares Web Modernos y Arquitectura Responsive
- **`<dialog closedby="any">` adaptable a teclados móviles:** Tanto el gestor de clubes como el anotador de Truco utilizan el elemento nativo `<dialog>` con apertura modal (`showModal()`), dimensiones acotadas con cuerpo interno desplazable (`.dialog-body`) y listener de fallback por coordenadas (`getBoundingClientRect()`) para navegadores sin soporte nativo de `closedBy`.
- **Tablas de Posiciones Responsivas (`responsive-table`):** Las tablas de grupos usan `<div tabindex="0" role="region" aria-labelledby="..." class="table-wrapper">` con `container-type: inline-size`, encabezados `position: sticky` tanto en `thead` como en `tbody th`, y una regla `@container (width < 440px)` que transforma las filas en tarjetas apiladas inyectando los nombres de columna con `td:nth-child(n)::before` y variables CSS (`--label-*`).
- **Container Queries (`container-type: inline-size` + `@container`):** Los paneles (`.panel`) y las tarjetas de partido (`.match-card`) miden su propio ancho disponible en lugar de depender únicamente del viewport, con fallback progresivo mediante `@supports (container-type: inline-size)` para `.match-grid` y `.stats-bar`.
- **Unidades Dinámicas (`dvh` / `dvw`), `safe-area-inset` y Tipografía Fluida (`clamp()`):** Uso de `100dvh` para evitar saltos por la barra de direcciones del navegador móvil, `env(safe-area-inset-*)` para pantallas con *notch*, y `clamp()` para escalar textos y espaciados desde móviles pequeños (`320px`) hasta Smart TVs.
- **Ergonomía Táctil y Control de Scroll:** Inputs con `font-size: max(16px, 0.95rem)` para prevenir el auto-zoom en iOS Safari, `touch-action: manipulation` y áreas de toque ampliadas bajo `@media (pointer: coarse)`, más `overscroll-behavior: contain`, `scrollbar-gutter: stable` y `flex-wrap: balance` en listas de chips.
- **`@starting-style`:** Animaciones de entrada suaves en tarjetas de enfrentamiento (`.match-card`) y chips de jugadores (`.player-chip`) sin necesidad de librerías externas, respetando `@media (prefers-reduced-motion: reduce)`.

---

## 6. Posibles Extensiones Futuras
- **Historial de Campeones / Ranking de Amigos:** Guardar estadísticas históricas de quién ganó más torneos en el grupo de amigos.
