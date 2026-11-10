import { useState } from 'react'
import CampoMonto from './CampoMonto'
import { formatoMoneda } from '../utils/formato'
import * as api from '../services/api'

// Transferencia en dos pasos: 1) datos y 2) confirmación mostrando el titular del destino.
// El padre recibe (cuentaDestino, monto) mediante onSubmit.
function FormTransferencia({ cuentaOrigen, saldo, onSubmit, procesando, deshabilitado }) {
  const [destino, setDestino] = useState('')
  const [monto, setMonto] = useState('')
  const [error, setError] = useState('')
  const [verificando, setVerificando] = useState(false)
  // Datos del destino ya verificados ({ numero, titular }); null mientras se llenan los datos.
  const [titularDestino, setTitularDestino] = useState(null)

  // Paso 1: valida los datos y consulta a quién pertenece la cuenta de destino.
  const continuar = async (e) => {
    e.preventDefault()
    const valor = Number(monto)
    if (!destino.trim()) {
      setError('Indique la cuenta de destino.')
      return
    }
    if (destino.trim() === cuentaOrigen) {
      setError('La cuenta de destino debe ser distinta a la de origen.')
      return
    }
    if (monto === '' || !Number.isFinite(valor) || valor <= 0) {
      setError('Ingrese un monto numérico mayor que cero.')
      return
    }
    if (valor > saldo) {
      setError('Saldo insuficiente para esta transferencia.')
      return
    }
    setError('')
    setVerificando(true)
    try {
      const respuesta = await api.obtenerDestino(destino.trim())
      setTitularDestino(respuesta.cuenta)
    } catch (err) {
      setError(err.message)
    } finally {
      setVerificando(false)
    }
  }

  // Paso 2: el usuario confirma que el titular es el correcto.
  const confirmar = async () => {
    const exito = await onSubmit(titularDestino.numero, Number(monto))
    if (exito) {
      setDestino('')
      setMonto('')
      setTitularDestino(null)
    }
  }

  if (titularDestino) {
    return (
      <div>
        <p className="text-sm text-suave">Revise los datos antes de confirmar.</p>

        <dl className="mt-3 divide-y divide-linea rounded-lg border border-linea text-sm">
          <div className="flex items-baseline justify-between gap-4 px-4 py-3">
            <dt className="text-suave">Titular del destino</dt>
            <dd className="text-right text-base font-semibold text-tinta">{titularDestino.titular}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 px-4 py-3">
            <dt className="text-suave">Cuenta de destino</dt>
            <dd className="font-mono text-tinta">{titularDestino.numero}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 px-4 py-3">
            <dt className="text-suave">Monto a transferir</dt>
            <dd className="text-lg font-semibold text-tinta">{formatoMoneda(Number(monto))}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={confirmar}
          disabled={procesando || deshabilitado}
          className="mt-5 w-full rounded-lg bg-acento px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-acento-osc disabled:cursor-not-allowed disabled:opacity-50"
        >
          {procesando ? 'Procesando…' : 'Confirmar transferencia'}
        </button>
        <button
          type="button"
          onClick={() => setTitularDestino(null)}
          disabled={procesando}
          className="mt-2 w-full rounded-lg border border-linea px-4 py-3 text-base font-medium text-tinta transition-colors hover:bg-fondo disabled:opacity-50"
        >
          Corregir datos
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={continuar} noValidate>
      <label htmlFor="cuenta-destino" className="block text-sm font-medium text-tinta">
        Cuenta de destino
      </label>
      <input
        id="cuenta-destino"
        type="text"
        value={destino}
        onChange={(e) => setDestino(e.target.value)}
        placeholder="Ej. 001-0002"
        className="mt-1 mb-4 w-full rounded-lg border border-linea bg-white px-4 py-3 text-lg text-tinta placeholder-suave focus:border-acento focus:ring-2 focus:ring-acento-claro focus:outline-none"
      />

      <CampoMonto id="monto-transferencia" valor={monto} onCambio={setMonto} />
      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-egreso">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={verificando || deshabilitado}
        className="mt-5 w-full rounded-lg bg-acento px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-acento-osc disabled:cursor-not-allowed disabled:opacity-50"
      >
        {verificando ? 'Verificando cuenta…' : 'Continuar'}
      </button>
    </form>
  )
}

export default FormTransferencia
