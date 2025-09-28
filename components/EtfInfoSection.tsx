import React, { useState } from 'react';
import type { Etf } from '../types';
import EtfCard from './EtfCard';
import CompactEtfCard from './CompactEtfCard';
import EtfDetailModal from './EtfDetailModal';
import EtfEditModal from './EtfEditModal';

interface EtfInfoSectionProps {
    etfData: Record<string, Etf>;
    categories: string[];
    apiKey: string | null;
    onSaveEtf: (etf: Etf) => void;
    onDeleteEtf: (ticker: string) => void;
    onResetEtfs: () => void;
}

const EtfInfoSection: React.FC<EtfInfoSectionProps> = ({ etfData, categories, apiKey, onSaveEtf, onDeleteEtf, onResetEtfs }) => {
    const [activeCategory, setActiveCategory] = useState('전체');
    const [selectedEtf, setSelectedEtf] = useState<Etf | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [modalEtf, setModalEtf] = useState<Etf | 'new' | null>(null);

    const allCategories = ['전체', ...categories];
    const etfsToDisplay = activeCategory === '전체'
        ? Object.values(etfData)
        // FIX: Add explicit type to ensure `etf` is correctly inferred as `Etf`.
        : Object.values(etfData).filter((etf: Etf) => etf.category === activeCategory);

    const isCompactView = activeCategory === '전체' && !isEditing;

    const gridClasses = isCompactView
        ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3"
        : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";

    const handleCompactCardClick = (etf: Etf) => {
        setSelectedEtf(etf);
    };
    
    const handleSave = (etf: Etf) => {
        onSaveEtf(etf);
        setModalEtf(null);
    };

    return (
        <section className="mb-12">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6 border-b-2 border-cyan-400/30 pb-2">
                <h2 className="text-2xl font-semibold text-cyan-400">
                    미국 배당,<span className="text-amber-400">성장</span> ETF Pool
                </h2>
                <div className="flex items-center gap-2">
                    {isEditing && (
                        <button
                            onClick={onResetEtfs}
                            className="bg-gray-600 hover:bg-gray-700 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors"
                        >
                            기본값 복원
                        </button>
                    )}
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors ${
                            isEditing ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {isEditing ? '편집 완료' : 'ETF 목록 편집'}
                    </button>
                </div>
            </div>

            {isEditing && (
                <div className="text-center mb-6 bg-gray-800 p-4 rounded-lg">
                    <button
                        onClick={() => setModalEtf('new')}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full transition-transform transform hover:scale-105"
                    >
                        + 새 ETF 추가하기
                    </button>
                </div>
            )}

            <div className="flex flex-wrap gap-2 mb-6">
                {allCategories.map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 
                            ${activeCategory === category ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                        {category}
                    </button>
                ))}
            </div>
            <div className={gridClasses}>
                {/* FIX: Add explicit type to ensure `etf` is correctly inferred as `Etf`. */}
                {etfsToDisplay.map((etf: Etf) => 
                    isCompactView 
                    ? <CompactEtfCard key={etf.ticker} etf={etf} onClick={handleCompactCardClick} /> 
                    : <EtfCard 
                        key={etf.ticker} 
                        etf={etf} 
                        isEditing={isEditing}
                        onEdit={() => setModalEtf(etf)}
                        onDelete={() => onDeleteEtf(etf.ticker)}
                      />
                )}
            </div>
            {selectedEtf && (
                <EtfDetailModal 
                    etf={selectedEtf} 
                    onClose={() => setSelectedEtf(null)} 
                />
            )}
            {modalEtf && (
                <EtfEditModal
                    etf={modalEtf === 'new' ? null : modalEtf}
                    apiKey={apiKey}
                    onSave={handleSave}
                    onClose={() => setModalEtf(null)}
                    existingTickers={Object.keys(etfData).filter(t => modalEtf !== 'new' && modalEtf && t !== (modalEtf as Etf).ticker)}
                    categories={categories}
                />
            )}
        </section>
    );
};

export default EtfInfoSection;
