export default function FeedbackBox({ feedback, correct }) {
  return (
    <div className={`feedback-box ${correct ? 'success' : 'error'}`}>
      <strong>{correct ? 'Correto' : 'Incorreto'}</strong>
      <p>{feedback}</p>
    </div>
  );
}
