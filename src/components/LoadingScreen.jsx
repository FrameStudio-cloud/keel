function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-[#1a1a2e]">
      <style>{`
        .ls-logo-ring {
          position: relative;
          width: 96px;
          height: 96px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ls-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 3px solid transparent;
          border-top-color: #2563eb;
          border-right-color: #60a5fa;
          animation: ls-spin 1.2s cubic-bezier(0.45, 0, 0.35, 1) infinite;
        }
        .ls-ring-dash {
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          border: 2px solid transparent;
          border-bottom-color: rgba(37, 99, 235, 0.25);
          border-left-color: rgba(96, 165, 250, 0.4);
          animation: ls-spin 2s cubic-bezier(0.65, 0, 0.35, 1) infinite reverse;
        }
        .ls-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #60a5fa;
          border-radius: 50%;
          top: 4px;
          animation: ls-orbit 1.8s ease-in-out infinite;
          box-shadow: 0 0 12px rgba(37, 99, 235, 0.6);
        }
        .ls-brand {
          z-index: 2;
          animation: ls-pulse 1.8s ease-in-out infinite;
        }
        .ls-dots {
          display: flex;
          gap: 8px;
        }
        .ls-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2563eb;
          animation: ls-bounce 1.4s ease-in-out infinite;
        }
        .ls-dots span:nth-child(2) { animation-delay: 0.2s; }
        .ls-dots span:nth-child(3) { animation-delay: 0.4s; }
        .ls-dots span:nth-child(4) { animation-delay: 0.6s; }
        .ls-dots span:nth-child(5) { animation-delay: 0.8s; }
        @keyframes ls-spin { to { transform: rotate(360deg); } }
        @keyframes ls-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }
        @keyframes ls-orbit {
          0%, 100% { transform: rotate(0deg) translateX(44px) rotate(0deg); }
          50% { transform: rotate(180deg) translateX(44px) rotate(-180deg); }
        }
        @keyframes ls-bounce {
          0%, 80%, 100% { transform: scale(0.4); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      <div className="flex flex-col items-center gap-8">
        <div className="ls-logo-ring">
          <span className="ls-dot" />
          <div className="ls-ring" />
          <div className="ls-ring-dash" />
          <span className="ls-brand text-3xl font-bold text-blue-600 dark:text-blue-400">Keel</span>
        </div>
        <div className="ls-dots">
          <span /><span /><span /><span /><span />
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
