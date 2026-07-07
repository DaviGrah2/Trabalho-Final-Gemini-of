export default function Botao({ children, onClick, type = 'button', disabled = false }) {
  return (
    <button className="botao" type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
