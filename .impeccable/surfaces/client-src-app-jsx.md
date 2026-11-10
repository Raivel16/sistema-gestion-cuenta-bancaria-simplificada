---
version: 1
slug: "client-src-app-jsx"
primary_target: "client/src/App.jsx"
related_targets: []
---

# Surface brief: App bancaria (client)

Scope: toda la app (pantalla principal + una pantalla por operación). Modo: Operate.
Audiencia/tarea: titular de cuenta (demo académica) que consulta saldo, deposita, retira, transfiere y revisa el historial, en laptop y celular. Restricciones: React + Tailwind sin librerías nuevas; código simple (useState/useEffect/Props).

## Direction contract

THESIS: Un banco serio no se decora: el dinero se ve como un objeto grabado. La pantalla principal es una tarjeta de débito (el saldo) más tres acciones grandes y un extracto limpio; rechaza el panel de tarjetas blancas idénticas con degradado índigo y emojis.
OWN-WORLD: Tarjeta de débito grabada. Fondo gris frío (#EDF0F2), superficies blancas con línea fina (#D5DBE0), tinta grafito (#121C26), tarjeta grafito (#17232E) con cifras grabadas (text-shadow con offset y blur), un único verde azulado profundo (#0B6E63) para acciones y ingresos, ladrillo (#B4332A) solo para egresos y errores. Tipografía del sistema, cifras tabulares siempre. Íconos SVG dibujados en un solo trazo. Sin degradados, sin emojis.
STORY: El usuario entiende en un vistazo cuánto tiene, elige una acción con un toque, confirma en una pantalla de un solo campo y vuelve a ver el saldo y el movimiento nuevo.
FIRST VIEWPORT: Barra superior con nombre y selector de cuenta. Debajo, a la izquierda (lg) la tarjeta grafito con saldo grande, número de cuenta agrupado y titular; a la derecha tres botones grandes apilados (Depositar, Retirar, Transferir) con ícono, título y una línea. Abajo, el historial como extracto: fecha, concepto, monto alineado a la derecha. En móvil todo en una columna.
FORM: Operate, candidata 4 de mi lista, seed:bd1d2c780a3e2f03. Signature move: la tarjeta de débito grabada como saldo.
