# 🃏⚽ Armador de Parejas & Cruces (Truco, Play & Fútbol)

Aplicación web interactiva para armar **parejas o equipos aleatorios**, generar **enfrentamientos (`VS`)** y **sortear clubes de fútbol** (ideal para juntadas de Truco, EA FC / FIFA, eFootball / PES o partidos de fútbol entre amigos).

---

## ✨ Características Principales

- **Formatos de juego rápidos:** Selector directo para **1 vs 1** (mano a mano), **2 vs 2** (parejas) y **3 vs 3** (tríos).
- **Cruces automáticos (`VS`):** No solo agrupa a los jugadores, sino que arma los partidos listos para jugar (`Equipo 1 VS Equipo 2`).
- **Manejo inteligente de sobrantes:**
  - **Equipo en espera:** Si se forma una cantidad impar de equipos (ej. 3 parejas = 6 jugadores), el tercer equipo queda asignado como *"Espera ganador"*.
  - **Jugadores al banco:** Si el total de jugadores no es múltiplo del tamaño de equipo (ej. 5 jugadores para un `2 vs 2`), elige al azar quién queda en el banco para entrar en el próximo partido.
- **Sorteo de Clubes / Equipos (Play / Fútbol):**
  - Categorías predefinidas: **🇦🇷 Fútbol Argentino**, **🌍 Gigantes de Europa (Champions)**, **🏆 Selecciones Nacionales**, **⭐ Mix Élite 5 Estrellas** y **✏️ Personalizado**.
  - **Editor de clubes integrado:** Podés agregar o quitar clubes de cada lista o restaurar los valores por defecto.
  - **Re-sorteo independiente:** Botón para **volver a sortear todos los clubes** sin desarmar las parejas ya armadas, o botón `🔄` en cada tarjeta para **cambiar el club de un solo equipo**.
  - Opción para **evitar clubes repetidos** en el mismo sorteo.
- **Control y Re-sorteo:**
  - **🎲 ¡Armar Parejas y Cruces! / 🔄 Re-sortear todo:** Cada vez que se presiona, vuelve a mezclar de cero a los jugadores activos y sus clubes.
  - **⚽ Solo Clubes:** Mantiene fijas las parejas y cruces ya armados y solo vuelve a barajar los equipos de fútbol.
  - **🧹 Reiniciar:** Oculta los resultados y vuelve al estado inicial de espera, manteniendo intactos a tus amigos en la lista.
  - **Limpiar:** Si deseás borrar la lista completa de jugadores para una nueva juntada.
  - Agregá un jugador o varios a la vez separados por coma (ej. `Jony, Lucas, Mati, Nico`).
  - Clic sobre cualquier jugador para marcarlo como **presente/ausente** sin borrarlo de tu lista habitual.
  - Guardado automático en el navegador (`localStorage`).
- **Exportación para WhatsApp:** Botón **📋 Copiar resumen** que genera el listado de partidos, clubes y suplentes con emojis listo para pegar en el grupo.

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
├── index.html                  # Estructura principal y modal nativo <dialog>
├── styles.css                  # Diseño moderno, adaptable y animaciones CSS
├── app.js                      # Lógica de sorteo (Fisher-Yates), estado y persistencia
├── parejas para truco o play.py # Script original por consola en Python (versión inicial)
├── README.md                   # Documentación de uso del proyecto
└── context.md                  # Contexto técnico, arquitectura y decisiones de diseño
```
