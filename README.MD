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

| Cuenta | Titular | Saldo inicial |
|---|---|---|
| 001-0001 | Ana Torres | 1500.00 |
| 001-0002 | Luis Ramirez | 800.50 |
| 001-0003 | Carla Mendoza | 2500.00 |
| 001-0004 | Jorge Quispe | 120.00 |

En la interfaz, escriba el número de cuenta en el recuadro superior y pulse **Consultar** para ver su saldo e historial.

## Endpoints

| Método | Ruta | Cuerpo | Respuesta |
|---|---|---|---|
| GET | `/api/cuenta/:id` | — | 200 / 404 |
| POST | `/api/cuenta/deposito` | `{ "cuenta": "001-0001", "monto": 100 }` | 201 / 400 / 404 |
| POST | `/api/cuenta/retiro` | `{ "cuenta": "001-0001", "monto": 50 }` | 201 / 400 / 404 |
| POST | `/api/cuenta/transferencia` | `{ "cuentaOrigen": "001-0001", "cuentaDestino": "001-0002", "monto": 75 }` | 201 / 400 / 404 |
| GET | `/api/cuenta/:id/historial` | — | 200 / 404 |

`:id` es el número de cuenta. Los errores responden `{ "ok": false, "mensaje": "..." }`: 400 (monto inválido, saldo insuficiente, misma cuenta), 404 (cuenta inexistente) y 500 (error interno, sin detalles técnicos).

## Cómo probar una transferencia

1. Ejecute `npm run seed` y abra `http://localhost:5173` con la cuenta `001-0001`.
2. En **Transferir dinero** escriba el destino `001-0002` y un monto, por ejemplo `75`.
3. El saldo baja de inmediato y el historial muestra "Transferencia enviada".
4. Consulte `001-0002` en el recuadro superior: su saldo subió en `75` y aparece "Transferencia recibida".
5. Pruebe un destino inexistente (`999`) o un monto mayor al saldo: se muestra el error y los saldos no cambian.

O por API:

```bash
curl -X POST http://localhost:3000/api/cuenta/transferencia \
  -H "Content-Type: application/json" \
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

## Alcance

Según la consigna, el sistema no incluye autenticación ni roles: cualquier cliente puede operar sobre cualquier cuenta. No debe exponerse fuera de un entorno local de demostración.
