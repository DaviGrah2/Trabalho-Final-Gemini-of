import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStudent } from '../api.js';
import { useStudent } from '../context/StudentContext.jsx';
import Botao from '../components/Botao.jsx';
import Card from '../components/Card.jsx';

export default function Home() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setStudent } = useStudent();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!name || !email) {
      setError('Preencha nome e email.');
      return;
    }

    try {
      setLoading(true);
      const student = await createStudent({ name, email });
      setStudent(student);
      navigate('/diagnostico');
    } catch (err) {
      setError('Erro ao cadastrar estudante.');
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickLogin() {
    setError('');
    try {
      setLoading(true);
      const student = await createStudent({ name: 'Aluno Teste', email: 'aluno.teste@example.com' });
      setStudent(student);
      navigate('/trilha');
    } catch (err) {
      setError('Erro ao entrar como aluno teste.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="Bem-vindo" description="Identifique-se para começar sua trilha adaptativa.">
      <form onSubmit={handleSubmit} className="formulario">
        <label>
          Nome
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        {error && <p className="erro">{error}</p>}
        <Botao type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Iniciar'}</Botao>
        <Botao type="button" onClick={handleQuickLogin} disabled={loading}>Entrar como aluno teste</Botao>
      </form>
    </Card>
  );
}
