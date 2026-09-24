function Toast({ toasts, removeToast }) {
  return (
    <div className="toast-stack">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <strong style={{ textTransform: 'capitalize' }}>{toast.title || toast.type}</strong>
            <span>{toast.text}</span>
          </div>
          <button className="toast__close" onClick={() => removeToast(toast.id)}>×</button>
        </div>
      ))}
    </div>
  );
}

export default Toast;
