import { useEffect, useState } from 'react';
import { useStudent } from '../context/StudentContext.jsx';
import { fetchPainel } from '../api.js';
import Card from '../components/Card.jsx';
import Loading from '../components/Loading.jsx';
import BarraProgresso from '../components/BarraProgresso.jsx';

export default function Painel() {
  const { student, trilha } = useStudent();
  const [painel, setPainel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!student) return;

    async function loadPainel() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchPainel(student.id);
        setPainel(data);
      } catch (err) {
        setError('Não foi possível carregar o painel.');
      } finally {
        setLoading(false);
      }
    }

    loadPainel();
  }, [student]);

  if (!student) {
    return <Card title="Painel" description="Cadastre-se antes de acessar o painel." />;
  }

  const completed = painel?.topics.filter((topic) => topic.completed).length ?? 0;
  const total = painel?.topics.length ?? trilha.length;

  return (
    <Card title="Painel do Estudante" description="Veja seu progresso e histórico de respostas.">
      {loading ? (
        <Loading />
      ) : error ? (
        <p className="erro">{error}</p>
      ) : painel ? (
        <>
          <BarraProgresso completed={completed} total={total} />
          <section className="painel-secao">
            <h3>Progresso da trilha</h3>
            {painel.topics.length === 0 ? (
              <p>Nenhum tópico registrado ainda.</p>
            ) : (
              <ul className="lista-painel">
                {painel.topics.map((topic) => (
                  <li key={topic.id}>
                    {topic.title} — {topic.completed ? 'Concluído' : 'Pendente'} ({topic.score}%)
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="painel-secao">
            <h3>Histórico de respostas</h3>
            {painel.history.length === 0 ? (
              <p>Você ainda não respondeu avaliações.</p>
            ) : (
              <ul className="lista-painel">
                {painel.history.map((item) => (
                  <li key={item.id}>
                    <strong>{item.correct ? 'Correto' : 'Incorreto'}</strong> — {item.question}
                    <p>{item.feedback}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : (
        <p>Nenhum dado disponível.</p>
      )}
    </Card>
  );
}
