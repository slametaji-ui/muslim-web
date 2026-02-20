import React, { useState, useEffect } from 'react';
import { Users, Coins, Calculator, Info, CheckCircle2, ChevronLeft, History, Briefcase, Wallet, TrendingUp, Save, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface ZakatHistory {
    id: string;
    type: string;
    amount: number;
    date: string;
    description: string;
}

const ZakatCalculatorPage: React.FC = () => {
    const [activeSection, setActiveSection] = useState<'calculator' | 'history'>('calculator');
    const [zakatCategory, setZakatCategory] = useState<'fitrah' | 'penghasilan' | 'maal' | 'perdagangan'>('fitrah');
    
    // Fitrah State
    const [personCount, setPersonCount] = useState<number>(1);
    const [ricePrice, setRicePrice] = useState<number>(15000);
    const [zakatType, setZakatType] = useState<'money' | 'rice'>('money');

    // Other Zakat States (Stored as numbers)
    const [income, setIncome] = useState<number>(0);
    const [assets, setAssets] = useState<number>(0);
    const [tradeInventory, setTradeInventory] = useState<number>(0);
    const [tradeCash, setTradeCash] = useState<number>(0);
    const [tradeDebt, setTradeDebt] = useState<number>(0);

    const [history, setHistory] = useState<ZakatHistory[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('muslim_app_zakat_history');
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch (e) { console.error(e); }
        }
    }, []);

    // Format helper: Number to Dot-separated String
    const formatDisplay = (num: number): string => {
        if (num === 0) return '';
        return new Intl.NumberFormat('id-ID').format(num);
    };

    // Parse helper: String with Dots to Number
    const parseInput = (val: string): number => {
        const clean = val.replace(/\./g, '').replace(/[^0-9]/g, '');
        return clean === '' ? 0 : parseInt(clean, 10);
    };

    const handleInputChange = (val: string, setter: (n: number) => void) => {
        setter(parseInput(val));
    };

    const calculateZakat = () => {
        switch (zakatCategory) {
            case 'fitrah':
                return zakatType === 'rice' ? 3.5 * personCount : ricePrice * 3.5 * personCount;
            case 'penghasilan':
                return income * 0.025;
            case 'maal':
                return assets * 0.025;
            case 'perdagangan':
                const netAssets = tradeCash + tradeInventory - tradeDebt;
                return Math.max(0, netAssets * 0.025);
            default:
                return 0;
        }
    };

    const totalAmount = calculateZakat();

    const saveToHistory = () => {
        if (totalAmount <= 0) return;
        
        const newItem: ZakatHistory = {
            id: Date.now().toString(),
            type: zakatCategory.charAt(0).toUpperCase() + zakatCategory.slice(1),
            amount: totalAmount,
            date: new Date().toISOString(),
            description: zakatCategory === 'fitrah' ? `${personCount} Jiwa` : 'Kalkulasi Mandiri'
        };

        const newHistory = [newItem, ...history];
        setHistory(newHistory);
        localStorage.setItem('muslim_app_zakat_history', JSON.stringify(newHistory));
        alert('Data zakat berhasil disimpan ke riwayat!');
    };

    const deleteHistory = (id: string) => {
        const newHistory = history.filter(item => item.id !== id);
        setHistory(newHistory);
        localStorage.setItem('muslim_app_zakat_history', JSON.stringify(newHistory));
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-24 transition-colors">
            {/* Premium Header */}
            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 pt-12 pb-6 px-6 rounded-b-[2.5rem] shadow-lg mb-8 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                    <Coins size={120} />
                </div>
                <div className="relative z-10">
                    <Link to="/" className="absolute left-0 top-0 p-2 text-white/80 hover:text-white transition-colors">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-black mb-1 tracking-tight">Layanan Zakat</h1>
                    <p className="text-primary-100 text-xs font-black uppercase  opacity-80 mt-1">Sucikan Harta & Jiwa</p>

                    {/* Section Switcher */}
                    <div className="mt-8 flex bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-inner">
                        <button
                            onClick={() => setActiveSection('calculator')}
                            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase  transition-all ${activeSection === 'calculator' ? 'bg-white text-primary-700 shadow-md scale-[0.98]' : 'text-primary-50 hover:bg-white/10'}`}
                        >
                            Calculator
                        </button>
                        <button
                            onClick={() => setActiveSection('history')}
                            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase  transition-all ${activeSection === 'history' ? 'bg-white text-primary-700 shadow-md scale-[0.98]' : 'text-primary-50 hover:bg-white/10'}`}
                        >
                            Riwayat
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="max-w-md mx-auto px-6 pt-4">
                {activeSection === 'calculator' ? (
                    <>
                        {/* Category Selector */}
                        <div className="grid grid-cols-4 gap-2 mb-8">
                            <CategoryTab active={zakatCategory === 'fitrah'} icon={<Users size={18} />} label="Fitrah" onClick={() => setZakatCategory('fitrah')} />
                            <CategoryTab active={zakatCategory === 'penghasilan'} icon={<Briefcase size={18} />} label="Gaji" onClick={() => setZakatCategory('penghasilan')} />
                            <CategoryTab active={zakatCategory === 'maal'} icon={<Wallet size={18} />} label="Maal" onClick={() => setZakatCategory('maal')} />
                            <CategoryTab active={zakatCategory === 'perdagangan'} icon={<TrendingUp size={18} />} label="Niaga" onClick={() => setZakatCategory('perdagangan')} />
                        </div>

                        {/* Result Card */}
                        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-[3rem] p-8 text-white shadow-xl shadow-primary-500/20 relative overflow-hidden mb-8 group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse"></div>
                            
                            <div className="relative z-10 text-center">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-100 mb-2">Estimasi Zakat {zakatCategory}</h2>
                                <div className="text-4xl font-black mb-4 flex justify-center items-end gap-2 tabular-nums">
                                    {zakatType === 'rice' && zakatCategory === 'fitrah' ? (
                                        <>
                                            <span>{totalAmount}</span>
                                            <span className="text-xl mb-1">Ltr</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-xl mb-1">Rp</span>
                                            <span>{new Intl.NumberFormat('id-ID').format(totalAmount)}</span>
                                        </>
                                    )}
                                </div>
                                <button 
                                    onClick={saveToHistory}
                                    className="inline-flex items-center gap-2 px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-[10px] font-black uppercase  transition-all"
                                >
                                    <Save size={14} /> Simpan ke Riwayat
                                </button>
                            </div>
                        </div>

                        {/* Input Controls */}
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 mb-8 shadow-sm">
                            {zakatCategory === 'fitrah' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl mb-4 shadow-inner">
                                        <button onClick={() => setZakatType('money')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase  transition-all ${zakatType === 'money' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400'}`}>Uang</button>
                                        <button onClick={() => setZakatType('rice')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase  transition-all ${zakatType === 'rice' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400'}`}>Beras</button>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase  block mb-4">Jumlah Orang</label>
                                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <button onClick={() => setPersonCount(Math.max(1, personCount - 1))} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-700 rounded-xl shadow-sm text-primary-600 font-bold">-</button>
                                            <span className="text-xl font-black text-slate-800 dark:text-white">{personCount}</span>
                                            <button onClick={() => setPersonCount(personCount + 1)} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-700 rounded-xl shadow-sm text-primary-600 font-bold">+</button>
                                        </div>
                                    </div>
                                    {zakatType === 'money' && (
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase  block mb-4">Harga Beras / Liter (Rp)</label>
                                            <input 
                                                type="text" 
                                                value={formatDisplay(ricePrice)} 
                                                onChange={(e) => handleInputChange(e.target.value, setRicePrice)} 
                                                className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 font-black text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" 
                                                placeholder="Contoh: 15.000"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {zakatCategory === 'penghasilan' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase  block mb-4">Total Pendapatan / Bulan (Rp)</label>
                                        <input 
                                            type="text" 
                                            value={formatDisplay(income)} 
                                            onChange={(e) => handleInputChange(e.target.value, setIncome)} 
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 font-black text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" 
                                            placeholder="Contoh: 10.000.000"
                                        />
                                    </div>
                                    <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl text-[10px] font-bold text-primary-700 dark:text-primary-400">
                                        Nishab: Rp13.200.000 / bln (Est. 522kg beras)
                                    </div>
                                </div>
                            )}

                            {zakatCategory === 'maal' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase  block mb-4">Total Aset Harta (Rp)</label>
                                        <input 
                                            type="text" 
                                            value={formatDisplay(assets)} 
                                            onChange={(e) => handleInputChange(e.target.value, setAssets)} 
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 font-black text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" 
                                            placeholder="Contoh: 100.000.000"
                                        />
                                        <p className="text-[9px] text-slate-400 mt-2 ml-1">Simpanan, emas, deposito, dll yang sudah dimiliki 1 tahun.</p>
                                    </div>
                                    <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl text-[10px] font-bold text-primary-700 dark:text-primary-400">
                                        Nishab: Rp102.000.000 (Est. 85g emas)
                                    </div>
                                </div>
                            )}

                            {zakatCategory === 'perdagangan' && (
                                <div className="space-y-4 animate-in fade-in duration-300">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase  block mb-1">Modal / Stok Barang (Rp)</label>
                                        <input 
                                            type="text" 
                                            value={formatDisplay(tradeInventory)} 
                                            onChange={(e) => handleInputChange(e.target.value, setTradeInventory)} 
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 font-black text-sm outline-none" 
                                            placeholder="Stok Barang"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase  block mb-1">Uang Tunai / Piutang (Rp)</label>
                                        <input 
                                            type="text" 
                                            value={formatDisplay(tradeCash)} 
                                            onChange={(e) => handleInputChange(e.target.value, setTradeCash)} 
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 font-black text-sm outline-none" 
                                            placeholder="Uang Tunai"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase  block mb-1">Hutang Jatuh Tempo (Rp)</label>
                                        <input 
                                            type="text" 
                                            value={formatDisplay(tradeDebt)} 
                                            onChange={(e) => handleInputChange(e.target.value, setTradeDebt)} 
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 font-black text-sm outline-none" 
                                            placeholder="Hutang"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-[2.5rem] border border-primary-100 dark:border-primary-800 flex items-start gap-4">
                            <Info size={24} className="text-primary-600 mt-1" />
                            <p className="text-[11px] font-bold text-primary-700 dark:text-primary-300 leading-relaxed">
                                Kalkulasi ini berdasarkan ketentuan syariah lazim dengan Nishab estimasi. Silakan konsultasikan dengan BAZNAS atau lembaga zakat resmi untuk detail lebih mendalam.
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        {history.length > 0 ? (
                            history.map((item) => (
                                <div key={item.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 text-[8px] font-black uppercase rounded-full">{item.type}</span>
                                            <span className="text-[10px] font-bold text-slate-400">{format(new Date(item.date), 'dd MMM yyyy')}</span>
                                        </div>
                                        <h4 className="font-black text-slate-800 dark:text-white">Rp {new Intl.NumberFormat('id-ID').format(item.amount)}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{item.description}</p>
                                    </div>
                                    <button 
                                        onClick={() => deleteHistory(item.id)}
                                        className="p-3 bg-red-50 text-red-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 flex flex-col items-center gap-4">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                                    <History size={40} />
                                </div>
                                <p className="text-slate-400 font-bold text-sm uppercase ">Belum ada riwayat</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const CategoryTab = ({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center gap-2 py-4 rounded-3xl transition-all ${active ? 'bg-primary-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800 hover:bg-slate-50'}`}
    >
        {icon}
        <span className="text-[8px] font-black uppercase  font-sans">{label}</span>
    </button>
);

export default ZakatCalculatorPage;
