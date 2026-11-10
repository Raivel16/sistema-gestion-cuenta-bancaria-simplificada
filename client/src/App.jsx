import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import SaldoCard from './components/SaldoCard'
import MenuOperaciones from './components/MenuOperaciones'
import PantallaOperacion from './components/PantallaOperacion'
import FormOperacion from './components/FormOperacion'
import FormTransferencia from './components/FormTransferencia'
import HistorialTransacciones from './components/HistorialTransacciones'
import Mensaje from './components/Mensaje'
import * as api from './services/api'

// Textos de cada pantalla de operación.
const PANTALLAS = {
  deposito: { titulo: 'Depositar', descripcion: 'Agregue dinero a su cuenta.' },
  retiro: { titulo: 'Retirar', descripcion: 'Retire dinero de su saldo disponible.' },
  transferencia: { titulo: 'Transferir', descripcion: 'Envíe dinero a otra cuenta del banco.' },
}

function App() {
  // "inicio", "deposito", "retiro" o "transferencia": decide qué pantalla se muestra.
  const [vista, setVista] = useState('inicio')
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

  const irAInicio = () => {
    setMensaje(null)
    setVista('inicio')
  }

  const abrirOperacion = (nuevaVista) => {
    setMensaje(null)
    setVista(nuevaVista)
  }

  const cambiarCuenta = (numero) => {
    setCuentaActiva(numero)
    irAInicio()
  }

  // Ejecuta una operación de la API. Si sale bien, vuelve al inicio con el saldo actualizado.
  const ejecutarOperacion = async (accion) => {
    setProcesando(true)
    setMensaje(null)
    try {
      const respuesta = await accion()
      setMensaje({ tipo: 'exito', texto: respuesta.mensaje })
      setVersion((v) => v + 1)
      setVista('inicio')
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
    <div className="min-h-screen bg-fondo">
      <Navbar cuentaActiva={cuentaActiva} onCambiarCuenta={cambiarCuenta} onInicio={irAInicio} />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <Mensaje mensaje={mensaje} onCerrar={() => setMensaje(null)} />

        {vista === 'inicio' ? (
          <>
            <div className="grid gap-6 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <SaldoCard cuenta={cuenta} cargando={cargando} />
              </div>
              <div className="lg:col-span-2">
                <MenuOperaciones onElegir={abrirOperacion} deshabilitado={!cuenta} />
              </div>
            </div>
            <HistorialTransacciones movimientos={movimientos} cuentaActual={cuentaActiva} cargando={cargando} />
          </>
        ) : (
          <PantallaOperacion
            titulo={PANTALLAS[vista].titulo}
            descripcion={PANTALLAS[vista].descripcion}
            cuenta={cuenta}
            onVolver={irAInicio}
          >
            {vista === 'transferencia' ? (
              <FormTransferencia
                cuentaOrigen={cuentaActiva}
                onSubmit={manejarTransferencia}
                procesando={procesando}
                deshabilitado={!cuenta}
              />
            ) : (
              <FormOperacion tipo={vista} onSubmit={manejarOperacion} procesando={procesando} deshabilitado={!cuenta} />
            )}
          </PantallaOperacion>
        )}
      </main>
    </div>
  )
}

export default App
