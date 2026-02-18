import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
    title: string;
    showBackButton?: boolean;
    rightElement?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, showBackButton = false, rightElement }) => {
    const navigate = useNavigate();

    return (
        <header className="flex items-center justify-between px-6 py-5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                {showBackButton && (
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 active:scale-90 transition-transform"
                    >
                        <ChevronLeft size={20} />
                    </button>
                )}
                <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase">
                    {title}
                </h1>
            </div>
            {rightElement && (
                <div className="flex items-center">
                    {rightElement}
                </div>
            )}
        </header>
    );
};

export default PageHeader;
