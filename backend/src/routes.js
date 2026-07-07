import express from 'express';
import { query } from './db.js';
import { generateDiagnosis, generateStudyPath, generateAssessment, generateFeedback } from './gemini.js';

const router = express.Router();

router.post('/students', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Nome e email são obrigatórios.' });

  try {
    const insert = await query('INSERT INTO students(name, email) VALUES($1, $2) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING *', [name, email]);
    res.json(insert.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao cadastrar estudante.' });
  }
});

router.post('/diagnostico', async (req, res) => {
  const { studentId, answers } = req.body;
  if (!studentId || !answers) return res.status(400).json({ error: 'studentId e answers são obrigatórios.' });

  try {
    const diagnosisText = await generateDiagnosis(answers);
    const studyPath = await generateStudyPath(diagnosisText);

    await query('DELETE FROM topics WHERE student_id = $1', [studentId]);
    for (let i = 0; i < studyPath.length; i += 1) {
      const topic = studyPath[i];
      await query(
        'INSERT INTO topics(student_id, title, description, order_index, content) VALUES($1,$2,$3,$4,$5)',
        [studentId, topic.title, topic.description, i + 1, topic.content]
      );
    }

    res.json({ diagnosis: diagnosisText, studyPath });
  } catch (error) {
    res.status(500).json({ error: 'Falha ao gerar diagnóstico e trilha.' });
  }
});

router.get('/trilha/:studentId', async (req, res) => {
  const { studentId } = req.params;
  try {
    const result = await query('SELECT * FROM topics WHERE student_id = $1 ORDER BY order_index', [studentId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao buscar trilha.' });
  }
});

async function loadOrGenerateAssessments(studentId, topic, force = false) {
  if (force) {
    await query('DELETE FROM assessments WHERE student_id = $1 AND topic_id = $2', [studentId, topic.id]);
  }

  const assessmentsRes = await query('SELECT * FROM assessments WHERE student_id = $1 AND topic_id = $2', [studentId, topic.id]);
  let assessments = assessmentsRes.rows;

  if (assessments.length === 0) {
    const generatedAssessments = await generateAssessment(topic);
    const inserted = [];
    for (const assessmentItem of generatedAssessments) {
      const saved = await query(
        'INSERT INTO assessments(student_id, topic_id, question, answer_key) VALUES($1,$2,$3,$4) RETURNING *',
        [studentId, topic.id, assessmentItem.question, assessmentItem.answer_key]
      );
      inserted.push(saved.rows[0]);
    }
    assessments = inserted;
  }

  return assessments;
}

router.get('/topico/:studentId/:topicId', async (req, res) => {
  const { studentId, topicId } = req.params;
  try {
    const topicRes = await query('SELECT * FROM topics WHERE student_id = $1 AND id = $2', [studentId, topicId]);
    const topic = topicRes.rows[0];
    if (!topic) return res.status(404).json({ error: 'Tópico não encontrado.' });

    const assessments = await loadOrGenerateAssessments(studentId, topic);
    res.json({ topic, assessments });
  } catch (error) {
    res.status(500).json({ error: 'Falha ao buscar tópico.' });
  }
});

router.post('/topico/:studentId/:topicId/gerar', async (req, res) => {
  const { studentId, topicId } = req.params;
  try {
    const topicRes = await query('SELECT * FROM topics WHERE student_id = $1 AND id = $2', [studentId, topicId]);
    const topic = topicRes.rows[0];
    if (!topic) return res.status(404).json({ error: 'Tópico não encontrado.' });

    const assessments = await loadOrGenerateAssessments(studentId, topic, true);
    res.json({ topic, assessments });
  } catch (error) {
    res.status(500).json({ error: 'Falha ao gerar questionário.' });
  }
});

router.post('/topico/:studentId/:topicId/resposta', async (req, res) => {
  const { studentId, topicId } = req.params;
  const { assessmentId, studentAnswer, responses } = req.body;
  if (!responses && (!assessmentId || !studentAnswer)) {
    return res.status(400).json({ error: 'assessmentId e studentAnswer ou responses são obrigatórios.' });
  }

  try {
    const answers = responses && Array.isArray(responses) ? responses : [{ assessmentId, studentAnswer }];
    const results = [];
    let allCorrect = true;

    for (const item of answers) {
      const assessmentRes = await query('SELECT * FROM assessments WHERE id = $1 AND student_id = $2 AND topic_id = $3', [item.assessmentId, studentId, topicId]);
      const assessment = assessmentRes.rows[0];
      if (!assessment) return res.status(404).json({ error: 'Avaliação não encontrada.' });

      const correct = assessment.answer_key.trim().toLowerCase() === item.studentAnswer.trim().toLowerCase();
      const feedback = await generateFeedback(item.studentAnswer, assessment.answer_key);

      await query(
        'INSERT INTO responses(assessment_id, student_answer, correct, feedback) VALUES($1,$2,$3,$4)',
        [item.assessmentId, item.studentAnswer, correct, feedback]
      );

      results.push({ assessmentId: item.assessmentId, correct, feedback });
      if (!correct) allCorrect = false;
    }

    if (answers.length > 1 && allCorrect) {
      await query('UPDATE topics SET completed = true, score = 100 WHERE id = $1', [topicId]);
    }

    if (answers.length === 1) {
      res.json(results[0]);
    } else {
      res.json({ results });
    }
  } catch (error) {
    res.status(500).json({ error: 'Falha ao processar resposta.' });
  }
});

router.get('/painel/:studentId', async (req, res) => {
  const { studentId } = req.params;
  try {
    const topics = await query('SELECT id, title, completed, score FROM topics WHERE student_id = $1 ORDER BY order_index', [studentId]);
    const responses = await query(
      'SELECT r.id, a.question, r.student_answer, r.correct, r.feedback, r.created_at FROM responses r JOIN assessments a ON r.assessment_id = a.id WHERE a.student_id = $1 ORDER BY r.created_at DESC',
      [studentId]
    );

    res.json({ topics: topics.rows, history: responses.rows });
  } catch (error) {
    res.status(500).json({ error: 'Falha ao buscar painel.' });
  }
});

export default router;
