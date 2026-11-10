import { formatoFecha, formatoMoneda } from '../utils/formato'

// Una fila del extracto. Decide si el movimiento suma o resta para la cuenta que se consulta.
function MovimientoItem({ movimiento, cuentaActual }) {
  const { tipo, monto, fecha, cuentaOrigen, cuentaDestino } = movimiento

  const esTransferencia = tipo === 'transferencia'
  const recibida = esTransferencia && cuentaDestino === cuentaActual
  const suma = tipo === 'deposito' || recibida

  let titulo = 'Depósito'
  if (tipo === 'retiro') titulo = 'Retiro'
  if (esTransferencia) titulo = recibida ? 'Transferencia recibida' : 'Transferencia enviada'

  // En las transferencias se muestra la otra cuenta involucrada.
  const contraparte = esTransferencia ? (recibida ? cuentaOrigen : cuentaDestino) : null

  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0">
        <p className="font-medium text-tinta">{titulo}</p>
        <p className="truncate text-sm text-suave">
          {formatoFecha(fecha)}
          {contraparte && ` · ${recibida ? 'de' : 'a'} ${contraparte}`}
        </p>
      </div>
      <span className={`shrink-0 text-right font-semibold ${suma ? 'text-acento' : 'text-egreso'}`}>
        {suma ? '+' : '−'} {formatoMoneda(monto)}
      </span>
    </li>
  )
}

export default MovimientoItem
