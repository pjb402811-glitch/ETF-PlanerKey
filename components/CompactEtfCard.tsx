import React from 'react';
import type { Etf } from '../types';
import { categoryColorMap } from '../constants';

interface CompactEtfCardProps {
    etf: Etf;
    onClick: (etf: Etf) => void;
}

const CompactEtfCard: React.FC<CompactEtfCardProps> = ({ etf, onClick }) => {
    const borderColor = categoryColorMap[etf.category] || 'gray';
    
    return (
        <button 
            onClick={() => onClick(etf)}
            className={`w-full text-left bg-gray-800 p-2 rounded-lg shadow-md border-l-4 border-${borderColor}-500 flex items-center justify-between hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500`}
        >
            <h3 className="text-sm font-bold text-white truncate pr-2">
                {etf.ticker}
            </h3>
            <span className="font-semibold text-green-400 text-xs flex-shrink-0">{(etf.yield * 100).toFixed(1)}%</span>
        </button>
    );
};

export default CompactEtfCard;