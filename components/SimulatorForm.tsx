import React, { useState, useEffect } from 'react';
import type { RiskProfile, InvestmentTheme, SimulationGoal } from '../types';

interface SimulatorFormProps {
    onSubmit: (
        goal: SimulationGoal,
        currentAge: number,
        investmentPeriod: number,
        riskProfile: RiskProfile,
        investmentTheme: InvestmentTheme,
        secondaryTheme: InvestmentTheme | null,
        inflationRate: number
    ) => void;
}

const formatNumberWithCommas = (value: string): string => {
    if (!value) return '';
    const num = value.replace(/,/g, '');
    if (isNaN(parseFloat(num))) return '';
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const secondaryThemeOptions: { value: InvestmentTheme; label: string }[] = [
    { value: 'max-growth', label: '성장 집중 (배당 최소화)' },
    { value: 'tech-focused', label: '미래 기술 집중 (성장형)' },
    { value: 'dividend-focused', label: '안정 고배당 집중 (배당형)' },
    { value: 'crypto-focused', label: '디지털자산 집중 (초고위험 성장형)' },
    { value: 'ai-recommended', label: 'AI 추천 종합' },
];

const SimulatorForm: React.FC<SimulatorFormProps> = ({ onSubmit }) => {
    const [goalType, setGoalType] = useState<'dividend' | 'asset' | 'investment'>('dividend');
    const [targetDividend, setTargetDividend] = useState('300');
    const [targetAsset, setTargetAsset] = useState('10'); // 10억
    const [monthlyInvestment, setMonthlyInvestment] = useState('100');
    const [currentAge, setCurrentAge] = useState('0');
    const [investmentPeriod, setInvestmentPeriod] = useState('0');
    const [inflationRate, setInflationRate] = useState('3');
    const [riskProfile, setRiskProfile] = useState<RiskProfile>('balanced');
    const [investmentTheme, setInvestmentTheme] = useState<InvestmentTheme>('ai-recommended');
    const [secondaryTheme, setSecondaryTheme] = useState<InvestmentTheme>('max-growth');
    
    const [isRiskProfileDisabled, setIsRiskProfileDisabled] = useState(false);
    const [isDividendGoalDisabled, setIsDividendGoalDisabled] = useState(false);
    const [isAssetGoalDisabled, setIsAssetGoalDisabled] = useState(false);

    useEffect(() => {
        setIsRiskProfileDisabled(investmentTheme !== 'ai-recommended');

        const dividendDisabled = ['max-growth', 'crypto-focused', '2x-growth', '2x-mixed'].includes(investmentTheme);
        const assetDisabled = investmentTheme === 'dividend-focused';
        
        setIsDividendGoalDisabled(dividendDisabled);
        setIsAssetGoalDisabled(assetDisabled);

        if (dividendDisabled && goalType === 'dividend') {
            setGoalType('asset');
        }
        if (assetDisabled && goalType === 'asset') {
            setGoalType('dividend');
        }
    }, [investmentTheme, goalType]);

    const handleNumericInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/,/g, '');
        if (/^\d*$/.test(value)) {
            setter(formatNumberWithCommas(value));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const cleanAndParse = (val: string) => parseFloat(val.replace(/,/g, '')) || 0;

        let goal: SimulationGoal;
        if (goalType === 'asset') {
            goal = { type: 'asset', value: cleanAndParse(targetAsset) * 10000 }; // 억원 -> 만원
        } else if (goalType === 'dividend') {
            goal = { type: 'dividend', value: cleanAndParse(targetDividend) }; // 만원
        } else { // investment
            goal = { type: 'investment', value: cleanAndParse(monthlyInvestment) }; // 만원
        }

        const currentAgeVal = parseInt(currentAge) || 0;
        const investmentPeriodVal = parseInt(investmentPeriod) || 0;
        const inflationRateVal = parseFloat(inflationRate) || 0;

        if (goal.value <= 0 || investmentPeriodVal <= 0) {
            alert("입력값을 확인해주세요. 목표 또는 투자 금액, 기간은 0보다 커야 합니다.");
            return;
        }
        
        onSubmit(goal, currentAgeVal, investmentPeriodVal, riskProfile, investmentTheme, investmentTheme === '2x-mixed' ? secondaryTheme : null, inflationRateVal);
    };

    return (
        <section className="bg-gray-800 p-6 rounded-2xl shadow-lg mb-12">
            <h2 className="text-2xl font-semibold text-green-400 mb-6 text-center">자녀를 위한 투자 계획 입력하기</h2>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="investment-theme" className="block text-sm font-medium text-gray-300 mb-2">투자 테마 선택</label>
                        <select id="investment-theme" value={investmentTheme} onChange={e => setInvestmentTheme(e.target.value as InvestmentTheme)} className="w-full bg-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                            <option value="ai-recommended">AI 추천 종합 포트폴리오</option>
                            <option value="max-growth">성장 집중 (배당 최소화)</option>
                            <option value="tech-focused">미래 기술 집중 (성장형)</option>
                            <option value="dividend-focused">안정 고배당 집중 (배당형)</option>
                            <option value="crypto-focused">디지털자산 집중 (초고위험 성장형)</option>
                            <option value="2x-growth">2X 레버리지 성장 (초고위험)</option>
                            <option value="2x-mixed">2X 레버리지 + 혼합 테마</option>
                        </select>
                    </div>
                     {investmentTheme === '2x-mixed' ? (
                         <div>
                            <label htmlFor="secondary-theme" className="block text-sm font-medium text-gray-300 mb-2">혼합할 테마 선택 (50%)</label>
                            <select id="secondary-theme" value={secondaryTheme} onChange={e => setSecondaryTheme(e.target.value as InvestmentTheme)} className="w-full bg-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                                {secondaryThemeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                    ) : (
                        <div style={{ opacity: isRiskProfileDisabled ? 0.5 : 1 }}>
                            <label htmlFor="risk-profile" className="block text-sm font-medium text-gray-300 mb-2">투자 성향 (AI 추천 종합 선택 시)</label>
                            <select id="risk-profile" value={riskProfile} onChange={e => setRiskProfile(e.target.value as RiskProfile)} className="w-full bg-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" disabled={isRiskProfileDisabled}>
                                <option value="conservative">안정 추구형 (배당금 중심)</option>
                                <option value="balanced">균형 성장형 (배당+성장)</option>
                                <option value="aggressive">적극 성장형 (성장 중심)</option>
                            </select>
                        </div>
                    )}
                    
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">시뮬레이션 기준 선택</label>
                        <div className="grid grid-cols-3 rounded-lg bg-gray-700 p-1">
                            <button 
                                type="button" 
                                onClick={() => setGoalType('dividend')} 
                                disabled={isDividendGoalDisabled}
                                className={`w-full py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${goalType === 'dividend' ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-600'} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                월 배당금 기준
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setGoalType('asset')} 
                                disabled={isAssetGoalDisabled}
                                className={`w-full py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${goalType === 'asset' ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-600'} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                총 자산 기준
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setGoalType('investment')} 
                                className={`w-full py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${goalType === 'investment' ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                            >
                                월 투자금 기준
                            </button>
                        </div>
                    </div>
                    
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className={`p-4 rounded-xl transition-all duration-300 ${goalType === 'dividend' ? 'bg-gray-900/50 ring-2 ring-green-500' : ''}`} style={{opacity: goalType === 'dividend' ? 1 : 0.5}}>
                            <label htmlFor="target-dividend" className="block text-sm font-medium text-gray-300 mb-2">목표 월 배당금 (만원)</label>
                            <div className="flex items-center bg-gray-700 rounded-lg">
                                <input type="text" inputMode="numeric" id="target-dividend" value={targetDividend} onChange={handleNumericInputChange(setTargetDividend)} disabled={goalType !== 'dividend'} className="w-full bg-transparent p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:cursor-not-allowed" placeholder="예: 300" />
                                <span className="text-gray-400 pr-4 flex-shrink-0">만원</span>
                            </div>
                        </div>

                        <div className={`p-4 rounded-xl transition-all duration-300 ${goalType === 'asset' ? 'bg-gray-900/50 ring-2 ring-green-500' : ''}`} style={{opacity: goalType === 'asset' ? 1 : 0.5}}>
                            <label htmlFor="target-asset" className="block text-sm font-medium text-gray-300 mb-2">목표 총자산 (억원)</label>
                            <div className="flex items-center bg-gray-700 rounded-lg">
                                <input type="text" inputMode="numeric" id="target-asset" value={targetAsset} onChange={handleNumericInputChange(setTargetAsset)} disabled={goalType !== 'asset'} className="w-full bg-transparent p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:cursor-not-allowed" placeholder="예: 10" />
                                <span className="text-gray-400 pr-4 flex-shrink-0">억원</span>
                            </div>
                        </div>
                        
                        <div className={`p-4 rounded-xl transition-all duration-300 ${goalType === 'investment' ? 'bg-gray-900/50 ring-2 ring-green-500' : ''}`} style={{opacity: goalType === 'investment' ? 1 : 0.5}}>
                            <label htmlFor="monthly-investment" className="block text-sm font-medium text-gray-300 mb-2">매월 투자 가능 금액 (만원)</label>
                            <div className="flex items-center bg-gray-700 rounded-lg">
                                <input type="text" inputMode="numeric" id="monthly-investment" value={monthlyInvestment} onChange={handleNumericInputChange(setMonthlyInvestment)} disabled={goalType !== 'investment'} className="w-full bg-transparent p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:cursor-not-allowed" placeholder="예: 100" />
                                <span className="text-gray-400 pr-4 flex-shrink-0">만원</span>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="current-age" className="block text-sm font-medium text-gray-300 mb-2">자녀의 현재 나이 (세)</label>
                            <div className="flex items-center bg-gray-700 rounded-lg">
                                <input type="number" id="current-age" value={currentAge} onChange={e => setCurrentAge(e.target.value)} className="w-full bg-transparent p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="예: 5" />
                                <span className="text-gray-400 pr-4 flex-shrink-0">세</span>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="investment-period" className="block text-sm font-medium text-gray-300 mb-2">총 투자 기간 (년)</label>
                            <div className="flex items-center bg-gray-700 rounded-lg">
                                <input type="number" id="investment-period" value={investmentPeriod} onChange={e => setInvestmentPeriod(e.target.value)} className="w-full bg-transparent p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="예: 20" />
                                <span className="text-gray-400 pr-4 flex-shrink-0">년</span>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="inflation-rate" className="block text-sm font-medium text-gray-300 mb-2">연평균 물가상승률</label>
                            <div className="flex items-center bg-gray-700 rounded-lg">
                                <input type="number" step="0.1" id="inflation-rate" value={inflationRate} onChange={e => setInflationRate(e.target.value)} className="w-full bg-transparent p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="예: 2.5" />
                                <span className="text-gray-400 pr-4 flex-shrink-0">%</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-8 text-center">
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-10 rounded-full transition-transform transform hover:scale-105 shadow-lg">
                        AI 포트폴리오로 결과 보기
                    </button>
                </div>
            </form>
        </section>
    );
};

export default SimulatorForm;