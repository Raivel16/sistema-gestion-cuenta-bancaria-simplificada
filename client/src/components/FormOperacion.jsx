import { useState } from 'react'
import CampoMonto from './CampoMonto'

// Formulario de depósito o retiro según la prop "tipo". El padre recibe (tipo, monto) en onSubmit.
function FormOperacion({ tipo, onSubmit, procesando, deshabilitado }) {
  const [monto, setMonto] = useState('')
  const [error, setError] = useState('')

  const esDeposito = tipo === 'deposito'

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

  return (
    <form onSubmit={manejarEnvio} noValidate>
      <CampoMonto id="monto-operacion" valor={monto} onCambio={setMonto} />
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
        {procesando ? 'Procesando…' : esDeposito ? 'Confirmar depósito' : 'Confirmar retiro'}
      </button>
    </form>
  )
}

export default FormOperacion
