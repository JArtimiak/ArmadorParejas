# GEMINI.md

## Stack Tecnológico
- **Lenguaje y UI:** HTML5 (`<dialog>` nativos, `popover="auto"` / `popover="manual"`, `<progress>` indeterminado y `<meta name="color-scheme">` anti-FOUC), CSS3 (`light-dark()`, Bento Grid, Container Queries, `@starting-style`, CSS Anchor Positioning, View Transitions y propiedades lógicas) y JavaScript Vanilla (ES6+), sin frameworks ni dependencias externas.
- **ORM / Base de datos:** Ninguno; persistencia local en navegador mediante `localStorage` (`STORAGE_KEY = 'armador_parejas_state_v1'` y preferencia opcional `'color-scheme'`).
- **Tooling:** Sin `package.json`, bundler ni transpilador; ejecución directa en navegador.

## Arquitectura y Estructura
- **Patrón:** Scripts clásicos globales cargados secuencialmente en `index.html` (`state` compartido en scope global y renderizado imperativo al DOM).
- `index.html`: Shell principal, controles, menú popover de cancha, Bento Grid de métricas, diálogos nativos y región de notificaciones toast.
- `css/styles.css`: Hoja de estilos única con tema dual Oscuro/Claro, Container Queries, animaciones Top Layer y View Transitions.
- `js/state.js`: `DEFAULT_PRESETS`, objeto global `state`, referencias al DOM cacheadas, persistencia, `runViewTransition()` y `showToast()`.
- `js/players-clubs.js`: Alta/estado de jugadores (`vt-chip`) y presets de clubes.
- `js/draw.js`: Sorteo de parejas/equipos, cruces `VS` (`vt-card`), spinner `<progress>` y resumen para WhatsApp.
- `js/tournament.js`: Motor de torneo (fase de grupos Round-Robin y eliminatorias).
- `js/truco.js`: Anotador de Truco (15/30 pts, fósforos SVG y confeti).
- `js/app.js`: Punto de entrada; event listeners (con guardia IME), toggle de tema, `closeTopLayer()` e inicialización.

## Comandos (Build, Linter, Tests)
- **Compilar / Chequear tipos:** No aplica (JavaScript sin transpilación ni TypeScript); verificación sintáctica con `node --check`.
- **Linter:** No configurado en el repositorio; auditoría de plataforma web con `npx.cmd -y modern-web-guidance@latest legacy-scan . --json`.
- **Test individual:** No hay suite de tests automatizada; verificación manual abriendo `index.html` en el navegador (o servidor estático local).

## Convenciones Detectadas
- **Modularidad:** Archivos JS divididos por dominio funcional (`< 360` líneas en `state.js`, `players-clubs.js`, `draw.js`, `truco.js` y `app.js`; `tournament.js` en 517 líneas).
- **Estado, UI y Transiciones:** Mutar el objeto `state`, invocar `saveState()`, envolver cambios de vista en `runViewTransition(...)`, actualizar con `syncControlsWithState()`, `updateStats()` o `render*()`, y confirmar acciones mediante `showToast(...)`.
- **Errores y validaciones:** Sin `try/catch` en flujos de UI; validar entradas temprano con `return`, verificar composición IME (`e.isComposing || e.keyCode === 229`) en listeners `Enter` de `keydown` y mostrar mensajes mediante `showAlert(...)` / `hideAlert()`.
- **Tipos numéricos y visibilidad:** Conversión explícita con `Number(...)` y `parseInt(val, 10)`; alternar visibilidad con la propiedad booleana `element.hidden`.
- **Estilos:** Tokens duales con `light-dark()` + fallbacks, propiedades lógicas CSS (`inline-size`, `block-size`, `padding-block`, `margin-block-end`), Container Queries (`@container`) y atributos `data-*` / `aria-*` / `popover*` para estado de controles.
