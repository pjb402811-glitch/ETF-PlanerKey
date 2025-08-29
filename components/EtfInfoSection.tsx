import React, { useState } from 'react';
import type { Etf } from '../types';
import EtfCard from './EtfCard';
import CompactEtfCard from './CompactEtfCard';
import EtfDetailModal from './EtfDetailModal';

interface EtfInfoSectionProps {
    etfData: Record<string, Etf>;
    categories: string[];
}

const EtfInfoSection: React.FC<EtfInfoSectionProps> = ({ etfData, categories }) => {
    const [activeCategory, setActiveCategory] = useState('전체');
    const [selectedEtf, setSelectedEtf] = useState<Etf | null>(null);

    const allCategories = ['전체', ...categories.sort()];
    const etfsToDisplay = activeCategory === '전체'
        ? Object.values(etfData)
        : Object.values(etfData).filter(etf => etf.category === activeCategory);

    const isCompactView = activeCategory === '전체';
    const gridClasses = isCompactView
        ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3"
        : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";

    const handleCompactCardClick = (etf: Etf) => {
        setSelectedEtf(etf);
    };

    return (
        <section className="mb-12">
            <h2 className="text-2xl font-semibold text-cyan-400 mb-6 border-b-2 border-cyan-400/30 pb-2">
                미국 배당,<span className="text-amber-400">성장</span> ETF Pool
            </h2>
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
                {etfsToDisplay.map(etf => 
                    isCompactView 
                    ? <CompactEtfCard key={etf.ticker} etf={etf} onClick={handleCompactCardClick} /> 
                    : <EtfCard key={etf.ticker} etf={etf} />
                )}
            </div>
            {selectedEtf && (
                <EtfDetailModal 
                    etf={selectedEtf} 
                    onClose={() => setSelectedEtf(null)} 
                />
            )}
        </section>
    );
};

export default EtfInfoSection;