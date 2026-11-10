import { useEffect, useState } from 'react'
import * as api from '../services/api'

// Cuentas de demostración creadas por el seed (npm run seed en /server).
const CUENTAS_DEMO = ['001-0001', '001-0002', '001-0003']

function iniciales(nombre) {
  return nombre
    .split(' ')
    .map((palabra) => palabra[0])
    .join('')
    .slice(0, 2)
}

// Pantalla de ingreso: se elige una de las cuentas demo y se entra.
function Login({ onIngresar }) {
  const [cuentas, setCuentas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Pide al servidor el titular de cada cuenta demo para mostrarlo en la lista.
  useEffect(() => {
    let vigente = true

    async function cargarCuentas() {
      try {
        const respuestas = await Promise.all(CUENTAS_DEMO.map((numero) => api.obtenerCuenta(numero)))
        if (vigente) setCuentas(respuestas.map((r) => r.cuenta))
      } catch (e) {
        if (vigente) setError(e.message)
      } finally {
        if (vigente) setCargando(false)
      }
    }

    cargarCuentas()
    return () => {
      vigente = false
    }
  }, [])

  return (
    <section className="mx-auto w-full max-w-md py-6">
      <div className="rounded-2xl border border-linea bg-white p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-tinta">Ingresar</h1>
        <p className="mt-1 text-sm text-suave">Elija una cuenta de demostración para abrirla.</p>

        {error && (
          <p role="alert" className="mt-4 rounded-lg border border-egreso/30 bg-egreso-claro px-4 py-3 text-sm font-medium text-egreso">
            {error} Si la base está vacía, ejecute <code>npm run seed</code> en el servidor.
          </p>
        )}

        {cargando && <p className="mt-5 text-sm text-suave">Cargando cuentas…</p>}

        <ul className="mt-5 grid gap-3">
          {cuentas.map((cuenta) => (
            <li key={cuenta.numero}>
              <button
                type="button"
                onClick={() => onIngresar(cuenta.numero)}
                className="flex w-full items-center gap-4 rounded-xl border border-linea p-4 text-left transition-colors hover:border-acento hover:bg-acento-claro"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-grafito text-sm font-semibold uppercase text-white">
                  {iniciales(cuenta.titular)}
                </span>
                <span>
                  <span className="block font-semibold text-tinta">{cuenta.titular}</span>
                  <span className="block font-mono text-sm tracking-wider text-suave">{cuenta.numero}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Login
