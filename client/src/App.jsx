import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import SaldoCard from './components/SaldoCard'
import FormOperacion from './components/FormOperacion'
import FormTransferencia from './components/FormTransferencia'
import HistorialTransacciones from './components/HistorialTransacciones'
import Mensaje from './components/Mensaje'
import * as api from './services/api'

function App() {
  const [cuentaActiva, setCuentaActiva] = useState('001-0001')
  const [cuenta, setCuenta] = useState(null)
  const [movimientos, setMovimientos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  // Cada vez que cambia, el useEffect vuelve a pedir los datos al servidor.
  const [version, setVersion] = useState(0)

  // Carga inicial y sincronización: al abrir la app, al cambiar de cuenta y después de cada operación.
  useEffect(() => {
    let vigente = true

    async function cargarDatos() {
      setCargando(true)
      try {
        const [datosCuenta, datosHistorial] = await Promise.all([
          api.obtenerCuenta(cuentaActiva),
          api.obtenerHistorial(cuentaActiva),
        ])
        if (!vigente) return
        setCuenta(datosCuenta.cuenta)
        setMovimientos(datosHistorial.movimientos)
      } catch (error) {
        if (!vigente) return
        setCuenta(null)
        setMovimientos([])
        setMensaje({ tipo: 'error', texto: error.message })
      } finally {
        if (vigente) setCargando(false)
      }
    }

    cargarDatos()
    return () => {
      vigente = false
    }
  }, [cuentaActiva, version])

  const cambiarCuenta = (numero) => {
    setMensaje(null)
    setCuentaActiva(numero)
  }

  // Ejecuta una operación de la API, muestra el resultado y refresca saldo e historial.
  const ejecutarOperacion = async (accion) => {
    setProcesando(true)
    setMensaje(null)
    try {
      const respuesta = await accion()
      setMensaje({ tipo: 'exito', texto: respuesta.mensaje })
      setVersion((v) => v + 1)
      return true
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.message })
      return false
    } finally {
      setProcesando(false)
    }
  }

  const manejarOperacion = (tipo, monto) =>
    ejecutarOperacion(() => (tipo === 'deposito' ? api.depositar(cuentaActiva, monto) : api.retirar(cuentaActiva, monto)))

  const manejarTransferencia = (destino, monto) =>
    ejecutarOperacion(() => api.transferir(cuentaActiva, destino, monto))

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar cuentaActiva={cuentaActiva} onCambiarCuenta={cambiarCuenta} />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <Mensaje mensaje={mensaje} onCerrar={() => setMensaje(null)} />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <SaldoCard cuenta={cuenta} cargando={cargando} />
            <FormOperacion onSubmit={manejarOperacion} procesando={procesando} deshabilitado={!cuenta} />
            <FormTransferencia
              cuentaOrigen={cuentaActiva}
              onSubmit={manejarTransferencia}
              procesando={procesando}
              deshabilitado={!cuenta}
            />
          </div>
          <div>
            <HistorialTransacciones movimientos={movimientos} cuentaActual={cuentaActiva} cargando={cargando} />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
