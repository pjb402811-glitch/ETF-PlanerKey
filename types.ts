export interface Etf {
    ticker: string;
    name: string;
    desc: string;
    pros: string;
    cons: string;
    yield: number;
    growth: number;
    color: string;
    risk: '낮음' | '중립' | '높음';
    category: string;
}

export type RiskProfile = 
    | 'conservative' 
    | 'balanced' 
    | 'aggressive';

export type InvestmentTheme =
    | 'ai-recommended'
    | 'dividend-focused'
    | 'tech-focused'
    | 'crypto-focused'
    | 'max-growth'
    | '2x-growth';

export type SimulationGoal = 
    | { type: 'dividend'; value: number } // value in 10,000 KRW
    | { type: 'asset'; value: number }    // value in 10,000 KRW
    | { type: 'investment'; value: number }; // value in 10,000 KRW
    
export interface PortfolioScenario {
    id: RiskProfile | string;
    name: string;
    desc: string;
    risk: '낮음' | '중립' | '높음';
    weights: { [ticker: string]: number };
}

export interface SimulationResult {
    scenario: PortfolioScenario;
    targetAssets: number;
    monthlyInvestment: number;
    postTaxYield: number;
    assetGrowth: number[];
    dividendGrowth: number[];
    periodYears: number;
    inflationAdjustedTargetAssets: number;
    inflationAdjustedMonthlyDividend: number;
}

export interface MonthlyEntry {
    month: number;
    // Key is the ETF ticker, value is the investment amount in KRW
    investments: { [ticker: string]: number };
}

export interface SimulationProjection {
    periodYears: number;
    targetAssets: number;
    finalMonthlyDividend: number;
    startAge?: number;
}

export interface PortfolioMonitorData {
    id: string;
    portfolio: PortfolioScenario;
    childName: string;
    targetMonthlyInvestment: number;
    currentTotalValue: number; // in KRW
    monthlyDividendReceived: number; // in KRW
    yearlyAdjustments: {
        [year: number]: {
            [ticker: string]: number; // in KRW
        };
    };
    currentTrackingYear: number;
    trackingHistory: {
        [year: number]: MonthlyEntry[];
    };
    simulationProjection?: SimulationProjection;
}