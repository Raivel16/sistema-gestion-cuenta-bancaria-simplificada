// Llamadas HTTP a la API REST del servidor Express.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Token de la sesión abierta. Se envía en cada petición como "Authorization: Bearer <token>".
let token = ''

export function guardarToken(nuevoToken) {
  token = nuevoToken
}

// Envía la petición y devuelve el JSON. Si la API responde con error, lanza un Error
// con su mensaje y el código HTTP en error.status.
async function pedir(ruta, opciones = {}) {
  let respuesta
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      ...opciones,
      headers: {
        ...(opciones.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor. Verifique que el backend esté activo.')
  }

  let datos = {}
  try {
    datos = await respuesta.json()
  } catch {
    // La respuesta no era JSON; se informa más abajo.
  }

  if (!respuesta.ok) {
    const error = new Error(datos.mensaje || 'Ocurrió un error inesperado en el servidor.')
    error.status = respuesta.status
    throw error
  }
  return datos
}

function enviar(ruta, cuerpo) {
  return pedir(ruta, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
  })
}

export const iniciarSesion = (usuario, pin) => enviar('/auth/login', { usuario, pin })

export const cerrarSesion = () => enviar('/auth/logout', {})

export const obtenerCuenta = (numero) => pedir(`/cuenta/${encodeURIComponent(numero)}`)

export const obtenerHistorial = (numero) => pedir(`/cuenta/${encodeURIComponent(numero)}/historial`)

// Titular de una cuenta de destino (solo número y nombre), para confirmar antes de transferir.
export const obtenerDestino = (numero) => pedir(`/cuenta/destino/${encodeURIComponent(numero)}`)

export const depositar = (cuenta, monto) => enviar('/cuenta/deposito', { cuenta, monto })

export const retirar = (cuenta, monto) => enviar('/cuenta/retiro', { cuenta, monto })

export const transferir = (cuentaOrigen, cuentaDestino, monto) =>
  enviar('/cuenta/transferencia', { cuentaOrigen, cuentaDestino, monto })
