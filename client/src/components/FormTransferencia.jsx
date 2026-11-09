import { useState } from 'react'

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

  const clasesInput =
    'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200'

  return (
    <form onSubmit={manejarEnvio} className="rounded-2xl bg-white p-6 shadow" noValidate>
      <h2 className="text-lg font-bold text-slate-800">Transferir dinero</h2>
      <p className="mt-1 text-sm text-slate-500">
        Desde la cuenta <strong>{cuentaOrigen}</strong>
      </p>

      <label htmlFor="cuenta-destino" className="mt-4 block text-sm font-medium text-slate-700">
        Cuenta de destino
      </label>
      <input
        id="cuenta-destino"
        type="text"
        value={destino}
        onChange={(e) => setDestino(e.target.value)}
        placeholder="Ej. 001-0002"
        className={clasesInput}
      />

      <label htmlFor="monto-transferencia" className="mt-4 block text-sm font-medium text-slate-700">
        Monto (S/)
      </label>
      <input
        id="monto-transferencia"
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
        placeholder="0.00"
        className={clasesInput}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={procesando || deshabilitado}
        className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {procesando ? 'Procesando...' : 'Transferir'}
      </button>
    </form>
  )
}

export default FormTransferencia
