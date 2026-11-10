import MovimientoItem from './MovimientoItem'

// Extracto con las últimas transacciones de la cuenta.
function HistorialTransacciones({ movimientos, cuentaActual, cargando }) {
  return (
    <section aria-label="Historial de movimientos">
      <h2 className="mb-3 text-lg font-semibold text-tinta">Últimos movimientos</h2>

      <div className="overflow-hidden rounded-xl border border-linea bg-white">
        {cargando && movimientos.length === 0 ? (
          <p className="px-4 py-6 text-sm text-suave">Cargando movimientos…</p>
        ) : movimientos.length === 0 ? (
          <p className="px-4 py-6 text-sm text-suave">
            Esta cuenta aún no tiene movimientos. Haga un depósito para comenzar.
          </p>
        ) : (
          <ul className="divide-y divide-linea">
            {movimientos.map((movimiento) => (
              <MovimientoItem key={movimiento._id} movimiento={movimiento} cuentaActual={cuentaActual} />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default HistorialTransacciones
