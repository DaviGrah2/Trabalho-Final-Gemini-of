import axios from 'axios';

const API = process.env.API_URL || 'http://localhost:3000/api';

async function main() {
  try {
    console.log('Criando estudante de teste...');
    const studentResp = await axios.post(`${API}/students`, { name: 'Aluno Teste', email: 'aluno.teste@example.com' });
    const student = studentResp.data;
    console.log('Estudante criado:', student);

    console.log('Enviando diagnóstico para gerar trilha...');
    const answers = {
      answer1: 'Conheço o básico de lógica e variáveis',
      answer2: 'Intermediário',
      answer3: 'Quero aprender React e backend',
      answer4: 'Menos confiante em programação assíncrona e APIs',
      answer5: '5 horas por semana'
    };

    const diagResp = await axios.post(`${API}/diagnostico`, { studentId: student.id, answers });
    console.log('Diagnóstico e trilha gerados. Trilha resumo:', (diagResp.data.studyPath || []).slice(0,5));

    console.log('Buscando trilha completa...');
    const trilhaResp = await axios.get(`${API}/trilha/${student.id}`);
    const trilha = trilhaResp.data;
    console.log(`Trilha contém ${trilha.length} tópicos.`);

    if (trilha.length > 0) {
      const first = trilha[0];
      console.log('Solicitando avaliações do primeiro tópico (gera 30 perguntas via fallback)...');
      const topicoResp = await axios.get(`${API}/topico/${student.id}/${first.id}`);
      const topicData = topicoResp.data;
      console.log('Tópico retornado:', topicData.topic.title);
      console.log('Número de avaliações geradas:', (topicData.assessments || []).length);
    }

    console.log('Seed finalizado. Abra o frontend e acesse o tópico para ver as questões.');
  } catch (err) {
    console.error('Erro no seed:', err.response?.data || err.message || err);
    process.exit(1);
  }
}

main();
