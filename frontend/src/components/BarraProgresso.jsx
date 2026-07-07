export default function BarraProgresso({ completed, total }) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="barra-progresso">
      <div className="barra-preenchida" style={{ width: `${percentage}%` }} />
      <span>{percentage}% concluído</span>
    </div>
  );
}
