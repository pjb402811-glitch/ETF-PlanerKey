import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { PortfolioMonitorData, MonthlyEntry, Etf } from '../types';
import PurchaseCalculator from './PurchaseCalculator';

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


const AllocationBar: React.FC<{ target: number, actual: number }> = ({ target, actual }) => {
    const diff = Math.abs(target - actual);
    const indicatorColor = diff <= 2 ? 'bg-green-500' : diff <= 5 ? 'bg-yellow-500' : 'bg-red-500';

    return (
        <div className="w-full bg-gray-700 rounded-full h-5 relative my-1">
            <div className="bg-cyan-600 h-5 rounded-full" style={{ width: `${actual}%` }} />
            <div className="absolute top-0 h-full w-0.5 bg-gray-200" style={{ left: `${target}%` }} title={`목표: ${target.toFixed(1)}%`}>
                <div className={`w-2 h-2 ${indicatorColor} rounded-full absolute -top-1 -translate-x-1/2`}></div>
            </div>
        </div>
    );
};

interface PortfolioTrackerDetailProps {
    data: PortfolioMonitorData;
    etfData: Record<string, Etf>;
    isEditing: boolean;
    onChange: (data: PortfolioMonitorData) => void;
}

const PortfolioTrackerDetail: React.FC<PortfolioTrackerDetailProps> = ({ data, etfData, isEditing, onChange }) => {
    
    const tickers = useMemo(() => Object.keys(data.portfolio.weights).sort((a,b) => data.portfolio.weights[b] - data.portfolio.weights[a]), [data.portfolio.weights]);

    const deepClone = (obj: any) => JSON.parse(JSON.stringify(obj));

    const handleFieldChange = (field: keyof PortfolioMonitorData, value: any) => {
        onChange({ ...data, [field]: value });
    };

    const handleMonthDataChange = (monthIndex: number, ticker: string, value: string) => {
        const numericValue = parseFloat(value.replace(/,/g, '')) * 10000 || 0;
        const year = data.currentTrackingYear;
        
        const newData = deepClone(data);
        newData.trackingHistory[year][monthIndex].investments[ticker] = numericValue;
        onChange(newData);
    };

    const handleYearlyAdjustmentTickerChange = (ticker: string, value: string) => {
        const numericValue = parseFloat(value.replace(/,/g, '')) * 10000 || 0;
        const year = data.currentTrackingYear;

        const newData = deepClone(data);
        if (!newData.yearlyAdjustments) newData.yearlyAdjustments = {};
        if (!newData.yearlyAdjustments[year]) newData.yearlyAdjustments[year] = {};
        
        newData.yearlyAdjustments[year][ticker] = numericValue;
        onChange(newData);
    };
    
    const handlePortfolioWeightChange = (ticker: string, newWeight: number) => {
        const newData = deepClone(data);
        newData.portfolio.weights[ticker] = newWeight / 100;
        onChange(newData);
    };

    const handlePortfolioTickerChange = (oldTicker: string, newTicker: string) => {
        const newData = deepClone(data);
        const newWeights: { [key: string]: number } = {};
        Object.entries(data.portfolio.weights).forEach(([key, value]) => {
            if (key === oldTicker) {
                newWeights[newTicker] = value as number;
            } else {
                newWeights[key] = value as number;
            }
        });
        newData.portfolio.weights = newWeights;

        for (const year in newData.trackingHistory) {
            newData.trackingHistory[year].forEach((monthEntry: MonthlyEntry) => {
                if (monthEntry.investments.hasOwnProperty(oldTicker)) {
                    monthEntry.investments[newTicker] = monthEntry.investments[oldTicker];
                    delete monthEntry.investments[oldTicker];
                }
            });
        }
        for (const year in newData.yearlyAdjustments) {
            if (newData.yearlyAdjustments[year].hasOwnProperty(oldTicker)) {
                newData.yearlyAdjustments[year][newTicker] = newData.yearlyAdjustments[year][oldTicker];
                delete newData.yearlyAdjustments[year][oldTicker];
            }
        }
        onChange(newData);
    };

    const handleAddEtf = () => {
        const currentTickers = Object.keys(data.portfolio.weights);
        const availableToAdd = Object.keys(etfData).find(t => !currentTickers.includes(t));
        if (availableToAdd) {
            const newData = deepClone(data);
            newData.portfolio.weights[availableToAdd] = 0;
            for (const year in newData.trackingHistory) {
                newData.trackingHistory[year].forEach((monthEntry: MonthlyEntry) => {
                    monthEntry.investments[availableToAdd] = 0;
                });
            }
            for (const year in newData.yearlyAdjustments) {
                if(!newData.yearlyAdjustments[year]) newData.yearlyAdjustments[year] = {};
                newData.yearlyAdjustments[year][availableToAdd] = 0;
            }
            onChange(newData);
        } else {
            alert("더 이상 추가할 수 있는 ETF가 없습니다.");
        }
    };
    
    const handleRemoveEtf = (tickerToRemove: string) => {
        const newData = deepClone(data);
        delete newData.portfolio.weights[tickerToRemove];

        for (const year in newData.trackingHistory) {
            newData.trackingHistory[year].forEach((monthEntry: MonthlyEntry) => {
                delete monthEntry.investments[tickerToRemove];
            });
        }
        for (const year in newData.yearlyAdjustments) {
            delete newData.yearlyAdjustments[year][tickerToRemove];
        }
        onChange(newData);
    };

    const handleAddNewYear = () => {
        const existingYears = Object.keys(data.trackingHistory).map(Number);
        const latestYear = Math.max(...existingYears);
        const newYear = latestYear + 1;

        if (data.trackingHistory[newYear]) return;
        
        const newData = deepClone(data);
        const initialInvestments: { [ticker: string]: number } = {};
        Object.keys(data.portfolio.weights).forEach(ticker => { initialInvestments[ticker] = 0; });
        
        if (!newData.yearlyAdjustments) newData.yearlyAdjustments = {};
        newData.yearlyAdjustments[newYear] = { ...initialInvestments };
        newData.currentTrackingYear = newYear;
        newData.trackingHistory[newYear] = Array(12).fill(null).map((_, i) => ({ month: i + 1, investments: { ...initialInvestments } }));
        onChange(newData);
    };

    const currentYearEntries = data.trackingHistory[data.currentTrackingYear] || [];
    const trackedYears = Object.keys(data.trackingHistory).map(Number).sort();

    const cumulativePrincipalByTicker = useMemo(() => {
        const totals: { [ticker: string]: number } = {};
        tickers.forEach(t => { if(t) totals[t] = 0; });

        Object.values(data.trackingHistory).flat().forEach(monthlyEntry => {
            tickers.forEach(ticker => {
                if (totals.hasOwnProperty(ticker)) {
                    totals[ticker] += monthlyEntry.investments[ticker] || 0;
                }
            });
        });

        if (data.yearlyAdjustments) {
            Object.values(data.yearlyAdjustments).forEach(yearAdjustments => {
                tickers.forEach(ticker => {
                    if (totals.hasOwnProperty(ticker) && yearAdjustments) {
                        totals[ticker] += yearAdjustments[ticker] || 0;
                    }
                });
            });
        }
        
        return totals;
    }, [data.trackingHistory, data.yearlyAdjustments, tickers]);

    const totalPrincipal = useMemo(() => Object.values(cumulativePrincipalByTicker).reduce((sum, val) => sum + val, 0), [cumulativePrincipalByTicker]);

    const yearlyMonthlyTotalsByTicker = useMemo(() => {
        return tickers.reduce((acc, ticker) => {
            acc[ticker] = currentYearEntries.reduce((sum, entry) => sum + (entry.investments[ticker] || 0), 0);
            return acc;
        }, {} as {[key: string]: number});
    }, [currentYearEntries, tickers]);

    const yearlyMonthlyGrandTotal = useMemo(() => Object.values(yearlyMonthlyTotalsByTicker).reduce((sum, val) => sum + val, 0), [yearlyMonthlyTotalsByTicker]);

    const yearlyAdjustmentByTicker = useMemo(() => data.yearlyAdjustments?.[data.currentTrackingYear] || {}, [data.yearlyAdjustments, data.currentTrackingYear]);
    
    const yearlyAdjustmentTotal = useMemo(() => Object.values(yearlyAdjustmentByTicker).reduce((sum, val) => sum + val, 0), [yearlyAdjustmentByTicker]);
    
    const yearlyGrandTotalByTicker = useMemo(() => {
         const totals: {[key:string]: number} = {};
         tickers.forEach(ticker => {
             totals[ticker] = (yearlyMonthlyTotalsByTicker[ticker] || 0) + (yearlyAdjustmentByTicker[ticker] || 0);
         });
         return totals;
    }, [tickers, yearlyMonthlyTotalsByTicker, yearlyAdjustmentByTicker]);

    const yearlyGrandTotal = yearlyMonthlyGrandTotal + yearlyAdjustmentTotal;

    const totalProfit = data.currentTotalValue - totalPrincipal;
    const returnRate = totalPrincipal > 0 ? (totalProfit / totalPrincipal) * 100 : 0;
    const profitColor = totalProfit > 0 ? 'text-green-400' : totalProfit < 0 ? 'text-red-400' : 'text-gray-300';
    
    const totalWeightSum = isEditing ? Object.values(data.portfolio.weights).reduce((sum, w) => sum + w, 0) * 100 : 0;
    const totalWeightColor = Math.abs(totalWeightSum - 100) < 0.1 ? 'text-green-400' : 'text-red-400';
    
    const projection = data.simulationProjection;
    const hasStartAge = projection && projection.startAge !== undefined && projection.startAge !== null;

    return (
        <div className="p-4 md:p-6 border-t border-gray-700">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <input
                    type="text"
                    value={data.childName}
                    onChange={(e) => handleFieldChange('childName', e.target.value)}
                    placeholder="자녀 이름"
                    disabled={!isEditing}
                    className="bg-gray-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-lg font-semibold w-full sm:w-auto disabled:bg-transparent disabled:text-gray-200"
                />
            </div>
            
            {projection && (
                <div className="bg-gray-900/50 p-4 rounded-lg mb-6 text-center border border-amber-500/50">
                    <h4 className="font-semibold text-lg text-amber-400 mb-2">최초 시뮬레이션 목표</h4>
                    {hasStartAge ? (
                        <p className="text-lg md:text-xl text-white leading-relaxed">
                            <span className="font-bold">{data.childName}</span>님(<span className="font-bold">{projection.startAge}</span>세)은 매월 <span className="font-bold text-green-400">{formatCurrency(data.targetMonthlyInvestment, '만원')}</span> 투자시, <span className="font-bold">{projection.startAge! + projection.periodYears}</span>세에<br/>(예상) 총자산 <span className="font-bold text-cyan-400">{formatCurrencyShort(projection.targetAssets)}</span> <span className="text-base text-gray-400">(현재 가치: {formatCurrencyShort(projection.inflationAdjustedTargetAssets)})</span>,<br/>월배당금 <span className="font-bold text-indigo-400">{formatCurrencyShort(projection.finalMonthlyDividend)}</span> <span className="text-base text-gray-400">(현재 가치: {formatCurrencyShort(projection.inflationAdjustedMonthlyDividend)})</span> 기대
                        </p>
                    ) : (
                        <p className="text-lg md:text-xl text-white leading-relaxed">
                            <span className="font-bold">{projection.periodYears}</span>년 후 (예상)<br/>
                            총자산 <span className="font-bold text-cyan-400">{formatCurrencyShort(projection.targetAssets)}</span> <span className="text-base text-gray-400">(현재 가치: {formatCurrencyShort(projection.inflationAdjustedTargetAssets)})</span>, <br/>
                            월배당금 <span className="font-bold text-indigo-400">{formatCurrencyShort(projection.finalMonthlyDividend)}</span> <span className="text-base text-gray-400">(현재 가치: {formatCurrencyShort(projection.inflationAdjustedMonthlyDividend)})</span>
                        </p>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-900/50 p-4 rounded-lg">
                     <div className="border-b border-gray-700 pb-4 mb-4">
                        <h4 className="font-semibold text-amber-400">{data.portfolio.name}</h4>
                        <p className="text-sm text-gray-400 mt-1">{data.portfolio.desc}</p>
                        <div className="text-sm mt-2">
                            위험도: <span className={`px-2 py-0.5 rounded-full text-xs ${
                                data.portfolio.risk === '낮음' ? 'bg-green-500/20 text-green-400' :
                                data.portfolio.risk === '중립' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                            }`}>{data.portfolio.risk}</span>
                        </div>
                    </div>
                    <h3 className="font-semibold text-lg text-white mb-3">누적 성과 요약</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-400">목표 월 투자액</p>
                            <p className="text-lg font-bold text-white">{formatCurrency(data.targetMonthlyInvestment)}</p>
                        </div>
                        <div>
                            <p className="text-gray-400">총 누적 투자 원금</p>
                            <p className="text-lg font-bold text-white">{formatCurrency(totalPrincipal)}</p>
                        </div>
                        <div>
                             <p className="text-gray-400">현재 총 자산 평가액 (직접입력)</p>
                            <div className="flex items-center bg-gray-700 rounded-lg mt-1">
                                <input type="text" inputMode="numeric" value={formatNumber(data.currentTotalValue / 10000)} onChange={e => handleFieldChange('currentTotalValue', parseFloat(e.target.value.replace(/,/g, '')) * 10000 || 0)} disabled={!isEditing} className="w-full bg-transparent p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:cursor-not-allowed" />
                                <span className="text-gray-400 pr-3 flex-shrink-0">만원</span>
                            </div>
                        </div>
                         <div>
                            <p className="text-gray-400">월 수령배당금 (세후, 직접입력)</p>
                            <div className="flex items-center bg-gray-700 rounded-lg mt-1">
                                <input type="text" inputMode="numeric" value={formatNumber(data.monthlyDividendReceived / 10000)} onChange={e => handleFieldChange('monthlyDividendReceived', parseFloat(e.target.value.replace(/,/g, '')) * 10000 || 0)} disabled={!isEditing} className="w-full bg-transparent p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:cursor-not-allowed" />
                                <span className="text-gray-400 pr-3 flex-shrink-0">만원</span>
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <p className="text-gray-400">총 수익금 (수익률)</p>
                            <p className={`text-lg font-bold ${profitColor}`}>{formatCurrency(totalProfit)} ({returnRate.toFixed(2)}%)</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-lg text-white">누적 포트폴리오 비중 분석</h3>
                        {isEditing && <button onClick={handleAddEtf} className="text-sm bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded-lg transition-colors">+ ETF 추가</button>}
                    </div>
                    {isEditing ? (
                        <div className="space-y-2 text-sm">
                             {tickers.map(ticker => (
                                <div key={ticker} className="grid grid-cols-12 gap-2 items-center">
                                    <div className="col-span-5">
                                        <select value={ticker} onChange={e => handlePortfolioTickerChange(ticker, e.target.value)} className="w-full bg-gray-700 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500">
                                            {Object.keys(etfData).map(t => <option key={t} value={t} disabled={tickers.includes(t) && t !== ticker}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-5 flex items-center">
                                        <input type="number" value={(data.portfolio.weights[ticker] * 100).toFixed(1)} onChange={e => handlePortfolioWeightChange(ticker, parseFloat(e.target.value))} className="w-full bg-gray-700 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 text-right" step="0.1" />
                                        <span className="ml-2 text-gray-400">%</span>
                                    </div>
                                    <div className="col-span-2 text-right">
                                        <button onClick={() => handleRemoveEtf(ticker)} className="text-red-500 hover:text-red-400 font-bold text-xl"> &times; </button>
                                    </div>
                                </div>
                             ))}
                             <div className="pt-2 text-right font-bold">
                                총합: <span className={totalWeightColor}>{totalWeightSum.toFixed(1)}%</span>
                             </div>
                        </div>
                    ) : (
                         <div className="space-y-4">
                            {tickers.map(ticker => {
                                const actualWeight = totalPrincipal > 0 ? (cumulativePrincipalByTicker[ticker] / totalPrincipal) * 100 : 0;
                                const targetWeight = data.portfolio.weights[ticker] * 100;
                                return (
                                    <div key={ticker}>
                                        <div className="flex justify-between items-baseline text-sm mb-1">
                                            <span className="font-bold text-gray-300">{ticker}</span>
                                            <span className="text-gray-400">실제 <span className="font-semibold text-white">{actualWeight.toFixed(1)}%</span> / 목표 <span className="font-semibold text-gray-300">{targetWeight.toFixed(1)}%</span></span>
                                        </div>
                                        <AllocationBar target={targetWeight} actual={actualWeight} />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

             <div className="mt-6 bg-gray-900/50 p-4 rounded-lg overflow-x-auto">
                 <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                         <h3 className="font-semibold text-lg text-white">월별 투자원금 입력 (단위: 만원)</h3>
                         <div className="flex items-center bg-gray-700 rounded-lg p-1">
                            {trackedYears.map(year => (
                                <button key={year} onClick={() => handleFieldChange('currentTrackingYear', year)} disabled={isEditing && trackedYears.length > 1} className={`px-3 py-1 text-sm rounded-md ${data.currentTrackingYear === year ? 'bg-amber-600 text-white' : 'text-gray-300 hover:bg-gray-600'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                                    {year}년
                                </button>
                            ))}
                         </div>
                    </div>
                    {isEditing && <button onClick={handleAddNewYear} className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-3 rounded-lg transition-colors">+ 새해 추가</button>}
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300" style={{minWidth: `${tickers.length * 120 + 180}px`}}>
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                            <tr>
                                <th scope="col" className="px-4 py-3 sticky left-0 bg-gray-800 z-10">월</th>
                                {tickers.map(ticker => <th scope="col" className="px-4 py-3 text-center" key={ticker}>{ticker}</th>)}
                                <th scope="col" className="px-4 py-3 text-center">월별 합계</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentYearEntries.map((entry, index) => {
                                const monthlyTotal = tickers.reduce((s, t) => s + (entry.investments[t] || 0), 0);
                                return (
                                <tr key={entry.month} className="border-b border-gray-700 hover:bg-gray-800/50">
                                    <th scope="row" className="px-4 py-2 font-medium text-white whitespace-nowrap sticky left-0 bg-gray-800/95">{entry.month}월</th>
                                    {tickers.map(ticker => (
                                        <td className="px-2 py-1" key={ticker}>
                                            <input type="text" inputMode="numeric" disabled={!isEditing} value={formatNumber((entry.investments[ticker] || 0) / 10000)} onChange={(e) => handleMonthDataChange(index, ticker, e.target.value)} className="w-full min-w-[80px] bg-gray-700 p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-right disabled:cursor-not-allowed disabled:bg-gray-700/50" placeholder="0" />
                                        </td>
                                    ))}
                                    <td className="px-4 py-2 text-right font-medium text-white">{formatCurrency(monthlyTotal)}</td>
                                </tr>
                            )})}
                             <tr className="border-b border-gray-700 hover:bg-gray-800/50">
                                <th scope="row" className="px-4 py-2 font-medium text-white whitespace-nowrap sticky left-0 bg-gray-800/95">추가 입출금</th>
                                {tickers.map(ticker => (
                                    <td className="px-2 py-1" key={ticker}>
                                        <input 
                                            type="text" 
                                            inputMode="numeric" 
                                            disabled={!isEditing} 
                                            value={formatNumber((yearlyAdjustmentByTicker[ticker] || 0) / 10000)} 
                                            onChange={(e) => handleYearlyAdjustmentTickerChange(ticker, e.target.value)}
                                            className="w-full min-w-[80px] bg-gray-700 p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-right disabled:cursor-not-allowed disabled:bg-gray-700/50" 
                                            placeholder="0" 
                                        />
                                    </td>
                                ))}
                                <td className="px-4 py-2 text-right font-medium text-white">{formatCurrency(yearlyAdjustmentTotal)}</td>
                            </tr>
                        </tbody>
                        <tfoot className="text-white font-bold bg-gray-800">
                             <tr className="border-t-2 border-amber-500">
                                <th scope="row" className="px-4 py-2 sticky left-0 bg-gray-800 z-10">{data.currentTrackingYear}년 결산</th>
                                {tickers.map(ticker => <td key={ticker} className="px-2 py-2 text-right min-w-[96px] font-semibold">{formatCurrency(yearlyGrandTotalByTicker[ticker])}</td>)}
                                <td className="px-4 py-2 text-right w-[140px] font-semibold">{formatCurrency(yearlyGrandTotal)}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="px-4 py-2 sticky left-0 bg-gray-800 z-10 text-gray-400 font-normal">실제 비중</th>
                                {tickers.map(ticker => {
                                    const weight = yearlyGrandTotal > 0 ? (yearlyGrandTotalByTicker[ticker] / yearlyGrandTotal) * 100 : 0;
                                    return <td key={ticker} className="px-2 py-2 text-right min-w-[96px]">{weight.toFixed(1)}%</td>
                                })}
                                <td className="px-4 py-2 text-right w-[140px]">100%</td>
                            </tr>
                            <tr className="text-gray-400">
                                <th scope="row" className="px-4 py-2 sticky left-0 bg-gray-800 z-10 font-normal">목표 비중</th>
                                {tickers.map(ticker => {
                                    const targetWeight = (data.portfolio.weights[ticker] || 0) * 100;
                                    return <td key={ticker} className="px-2 py-2 text-right min-w-[96px]">{targetWeight.toFixed(1)}%</td>
                                })}
                                <td className="px-4 py-2 text-right w-[140px]">100%</td>
                            </tr>
                        </tfoot>
                    </table>
                 </div>
            </div>
        </div>
    );
};


interface MyPortfolioSectionProps {
    portfolios: PortfolioMonitorData[];
    etfData: Record<string, Etf>;
    onUpdate: (data: PortfolioMonitorData) => void;
    onClone: (portfolioId: string) => void;
    onDelete: (portfolioId: string) => void;
    onResetAll: () => void;
    onExport: () => void;
    onImport: (file: File) => void;
}

const MyPortfolioSection: React.FC<MyPortfolioSectionProps> = ({ portfolios, etfData, onUpdate, onClone, onDelete, onResetAll, onExport, onImport }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingData, setEditingData] = useState<PortfolioMonitorData | null>(null);
    const importInputRef = useRef<HTMLInputElement>(null);
    const [activeSubTab, setActiveSubTab] = useState<'management' | 'calculator'>('management');

    useEffect(() => {
        if (expandedId && !portfolios.some(p => p.id === expandedId)) {
            setExpandedId(null);
        }
        if (editingId && !portfolios.some(p => p.id === editingId)) {
            setEditingId(null);
            setEditingData(null);
        }
    }, [portfolios, expandedId, editingId]);

    const handleEditClick = (portfolio: PortfolioMonitorData) => {
        setEditingId(portfolio.id);
        setEditingData(JSON.parse(JSON.stringify(portfolio))); // Deep copy for editing
        if (expandedId !== portfolio.id) setExpandedId(portfolio.id);
    };

    const handleCancelClick = () => {
        setEditingId(null);
        setEditingData(null);
    };

    const handleSaveClick = () => {
        if (editingData) {
            const totalWeight = Object.values(editingData.portfolio.weights).reduce((sum, w) => sum + w, 0);
            if (Math.abs(totalWeight - 1) > 0.001) {
                alert(`포트폴리오 비중의 총합이 100%가 되어야 합니다. (현재: ${(totalWeight * 100).toFixed(1)}%)`);
                return;
            }
            onUpdate(editingData);
            setEditingId(null);
            setEditingData(null);
        }
    };
    
    const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImport(file);
        }
        if (importInputRef.current) {
            importInputRef.current.value = '';
        }
    };

    return (
        <section className="fade-in">
            <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
                <h2 className="text-2xl font-semibold text-amber-400">📊 내 포트폴리오</h2>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                    <input
                        type="file"
                        ref={importInputRef}
                        onChange={handleFileImport}
                        accept=".json"
                        className="hidden"
                        id="import-file-input"
                    />
                    <label
                        htmlFor="import-file-input"
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors cursor-pointer"
                    >
                        데이터 가져오기
                    </label>
                    {portfolios.length > 0 && (
                        <>
                            <button
                                onClick={onExport}
                                className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                데이터 내보내기
                            </button>
                            <button
                                onClick={onResetAll}
                                className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                전체 초기화
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="flex border-b border-gray-700 mb-6">
                <button
                    onClick={() => setActiveSubTab('management')}
                    className={`px-4 py-2 -mb-px text-base font-semibold transition-colors duration-200 ${
                        activeSubTab === 'management'
                            ? 'text-amber-400 border-b-2 border-amber-400'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    포트폴리오 관리
                </button>
                <button
                    onClick={() => setActiveSubTab('calculator')}
                    className={`px-4 py-2 -mb-px text-base font-semibold transition-colors duration-200 ${
                        activeSubTab === 'calculator'
                            ? 'text-amber-400 border-b-2 border-amber-400'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    매수수량 계산기
                </button>
            </div>

            {activeSubTab === 'management' && (
                <div className="space-y-4">
                    {portfolios.length === 0 ? (
                        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg text-center fade-in border-2 border-dashed border-gray-600">
                            <p className="text-gray-400">관리 중인 포트폴리오가 없습니다.</p>
                            <p className="text-sm text-gray-500 mt-2">시뮬레이터를 실행하여 포트폴리오를 추가하거나, '데이터 가져오기'로 기존 데이터를 불러올 수 있습니다.</p>
                        </div>
                    ) : (
                        portfolios.map((p) => {
                            const isExpanded = expandedId === p.id;
                            const isEditing = editingId === p.id;

                            return (
                            <div key={p.id} className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden">
                                <div 
                                    className="p-4 flex justify-between items-center hover:bg-gray-700/50 transition-colors cursor-pointer"
                                    onClick={() => !isEditing && setExpandedId(isExpanded ? null : p.id)}
                                >
                                    <div className="flex-grow">
                                        <span className="font-bold text-lg text-amber-400">{isEditing ? editingData?.childName : p.childName}</span>
                                        <span className="text-gray-400 mx-2">-</span>
                                        <span className="text-white">{p.portfolio.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                        {isEditing ? (
                                            <>
                                                <button onClick={(e) => { e.stopPropagation(); handleSaveClick(); }} className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors">저장</button>
                                                <button onClick={(e) => { e.stopPropagation(); handleCancelClick(); }} className="bg-gray-600 hover:bg-gray-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors">취소</button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={(e) => { e.stopPropagation(); onClone(p.id); }} className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors">복제</button>
                                                <button onClick={(e) => { e.stopPropagation(); handleEditClick(p); }} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors">수정</button>
                                                <button onClick={(e) => { e.stopPropagation(); onDelete(p.id); }} className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors">삭제</button>
                                            </>
                                        )}
                                        <div className="p-1 rounded-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                {isExpanded && (
                                    <PortfolioTrackerDetail
                                        data={isEditing && editingData ? editingData : p}
                                        etfData={etfData}
                                        isEditing={isEditing}
                                        onChange={setEditingData}
                                    />
                                )}
                            </div>
                        )})
                    )}
                </div>
            )}

            {activeSubTab === 'calculator' && (
                <PurchaseCalculator portfolios={portfolios} />
            )}
        </section>
    );
};

export default MyPortfolioSection;