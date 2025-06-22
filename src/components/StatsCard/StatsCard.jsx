export default function StatCard({ label, value, onClick, style }) {
  return (
    <div className="stat-card" onClick={onClick} style={style}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
