// Campo de monto en soles, grande y legible. Lo usan depósito, retiro y transferencia.
function CampoMonto({ id, valor, onCambio }) {
  return (
    <>
      <label htmlFor={id} className="block text-sm font-medium text-tinta">
        Monto
      </label>
      <div className="mt-1 flex items-center rounded-lg border border-linea bg-white focus-within:border-acento focus-within:ring-2 focus-within:ring-acento-claro">
        <span className="pl-4 text-xl font-medium text-suave">S/</span>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          value={valor}
          onChange={(e) => onCambio(e.target.value)}
          placeholder="0.00"
          className="w-full min-w-0 bg-transparent px-3 py-3 text-2xl font-semibold text-tinta placeholder-linea outline-none"
        />
      </div>
    </>
  )
}

export default CampoMonto
