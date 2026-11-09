import { useState } from 'react'
import Navbar from './components/Navbar'
import SaldoCard from './components/SaldoCard'
import HistorialTransacciones from './components/HistorialTransacciones'

function App() {
  const [cuentaActiva, setCuentaActiva] = useState('001-0001')
  const [cuenta] = useState(null)
  const [movimientos] = useState([])

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar cuentaActiva={cuentaActiva} onCambiarCuenta={setCuentaActiva} />

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 lg:grid-cols-2">
        <div className="space-y-6">
          <SaldoCard cuenta={cuenta} cargando={false} />
        </div>
        <HistorialTransacciones movimientos={movimientos} cuentaActual={cuentaActiva} cargando={false} />
      </main>
    </div>
  )
}

export default App
