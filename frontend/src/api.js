import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3001/api', timeout: 10000 });

export async function createStudent(payload) {
  const response = await api.post('/students', payload);
  return response.data;
}

export async function submitDiagnostico(payload) {
  const response = await api.post('/diagnostico', payload);
  return response.data;
}

export async function fetchTrilha(studentId) {
  const response = await api.get(`/trilha/${studentId}`);
  return response.data;
}

export async function fetchTopico(studentId, topicId) {
  const response = await api.get(`/topico/${studentId}/${topicId}`);
  return response.data;
}

export async function fetchAssessment(studentId, topicId, assessmentId) {
  const response = await api.get(`/topico/${studentId}/${topicId}/assessment/${assessmentId}`);
  return response.data;
}

export async function generateTopico(studentId, topicId) {
  const response = await api.post(`/topico/${studentId}/${topicId}/gerar`);
  return response.data;
}

export async function submitResposta(studentId, topicId, payload) {
  const response = await api.post(`/topico/${studentId}/${topicId}/resposta`, payload);
  return response.data;
}

export async function fetchPainel(studentId) {
  const response = await api.get(`/painel/${studentId}`);
  return response.data;
}

export async function getStudent(studentId) {
  const response = await api.get(`/students/${studentId}`);
  return response.data;
}

export async function updateStudent(studentId, payload) {
  const response = await api.put(`/students/${studentId}`, payload);
  return response.data;
}
