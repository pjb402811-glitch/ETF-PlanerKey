import React, { useEffect } from 'react';
import type { SimulationResult, PortfolioScenario } from '../types';
import ChartComponent from './Chart';

const formatCurrency = (num: number) => `${Math.round(num).toLocaleString('ko-KR')}원`;

const formatCurrencyShort = (num: number): string => {
    const numAbs = Math.abs(num);
    if (numAbs >= 100000000) {
        const value = Math.round(num / 10000000) / 10;
        return `${value.toLocaleString('ko-KR')}억원`;
    }
    if (numAbs >= 10000) {
        return `${Math.round(num / 10000).toLocaleString('ko-KR')}만원`;
    }
    return `${Math.round(num).toLocaleString('ko-KR')}원`;
};


interface ResultCardProps {
    result: SimulationResult;
    index: number;
    isPrimary: boolean;
    onSelectPortfolio: (portfolio: PortfolioScenario, monthlyInvestment: number) => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, index, isPrimary, onSelectPortfolio }) => {
    const riskColorClass = result.scenario.risk === '낮음' ? 'bg-green-500/20 text-green-400' :
                           result.scenario.risk === '중립' ? 'bg-yellow-500/20 text-yellow-400' :
                           'bg-red-500/20 text-red-400';
    const chartLabels = Array.from({ length: result.periodYears + 1 }, (_, i) => `${i}년차`);
    const yearlyAssetData = result.assetGrowth.filter((_, i) => i % 12 === 0);
    const yearlyDividendData = result.dividendGrowth.filter((_, i) => i % 12 === 0);

    return (
        <div 
            className={`bg-gray-800 p-6 rounded-2xl shadow-lg border-2 ${isPrimary ? 'border-amber-400' : 'border-gray-700'} fade-in`}
            style={{ animationDelay: `${index * 150}ms` }}
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className={`text-xl font-bold ${isPrimary ? 'text-amber-400' : 'text-gray-300'}`}>
                        {isPrimary ? '🥇 추천 순위 1' : `🥈 추천 순위 ${index + 1}`}
                    </span>
                    <h3 className="text-2xl font-bold text-white">{result.scenario.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{result.scenario.desc}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                    <div className="text-lg font-semibold">위험도: <span className={`px-3 py-1 rounded-full text-sm ${riskColorClass}`}>{result.scenario.risk}</span></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                <div className="bg-gray-900/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-lg text-green-400 mb-4 text-center">포트폴리오 구성 ({formatCurrency(result.monthlyInvestment)}/월)</h4>
                    <div className="space-y-3 text-sm mb-4">
                        {Object.entries(result.scenario.weights).map(([ticker, weight]) => (
                            <div key={ticker} className="flex justify-between items-center">
                                <span className="font-bold text-gray-300 w-16">{ticker}</span>
                                <div className="flex-grow h-2.5 bg-gray-700 rounded-full mx-3">
                                    <div className={`h-2.5 bg-cyan-500 rounded-full`} style={{ width: `${weight * 100}%` }}></div>
                                </div>
                                <span className="w-12 text-right text-gray-300">{(weight * 100).toFixed(1)}%</span>
                            </div>
                        ))}
                    </div>
                     <p className="text-xs text-gray-500 text-center px-2">
                        💡 실제 투자 시에는 월 투자금을 모아 각 ETF의 현재 가격에 맞춰 비중대로 매수하는 것이 좋습니다.
                    </p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg flex flex-col justify-center items-center text-center">
                    <h4 className="font-semibold text-lg text-cyan-400 mb-2">{result.periodYears}년 후 예상 결과</h4>
                    <p className="text-2xl font-bold text-white">{formatCurrency(result.targetAssets)}</p>
                    <p className="text-gray-400">예상 총자산</p>
                    <div className="w-20 h-px bg-gray-600 my-3"></div>
                    <p className="text-2xl font-bold text-white">{formatCurrency(result.targetAssets * result.postTaxYield / 12)}</p>
                    <p className="text-gray-400">예상 월 배당금 (세후)</p>
                </div>
            </div>

            {isPrimary && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                    <div className="bg-gray-900/50 p-4 rounded-lg fade-in" style={{height: '320px'}}>
                        <h4 className="font-semibold text-lg text-white mb-3 text-center">총 자산 예상 성장 차트</h4>
                        <ChartComponent 
                            data={{ labels: chartLabels, datasets: [{ label: '총 자산', data: yearlyAssetData, borderColor: '#34d399', backgroundColor: 'rgba(52, 211, 153, 0.2)', fill: true, tension: 0.3 }]}}
                        />
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-lg fade-in" style={{height: '320px'}}>
                        <h4 className="font-semibold text-lg text-white mb-3 text-center">월 예상 배당금 성장 차트</h4>
                        <ChartComponent 
                             data={{ labels: chartLabels, datasets: [{ label: '월 예상 배당금 (세후)', data: yearlyDividendData, borderColor: '#818cf8', backgroundColor: 'rgba(129, 140, 248, 0.2)', fill: true, tension: 0.3 }]}}
                        />
                    </div>
                </div>
            )}
            <div className="mt-6 text-center">
                <button 
                    onClick={() => onSelectPortfolio(result.scenario, result.monthlyInvestment)}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-6 rounded-full transition-transform transform hover:scale-105 shadow-md"
                >
                    이 포트폴리오 관리 시작
                </button>
            </div>
        </div>
    );
};


interface ResultsSectionProps {
    results: SimulationResult[];
    inputs: { currentAge: number; investmentPeriod: number };
    onSelectPortfolio: (portfolio: PortfolioScenario, monthlyInvestment: number) => void;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({ results, inputs, onSelectPortfolio }) => {
    const resultsRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [results]);

    if (!results || results.length === 0) return null;

    const primaryResult = results[0];
    const targetAge = inputs.currentAge + inputs.investmentPeriod;
    const finalMonthlyDividend = primaryResult.targetAssets * primaryResult.postTaxYield / 12;

    return (
        <section ref={resultsRef} className="fade-in">
            <h2 className="text-2xl font-semibold text-amber-400 mb-6 border-b-2 border-amber-400/30 pb-2">시뮬레이션 결과 보고서</h2>
            <div className="bg-gray-800 p-6 rounded-2xl mb-8 text-center fade-in">
                 <p className="text-xl md:text-2xl leading-relaxed">
                    (예상) 매월 <span className="font-bold text-green-400">{formatCurrencyShort(primaryResult.monthlyInvestment)}</span> 투자 시,<br/>
                    자녀가 <span className="font-bold text-amber-400">{targetAge}세</span>가 되었을 때,<br/>
                    월 배당 <span className="font-bold text-indigo-400">{formatCurrencyShort(finalMonthlyDividend)}</span>, 
                    총자산 <span className="font-bold text-cyan-400">{formatCurrencyShort(primaryResult.targetAssets)}</span> 달성이 기대됩니다.
                </p>
            </div>
            <div className="space-y-8">
                {results.map((result, index) => (
                    <ResultCard 
                        key={result.scenario.id} 
                        result={result} 
                        index={index} 
                        isPrimary={index === 0} 
                        onSelectPortfolio={onSelectPortfolio}
                    />
                ))}
            </div>
        </section>
    );
};

export default ResultsSection;