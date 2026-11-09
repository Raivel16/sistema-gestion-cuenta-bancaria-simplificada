import { formatoMoneda } from '../utils/formato'

// Tarjeta con el saldo actual y los datos de la cuenta.
function SaldoCard({ cuenta, cargando }) {
  return (
    <section className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-lg">
      <p className="text-sm uppercase tracking-wide text-indigo-200">Saldo disponible</p>

      {cuenta ? (
        <>
          <p className="mt-2 break-words text-4xl font-bold sm:text-5xl">{formatoMoneda(cuenta.saldo)}</p>
          <div className="mt-4 flex flex-col gap-1 text-sm text-indigo-100 sm:flex-row sm:gap-6">
            <span>
              Titular: <strong className="text-white">{cuenta.titular}</strong>
            </span>
            <span>
              Cuenta: <strong className="text-white">{cuenta.numero}</strong>
            </span>
          </div>
        </>
      ) : (
        <p className="mt-2 text-2xl font-semibold text-indigo-100">
          {cargando ? 'Cargando saldo...' : 'Sin datos de cuenta'}
        </p>
      )}
    </section>
  )
}

export default SaldoCard
