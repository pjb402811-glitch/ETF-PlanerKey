import type { PortfolioScenario, RiskProfile } from './types';

export const categoryColorMap: { [key: string]: string } = {
    '시장 대표': 'blue',
    '배당 성장': 'orange',
    '고배당': 'rose',
    '커버드콜': 'red',
    '성장주': 'purple',
    '섹터': 'teal',
    '테마': 'lime',
    '가상자산': 'yellow',
    '채권/금융': 'indigo',
    '리츠': 'teal',
    '에너지/인프라': 'amber',
    '기타 고배당': 'gray',
};

export const portfolioScenarios: Record<RiskProfile, PortfolioScenario> = {
    'conservative': { 
        id: 'conservative',
        name: '안정 추구형 포트폴리오',
        desc: '원금 보호와 꾸준한 배당금 흐름을 최우선으로 합니다. 시장 변동성에 대한 위험을 최소화합니다.',
        risk: '낮음',
        weights: { SCHD: 0.50, JEPI: 0.30, VIG: 0.10, VOO: 0.10 }
    },
    'balanced': {
        id: 'balanced',
        name: '균형 성장형 포트폴리오',
        desc: '안정적인 배당과 자산 성장의 균형을 추구합니다. 적절한 위험을 감수하며 장기적인 성과를 목표로 합니다.',
        risk: '중립',
        weights: { VOO: 0.35, SCHD: 0.30, QQQ: 0.20, JEPI: 0.15 }
    },
    'aggressive': {
        id: 'aggressive',
        name: '적극 성장형 포트폴리오',
        desc: '배당보다는 자산 성장에 집중합니다. 높은 시장 변동성을 활용하여 수익률을 극대화하는 것을 목표로 합니다.',
        risk: '높음',
        weights: { QQQ: 0.40, VOO: 0.30, SMH: 0.20, JEPQ: 0.10 }
    }
};