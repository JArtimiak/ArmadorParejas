# Contexto del Proyecto (`context.md`)

## 1. Objetivo General
El proyecto resuelve una necesidad habitual en juntadas de amigos (partidos de PlayStation como EA FC / FIFA / PES, campeonatos de Truco o fútbol): **armar equipos o parejas de forma 100% imparcial**, definir **quién juega contra quién (`VS`)**, determinar **quién espera afuera si sobran jugadores** y, opcionalmente, **sortear qué club o selección usa cada equipo**.

---

## 2. Evolución del Proyecto
- **Versión inicial (`parejas para truco o play.py`):** Script de consola en Python que pedía nombres por `input()`, solicitaba un tamaño de equipo y extraía elementos con `random.choice()` + `.remove()`. No contemplaba jugadores sobrantes, no armaba enfrentamientos `VS`, no sorteaba clubes de fútbol y requería reescribir los nombres en cada ejecución.
- **Versión actual (`index.html`, `css/styles.css`, `js/app.js`):** Aplicación Web client-side sin dependencias externas (Vanilla HTML5/CSS3/JS ES6+), optimizada para abrirse localmente o desplegarse directamente vía **GitHub Pages** (en `main` / `root`) y persistir los datos en `localStorage`.

---

## 3. Arquitectura y Flujo de Datos

### Estado Global (`state` en `app.js`)
Toda la aplicación gira en torno a un único objeto de estado sincronizado en `localStorage` bajo la clave `armador_parejas_state_v1`:
- `teamSize` (`1 | 2 | 3`): Define el formato actual (`1 vs 1`, `2 vs 2` o `3 vs 3`).
- `players` (`Array<{ id, name, active }>`): Lista de jugadores registrados. El flag `active` permite desactivar amigos ausentes en una juntada sin eliminarlos de la base guardada.
- `clubsEnabled` (`boolean`): Activa o desactiva la asignación de clubes de fútbol.
- `selectedPreset` (`"argentina" | "europa" | "selecciones" | "mix5" | "custom"`): Categoría de clubes activa.
- `noRepeatClubs` (`boolean`): Evita que dos equipos reciban el mismo club mientras alcancen los clubes disponibles en la bolsa.
- `presets` (`Object`): Diccionario de listas de clubes editables por el usuario, inicializado a partir de `DEFAULT_PRESETS`.
- `lastDraw` (`{ teams, bench } | null`): Resultado del último sorteo en memoria, lo que permite **re-sortear únicamente los clubes** sin desarmar las parejas ya formadas.

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
3. **Asignación, Re-sorteo y Reinicio:**
   - **`#btnGenerate` y `#btnRerollAll`:** Ejecutan un nuevo sorteo completo barajando jugadores y clubes con Fisher-Yates.
   - **`#btnRerollClubs`:** Vuelve a barajar únicamente los clubes asignados a los equipos ya existentes sin alterar parejas ni cruces.
   - **`#btnResetDraw` (`clearDrawUI`):** Resetea `state.lastDraw = null` y `state.tournament = null`, vacía los nodos de partidos y suplentes en el DOM y oculta los contenedores de resultados restaurando la vista inicial sin borrar los jugadores registrados.
   - **`rerollSingleTeamClub` (`🔄`):** Permite cambiar el club de un único equipo individualmente.
4. **Motor de Torneos (`state.tournament`):**
   - **Modalidades soportadas:** `groups` (Solo Fase de Grupos), `knockout` (Solo Cuadro Eliminatorio) y `both` (Fase de Grupos + Cuadro Eliminatorio).
   - **Fixture Round-Robin (`generateRoundRobinRounds`):** Implementa el *Circle Method* (algoritmo de Berger) para generar las fechas todos contra todos de cada zona, asignando automáticamente fecha libre (`byeTeamId`) si el grupo tiene cantidad impar de equipos.
   - **Tabla de Posiciones en vivo (`computeGroupStandings`):** Calcula `PJ`, `G`, `E`, `P`, `GF`, `GC`, `DG` y `PTS` (3 pts por victoria, 1 pt por empate) y ordena por `PTS` → `DG` → `GF` → orden alfabético.
   - **Cuadro Eliminatorio Dinámico (`createKnockoutBracket` y `propagateBracketWinners`):** Calcula la potencia de 2 inmediata superior (`bracketSize` = 2, 4, 8 o 16) para rotular automáticamente **Octavos de Final**, **Cuartos de Final**, **Semifinales** y **Final**. Asigna pases directos (`isBye: true`) a los mejores preclasificados cuando el número de equipos no es potencia de 2 y propaga los ganadores ronda a ronda (por resultado numérico o selección directa con `✓ Ganó`) hasta coronar al campeón.
5. **Anotador de Truco (`state.truco` y `createMatchstickBoxSVG`):**
   - Accesible globalmente desde el botón fijo del encabezado (`#btnOpenTrucoGlobal`) o vinculado a un partido sorteado / partido de torneo (`linkedMatch`).
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
