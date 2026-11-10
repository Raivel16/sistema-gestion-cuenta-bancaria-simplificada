import { useState } from 'react'

// Barra superior: nombre de la app y buscador de cuenta.
function Navbar({ cuentaActiva, onCambiarCuenta, onInicio }) {
  const [texto, setTexto] = useState(cuentaActiva)

  const manejarEnvio = (e) => {
    e.preventDefault()
    const numero = texto.trim()
    if (numero) onCambiarCuenta(numero)
  }

  return (
    <header className="border-b border-linea bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onInicio}
          className="flex items-center gap-2 text-left text-lg font-semibold tracking-tight text-tinta"
        >
          <span className="h-3 w-3 rounded-sm bg-acento" aria-hidden="true" />
          Mi Cuenta Bancaria
        </button>

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
            className="w-full min-w-0 rounded-md border border-linea bg-white px-3 py-2 text-sm text-tinta placeholder-suave focus:border-acento sm:w-44"
          />
          <button
            type="submit"
            className="shrink-0 rounded-md border border-linea px-4 py-2 text-sm font-medium text-tinta transition-colors hover:bg-fondo"
          >
            Cambiar cuenta
          </button>
        </form>
      </div>
    </header>
  )
}

export default Navbar
