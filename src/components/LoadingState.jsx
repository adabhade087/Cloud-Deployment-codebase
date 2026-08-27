export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="loading-overlay">
      <div className="spinner spinner-lg" />
      <span>{message}</span>
    </div>
  );
}
