import { useState } from 'react'

// Encabezado con el nombre de la app y el buscador de cuenta.
function Navbar({ cuentaActiva, onCambiarCuenta }) {
  const [texto, setTexto] = useState(cuentaActiva)

  const manejarEnvio = (e) => {
    e.preventDefault()
    const numero = texto.trim()
    if (numero) onCambiarCuenta(numero)
  }

  return (
    <header className="bg-indigo-700 text-white shadow-md">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold tracking-tight">🏦 Mi Cuenta Bancaria</h1>

        <form onSubmit={manejarEnvio} className="flex gap-2">
          <label htmlFor="cuenta-activa" className="sr-only">
            Número de cuenta
          </label>
          <input
            id="cuenta-activa"
            type="text"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Ej. 001-0001"
            className="w-full min-w-0 rounded-lg border border-indigo-400 bg-indigo-600 px-3 py-2 text-sm text-white placeholder-indigo-200 focus:border-white focus:outline-none sm:w-48"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
          >
            Consultar
          </button>
        </form>
      </div>
    </header>
  )
}

export default Navbar
