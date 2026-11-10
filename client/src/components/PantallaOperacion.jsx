import { formatoMoneda } from '../utils/formato'
import { IconoVolver } from './Iconos'

// Marco común de las pantallas de operación: volver, título y saldo disponible.
function PantallaOperacion({ titulo, descripcion, cuenta, onVolver, children }) {
  return (
    <section className="mx-auto w-full max-w-lg">
      <button
        type="button"
        onClick={onVolver}
        className="mb-4 flex items-center gap-2 rounded-md py-1 text-sm font-medium text-suave transition-colors hover:text-tinta"
      >
        <IconoVolver className="h-4 w-4" />
        Volver al inicio
      </button>

      <div className="rounded-2xl border border-linea bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-tinta">{titulo}</h2>
        <p className="mt-1 text-sm text-suave">{descripcion}</p>

        {cuenta && (
          <dl className="mt-5 flex items-baseline justify-between gap-4 border-y border-linea py-3 text-sm">
            <dt className="text-suave">Saldo disponible · {cuenta.numero}</dt>
            <dd className="font-semibold text-tinta">{formatoMoneda(cuenta.saldo)}</dd>
          </dl>
        )}

        <div className="mt-5">{children}</div>
      </div>
    </section>
  )
}

export default PantallaOperacion
