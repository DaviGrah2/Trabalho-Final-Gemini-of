import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStudent } from '../context/StudentContext.jsx';
import { fetchTopico, fetchAssessment, generateTopico, submitResposta } from '../api.js';
import Card from '../components/Card.jsx';
import FeedbackBox from '../components/FeedbackBox.jsx';
import Loading from '../components/Loading.jsx';
import Botao from '../components/Botao.jsx';

export default function Topico() {
  const { id } = useParams();
  const { student } = useStudent();
  const [topicData, setTopicData] = useState(null);
  const [assessmentIds, setAssessmentIds] = useState([]);
  const [currentAssessmentIndex, setCurrentAssessmentIndex] = useState(0);
  const [currentAssessment, setCurrentAssessment] = useState(null);
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
        const ids = (data.assessments || []).map((assessment) => assessment.id);
        setAssessmentIds(ids);
        setCurrentAssessmentIndex(0);
        if (ids.length > 0) {
          await loadAssessmentById(ids[0]);
        }
      } catch (err) {
        setError('Não foi possível carregar o tópico.');
      } finally {
        setLoading(false);
      }
    }

    loadTopic();
  }, [student, id]);

  async function loadAssessmentById(assessmentId) {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAssessment(student.id, id, assessmentId);
      setCurrentAssessment(data.assessment);
      setAssessmentIds(data.assessmentIds || []);
      setCurrentAssessmentIndex(data.currentIndex >= 0 ? data.currentIndex : 0);
      if (!topicData) {
        setTopicData({ topic: data.topic, assessments: [] });
      }
    } catch (err) {
      setError('Não foi possível carregar a pergunta.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setLoading(true);
    setError('');

    try {
      const data = await generateTopico(student.id, id);
      setTopicData(data);
      const ids = (data.assessments || []).map((assessment) => assessment.id);
      setAssessmentIds(ids);
      setCurrentAssessmentIndex(0);
      if (ids.length > 0) {
        await loadAssessmentById(ids[0]);
      }
    } catch (err) {
      setError('Erro ao gerar questionário.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!currentAssessment) return;
    setLoading(true);
    setError('');

    try {
      const response = await submitResposta(student.id, id, {
        assessmentId: currentAssessment.id,
        studentAnswer: answerMap[currentAssessment.id] || ''
      });
      setFeedback(response);
    } catch (err) {
      setError('Erro ao enviar resposta.');
    } finally {
      setLoading(false);
    }
  }

  function handleAnswerChange(value) {
    setAnswerMap((prev) => ({
      ...prev,
      [currentAssessment.id]: value
    }));
  }

  async function goToAssessmentIndex(index) {
    if (index < 0 || index >= assessmentIds.length) return;
    await loadAssessmentById(assessmentIds[index]);
  }

  const totalQuestions = topicData?.assessments?.length ?? assessmentIds.length;
  const currentNumber = currentAssessmentIndex + 1;

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
            <p>{totalQuestions} perguntas encontradas</p>
            {totalQuestions > 0 && currentAssessment ? (
              <>
                <div className="pagina-info">
                  Pergunta {currentNumber} de {totalQuestions}
                </div>
                <form onSubmit={handleSubmit} className="formulario">
                  <label key={currentAssessment.id}>
                    <span className="pergunta-texto">
                      {currentNumber}. {currentAssessment.question}
                    </span>
                    <textarea
                      name={`resposta-${currentAssessment.id}`}
                      value={answerMap[currentAssessment.id] || ''}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                    />
                  </label>
                  <div className="paginacao">
                    <button
                      type="button"
                      className="botao secundario"
                      onClick={() => goToAssessmentIndex(currentAssessmentIndex - 1)}
                      disabled={currentAssessmentIndex === 0 || loading}
                    >
                      Anterior
                    </button>
                    <button
                      type="button"
                      className="botao secundario"
                      onClick={() => goToAssessmentIndex(currentAssessmentIndex + 1)}
                      disabled={currentAssessmentIndex === totalQuestions - 1 || loading}
                    >
                      Próxima
                    </button>
                  </div>
                  <div className="acoes-formulario">
                    <Botao type="submit" disabled={loading || !answerMap[currentAssessment.id]}>
                      {loading ? 'Enviando...' : 'Enviar resposta'}
                    </Botao>
                    <Botao type="button" onClick={handleGenerate} disabled={loading}>
                      {loading ? 'Gerando...' : 'Gerar perguntas'}
                    </Botao>
                  </div>
                </form>
              </>
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
