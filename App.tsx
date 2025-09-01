import React, { useState, useEffect, useCallback } from 'react';
import type { Etf, PortfolioScenario, SimulationResult, RiskProfile, InvestmentTheme, SimulationGoal, PortfolioMonitorData } from './types';
import { getEtfData } from './services/etfService';
import { generateAiPortfolio } from './services/geminiService';
import { portfolioScenarios as defaultScenarios } from './constants';
import Header from './components/Header';
import EtfInfoSection from './components/EtfInfoSection';
import SimulatorForm from './components/SimulatorForm';
import ResultsSection from './components/ResultsSection';
import MyPortfolioSection from './components/MyPortfolioSection';
import LoadingOverlay from './components/LoadingOverlay';
import AlertModal from './components/AlertModal';
import Navigation from './components/Navigation';
import ApiKeyModal from './components/ApiKeyModal';
import ConfirmModal from './components/ConfirmModal';

const curateEtfPoolForAI = (allEtfs: Etf[], riskProfile: RiskProfile, investmentTheme: InvestmentTheme): Etf[] => {
    const selectEtfsByRisk = (etfs: Etf[]): Etf[] => {
        const lowRisk = etfs.filter(e => e.risk === '낮음');
        const mediumRisk = etfs.filter(e => e.risk === '중립');
        const highRisk = etfs.filter(e => e.risk === '높음');
        
        const shuffle = (arr: Etf[]) => [...arr].sort(() => 0.5 - Math.random());
        const MAX_ETFS_FOR_AI = 25;
        let selection: Etf[] = [];

        switch (riskProfile) {
            case 'conservative':
                selection = [...shuffle(lowRisk).slice(0, 15), ...shuffle(mediumRisk).slice(0, 7), ...shuffle(highRisk).slice(0, 3)];
                break;
            case 'balanced':
                selection = [...shuffle(lowRisk).slice(0, 8), ...shuffle(mediumRisk).slice(0, 10), ...shuffle(highRisk).slice(0, 7)];
                break;
            case 'aggressive':
                selection = [...shuffle(lowRisk).slice(0, 3), ...shuffle(mediumRisk).slice(0, 7), ...shuffle(highRisk).slice(0, 15)];
                break;
        }
        return shuffle(selection).slice(0, MAX_ETFS_FOR_AI);
    };

    if (investmentTheme === 'ai-recommended') {
        return selectEtfsByRisk(allEtfs);
    }
    
    let themeFilteredEtfs: Etf[] = [];
    const growthCategories = ['성장주', '테마'];
    const highGrowthSectors = ['XLK', 'VGT', 'SMH', 'BOTZ', 'FDIS'];
    const dividendCategories = ['배당 성장', '고배당', '커버드콜', '리츠'];

    switch (investmentTheme) {
        case 'max-growth':
            themeFilteredEtfs = allEtfs.filter(etf => 
                (growthCategories.includes(etf.category) || highGrowthSectors.includes(etf.ticker) || etf.category === '가상자산') &&
                etf.growth >= 0.10 &&
                etf.yield < 0.03
            );
            break;
        case 'tech-focused':
            themeFilteredEtfs = allEtfs.filter(etf => 
                ['VGT', 'XLK', 'QQQ', 'SMH', 'BOTZ', 'ARKK'].includes(etf.ticker)
            );
            break;
        case 'dividend-focused':
            themeFilteredEtfs = allEtfs.filter(etf => dividendCategories.includes(etf.category));
            break;
        case 'crypto-focused':
            themeFilteredEtfs = allEtfs.filter(etf => etf.category === '가상자산');
            break;
        default:
            return selectEtfsByRisk(allEtfs);
    }
    
    return themeFilteredEtfs.length > 0 ? themeFilteredEtfs : selectEtfsByRisk(allEtfs);
};

const getNewTrackingHistory = (portfolio: PortfolioScenario) => {
    const currentYear = new Date().getFullYear();
    const initialInvestments: { [ticker: string]: number } = {};
    if (portfolio && portfolio.weights) {
        Object.keys(portfolio.weights).forEach(ticker => {
            initialInvestments[ticker] = 0;
        });
    }

    return {
        currentTrackingYear: currentYear,
        trackingHistory: {
            [currentYear]: Array(12).fill(null).map((_, i) => ({
                month: i + 1,
                investments: { ...initialInvestments }
            }))
        }
    };
};

const migratePortfolioData = (p: any): PortfolioMonitorData => {
    if (!p || typeof p !== 'object') {
        throw new Error('유효하지 않은 포트폴리오 데이터 형식입니다.');
    }
    if (!p.id || !p.portfolio || !p.portfolio.weights) {
        throw new Error('필수 데이터(id, portfolio, weights)가 누락되었습니다.');
    }

    const migrated: PortfolioMonitorData = {
        id: p.id,
        portfolio: p.portfolio,
        childName: p.childName || '자녀 이름',
        targetMonthlyInvestment: p.targetMonthlyInvestment || 0,
        currentTotalValue: p.currentTotalValue || 0,
        monthlyDividendReceived: p.monthlyDividendReceived || 0,
        currentTrackingYear: p.currentTrackingYear || new Date().getFullYear(),
        trackingHistory: p.trackingHistory || getNewTrackingHistory(p.portfolio).trackingHistory,
        yearlyAdjustments: p.yearlyAdjustments || {},
    };

    if (migrated.trackingHistory) {
        const tickers = Object.keys(migrated.portfolio.weights);
        for (const year in migrated.trackingHistory) {
            if (!migrated.yearlyAdjustments[year] || typeof migrated.yearlyAdjustments[year] !== 'object' || Array.isArray(migrated.yearlyAdjustments[year])) {
                const initialAdjustments: { [ticker: string]: number } = {};
                tickers.forEach(ticker => {
                    initialAdjustments[ticker] = 0;
                });
                migrated.yearlyAdjustments[year] = initialAdjustments;
            } else {
                tickers.forEach(ticker => {
                    if (migrated.yearlyAdjustments[year][ticker] === undefined) {
                        migrated.yearlyAdjustments[year][ticker] = 0;
                    }
                });
            }
        }
    }
    
    delete (migrated as any).principalAdjustment;

    return migrated;
};


const App: React.FC = () => {
    const [etfData, setEtfData] = useState<Record<string, Etf>>({});
    const [etfCategories, setEtfCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState('ETF 데이터 가져오는 중...');
    
    const [alertInfo, setAlertInfo] = useState<{ title: string; message: string } | null>(null);
    const [confirmInfo, setConfirmInfo] = useState<{ title: string; message: string; onConfirm: () => void; } | null>(null);
    const [simulationResults, setSimulationResults] = useState<SimulationResult[] | null>(null);
    const [simulationInputs, setSimulationInputs] = useState<{currentAge: number, investmentPeriod: number} | null>(null);

    const [trackedPortfolios, setTrackedPortfolios] = useState<PortfolioMonitorData[]>([]);
    const [activeTab, setActiveTab] = useState<'simulator' | 'tracker'>('simulator');
    
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

    const showAlert = useCallback((title: string, message: string) => {
        setAlertInfo({ title, message });
    }, []);

    useEffect(() => {
        try {
            const savedKey = localStorage.getItem('googleApiKey');
            if (savedKey) {
                setApiKey(savedKey);
            } else {
                setIsApiKeyModalOpen(true);
            }

            const savedData = localStorage.getItem('trackedPortfolios');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                const portfoliosToLoad: PortfolioMonitorData[] = [];
                const dataToProcess = Array.isArray(parsedData) ? parsedData : (parsedData?.portfolio ? [parsedData] : []);


                if (Array.isArray(dataToProcess)) {
                    dataToProcess.forEach(p => {
                        try {
                            portfoliosToLoad.push(migratePortfolioData(p));
                        } catch (e) {
                            console.warn("Skipping invalid portfolio from localStorage:", p, e);
                        }
                    });
                }
                
                setTrackedPortfolios(portfoliosToLoad);
                
                if (portfoliosToLoad.length > 0) {
                     setActiveTab('tracker');
                }
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
            showAlert("데이터 로드 오류", "저장된 데이터를 불러오는 데 실패했습니다.");
        }
    }, [showAlert]);

    // Save portfolios to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('trackedPortfolios', JSON.stringify(trackedPortfolios));
        } catch (error) {
            console.error("Failed to save portfolios to localStorage", error);
        }
    }, [trackedPortfolios]);

    const fetchInitialData = useCallback(async () => {
        setIsLoading(true);
        setLoadingMessage('최신 ETF 데이터를 가져오고 분석 중...');
        try {
            let data: Record<string, Etf>;
            const savedEtfs = localStorage.getItem('userEtfData');
            if (savedEtfs) {
                data = JSON.parse(savedEtfs);
            } else {
                const defaultData = await getEtfData();
                data = defaultData.data;
            }
            const categories = [...new Set(Object.values(data).map(etf => etf.category))].sort();
            setEtfData(data);
            setEtfCategories(categories);
        } catch (error) {
            console.error("Error fetching or processing ETF data:", error);
            showAlert("데이터 로드 오류", `ETF 데이터를 가져오는 데 실패했습니다. 앱을 새로고침 해주세요.`);
        } finally {
            setIsLoading(false);
        }
    }, [showAlert]);

    useEffect(() => {
        fetchInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    const handleSaveApiKey = (newKey: string) => {
        try {
            localStorage.setItem('googleApiKey', newKey);
            setApiKey(newKey);
            setIsApiKeyModalOpen(false);
            showAlert("API Key 저장 완료", "API Key가 브라우저에 안전하게 저장되었습니다.");
        } catch (error) {
            console.error("Failed to save API key to localStorage", error);
            showAlert("저장 오류", "API Key를 저장하는 데 실패했습니다. 브라우저 설정을 확인해주세요.");
        }
    };
    
    const handleSelectPortfolio = (portfolio: PortfolioScenario, monthlyInvestment: number) => {
        const initialAdjustments: { [ticker: string]: number } = {};
        Object.keys(portfolio.weights).forEach(ticker => {
            initialAdjustments[ticker] = 0;
        });

        const newTrackedPortfolio: PortfolioMonitorData = {
            id: `portfolio_${Date.now()}`,
            portfolio,
            childName: '자녀 이름', // Default name
            targetMonthlyInvestment: monthlyInvestment,
            currentTotalValue: 0,
            monthlyDividendReceived: 0,
            yearlyAdjustments: { [new Date().getFullYear()]: initialAdjustments },
            ...getNewTrackingHistory(portfolio)
        };
        setTrackedPortfolios(prev => [...prev, newTrackedPortfolio]);
        setActiveTab('tracker');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleUpdatePortfolio = (updatedData: PortfolioMonitorData) => {
        setTrackedPortfolios(prev => prev.map(p => (p.id === updatedData.id ? updatedData : p)));
    };

    const handleResetAllPortfolios = () => {
        setConfirmInfo({
            title: "데이터 초기화 확인",
            message: "정말로 모든 포트폴리오 데이터를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.",
            onConfirm: () => {
                setTrackedPortfolios([]);
                setActiveTab('simulator');
                setConfirmInfo(null);
                showAlert("초기화 완료", "모든 포트폴리오 데이터가 삭제되었습니다.");
            }
        });
    };

    const handleSaveEtf = (etfToSave: Etf) => {
        const newEtfData = { ...etfData, [etfToSave.ticker]: etfToSave };
        setEtfData(newEtfData);
        setEtfCategories([...new Set(Object.values(newEtfData).map(etf => etf.category))].sort());
        localStorage.setItem('userEtfData', JSON.stringify(newEtfData));
        showAlert("저장 완료", `${etfToSave.ticker} ETF 정보가 저장되었습니다.`);
    };

    const handleDeleteEtf = (tickerToDelete: string) => {
        setConfirmInfo({
            title: "ETF 삭제 확인",
            message: `정말로 '${tickerToDelete}' ETF를 목록에서 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
            onConfirm: () => {
                const { [tickerToDelete]: deleted, ...rest } = etfData;
                setEtfData(rest);
                setEtfCategories([...new Set(Object.values(rest).map(etf => etf.category))].sort());
                localStorage.setItem('userEtfData', JSON.stringify(rest));
                setConfirmInfo(null);
                showAlert("삭제 완료", `${tickerToDelete} ETF가 삭제되었습니다.`);
            }
        });
    };

    const handleResetEtfs = () => {
        setConfirmInfo({
            title: "ETF 목록 초기화",
            message: "정말로 ETF 목록을 기본값으로 초기화하시겠습니까?\n모든 직접 추가/수정한 내용이 사라집니다.",
            onConfirm: async () => {
                setConfirmInfo(null);
                setIsLoading(true);
                setLoadingMessage('기본 ETF 데이터로 초기화하는 중...');
                try {
                    localStorage.removeItem('userEtfData');
                    const { data, categories } = await getEtfData();
                    setEtfData(data);
                    setEtfCategories(categories);
                    showAlert("초기화 완료", "ETF 목록이 기본값으로 복원되었습니다.");
                } catch (e) {
                    showAlert("오류", "초기화에 실패했습니다.");
                } finally {
                    setIsLoading(false);
                }
            }
        });
    };

    const calculatePortfolio = (
        goal: SimulationGoal,
        period: number,
        scenario: PortfolioScenario,
        inflationRate: number
    ): SimulationResult => {
        let portfolioAvgYield = 0;
        let portfolioTotalReturn = 0;
        Object.entries(scenario.weights).forEach(([ticker, weight]) => {
            const etf = etfData[ticker];
            if (etf) {
                portfolioAvgYield += etf.yield * weight;
                portfolioTotalReturn += (etf.growth + etf.yield) * weight;
            }
        });

        const postTaxYield = portfolioAvgYield * (1 - 0.154);
        const inflation = inflationRate / 100;
        
        const n = period * 12;
        const r = portfolioTotalReturn / 12;

        let monthlyInvestment = 0;
        
        const FVA_factor = r > 0 ? (Math.pow(1 + r, n) - 1) / r : n;

        if (goal.type === 'investment') {
            monthlyInvestment = goal.value;
        } else {
            // Adjust the goal for inflation to find the future nominal value needed
            const futureGoalValue = goal.value * Math.pow(1 + inflation, period);

            let targetGoalAssets: number;
            if (goal.type === 'dividend') {
                const annualTargetDividend = futureGoalValue * 12;
                targetGoalAssets = postTaxYield > 0 ? annualTargetDividend / postTaxYield : Infinity;
            } else { // goal.type === 'asset'
                targetGoalAssets = futureGoalValue;
            }
            monthlyInvestment = FVA_factor > 0 ? targetGoalAssets / FVA_factor : 0;
            monthlyInvestment = Math.max(0, monthlyInvestment);
        }

        const assetGrowth: number[] = [];
        const dividendGrowth: number[] = [];
        let currentAssets = 0; 
        for (let i = 0; i <= n; i++) {
            if (i > 0) {
                currentAssets = currentAssets * (1 + r) + monthlyInvestment;
            }
            assetGrowth.push(currentAssets);
            dividendGrowth.push(currentAssets * postTaxYield / 12);
        }
        
        const finalNominalAssets = assetGrowth[assetGrowth.length - 1];
        const finalNominalMonthlyDividend = dividendGrowth[dividendGrowth.length - 1];
        
        const inflationAdjustedTargetAssets = finalNominalAssets / Math.pow(1 + inflation, period);
        const inflationAdjustedMonthlyDividend = finalNominalMonthlyDividend / Math.pow(1 + inflation, period);

        return { 
            scenario, 
            targetAssets: finalNominalAssets,
            monthlyInvestment, 
            postTaxYield, 
            assetGrowth, 
            dividendGrowth, 
            periodYears: period,
            inflationAdjustedTargetAssets,
            inflationAdjustedMonthlyDividend,
        };
    };

    const handleSimulation = async (
        goal: SimulationGoal,
        currentAge: number,
        investmentPeriod: number,
        riskProfile: RiskProfile,
        investmentTheme: InvestmentTheme,
        inflationRate: number
    ) => {
        if (!apiKey) {
            showAlert("API Key 필요", "AI 포트폴리오를 생성하려면 Google AI API Key가 필요합니다. 우측 상단 설정 아이콘을 눌러 Key를 입력해주세요.");
            setIsApiKeyModalOpen(true);
            return;
        }
        
        if (Object.keys(etfData).length === 0) {
            showAlert("데이터 오류", "ETF 데이터가 로드되지 않았습니다. 잠시 후 다시 시도해주세요.");
            return;
        }

        setIsLoading(true);
        setLoadingMessage('AI가 고객님의 투자 성향과 테마에 맞는 포트폴리오를 구성 중입니다...');

        try {
            const effectiveRiskProfile = investmentTheme !== 'ai-recommended' ? 'aggressive' : riskProfile;
            const etfsForAi = curateEtfPoolForAI(Object.values(etfData), effectiveRiskProfile, investmentTheme);
            if (etfsForAi.length < 4) {
                 showAlert("포트폴리오 구성 불가", "선택하신 테마에 맞는 ETF가 4개 미만이라 AI 포트폴리오를 구성할 수 없습니다. 다른 테마를 선택해주세요.");
                 setIsLoading(false);
                 return;
            }

            const aiPortfolio = await generateAiPortfolio(apiKey, riskProfile, investmentTheme, etfsForAi);
            
            let scenariosToSimulate: PortfolioScenario[] = [];
            if (aiPortfolio) {
                scenariosToSimulate.push(aiPortfolio);
            } else {
                showAlert("AI 포트폴리오 생성 오류", "AI 포트폴리오 생성에 실패했습니다. 기본 시나리오를 바탕으로 결과를 표시합니다.");
            }

            Object.values(defaultScenarios).forEach(scenario => {
                if (!scenariosToSimulate.some(s => s.id === scenario.id)) {
                    scenariosToSimulate.push(scenario);
                }
            });

            const goalInWon: SimulationGoal = {
                type: goal.type,
                value: goal.value * 10000 // Convert 만원/억원 to 원
            };

            const results = scenariosToSimulate.map(scenario => calculatePortfolio(
                goalInWon,
                investmentPeriod,
                scenario,
                inflationRate
            ));
            
            const sortedResults = results.sort((a, b) => {
                if (aiPortfolio && a.scenario.id === aiPortfolio.id) return -1;
                if (aiPortfolio && b.scenario.id === aiPortfolio.id) return 1;
                if (a.scenario.id === riskProfile) return -1;
                if (b.scenario.id === riskProfile) return 1;
                return b.targetAssets - a.targetAssets;
            });

            setSimulationResults(sortedResults);
            setSimulationInputs({ currentAge, investmentPeriod });

        } catch (error) {
            console.error("Simulation failed:", error);
            showAlert("시뮬레이션 오류", `오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setSimulationResults(null);
            setSimulationInputs(null);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleResetSimulation = () => {
        setSimulationResults(null);
        setSimulationInputs(null);
    };

    return (
        <>
            <LoadingOverlay isVisible={isLoading} message={loadingMessage} />
            <AlertModal
                isVisible={!!alertInfo}
                title={alertInfo?.title ?? ''}
                message={alertInfo?.message ?? ''}
                onClose={() => setAlertInfo(null)}
            />
            <ConfirmModal
                isVisible={!!confirmInfo}
                title={confirmInfo?.title ?? ''}
                message={confirmInfo?.message ?? ''}
                onConfirm={() => confirmInfo?.onConfirm()}
                onClose={() => setConfirmInfo(null)}
                confirmText="삭제"
            />
            <ApiKeyModal
                isOpen={isApiKeyModalOpen}
                onClose={() => setIsApiKeyModalOpen(false)}
                onSave={handleSaveApiKey}
            />
            <div className="container mx-auto p-4 md:p-8 max-w-5xl">
                <Header onSettingsClick={() => setIsApiKeyModalOpen(true)} />
                <Navigation 
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    isTrackerActive={trackedPortfolios.length > 0}
                />

                {activeTab === 'simulator' && (
                    <>
                        <EtfInfoSection 
                            etfData={etfData} 
                            categories={etfCategories}
                            apiKey={apiKey}
                            onSaveEtf={handleSaveEtf}
                            onDeleteEtf={handleDeleteEtf}
                            onResetEtfs={handleResetEtfs}
                        />
                        <SimulatorForm onSubmit={handleSimulation} />
                        {simulationResults && simulationInputs && <ResultsSection results={simulationResults} inputs={simulationInputs} onSelectPortfolio={handleSelectPortfolio} onReset={handleResetSimulation} />}
                    </>
                )}
                
                {activeTab === 'tracker' && (
                     <MyPortfolioSection 
                        portfolios={trackedPortfolios}
                        etfData={etfData}
                        onUpdate={handleUpdatePortfolio}
                        onResetAll={handleResetAllPortfolios}
                    />
                )}

                <footer className="mt-12 pt-8 border-t border-gray-700 text-gray-500 text-sm">
                    <h3 className="font-semibold text-gray-400 mb-2">⚠️ 시뮬레이션 유의사항</h3>
                    <ul className="list-disc list-inside space-y-1">
                        <li>본 시뮬레이션은 과거 데이터를 기반으로 한 AI의 예상치이며, 미래 수익률을 보장하지 않습니다.</li>
                        <li>세금(배당소득세 15.4%)이 일부 반영되었으나, 개인별 금융소득종합과세 등은 고려되지 않았습니다.</li>
                        <li>시장 상황에 따라 수익률과 배당금은 언제든지 변동될 수 있으며, 투자의 최종 결정과 책임은 투자자 본인에게 있습니다.</li>
                        <li>연평균 물가상승률을 적용하여 목표 금액의 미래 가치를 추산하고, 최종 결과의 현재 가치를 함께 표시합니다.</li>
                        <li>AI가 추천하는 ETF 및 포트폴리오는 정보 제공을 목적으로 하며, 투자 권유가 아닙니다.</li>
                    </ul>
                    <h3 className="font-semibold text-gray-400 mt-6 mb-2">면책조항 (Disclaimer)</h3>
                    <p>
                        본 애플리케이션에서 제공되는 모든 정보와 시뮬레이션 결과는 정보 제공을 목적으로 하며, 어떠한 경우에도 금융, 투자, 법률, 세무 또는 기타 전문적인 조언으로 해석되어서는 안 됩니다. 제공되는 정보의 정확성이나 완전성을 보장하지 않으며, 정보의 오류나 누락에 대해 어떠한 책임도 지지 않습니다. 모든 투자 결정은 사용자 본인의 판단과 책임 하에 이루어져야 하며, 본 애플리케이션의 사용으로 인해 발생할 수 있는 어떠한 직간접적인 손실에 대해서도 개발자는 책임을 지지 않습니다. 투자를 시작하기 전에는 반드시 자격을 갖춘 금융 전문가와 상담하시기 바랍니다.
                    </p>
                </footer>
            </div>
        </>
    );
};

export default App;