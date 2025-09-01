import React from 'react';
import type { Etf } from '../types';
import { categoryColorMap } from '../constants';

interface EtfCardProps {
    etf: Etf;
    isEditing?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}

const EtfCard: React.FC<EtfCardProps> = ({ etf, isEditing, onEdit, onDelete }) => {
    const borderColor = categoryColorMap[etf.category] || 'gray';
    const riskColorClass = etf.risk === '낮음' ? 'bg-green-500/20 text-green-400' :
                           etf.risk === '중립' ? 'bg-yellow-500/20 text-yellow-400' :
                           'bg-red-500/20 text-red-400';

    return (
        <div className={`bg-gray-800 p-5 rounded-xl shadow-md border-l-4 border-${borderColor}-500 relative`}>
            {isEditing && (
                <div className="absolute top-3 right-3 flex gap-2">
                    <button onClick={onEdit} className="p-1.5 bg-gray-700 rounded-full hover:bg-blue-600 text-white transition-colors" aria-label="Edit ETF">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                          <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button onClick={onDelete} className="p-1.5 bg-gray-700 rounded-full hover:bg-red-600 text-white transition-colors" aria-label="Delete ETF">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            )}
            <h3 className={`text-xl font-bold text-${etf.color}-400 pr-16`}>
                {etf.ticker} <span className="text-base font-medium text-gray-300">{etf.name}</span>
            </h3>
            <p className="text-sm text-gray-400 mt-2 mb-4">{etf.desc}</p>
            <div className="text-xs space-y-2 mb-4">
                <p><span className="font-semibold text-green-400">장점:</span> {etf.pros}</p>
                <p><span className="font-semibold text-red-400">단점/유의사항:</span> {etf.cons}</p>
            </div>
            <div className="flex items-start text-center text-xs gap-2">
                <div className="flex-1">
                    <div className="text-gray-400">예상 배당률</div>
                    <div className="font-semibold text-white mt-1">{(etf.yield * 100).toFixed(2)}%</div>
                </div>
                <div className="flex-1">
                    <div className="text-gray-400">예상 성장률</div>
                    <div className="font-semibold text-white mt-1">{(etf.growth * 100).toFixed(2)}%</div>
                </div>
                <div className="flex-1">
                    <div className="text-gray-400">위험도</div>
                    <div className="mt-1"><span className={`px-2 py-0.5 rounded-full ${riskColorClass}`}>{etf.risk}</span></div>
                </div>
                <div className="flex-1">
                    <div className="text-gray-400">카테고리</div>
                    <div className="font-semibold text-gray-300 mt-1">{etf.category}</div>
                </div>
            </div>
        </div>
    );
};

export default EtfCard;