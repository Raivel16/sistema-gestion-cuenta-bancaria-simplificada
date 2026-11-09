import { useState } from 'react'

// Formulario para depositar o retirar. El padre recibe (tipo, monto) mediante onSubmit.
function FormOperacion({ onSubmit, procesando, deshabilitado }) {
  const [tipo, setTipo] = useState('deposito')
  const [monto, setMonto] = useState('')
  const [error, setError] = useState('')

  const manejarEnvio = async (e) => {
    e.preventDefault()
    const valor = Number(monto)
    if (monto === '' || !Number.isFinite(valor) || valor <= 0) {
      setError('Ingrese un monto numérico mayor que cero.')
      return
    }
    setError('')
    const exito = await onSubmit(tipo, valor)
    if (exito) setMonto('')
  }

  const botonTipo = (valor, texto) => (
    <button
      type="button"
      onClick={() => setTipo(valor)}
      className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
        tipo === valor ? 'bg-indigo-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {texto}
    </button>
  )

  return (
    <form onSubmit={manejarEnvio} className="rounded-2xl bg-white p-6 shadow" noValidate>
      <h2 className="text-lg font-bold text-slate-800">Depósito / Retiro</h2>

      <div className="mt-4 flex gap-2">
        {botonTipo('deposito', 'Depositar')}
        {botonTipo('retiro', 'Retirar')}
      </div>

      <label htmlFor="monto-operacion" className="mt-4 block text-sm font-medium text-slate-700">
        Monto (S/)
      </label>
      <input
        id="monto-operacion"
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
        placeholder="0.00"
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={procesando || deshabilitado}
        className={`mt-4 w-full rounded-lg px-4 py-2 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
          tipo === 'deposito' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
        }`}
      >
        {procesando ? 'Procesando...' : tipo === 'deposito' ? 'Realizar depósito' : 'Realizar retiro'}
      </button>
    </form>
  )
}

export default FormOperacion
