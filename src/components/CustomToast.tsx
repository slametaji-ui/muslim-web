import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error';
    duration?: number;
    onClose: () => void;
}

const CustomToast: React.FC<ToastProps> = ({ message, type = 'success', duration = 3000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade-out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className={`fixed top-12 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'}`}>
            <div className={`px-6 py-4 rounded-[2rem] shadow-2xl backdrop-blur-xl border flex items-center gap-4 min-w-[280px] max-w-[90vw] ${
                type === 'success' 
                ? 'bg-emerald-500/90 border-emerald-400/50 text-white' 
                : 'bg-rose-500/90 border-rose-400/50 text-white'
            }`}>
                {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <p className="text-xs font-black uppercase tracking-tight flex-1">{message}</p>
                <button onClick={() => setIsVisible(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export const useToast = () => {
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
    };

    const hideToast = () => setToast(null);

    const ToastComponent = toast ? (
        <CustomToast 
            message={toast.message} 
            type={toast.type} 
            onClose={hideToast} 
        />
    ) : null;

    return { showToast, ToastComponent };
};

export default CustomToast;
