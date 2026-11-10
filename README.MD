# Sistema de Gestión de Cuenta Bancaria Simplificada

Aplicación web Full-Stack (Ingeniería Web) para consultar saldo, depositar, retirar, transferir entre cuentas y ver el historial de movimientos. Los datos se guardan en MongoDB local.

## Tecnologías

- **Backend:** Node.js, Express 4, Mongoose (MongoDB). Capas: Router → Controller → Service → Repository → Model.
- **Frontend:** React 19 + Vite, Hooks (`useState`, `useEffect`), Props y Tailwind CSS 4.

## Requisitos previos

- Node.js 20 o superior (probado con 22) y npm.
- MongoDB Community Server en local, activo en `mongodb://127.0.0.1:27017` (no requiere configuración especial).

## Instalación y ejecución

```bash
# 1. Backend
cd server
npm install
cp .env.example .env      # en Windows: copy .env.example .env
npm run seed              # carga las cuentas de prueba
npm start                 # http://localhost:3000

# 2. Frontend (en otra terminal)
cd client
npm install
cp .env.example .env      # opcional: solo si cambia la URL de la API
npm run dev               # http://localhost:5173
```

### Variables de entorno

| Archivo | Variable | Valor por defecto | Uso |
|---|---|---|---|
| `server/.env` | `PORT` | `3000` | Puerto de la API |
| `server/.env` | `MONGODB_URI` | `mongodb://127.0.0.1:27017/cuenta_bancaria` | Conexión a MongoDB |
| `server/.env` | `CLIENT_URL` | `http://localhost:5173` | Origen permitido por CORS |
| `client/.env` | `VITE_API_URL` | `http://localhost:3000/api` | URL base de la API |

## Seed (datos de prueba)

`npm run seed` (en `server/`) crea o restablece estas cuentas y sus movimientos de ejemplo. Puede ejecutarse las veces que se quiera sin generar duplicados.

| Cuenta | Titular | Saldo inicial | Usuario | PIN |
|---|---|---|---|---|
| 001-0001 | Ana Torres | 1500.00 | `ana` | `1111` |
| 001-0002 | Luis Ramirez | 800.50 | `luis` | `2222` |
| 001-0003 | Carla Mendoza | 2500.00 | `carla` | `3333` |
| 001-0004 | Jorge Quispe | 120.00 | `jorge` | `4444` |

En la interfaz, ingrese con usuario y PIN de 4 dígitos (por ejemplo `ana` / `1111`). Cada usuario solo ve y opera su propia cuenta. **Cerrar sesión** vuelve a la pantalla de ingreso. Los PIN se guardan con hash (scrypt) y tras 5 intentos fallidos el usuario se bloquea 1 minuto.

## Endpoints

**Autenticación:** todas las rutas de `/api/cuenta` requieren la cabecera `Authorization: Bearer <token>`, que se obtiene al iniciar sesión. Las sesiones duran 1 hora y viven en memoria (al reiniciar el servidor hay que volver a ingresar). Sin sesión responden 401; si se indica una cuenta distinta a la de la sesión, 403.

| Método | Ruta | Cuerpo | Respuesta |
|---|---|---|---|
| POST | `/api/auth/login` | `{ "usuario": "ana", "pin": "1111" }` | 200 (token y cuenta) / 400 / 401 / 429 |
| POST | `/api/auth/logout` | — | 200 / 401 |
| GET | `/api/cuenta/destino/:numero` | — | 200 (número y titular) / 404 |

| Método | Ruta | Cuerpo | Respuesta |
|---|---|---|---|
| GET | `/api/cuenta/:id` | — | 200 / 404 |
| POST | `/api/cuenta/deposito` | `{ "cuenta": "001-0001", "monto": 100 }` | 201 / 400 / 404 |
| POST | `/api/cuenta/retiro` | `{ "cuenta": "001-0001", "monto": 50 }` | 201 / 400 / 404 |
| POST | `/api/cuenta/transferencia` | `{ "cuentaOrigen": "001-0001", "cuentaDestino": "001-0002", "monto": 75 }` | 201 / 400 / 404 |
| GET | `/api/cuenta/:id/historial` | — | 200 / 404 |

`:id` es el número de cuenta. Los errores responden `{ "ok": false, "mensaje": "..." }`: 400 (monto inválido, saldo insuficiente, misma cuenta), 404 (cuenta inexistente) y 500 (error interno, sin detalles técnicos).

## Cómo probar una transferencia

1. Ejecute `npm run seed`, abra `http://localhost:5173` e ingrese con `ana` / `1111`.
2. Pulse **Transferir**, escriba el destino `001-0002` y un monto, por ejemplo `75`, y pulse **Continuar**.
3. La pantalla muestra el **titular del destino** (Luis Ramirez) para verificarlo; pulse **Confirmar transferencia**.
4. El saldo baja de inmediato y el historial muestra "Transferencia enviada".
5. Cierre sesión e ingrese con `luis` / `2222`: su saldo subió en `75` y aparece "Transferencia recibida".
6. Pruebe un destino inexistente (`999`) o un monto mayor al saldo: se muestra el error y los saldos no cambian.

O por API:

```bash
# 1. Iniciar sesión y copiar el "token" de la respuesta
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"ana","pin":"1111"}'

# 2. Transferir usando ese token
curl -X POST http://localhost:3000/api/cuenta/transferencia \
  -H "Content-Type: application/json" -H "Authorization: Bearer <token>" \
  -d '{"cuentaOrigen":"001-0001","cuentaDestino":"001-0002","monto":75}'
```

## Atomicidad de las transferencias

El servidor detecta al iniciar si MongoDB admite transacciones y lo muestra en consola:

- **Replica set:** débito, crédito y registro se ejecutan en una transacción de MongoDB (sesión de Mongoose).
- **MongoDB standalone (instalación por defecto):** el débito es una operación atómica condicional (`saldo >= monto`), por lo que el saldo nunca queda negativo. Si falla el crédito o el registro del movimiento, los pasos previos se revierten.

No se necesita configurar nada; funciona en ambos casos. Opcionalmente, para usar transacciones reales, inicie `mongod --replSet rs0` y ejecute `rs.initiate()`; luego use `MONGODB_URI=mongodb://127.0.0.1:27017/cuenta_bancaria?replicaSet=rs0`.

## Pruebas

```bash
cd server
npm test
```

Ejecuta 7 pruebas contra la base `cuenta_bancaria_test` (depósitos, retiros, transferencias, reversión ante fallos y concurrencia). Para ejecutarlas contra un replica set: `TEST_MONGODB_URI="mongodb://127.0.0.1:27018/cuenta_bancaria_test?replicaSet=rs0" npm test`.

## Estructura

```text
server/  API (src/config, models, repositories, services, controllers, routes), scripts/seed.js, tests/
client/  React + Vite (src/components, services/api.js, utils)
docs/    Consigna del trabajo práctico
```

## Alcance y limitaciones de seguridad

El ingreso (usuario y PIN) es un control sencillo pensado para la demostración, no para producción: sesiones en memoria, sin HTTPS, sin renovación de tokens y sin registro de usuarios. La consulta del titular de una cuenta destino (`/api/cuenta/destino/:numero`) muestra el nombre completo a cualquier usuario con sesión, tal como pide el flujo de confirmación; un sistema real limitaría esas consultas y enmascararía parte del nombre.
