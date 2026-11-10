import { useState } from 'react'
import CampoMonto from './CampoMonto'

// Formulario de transferencia. El padre recibe (cuentaDestino, monto) mediante onSubmit.
function FormTransferencia({ cuentaOrigen, onSubmit, procesando, deshabilitado }) {
  const [destino, setDestino] = useState('')
  const [monto, setMonto] = useState('')
  const [error, setError] = useState('')

  const manejarEnvio = async (e) => {
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
    setError('')
    const exito = await onSubmit(destino.trim(), valor)
    if (exito) {
      setDestino('')
      setMonto('')
    }
  }

  return (
    <form onSubmit={manejarEnvio} noValidate>
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
        disabled={procesando || deshabilitado}
        className="mt-5 w-full rounded-lg bg-acento px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-acento-osc disabled:cursor-not-allowed disabled:opacity-50"
      >
        {procesando ? 'Procesando…' : 'Confirmar transferencia'}
      </button>
    </form>
  )
}

export default FormTransferencia
