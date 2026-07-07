import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStudent } from '../context/StudentContext.jsx';
import { fetchTopico, generateTopico, submitResposta } from '../api.js';
import Card from '../components/Card.jsx';
import FeedbackBox from '../components/FeedbackBox.jsx';
import Loading from '../components/Loading.jsx';
import Botao from '../components/Botao.jsx';

export default function Topico() {
  const { id } = useParams();
  const { student } = useStudent();
  const [topicData, setTopicData] = useState(null);
  const [answerMap, setAnswerMap] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!student) return;

    async function loadTopic() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchTopico(student.id, id);
        setTopicData(data);
        setAnswerMap({});
      } catch (err) {
        setError('Não foi possível carregar o tópico.');
      } finally {
        setLoading(false);
      }
    }

    loadTopic();
  }, [student, id]);

  async function handleGenerate() {
    setLoading(true);
    setError('');

    try {
      const data = await generateTopico(student.id, id);
      setTopicData(data);
      setAnswerMap({});
    } catch (err) {
      setError('Erro ao gerar questionário.');
    } finally {
      setLoading(false);
    }
  }

  function handleAnswerChange(assessmentId, value) {
    setAnswerMap((prev) => ({
      ...prev,
      [assessmentId]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!topicData?.assessments?.length) return;
    setLoading(true);
    setError('');

    try {
      const responses = topicData.assessments.map((assessment) => ({
        assessmentId: assessment.id,
        studentAnswer: answerMap[assessment.id] || ''
      }));

      const response = await submitResposta(student.id, id, { responses });
      setFeedback(response);
    } catch (err) {
      setError('Erro ao enviar respostas.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="Tópico" description="Revise o conteúdo e responda a avaliação abaixo.">
      {loading && <Loading />}
      {error && <p className="erro">{error}</p>}
      {topicData ? (
        <>
          <h2>{topicData.topic.title}</h2>
          <p>{topicData.topic.content}</p>
          <div className="avaliacao">
            <h3>Questionário de verificação</h3>
            <p>{topicData.assessments?.length ?? 0} perguntas encontradas</p>
            {topicData.assessments?.length ? (
              <form onSubmit={handleSubmit} className="formulario">
                {topicData.assessments.map((assessment, index) => (
                  <label key={assessment.id}>
                    <span className="pergunta-texto">
                      {index + 1}. {assessment.question}
                    </span>
                    <textarea
                      name={`resposta-${assessment.id}`}
                      value={answerMap[assessment.id] || ''}
                      onChange={(e) => handleAnswerChange(assessment.id, e.target.value)}
                    />
                  </label>
                ))}
                <div className="acoes-formulario">
                  <Botao
                    type="submit"
                    disabled={
                      loading ||
                      topicData.assessments.some((assessment) => !answerMap[assessment.id])
                    }
                  >
                    {loading ? 'Enviando...' : 'Enviar respostas'}
                  </Botao>
                  <Botao type="button" onClick={handleGenerate} disabled={loading}>
                    {loading ? 'Gerando...' : 'Gerar perguntas'}
                  </Botao>
                </div>
              </form>
            ) : (
              <>
                <p>Nenhum questionário disponível para este tópico.</p>
                <Botao type="button" onClick={handleGenerate} disabled={loading}>
                  {loading ? 'Gerando...' : 'Gerar perguntas'}
                </Botao>
              </>
            )}
          </div>
          {feedback && (
            <div className="resultado">
              <h3>Feedback da avaliação</h3>
              {feedback.results ? (
                <ul>
                  {feedback.results.map((item) => (
                    <li key={item.assessmentId}>
                      {item.correct ? 'Correto' : 'Incorreto'} — {item.feedback}
                    </li>
                  ))}
                </ul>
              ) : (
                <FeedbackBox feedback={feedback.feedback} correct={feedback.correct} />
              )}
            </div>
          )}
        </>
      ) : (
        !loading && <p>Selecione um tópico na trilha para ver o conteúdo.</p>
      )}
    </Card>
  );
}
