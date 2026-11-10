import { useState } from 'react'

// Pantalla de ingreso con usuario y PIN de 4 dígitos. El padre recibe (usuario, pin) en onIngresar
// y devuelve un texto de error si el ingreso falló.
function Login({ onIngresar, procesando }) {
  const [usuario, setUsuario] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  const manejarEnvio = async (e) => {
    e.preventDefault()
    if (!usuario.trim()) {
      setError('Ingrese su usuario.')
      return
    }
    if (!/^\d{4}$/.test(pin)) {
      setError('El PIN debe tener 4 dígitos.')
      return
    }
    setError('')
    const mensaje = await onIngresar(usuario.trim(), pin)
    if (mensaje) {
      setError(mensaje)
      setPin('')
    }
  }

  const clasesInput =
    'mt-1 w-full rounded-lg border border-linea bg-white px-4 py-3 text-lg text-tinta placeholder-suave focus:border-acento focus:ring-2 focus:ring-acento-claro focus:outline-none'

  return (
    <section className="mx-auto w-full max-w-md py-6">
      <form onSubmit={manejarEnvio} noValidate className="rounded-2xl border border-linea bg-white p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-tinta">Ingresar</h1>
        <p className="mt-1 text-sm text-suave">Acceda a su cuenta con su usuario y PIN.</p>

        <label htmlFor="usuario" className="mt-5 block text-sm font-medium text-tinta">
          Usuario
        </label>
        <input
          id="usuario"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          className={clasesInput}
        />

        <label htmlFor="pin" className="mt-4 block text-sm font-medium text-tinta">
          PIN de 4 dígitos
        </label>
        <input
          id="pin"
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          className={`${clasesInput} tracking-[0.5em]`}
        />

        {error && (
          <p role="alert" className="mt-3 text-sm font-medium text-egreso">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={procesando}
          className="mt-5 w-full rounded-lg bg-acento px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-acento-osc disabled:cursor-not-allowed disabled:opacity-50"
        >
          {procesando ? 'Ingresando…' : 'Ingresar'}
        </button>

        <p className="mt-4 text-center text-sm text-suave">
          Demostración: usuario <strong className="text-tinta">ana</strong>, PIN{' '}
          <strong className="text-tinta">1111</strong>
        </p>
      </form>
    </section>
  )
}

export default Login
