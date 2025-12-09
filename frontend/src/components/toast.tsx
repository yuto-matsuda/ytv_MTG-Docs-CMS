import { createContext, useContext, useState } from "react";

type ToastContextType = {
  showToast: (message: string, type: ToastType) => void;
};

type ToastType = 'success' | 'error';

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<ToastType | null>(null);
  const [closing, setClosing] = useState(false);

  const showToast = (msg: string, type: ToastType) => {
    setMessage(msg);
    setType(type);
    setClosing(false);

    setTimeout(() => {
      setClosing(true);
      setTimeout(() => {
        setMessage(null);
      }, 300);
    }, 2000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {(message && type) && (
        <div
          className={`
            toast z-100 transition-opacity duration-300
            ${closing ? "opacity-0" : "opacity-100"}
          `}
        >
          <div role="alert" className={`alert ${type === 'success' ? "alert-success" : "alert-error"}`}>
            {type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span>{message}</span>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
