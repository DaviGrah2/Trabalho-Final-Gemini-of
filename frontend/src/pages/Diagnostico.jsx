import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '../context/StudentContext.jsx';
import { submitDiagnostico } from '../api.js';
import Botao from '../components/Botao.jsx';
import Card from '../components/Card.jsx';

export default function Diagnostico() {
  const [answer1, setAnswer1] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [answer3, setAnswer3] = useState('');
  const [answer4, setAnswer4] = useState('');
  const [answer5, setAnswer5] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { student, setTrilha } = useStudent();

  if (!student) {
    return <Card title="Diagnóstico" description="Cadastre-se antes de acessar o diagnóstico." />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!answer1 || !answer2 || !answer3 || !answer4 || !answer5) {
      setError('Responda todas as questões.');
      return;
    }

    try {
      setLoading(true);
      const response = await submitDiagnostico({
        studentId: student.id,
        answers: { answer1, answer2, answer3, answer4, answer5 }
      });
      setResult(response);
      setTrilha(response.studyPath);
      navigate('/trilha');
    } catch (err) {
      setError('Erro ao gerar diagnóstico.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="Diagnóstico Inicial" description="Responda o questionário para que a IA identifique suas lacunas.">
      <form onSubmit={handleSubmit} className="formulario">
        <label>
          1. O que você já conhece sobre programação?
          <textarea value={answer1} onChange={(e) => setAnswer1(e.target.value)} />
        </label>
        <label>
          2. Como você avalia seu conhecimento em lógica de programação?
          <textarea value={answer2} onChange={(e) => setAnswer2(e.target.value)} />
        </label>
        <label>
          3. Quais são seus principais objetivos ao estudar com esta plataforma?
          <textarea value={answer3} onChange={(e) => setAnswer3(e.target.value)} />
        </label>
        <label>
          4. Em quais tópicos você se sente menos confiante?
          <textarea value={answer4} onChange={(e) => setAnswer4(e.target.value)} />
        </label>
        <label>
          5. Quantas horas por semana você deseja dedicar ao estudo?
          <textarea value={answer5} onChange={(e) => setAnswer5(e.target.value)} />
        </label>
        {error && <p className="erro">{error}</p>}
        <Botao type="submit" disabled={loading}>{loading ? 'Aguarde...' : 'Enviar diagnóstico'}</Botao>
      </form>
      {result && <div className="resultado"><h3>Diagnóstico gerado</h3><pre>{result.diagnosis}</pre></div>}
    </Card>
  );
}
