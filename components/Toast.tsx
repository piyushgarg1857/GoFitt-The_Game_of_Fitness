import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (message: string, type?: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType>({
    toasts: [],
    addToast: () => { },
    removeToast: () => { },
});

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const toast: Toast = { id, message, type, duration };
        setToasts(prev => [...prev, toast]);
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none" style={{ zIndex: 99999 }}>
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Trigger entrance animation
        const showTimer = setTimeout(() => setIsVisible(true), 10);

        // Auto remove
        const duration = toast.duration || 4000;
        const exitTimer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onRemove(toast.id), 300);
        }, duration);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(exitTimer);
        };
    }, [toast, onRemove]);

    const iconMap: Record<ToastType, string> = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: '💡',
    };

    const bgMap: Record<ToastType, string> = {
        success: 'from-emerald-500/20 to-emerald-900/40 border-emerald-500/40',
        error: 'from-red-500/20 to-red-900/40 border-red-500/40',
        warning: 'from-amber-500/20 to-amber-900/40 border-amber-500/40',
        info: 'from-cyan-500/20 to-cyan-900/40 border-cyan-500/40',
    };

    const glowMap: Record<ToastType, string> = {
        success: 'shadow-emerald-500/20',
        error: 'shadow-red-500/20',
        warning: 'shadow-amber-500/20',
        info: 'shadow-cyan-500/20',
    };

    return (
        <div
            className={`pointer-events-auto bg-gradient-to-r ${bgMap[toast.type]} backdrop-blur-xl border rounded-xl p-4 flex items-start gap-3 shadow-lg ${glowMap[toast.type]} transition-all duration-300 ease-out cursor-pointer ${isVisible && !isExiting
                    ? 'opacity-100 translate-x-0 scale-100'
                    : 'opacity-0 translate-x-8 scale-95'
                }`}
            onClick={() => {
                setIsExiting(true);
                setTimeout(() => onRemove(toast.id), 300);
            }}
        >
            <span className="text-lg flex-shrink-0 mt-0.5">{iconMap[toast.type]}</span>
            <p className="text-sm text-white font-medium leading-relaxed flex-1">{toast.message}</p>
            <button
                className="text-white/60 hover:text-white text-xs flex-shrink-0 mt-0.5 transition-colors"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsExiting(true);
                    setTimeout(() => onRemove(toast.id), 300);
                }}
            >
                ✕
            </button>
        </div>
    );
}
