import { IconoDeposito, IconoRetiro, IconoTransferencia } from './Iconos'

const operaciones = [
  { vista: 'deposito', titulo: 'Depositar', detalle: 'Agregar dinero a la cuenta', Icono: IconoDeposito },
  { vista: 'retiro', titulo: 'Retirar', detalle: 'Sacar dinero del saldo', Icono: IconoRetiro },
  { vista: 'transferencia', titulo: 'Transferir', detalle: 'Enviar a otra cuenta', Icono: IconoTransferencia },
]

// Tres botones grandes, uno por operación. El padre decide qué pantalla abrir.
function MenuOperaciones({ onElegir, deshabilitado }) {
  return (
    <nav aria-label="Operaciones" className="grid gap-3">
      {operaciones.map(({ vista, titulo, detalle, Icono }) => (
        <button
          key={vista}
          type="button"
          onClick={() => onElegir(vista)}
          disabled={deshabilitado}
          className="flex items-center gap-4 rounded-xl border border-linea bg-white p-4 text-left transition-colors hover:border-acento hover:bg-acento-claro disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-linea disabled:hover:bg-white"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-acento text-white">
            <Icono />
          </span>
          <span>
            <span className="block text-lg font-semibold text-tinta">{titulo}</span>
            <span className="block text-sm text-suave">{detalle}</span>
          </span>
        </button>
      ))}
    </nav>
  )
}

export default MenuOperaciones
