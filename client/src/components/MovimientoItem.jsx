import { formatoFecha, formatoMoneda } from '../utils/formato'

// Una fila del historial. Decide si el movimiento suma o resta para la cuenta que se consulta.
function MovimientoItem({ movimiento, cuentaActual }) {
  const { tipo, monto, fecha, cuentaOrigen, cuentaDestino } = movimiento

  const esTransferencia = tipo === 'transferencia'
  const recibida = esTransferencia && cuentaDestino === cuentaActual
  const suma = tipo === 'deposito' || recibida

  let titulo = 'Depósito'
  if (tipo === 'retiro') titulo = 'Retiro'
  if (esTransferencia) titulo = recibida ? 'Transferencia recibida' : 'Transferencia enviada'

  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="font-semibold text-slate-800">{titulo}</p>
        <p className="text-xs text-slate-500">{formatoFecha(fecha)}</p>
        <p className="truncate text-xs text-slate-500">
          Origen: {cuentaOrigen}
          {cuentaDestino && ` → Destino: ${cuentaDestino}`}
        </p>
      </div>
      <span className={`shrink-0 text-right font-bold ${suma ? 'text-green-600' : 'text-red-600'}`}>
        {suma ? '+' : '-'} {formatoMoneda(monto)}
      </span>
    </li>
  )
}

export default MovimientoItem
