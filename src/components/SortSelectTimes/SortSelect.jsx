export default function SortSelect({ sortOrder, setSortOrder }) {
  return (
    <div className="sort-container">
      <span className="sort-label">Ordenar por:</span>
      <div className="sort-select-wrapper">
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="sort-select"
        >
          <option value="recent">Más recientes</option>
          <option value="oldest">Más antiguos</option>
          <option value="fastest">Mejores tiempos</option>
          <option value="slowest">Peores tiempos</option>
        </select>
      </div>
    </div>
  );
}
