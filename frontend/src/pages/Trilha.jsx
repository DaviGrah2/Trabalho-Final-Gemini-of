import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStudent } from '../context/StudentContext.jsx';
import { fetchTrilha } from '../api.js';
import Card from '../components/Card.jsx';
import Loading from '../components/Loading.jsx';

export default function Trilha() {
  const { student, trilha, setTrilha } = useStudent();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!student) return;

    async function loadTrilha() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchTrilha(student.id);
        setTrilha(data);
      } catch (err) {
        setError('Não foi possível carregar a trilha.');
      } finally {
        setLoading(false);
      }
    }

    loadTrilha();
  }, [student, setTrilha]);

  if (!student) {
    return <Card title="Trilha" description="Cadastre-se antes de acessar a trilha." />;
  }

  return (
    <Card title="Sua Trilha" description="A sequência de tópicos sugerida para o seu progresso.">
      {loading ? (
        <Loading />
      ) : error ? (
        <p className="erro">{error}</p>
      ) : trilha.length === 0 ? (
        <p>Nenhuma trilha encontrada. Faça o diagnóstico para gerar uma trilha.</p>
      ) : (
        <div className="lista-topicos">
          {trilha.map((topic, index) => (
            <article key={`${topic.id ?? index}-${topic.order_index ?? index}`} className="topico-item">
              <h3>{topic.order_index}. {topic.title}</h3>
              <p>{topic.description}</p>
              <Link to={`/topico/${topic.id}`} className="link-topico">Ver tópico</Link>
            </article>
          ))}
        </div>
      )}
    </Card>
  );
}
