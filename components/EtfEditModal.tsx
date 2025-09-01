import React, { useState, useEffect } from 'react';
import type { Etf } from '../types';
import { categoryColorMap } from '../constants';
import { fetchEtfDataWithAI } from '../services/geminiService';

interface EtfEditModalProps {
    etf: Etf | null; // null for creating a new one
    apiKey: string | null;
    onSave: (etf: Etf) => void;
    onClose: () => void;
    existingTickers: string[];
    categories: string[];
}

const riskLevels: Array<Etf['risk']> = ['낮음', '중립', '높음'];

const EtfEditModal: React.FC<EtfEditModalProps> = ({ etf, apiKey, onSave, onClose, existingTickers, categories }) => {
    const [formData, setFormData] = useState<Omit<Etf, 'color'>>({
        ticker: '', name: '', desc: '', pros: '', cons: '',
        yield: 0, growth: 0, risk: '중립', category: '기타 고배당'
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isAwaitingAi, setIsAwaitingAi] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [newCategory, setNewCategory] = useState('');

    useEffect(() => {
        if (etf) {
            setFormData(etf);
            setIsAwaitingAi(false);
        } else {
             setFormData({
                ticker: '', name: '', desc: '', pros: '', cons: '',
                yield: 0, growth: 0, risk: '중립', category: '기타 고배당'
            });
            setIsAwaitingAi(true);
        }
        setErrors({});
        setAiError(null);
        setIsFetching(false);
    }, [etf]);
    
    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.ticker) newErrors.ticker = 'Ticker를 입력해야 합니다.';
        if (!etf && existingTickers.includes(formData.ticker.toUpperCase())) {
            newErrors.ticker = '이미 존재하는 Ticker입니다.';
        }
        if (!formData.name) newErrors.name = '이름을 입력해야 합니다.';
        if (isNaN(formData.yield)) newErrors.yield = '유효한 숫자를 입력해야 합니다.';
        if (isNaN(formData.growth)) newErrors.growth = '유효한 숫자를 입력해야 합니다.';
        if (formData.category === '--new--' && !newCategory.trim()) {
            newErrors.category = '새 카테고리 이름을 입력해주세요.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFetchWithAI = async () => {
        if (!formData.ticker) {
            setAiError("ETF Ticker를 입력해주세요.");
            return;
        }
        if (existingTickers.includes(formData.ticker.toUpperCase())) {
            setAiError("이미 존재하는 Ticker입니다.");
            return;
        }
         if (!apiKey) {
            setAiError("API Key가 설정되지 않았습니다. 메인 화면 우측 상단에서 설정해주세요.");
            return;
        }
        
        setIsFetching(true);
        setAiError(null);
        try {
            const aiData = await fetchEtfDataWithAI(apiKey, formData.ticker, categories);
            setFormData(prev => ({...prev, ...aiData}));
            setIsAwaitingAi(false);
        } catch (error) {
            setAiError(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.");
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            const finalCategory = formData.category === '--new--' ? newCategory.trim() : formData.category;

            const finalEtf: Etf = {
                ...formData,
                ticker: formData.ticker.toUpperCase(),
                category: finalCategory,
                color: categoryColorMap[finalCategory] || 'gray'
            };
            onSave(finalEtf);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // The value is in percent, so we divide by 100 for the internal representation
        const numericValue = parseFloat(value) || 0;
        setFormData(prev => ({ ...prev, [name]: numericValue / 100 }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl text-left border border-gray-700 relative overflow-hidden" onClick={e => e.stopPropagation()}>
                 <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="p-6 bg-gray-900/50 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">{etf ? 'ETF 정보 수정' : '새 ETF 추가'}</h3>
                         <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    
                    {isAwaitingAi ? (
                        <div className="p-6 space-y-4 text-center">
                            <p className="text-gray-300">정보를 가져올 ETF의 Ticker를 입력해주세요.</p>
                            <input 
                                type="text" 
                                name="ticker" 
                                value={formData.ticker} 
                                onChange={handleChange} 
                                className="w-full max-w-sm mx-auto bg-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase text-center text-lg font-bold"
                                placeholder="예: VOO"
                            />
                            {aiError && <p className="text-red-400 text-sm mt-2">{aiError}</p>}
                            <div className="pt-4">
                                <button
                                    type="button"
                                    onClick={handleFetchWithAI}
                                    disabled={isFetching}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait"
                                >
                                    {isFetching ? '정보 가져오는 중...' : 'AI로 정보 불러오기'}
                                </button>
                            </div>
                        </div>
                    ) : (
                    <>
                        <div className="p-6 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)'}}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="ticker" className="block text-sm font-medium text-gray-300 mb-1">Ticker</label>
                                    <input type="text" name="ticker" value={formData.ticker} onChange={handleChange} disabled={!!etf || !isAwaitingAi} className="w-full bg-gray-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed uppercase" />
                                    {errors.ticker && <p className="text-red-400 text-xs mt-1">{errors.ticker}</p>}
                                </div>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">ETF 이름</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                                </div>
                            </div>
                            <div>
                                <label htmlFor="desc" className="block text-sm font-medium text-gray-300 mb-1">설명</label>
                                <textarea name="desc" value={formData.desc} onChange={handleChange} rows={2} className="w-full bg-gray-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                            </div>
                            <div>
                                <label htmlFor="pros" className="block text-sm font-medium text-gray-300 mb-1">장점</label>
                                <input type="text" name="pros" value={formData.pros} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label htmlFor="cons" className="block text-sm font-medium text-gray-300 mb-1">단점/유의사항</label>
                                <input type="text" name="cons" value={formData.cons} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">카테고리</label>
                                    <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        {!categories.includes(formData.category) && <option value={formData.category}>{formData.category} (AI 추천)</option>}
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        <option value="--new--">-- 새 카테고리 추가 --</option>
                                    </select>
                                    {formData.category === '--new--' && (
                                        <input 
                                            type="text" 
                                            value={newCategory} 
                                            onChange={(e) => setNewCategory(e.target.value)}
                                            className="w-full bg-gray-700 p-2 mt-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="새 카테고리 이름 입력"
                                        />
                                    )}
                                    {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
                                </div>
                                <div>
                                    <label htmlFor="risk" className="block text-sm font-medium text-gray-300 mb-1">위험도</label>
                                    <select name="risk" value={formData.risk} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        {riskLevels.map(level => <option key={level} value={level}>{level}</option>)}
                                    </select>
                                </div>
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="yield" className="block text-sm font-medium text-gray-300 mb-1">예상 배당률 (%)</label>
                                    <input type="number" step="0.01" name="yield" value={(formData.yield * 100).toFixed(2)} onChange={handleNumericChange} className="w-full bg-gray-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    {errors.yield && <p className="text-red-400 text-xs mt-1">{errors.yield}</p>}
                                </div>
                                <div>
                                    <label htmlFor="growth" className="block text-sm font-medium text-gray-300 mb-1">예상 성장률 (%)</label>
                                    <input type="number" step="0.01" name="growth" value={(formData.growth * 100).toFixed(2)} onChange={handleNumericChange} className="w-full bg-gray-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    {errors.growth && <p className="text-red-400 text-xs mt-1">{errors.growth}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-900/50 flex justify-end gap-4 mt-auto">
                            <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                                취소
                            </button>
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                                저장
                            </button>
                        </div>
                    </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default EtfEditModal;