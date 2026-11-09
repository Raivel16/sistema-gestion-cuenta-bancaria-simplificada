import MovimientoItem from './MovimientoItem'

// Lista de las últimas transacciones de la cuenta.
function HistorialTransacciones({ movimientos, cuentaActual, cargando }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow">
      <h2 className="text-lg font-bold text-slate-800">Historial de movimientos</h2>

      {cargando && movimientos.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">Cargando historial...</p>
      ) : movimientos.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">Esta cuenta aún no tiene movimientos.</p>
      ) : (
        <ul className="mt-2 divide-y divide-slate-100">
          {movimientos.map((movimiento) => (
            <MovimientoItem key={movimiento._id} movimiento={movimiento} cuentaActual={cuentaActual} />
          ))}
        </ul>
      )}
    </section>
  )
}

export default HistorialTransacciones
