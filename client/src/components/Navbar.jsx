// Barra superior: nombre de la app y, con sesión abierta, la cuenta activa y "Cerrar sesión".
function Navbar({ cuenta, onInicio, onSalir }) {
  return (
    <header className="border-b border-linea bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          onClick={onInicio}
          className="flex items-center gap-2 text-left text-lg font-semibold tracking-tight text-tinta"
        >
          <span className="h-3 w-3 rounded-sm bg-acento" aria-hidden="true" />
          Mi Cuenta Bancaria
        </button>

        {onSalir && (
          <div className="flex items-center gap-3">
            {cuenta && (
              <p className="hidden text-right text-sm leading-tight sm:block">
                <span className="block font-medium text-tinta">{cuenta.titular}</span>
                <span className="block font-mono text-suave">{cuenta.numero}</span>
              </p>
            )}
            <button
              type="button"
              onClick={onSalir}
              className="shrink-0 rounded-md border border-linea px-4 py-2 text-sm font-medium text-tinta transition-colors hover:bg-fondo"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
