import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Login from './components/Login'
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
  // Número de la cuenta con sesión abierta; null mientras no se haya ingresado.
  const [cuentaActiva, setCuentaActiva] = useState(null)
  const [cuenta, setCuenta] = useState(null)
  const [movimientos, setMovimientos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  // Cada vez que cambia, el useEffect vuelve a pedir los datos al servidor.
  const [version, setVersion] = useState(0)

  // Limpia todo el estado de la sesión y vuelve a la pantalla de ingreso.
  const limpiarSesion = (aviso = null) => {
    api.guardarToken('')
    setCuentaActiva(null)
    setCuenta(null)
    setMovimientos([])
    setVista('inicio')
    setMensaje(aviso)
  }

  // Si el servidor responde 401, la sesión venció: se vuelve al ingreso.
  const sesionVencida = (error) => {
    if (error.status !== 401) return false
    limpiarSesion({ tipo: 'error', texto: 'Su sesión expiró. Ingrese nuevamente.' })
    return true
  }

  // Carga inicial y sincronización: al abrir la app, al cambiar de cuenta y después de cada operación.
  useEffect(() => {
    if (!cuentaActiva) return

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
        if (sesionVencida(error)) return
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

  // Devuelve un texto de error si el ingreso falla; si sale bien abre la cuenta.
  const ingresar = async (usuario, pin) => {
    setProcesando(true)
    try {
      const respuesta = await api.iniciarSesion(usuario, pin)
      api.guardarToken(respuesta.token)
      setCargando(true)
      setMensaje(null)
      setVista('inicio')
      setCuentaActiva(respuesta.cuenta.numero)
      return ''
    } catch (error) {
      return error.message
    } finally {
      setProcesando(false)
    }
  }

  const cerrarSesion = async () => {
    try {
      await api.cerrarSesion()
    } catch {
      // Aunque el servidor no responda, la sesión se cierra en el navegador.
    }
    limpiarSesion()
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
      if (!sesionVencida(error)) setMensaje({ tipo: 'error', texto: error.message })
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
      <Navbar
        cuenta={cuenta}
        onInicio={cuentaActiva ? irAInicio : undefined}
        onSalir={cuentaActiva ? cerrarSesion : undefined}
      />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <Mensaje mensaje={mensaje} onCerrar={() => setMensaje(null)} />

        {!cuentaActiva ? (
          <Login onIngresar={ingresar} procesando={procesando} />
        ) : vista === 'inicio' ? (
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
                saldo={cuenta?.saldo}
                onSubmit={manejarTransferencia}
                procesando={procesando}
                deshabilitado={!cuenta}
              />
            ) : (
              <FormOperacion tipo={vista} saldo={cuenta?.saldo} onSubmit={manejarOperacion} procesando={procesando} deshabilitado={!cuenta} />
            )}
          </PantallaOperacion>
        )}
      </main>
    </div>
  )
}

export default App
