import { formatoMoneda } from '../utils/formato'
import { IconoChip } from './Iconos'

// Saldo presentado como una tarjeta de débito: el elemento principal de la pantalla.
function SaldoCard({ cuenta, cargando }) {
  return (
    <section
      aria-label="Saldo de la cuenta"
      className="flex min-h-56 flex-col justify-between rounded-2xl bg-grafito p-6 text-white shadow-lg shadow-black/20"
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-white/70">Saldo disponible</p>
        <IconoChip className="h-7 w-10 text-white/50" />
      </div>

      {cuenta ? (
        <>
          <p className="grabado mt-6 break-words text-4xl font-semibold tracking-tight sm:text-5xl">
            {formatoMoneda(cuenta.saldo)}
          </p>
          <div className="mt-6 flex items-end justify-between gap-4">
            <p className="grabado font-mono text-lg tracking-widest">{cuenta.numero.replace('-', ' · ')}</p>
            <p className="text-right text-sm uppercase tracking-wider text-white/70">{cuenta.titular}</p>
          </div>
        </>
      ) : (
        <p className="mt-6 text-xl font-medium text-white/80">
          {cargando ? 'Cargando saldo…' : 'Sin datos de cuenta'}
        </p>
      )}
    </section>
  )
}

export default SaldoCard
