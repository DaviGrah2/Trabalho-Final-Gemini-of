import { useEffect, useRef, useState } from 'react';
import { useStudent } from '../context/StudentContext.jsx';
import { fetchPainel, updateStudent } from '../api.js';
import Card from '../components/Card.jsx';
import Loading from '../components/Loading.jsx';
import BarraProgresso from '../components/BarraProgresso.jsx';

export default function Painel() {
  const { student, trilha, setStudent } = useStudent();
  const [painel, setPainel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingName, setEditingName] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!student) return;
    setEditingName(student.name || '');
    setAvatarPreview(student.avatar_url || '');

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

  // save painel locally for restore
  useEffect(() => {
    if (!student || !painel) return;
    try {
      localStorage.setItem(`painel_${student.id}`, JSON.stringify({ painel, savedAt: new Date().toISOString() }));
    } catch (e) {
      // ignore
    }
  }, [painel, student]);

  function restoreLocalProgress() {
    if (!student) return;
    try {
      const raw = localStorage.getItem(`painel_${student.id}`);
      if (!raw) return alert('Nenhum progresso local encontrado.');
      const parsed = JSON.parse(raw);
      setPainel(parsed.painel);
      alert(`Progresso restaurado (salvo em ${new Date(parsed.savedAt).toLocaleString()}).`);
    } catch (e) {
      alert('Falha ao restaurar progresso local.');
    }
  }

  async function handleAvatarFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result.toString());
    reader.readAsDataURL(file);
  }

  function triggerAvatarPicker() {
    if (fileInputRef.current) fileInputRef.current.click();
  }

  async function handleSaveGlobalProgress() {
    if (!student || !painel) return;
    const completed = painel.topics.filter((t) => t.completed).length;
    setProfileSaving(true);
    try {
      // use existing updateStudent to send global_count
      const updated = await updateStudent(student.id, { global_count: completed });
      setStudent(updated);
      alert('Progresso global salvo.');
    } catch (e) {
      alert('Falha ao salvar progresso global.');
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleSaveProfile() {
    if (!student) return;
    setProfileSaving(true);
    try {
      const updated = await updateStudent(student.id, { name: editingName || undefined, avatar_url: avatarPreview || undefined });
      // update context student
      setStudent(updated);
    } catch (err) {
      // ignore for now
    } finally {
      setProfileSaving(false);
    }
  }

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
          <div className="profile-card">
            <div>
                <div className="avatar-clickable" onClick={triggerAvatarPicker} role="button" tabIndex={0}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" />
                  ) : (
                    <div style={{ width: 96, height: 96, borderRadius: 999, background: '#e2e8f0' }} />
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarFile} />
              </div>
            <div style={{ flex: 1 }}>
              <div className="profile-controls">
                <label>
                  Nome
                  <input type="text" value={editingName} onChange={(e) => setEditingName(e.target.value)} />
                </label>
                <label>
                  Foto
                  <input type="file" accept="image/*" onChange={handleAvatarFile} />
                </label>
                <div className="profile-actions">
                  <button className="botao" type="button" onClick={handleSaveProfile} disabled={profileSaving}>
                    {profileSaving ? 'Salvando...' : 'Salvar perfil'}
                  </button>
                  <button className="botao" type="button" onClick={handleSaveGlobalProgress} disabled={profileSaving}>
                    {profileSaving ? '...' : 'Salvar progresso global'}
                  </button>
                  <button className="botao secundario" type="button" onClick={() => {
                    if (!student) return; localStorage.removeItem(`painel_${student.id}`); alert('Progresso local removido.');
                  }}>
                    Limpar progresso local
                  </button>
                  <button className="botao secundario" type="button" onClick={() => restoreLocalProgress()}>
                    Restaurar progresso local
                  </button>
                </div>
                <div className="small-muted">Suas informações são salvas localmente e no servidor.</div>
              </div>
            </div>
          </div>

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
