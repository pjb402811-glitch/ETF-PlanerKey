import React, { useState, useMemo, useEffect } from 'react';
import type { PortfolioMonitorData } from '../types';

const formatNumber = (value: number | string): string => {
    if (value === '' || value === null || value === undefined) return '';
    const num = String(value).replace(/,/g, '');
    if (isNaN(parseFloat(num))) return '';
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const formatCurrency = (num: number, unit: '원' | '만원' = '원') => {
    const value = unit === '만원' ? Math.round(num / 10000) : Math.round(num);
    return `${value.toLocaleString('ko-KR')}${unit}`;
};

interface PurchaseCalculatorProps {
    portfolios: PortfolioMonitorData[];
}

const PurchaseCalculator: React.FC<PurchaseCalculatorProps> = ({ portfolios }) => {
    const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('');
    const [totalInvestment, setTotalInvestment] = useState<string>('');
    const [etfPrices, setEtfPrices] = useState<Record<string, string>>({});

    useEffect(() => {
        if (portfolios.length > 0 && (!selectedPortfolioId || !portfolios.some(p => p.id === selectedPortfolioId))) {
            setSelectedPortfolioId(portfolios[0].id);
        } else if (portfolios.length === 0) {
            setSelectedPortfolioId('');
        }
    }, [portfolios, selectedPortfolioId]);
    
    const selectedPortfolio = useMemo(() => {
        return portfolios.find(p => p.id === selectedPortfolioId);
    }, [portfolios, selectedPortfolioId]);

    useEffect(() => {
        if (selectedPortfolio) {
            setTotalInvestment(String(Math.round(selectedPortfolio.targetMonthlyInvestment / 10000)));
            const initialPrices: Record<string, string> = {};
            Object.keys(selectedPortfolio.portfolio.weights).forEach(ticker => {
                initialPrices[ticker] = etfPrices[ticker] || ''; // Keep existing prices if available
            });
            setEtfPrices(initialPrices);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPortfolio]);

    const handlePriceChange = (ticker: string, price: string) => {
        const value = price.replace(/,/g, '');
        if (/^\d*\.?\d*$/.test(value)) {
            setEtfPrices(prev => ({...prev, [ticker]: formatNumber(value)}));
        }
    };

    const handleTotalInvestmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/,/g, '');
        if (/^\d*$/.test(value)) {
            setTotalInvestment(formatNumber(value));
        }
    }
    
    const calculationResults = useMemo(() => {
        if (!selectedPortfolio) return [];
        
        const totalInvestmentKRW = parseFloat(totalInvestment.replace(/,/g, '')) * 10000 || 0;
        const results = Object.entries(selectedPortfolio.portfolio.weights)
            .sort(([, weightA], [, weightB]) => weightB - weightA)
            .map(([ticker, weight]) => {
                const price = parseFloat(etfPrices[ticker]?.replace(/,/g, '')) || 0;
                const targetAmount = totalInvestmentKRW * weight;
                const sharesToBuy = price > 0 ? targetAmount / price : 0;
                const actualCost = sharesToBuy * price;

                return {
                    ticker,
                    weight,
                    targetAmount,
                    price,
                    sharesToBuy,
                    actualCost,
                };
            });
        return results;
    }, [selectedPortfolio, totalInvestment, etfPrices]);
    
    const totalActualCost = calculationResults.reduce((sum, item) => sum + item.actualCost, 0);
    const remainingCash = (parseFloat(totalInvestment.replace(/,/g, '')) * 10000 || 0) - totalActualCost;

    if (portfolios.length === 0) {
        return (
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg text-center fade-in border-2 border-dashed border-gray-600">
                <p className="text-gray-400">계산할 포트폴리오가 없습니다.</p>
                <p className="text-sm text-gray-500 mt-2">'포트폴리오 관리' 탭에서 먼저 포트폴리오를 추가해주세요.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 p-4 md:p-6 rounded-2xl shadow-lg fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label htmlFor="portfolio-select" className="block text-sm font-medium text-gray-300 mb-2">포트폴리오 선택</label>
                    <select
                        id="portfolio-select"
                        value={selectedPortfolioId}
                        onChange={e => setSelectedPortfolioId(e.target.value)}
                        className="w-full bg-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                        {portfolios.map(p => (
                            <option key={p.id} value={p.id}>{p.childName} - {p.portfolio.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="total-investment" className="block text-sm font-medium text-gray-300 mb-2">총 월 투자액 (만원)</label>
                    <div className="flex items-center bg-gray-700 rounded-lg">
                        <input
                            type="text"
                            inputMode="numeric"
                            id="total-investment"
                            value={totalInvestment}
                            onChange={handleTotalInvestmentChange}
                            className="w-full bg-transparent p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="예: 100"
                        />
                        <span className="text-gray-400 pr-4 flex-shrink-0">만원</span>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                        <tr>
                            <th scope="col" className="px-4 py-3">ETF</th>
                            <th scope="col" className="px-4 py-3 text-center">목표 비중</th>
                            <th scope="col" className="px-4 py-3 text-right">목표 투자액</th>
                            <th scope="col" className="px-4 py-3 text-center w-40">현재가 (원)</th>
                            <th scope="col" className="px-4 py-3 text-center">매수 수량</th>
                            <th scope="col" className="px-4 py-3 text-right">실제 매수액</th>
                        </tr>
                    </thead>
                    <tbody>
                        {calculationResults.map(item => (
                            <tr key={item.ticker} className="border-b border-gray-700 hover:bg-gray-800/50">
                                <td className="px-4 py-2 font-medium text-white whitespace-nowrap">{item.ticker}</td>
                                <td className="px-4 py-2 text-center">{(item.weight * 100).toFixed(1)}%</td>
                                <td className="px-4 py-2 text-right">{formatCurrency(item.targetAmount, '원')}</td>
                                <td className="px-4 py-2">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={etfPrices[item.ticker] || ''}
                                        onChange={e => handlePriceChange(item.ticker, e.target.value)}
                                        className="w-full bg-gray-700 p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-right"
                                        placeholder="현재가 입력"
                                    />
                                </td>
                                <td className="px-4 py-2 text-center font-bold text-lg text-green-400">{item.sharesToBuy.toFixed(3)} 주</td>
                                <td className="px-4 py-2 text-right">{formatCurrency(item.actualCost, '원')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 border-t border-gray-700 pt-4 flex justify-between items-center flex-wrap gap-4">
                 <div className="text-xs text-gray-500 space-y-1">
                    <p>💡 소수점 3자리까지 계산된 값이며, 실제 매수 시 발생하는 수수료 및 세금은 포함되지 않았습니다.</p>
                    <p>💡 소수점 매수를 지원하지 않는 증권사의 경우, 실제 매수 가능 수량과 다를 수 있습니다.</p>
                </div>
                <div className="text-right space-y-2 text-base w-full sm:w-auto">
                    <p className="text-gray-300">총 실제 매수액: <span className="font-bold text-xl text-white ml-2">{formatCurrency(totalActualCost, '원')}</span></p>
                    <p className="text-gray-300">남은 현금: <span className="font-bold text-xl text-amber-400 ml-2">{formatCurrency(remainingCash, '원')}</span></p>
                </div>
            </div>
        </div>
    );
};

export default PurchaseCalculator;