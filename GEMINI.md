# GEMINI.md

## Stack Tecnológico
- **Lenguaje y UI:** HTML5 (modales `<dialog>` nativos), CSS3 y JavaScript Vanilla (ES6+), sin frameworks ni dependencias externas.
- **ORM / Base de datos:** Ninguno; persistencia local en navegador mediante `localStorage` (`STORAGE_KEY = 'armador_parejas_state_v1'`).
- **Tooling:** Sin `package.json`, bundler ni transpilador; ejecución directa en navegador.

## Arquitectura y Estructura
- **Patrón:** Scripts clásicos globales cargados secuencialmente en `index.html` (`state` compartido en scope global y renderizado imperativo al DOM).
- `index.html`: Shell principal, controles y diálogos nativos.
- `css/styles.css`: Hoja de estilos única, responsive y animaciones.
- `js/state.js`: `DEFAULT_PRESETS`, objeto global `state`, referencias al DOM cacheadas y persistencia.
- `js/players-clubs.js`: Alta/estado de jugadores y presets de clubes.
- `js/draw.js`: Sorteo de parejas/equipos, cruces `VS` y resumen para WhatsApp.
- `js/tournament.js`: Motor de torneo (fase de grupos Round-Robin y eliminatorias).
- `js/truco.js`: Anotador de Truco (15/30 pts, fósforos SVG y confeti).
- `js/app.js`: Punto de entrada; registro de event listeners e inicialización.

## Comandos (Build, Linter, Tests)
- **Compilar / Chequear tipos:** No aplica (JavaScript sin transpilación ni TypeScript).
- **Linter:** No configurado en el repositorio.
- **Test individual:** No hay suite de tests automatizada; verificación manual abriendo `index.html` en el navegador (o servidor estático local).

## Convenciones Detectadas
- **Modularidad:** Archivos JS divididos por dominio funcional (< 360 líneas c/u).
- **Estado y UI:** Mutar el objeto `state`, invocar `saveState()`, y actualizar la vista con `syncControlsWithState()`, `updateStats()` o funciones `render*()`.
- **Errores y validaciones:** Sin `try/catch` en flujos de UI; validar entradas temprano con `return` y mostrar mensajes mediante `showAlert(...)` / `hideAlert()`.
- **Tipos numéricos y visibilidad:** Conversión explícita con `Number(...)` y `parseInt(val, 10)`; alternar visibilidad con la propiedad booleana `element.hidden`.
- **Estilos:** Clases semánticas en `css/styles.css` y atributos `data-*` / `aria-*` para estado de controles.
