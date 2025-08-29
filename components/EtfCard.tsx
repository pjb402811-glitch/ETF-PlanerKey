import React from 'react';
import type { Etf } from '../types';
import { categoryColorMap } from '../constants';

interface EtfCardProps {
    etf: Etf;
}

const EtfCard: React.FC<EtfCardProps> = ({ etf }) => {
    const borderColor = categoryColorMap[etf.category] || 'gray';
    const riskColorClass = etf.risk === '낮음' ? 'bg-green-500/20 text-green-400' :
                           etf.risk === '중립' ? 'bg-yellow-500/20 text-yellow-400' :
                           'bg-red-500/20 text-red-400';

    return (
        <div className={`bg-gray-800 p-5 rounded-xl shadow-md border-l-4 border-${borderColor}-500`}>
            <h3 className={`text-xl font-bold text-${etf.color}-400`}>
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