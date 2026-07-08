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
  const [answerResultMap, setAnswerResultMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pageSize, setPageSize] = useState(10); // 0 = show all, default 10 per page
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!student) return;

    async function loadTopic() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchTopico(student.id, id);
        const savedAnswers = {};
        const savedResults = {};

        if (data.assessments) {
          data.assessments.forEach((assessment) => {
            if (assessment.saved_answer) {
              savedAnswers[assessment.id] = assessment.saved_answer;
            }
            if (assessment.saved_correct !== null) {
              savedResults[assessment.id] = assessment.saved_correct;
            }
          });
        }

        setTopicData(data);
        setAnswerMap(savedAnswers);
        setAnswerResultMap(savedResults);
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
    setAnswerResultMap({});

    try {
      const responses = topicData.assessments.map((assessment) => ({
        assessmentId: assessment.id,
        studentAnswer: answerMap[assessment.id] || ''
      }));

      const response = await submitResposta(student.id, id, { responses });
      setFeedback(response);
      // map per-assessment results to show animations
      const map = {};
      if (response && response.results && Array.isArray(response.results)) {
        for (const r of response.results) map[r.assessmentId] = !!r.correct;
      } else if (response && response.assessmentId) {
        map[response.assessmentId] = !!response.correct;
      }
      setAnswerResultMap(map);
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
                {/* Pagination controls */}
                <div className="paginacao">
                  <button
                    type="button"
                    className="botao secundario"
                    onClick={() => {
                      setPageSize(10);
                      setCurrentPage(1);
                    }}
                    disabled={pageSize === 10}
                  >
                    Mostrar 10 por página
                  </button>
                  <button
                    type="button"
                    className="botao secundario"
                    onClick={() => {
                      setPageSize(0);
                      setCurrentPage(1);
                    }}
                    disabled={pageSize === 0}
                  >
                    Mostrar todos
                  </button>
                </div>

                {(() => {
                  const assessments = topicData.assessments || [];
                  const total = assessments.length;
                  const size = pageSize > 0 ? pageSize : total;
                  const totalPages = Math.max(1, Math.ceil(total / size));
                  const page = Math.min(Math.max(1, currentPage), totalPages);
                  const start = (page - 1) * size;
                  const visible = assessments.slice(start, start + size);

                  return (
                    <>
                      {visible.map((assessment, index) => (
                        <label key={assessment.id}>
                          <span className="pergunta-texto">
                            {start + index + 1}. {assessment.question}
                          </span>
                          <textarea
                            className={`answer-input ${answerResultMap[assessment.id] === true ? 'correct' : answerResultMap[assessment.id] === false ? 'wrong' : ''}`}
                            name={`resposta-${assessment.id}`}
                            value={answerMap[assessment.id] || ''}
                            onChange={(e) => handleAnswerChange(assessment.id, e.target.value)}
                          />
                          {assessment.saved_feedback && !feedback && (
                            <p className="saved-feedback">Último feedback: {assessment.saved_feedback}</p>
                          )}
                        </label>
                      ))}

                      {pageSize > 0 && totalPages > 1 && (
                        <div className="paginacao">
                          <div className="pagina-info">Página {page} de {totalPages}</div>
                          <button
                            type="button"
                            className="botao"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                          >
                            Anterior
                          </button>
                          <button
                            type="button"
                            className="botao"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                          >
                            Próxima
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
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
          {topicData.topic.order_index === 10 && (
            <div className="easter-egg">
              O tolo reclama do bolso furado, o sábio usa o furo para coçar o saco. "by Pascal"
            </div>
          )}
        </>
      ) : (
        !loading && <p>Selecione um tópico na trilha para ver o conteúdo.</p>
      )}
    </Card>
  );
}
