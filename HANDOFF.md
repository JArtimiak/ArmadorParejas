# Handoff - Modernización Frontend

- **Current Goal & Status:** Auditoría y modernización completa del frontend completada siguiendo `modern-web-guidance`; lógica de negocio, estado y persistencia (`armador_parejas_state_v1`) intactos.
- **Modified Files:**
  - `index.html`: Meta `color-scheme` + script anti-FOUC, toggle de tema, `popover="auto"` en menú de cancha, Bento Grid de métricas, `<progress>` spinner, región de toasts y `tabindex="-1"` en encabezados de destino.
  - `css/styles.css`: Sistema dual Light/Dark con `light-dark()` y fallbacks, propiedades lógicas CSS, Bento Grid + Container Queries, animaciones Top Layer (`@starting-style`, `allow-discrete`), Anchor Positioning con `@supports`, View Transitions y estilos de `<progress>`.
  - `js/state.js`: Referencias DOM nuevas, helper `runViewTransition()` y sistema de toasts `showToast()` con `popover="manual"`.
  - `js/players-clubs.js`: `view-transition-name` por jugador, clase `.vt-chip` y transiciones en alta/baja/toggle.
  - `js/draw.js`: Spinner semántico `<progress>`, `.vt-card`, `runViewTransition()` y toasts al sortear/copiar.
  - `js/tournament.js`: `runViewTransition()` con focus routing al iniciar/avanzar torneo y toasts al generar/copiar.
  - `js/app.js`: Corrección IME (`isComposing || keyCode === 229`), cierre nativo `hidePopover?.()`, toggle de tema de 2 estados con reversión al sistema, `closeTopLayer()` y fallback `pointerdown`/`pointerup` en `<dialog>`.
- **Key Decisions:**
  - Cero librerías externas ni `package.json`; arquitectura de scripts clásicos globales preservada.
  - Todos los JS modificados permanecen bajo 360 líneas (`tournament.js` preexistente en 517).
- **Next Steps:**
  - Verificación visual manual en navegador (Light/Dark, Popover de cancha, Sorteo, Torneo y Anotador de Truco).
