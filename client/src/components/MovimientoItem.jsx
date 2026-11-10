import { formatoFecha, formatoMoneda } from '../utils/formato'

// Una fila del extracto. Según la cuenta que se consulta decide si el movimiento suma o resta
// y, en las transferencias, muestra a quién se envió o de quién se recibió.
function MovimientoItem({ movimiento, cuentaActual }) {
  const { tipo, monto, fecha, cuentaOrigen, cuentaDestino, titularOrigen, titularDestino } = movimiento

  const esTransferencia = tipo === 'transferencia'
  const recibida = esTransferencia && cuentaDestino === cuentaActual
  const suma = tipo === 'deposito' || recibida

  let titulo = 'Depósito'
  if (tipo === 'retiro') titulo = 'Retiro'
  if (esTransferencia) titulo = recibida ? 'Transferencia recibida' : 'Transferencia enviada'

  // La otra persona involucrada: quien envió (si recibí) o quien recibió (si envié).
  const contraparte = recibida
    ? { etiqueta: 'De', nombre: titularOrigen, numero: cuentaOrigen }
    : { etiqueta: 'Para', nombre: titularDestino, numero: cuentaDestino }

  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0">
        <p className="font-medium text-tinta">{titulo}</p>
        {esTransferencia && (
          <p className="truncate text-sm text-tinta">
            <span className="text-suave">{contraparte.etiqueta}:</span>{' '}
            <span className="font-medium">{contraparte.nombre || 'Cuenta'}</span>
            <span className="font-mono text-suave"> · {contraparte.numero}</span>
          </p>
        )}
        <p className="text-sm text-suave">{formatoFecha(fecha)}</p>
      </div>
      <span className={`shrink-0 text-right font-semibold ${suma ? 'text-acento' : 'text-egreso'}`}>
        {suma ? '+' : '−'} {formatoMoneda(monto)}
      </span>
    </li>
  )
}

export default MovimientoItem
