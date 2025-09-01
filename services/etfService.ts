import type { Etf } from '../types';
import { categoryColorMap } from '../constants';

const allEtfData: Record<string, Omit<Etf, 'ticker' | 'color'>> = {
    // Dividend Growth
    "VIG": { name: "Vanguard Dividend Appreciation ETF", desc: "10년 이상 배당을 꾸준히 늘려온 미국 대형주에 투자합니다.", pros: "우량주 중심의 안정적인 배당 성장", cons: "현재 배당률은 상대적으로 낮음", yield: 0.018, growth: 0.08, risk: '낮음', category: '배당 성장' },
    "SCHD": { name: "Schwab US Dividend Equity ETF", desc: "재무적으로 탄탄하고 10년 이상 배당을 늘려온 100개 우량 배당 성장주에 투자합니다.", pros: "높은 배당 성장률, 우량 가치주 중심, 낮은 보수", cons: "기술주 중심 상승장에서 소외될 수 있음", yield: 0.035, growth: 0.07, risk: '낮음', category: '배당 성장' },
    
    // High Dividend
    "HDV": { name: "iShares Core High Dividend ETF", desc: "재무 건전성이 높고 지속 가능한 배당을 지급하는 미국 우량주에 투자합니다.", pros: "높은 현재 배당률, 안정적인 기업 위주", cons: "성장 잠재력은 다소 낮을 수 있음", yield: 0.042, growth: 0.04, risk: '낮음', category: '고배당' },
    "SDY": { name: "SPDR S&P Dividend ETF", desc: "S&P 1500 지수 내에서 20년 이상 연속으로 배당을 늘려온 기업들에 투자합니다.", pros: "검증된 배당 귀족주 투자, 안정성", cons: "성장성은 다른 유형에 비해 낮음", yield: 0.028, growth: 0.05, risk: '낮음', category: '고배당' },

    // Sector
    "FUTY": { name: "Fidelity MSCI Utilities Index ETF", desc: "미국 유틸리티 섹터 기업에 투자합니다.", pros: "전통적인 경기 방어주, 안정적인 배당", cons: "금리 인상 시기에 취약할 수 있음", yield: 0.033, growth: 0.04, risk: '낮음', category: '섹터' },
    "VNQ": { name: "Vanguard Real Estate ETF", desc: "미국의 상업용 부동산에 투자하는 리츠(REITs)에 분산 투자합니다.", pros: "부동산 시장에 간편하게 투자, 높은 배당", cons: "금리 변동에 민감, 부동산 시장 침체 시 위험", yield: 0.045, growth: 0.03, risk: '중립', category: '섹터' },
    "VHT": { name: "Vanguard Health Care ETF", desc: "미국 헬스케어 섹터 전반에 투자합니다.", pros: "인구 고령화에 따른 장기 성장성", cons: "정부 정책 및 규제 변화에 민감", yield: 0.013, growth: 0.09, risk: '중립', category: '섹터' },
    "XLK": { name: "Technology Select Sector SPDR Fund", desc: "S&P 500 내 기술 섹터 대형주에 집중 투자합니다.", pros: "기술 혁신을 주도하는 기업 투자, 높은 성장 잠재력", cons: "높은 변동성, 낮은 배당", yield: 0.008, growth: 0.12, risk: '높음', category: '섹터' },
    "IYK": { name: "iShares U.S. Consumer Staples ETF", desc: "미국 필수소비재 기업에 투자합니다.", pros: "경기 변동에 둔감한 안정적 수요 기반", cons: "폭발적인 성장 기대는 어려움", yield: 0.025, growth: 0.06, risk: '낮음', category: '섹터' },
    "XLF": { name: "Financial Select Sector SPDR Fund", desc: "S&P 500 내 금융 섹터 기업에 투자합니다.", pros: "경기 확장 국면에서 높은 수익 기대", cons: "경기 침체 및 금융 위기 시 높은 위험", yield: 0.016, growth: 0.07, risk: '중립', category: '섹터' },
    "FDIS": { name: "Fidelity MSCI Consumer Discretionary Index ETF", desc: "미국 경기소비재(자동차, 의류, 레저 등) 기업에 투자합니다.", pros: "경기 호황 시 높은 성장성 기대", cons: "경기 침체에 민감하게 반응", yield: 0.007, growth: 0.11, risk: '높음', category: '섹터' },

    // Growth
    "VUG": { name: "Vanguard Growth ETF", desc: "미국의 대형 성장주에 분산 투자합니다.", pros: "장기적인 자산 성장 잠재력", cons: "시장 조정 시 하락폭이 클 수 있음, 낮은 배당", yield: 0.006, growth: 0.12, risk: '중립', category: '성장주' },
    "QQQ": { name: "Invesco QQQ Trust", desc: "나스닥 100 지수를 추종하며, 기술주 중심의 미국 대형 성장주 100개에 투자합니다.", pros: "혁신 기술 기업 투자, 높은 성장성", cons: "기술주 편중, 높은 변동성", yield: 0.006, growth: 0.13, risk: '높음', category: '성장주' },
    "ARKK": { name: "ARK Innovation ETF", desc: "파괴적 혁신 기술을 가진 기업에 집중 투자하는 액티브 ETF입니다.", pros: "초고수익 잠재력", cons: "극심한 변동성, 높은 운용보수", yield: 0.0, growth: 0.15, risk: '높음', category: '성장주' },
    "IWF": { name: "iShares Russell 1000 Growth ETF", desc: "러셀 1000 지수 내 성장주에 투자합니다.", pros: "다양한 성장주에 분산투자", cons: "VUG, QQQ 대비 성과가 다를 수 있음", yield: 0.007, growth: 0.11, risk: '중립', category: '성장주' },
    "FBGRX": { name: "Fidelity Blue Chip Growth Fund", desc: "성장 잠재력이 높은 우량 대형주(블루칩)에 투자하는 뮤추얼 펀드입니다.", pros: "유명 대기업 중심의 성장 투자", cons: "ETF가 아닌 펀드로 거래 방식이 다름", yield: 0.001, growth: 0.12, risk: '중립', category: '성장주' },
    "VGT": { name: "Vanguard Information Technology ETF", desc: "미국 정보 기술 섹터 기업 전반에 투자합니다.", pros: "기술주 전반에 대한 폭넓은 투자", cons: "높은 변동성, XLK와 유사", yield: 0.007, growth: 0.13, risk: '높음', category: '성장주' },
    
    // Thematic
    "ICLN": { name: "iShares Global Clean Energy ETF", desc: "전 세계 클린 에너지 관련 기업에 투자합니다.", pros: "미래 성장 동력, 친환경 트렌드", cons: "정부 정책 의존도 높음, 높은 변동성", yield: 0.01, growth: 0.09, risk: '높음', category: '테마' },
    "BOTZ": { name: "Global X Robotics & Artificial Intelligence ETF", desc: "로봇 및 인공지능(AI) 관련 기업에 투자합니다.", pros: "4차 산업혁명 핵심 기술 투자", cons: "고평가 논란, 높은 변동성", yield: 0.002, growth: 0.14, risk: '높음', category: '테마' },
    "SMH": { name: "VanEck Semiconductor ETF", desc: "반도체 설계, 제조, 장비 관련 기업에 투자합니다.", pros: "AI, IT 산업의 핵심인 반도체 시장 성장 수혜", cons: "산업 사이클에 따른 극심한 변동성", yield: 0.005, growth: 0.16, risk: '높음', category: '테마' },

    // Crypto Assets
    "IBIT": { name: "iShares Bitcoin Trust", desc: "비트코인 현물을 직접 보유하여 그 가치를 추종하는 현물 ETF입니다.", pros: "비트코인에 직접 투자하는 효과, 낮은 보수", cons: "가상자산의 극심한 가격 변동성", yield: 0.0, growth: 0.20, risk: '높음', category: '가상자산' },
    "FBTC": { name: "Fidelity Wise Origin Bitcoin Fund", desc: "비트코인 현물에 직접 투자하여 비트코인 가격을 추종합니다.", pros: "신뢰도 높은 운용사의 비트코인 투자 상품", cons: "IBIT와 유사하게 매우 높은 변동성", yield: 0.0, growth: 0.20, risk: '높음', category: '가상자산' },
    "BITO": { name: "ProShares Bitcoin Strategy ETF", desc: "비트코인 선물 계약에 투자하여 비트코인 가격 변동을 추종합니다.", pros: "현물 보유 없이 비트코인에 투자", cons: "선물 롤오버 비용 발생, 현물과 괴리율", yield: 0.0, growth: 0.18, risk: '높음', category: '가상자산' },
    "DAM": { name: "VanEck Digital Assets Mining ETF", desc: "디지털 자산 채굴 기업에 투자합니다.", pros: "가상자산 시장 성장의 수혜를 받는 기업에 투자", cons: "채굴 기업의 높은 운영 비용 및 규제 리스크", yield: 0.005, growth: 0.22, risk: '높음', category: '가상자산' },
    "BITS": { name: "Global X Blockchain & Bitcoin Strategy ETF", desc: "블록체인 기술 기업과 비트코인 선물에 함께 투자합니다.", pros: "블록체인 기술과 비트코인에 동시 투자", cons: "복잡한 구조, 높은 변동성", yield: 0.01, growth: 0.19, risk: '높음', category: '가상자산' },
    "CONY": { name: "YieldMax COIN Option Income Strategy ETF", desc: "코인베이스(COIN) 주식에 대한 커버드콜 전략으로 높은 월배당을 추구합니다.", pros: "매우 높은 월배당 가능성", cons: "주가 상승 제한, 자산 가격 하락 위험", yield: 0.73, growth: -0.1, risk: '높음', category: '가상자산' },
    "YBTC": { name: "Roundhill Bitcoin Covered Call Strategy ETF", desc: "비트코인 현물 ETF를 기초자산으로 커버드콜 전략을 사용합니다.", pros: "비트코인으로 월배당 창출", cons: "비트코인 상승 잠재력 제한, 높은 변동성", yield: 0.56, growth: -0.05, risk: '높음', category: '가상자산' },

    // Covered Call
    "JEPI": { name: "JPMorgan Equity Premium Income ETF", desc: "S&P 500 주식 기반의 커버드콜 전략을 통해 매월 높은 인컴(분배금)을 창출합니다.", pros: "매우 높은 월배당, 시장 하락 시 일부 방어", cons: "주가 상승 잠재력 제한적, 배당에 자산 매각 포함 가능", yield: 0.08, growth: 0.02, risk: '중립', category: '커버드콜' },
    "QYLD": { name: "Global X Nasdaq 100 Covered Call ETF", desc: "나스닥 100 지수를 기초로 커버드콜 전략을 사용하여 월배당을 지급합니다.", pros: "매우 높은 월배당", cons: "기초자산(나스닥 100)의 성장을 따라가지 못함", yield: 0.12, growth: -0.02, risk: '높음', category: '커버드콜' },
    "XYLD": { name: "Global X S&P 500 Covered Call ETF", desc: "S&P 500 지수를 기초로 커버드콜 전략을 사용하여 월배당을 지급합니다.", pros: "높은 월배당", cons: "기초자산(S&P 500)의 성장을 따라가지 못함", yield: 0.11, growth: 0.0, risk: '중립', category: '커버드콜' },
    "JEPQ": { name: "JPMorgan Nasdaq Equity Premium Income ETF", desc: "나스닥 100 기반의 커버드콜 전략으로, JEPI의 나스닥 버전입니다.", pros: "JEPI보다 높은 월배당, 기술주 기반 인컴 창출", cons: "QQQ보다 낮은 주가 상승률, 커버드콜의 본질적 한계", yield: 0.095, growth: 0.03, risk: '높음', category: '커버드콜' },
    "RYLD": { name: "Global X Russell 2000 Covered Call ETF", desc: "러셀 2000(중소형주) 지수를 기초로 커버드콜 전략을 사용합니다.", pros: "중소형주 기반의 높은 월배당", cons: "변동성이 크고 주가 하락 위험이 높음", yield: 0.12, growth: -0.03, risk: '높음', category: '커버드콜' },
    "NUSI": { name: "Nationwide Nasdaq-100 Risk-Managed Income ETF", desc: "나스닥 100에 투자하며, 풋옵션 매입(하방 방어)과 콜옵션 매도(수익 창출)를 결합한 칼라(Collar) 전략을 사용합니다.", pros: "하방 리스크를 일부 방어하며 월배당 추구", cons: "상승 잠재력이 크게 제한됨", yield: 0.07, growth: 0.01, risk: '중립', category: '커버드콜' },
    "RYLA": { name: "Global X Russell 2000 Covered Call & Growth ETF", desc: "러셀 2000 지수의 50%는 보유하고, 나머지 50%는 커버드콜 전략을 사용합니다.", pros: "배당과 성장의 균형을 추구", cons: "일반 성장 ETF보다 낮은 성장률", yield: 0.06, growth: 0.04, risk: '높음', category: '커버드콜' },

    // Market Index
    "VOO": { name: "Vanguard S&P 500 ETF", desc: "미국 S&P 500 지수를 추종하며, 미국 대표 500개 대기업에 분산 투자합니다.", pros: "낮은 보수, 높은 안정성, 시장 전체 성장 추종", cons: "폭발적 고성장 기대는 어려움, 상대적으로 낮은 배당률", yield: 0.015, growth: 0.085, risk: '중립', category: '시장 대표' },

    // 2X Leveraged
    "QLD": { name: "ProShares Ultra QQQ", desc: "나스닥 100 지수의 일일 수익률을 2배로 추종하는 레버리지 ETF입니다.", pros: "상승장에서의 극대화된 수익률", cons: "변동성 끌림(Decay) 현상, 장기 투자 시 높은 위험", yield: 0.0, growth: 0.26, risk: '높음', category: '2X' },
    "SSO": { name: "ProShares Ultra S&P500", desc: "S&P 500 지수의 일일 수익률을 2배로 추종하는 레버리지 ETF입니다.", pros: "미국 대표 지수 상승 시 2배 수익", cons: "횡보 또는 하락장에서 원금 손실 위험 매우 큼", yield: 0.0, growth: 0.17, risk: '높음', category: '2X' },
    "DDM": { name: "ProShares Ultra Dow30", desc: "다우존스 30 산업평균지수의 일일 수익률을 2배로 추종합니다.", pros: "우량주 지수에 대한 레버리지 투자", cons: "QLD, SSO보다 낮은 변동성, 그러나 여전히 위험", yield: 0.0, growth: 0.14, risk: '높음', category: '2X' },
    "USD": { name: "ProShares Ultra Semiconductors", desc: "미국 반도체 지수의 일일 수익률을 2배로 추종하는 레버리지 ETF입니다.", pros: "반도체 산업 상승 시 극대화된 수익", cons: "극심한 산업 사이클 변동성, 장기 투자 시 높은 위험", yield: 0.0, growth: 0.28, risk: '높음', category: '2X' },
    "ROM": { name: "ProShares Ultra Technology", desc: "미국 기술 지수의 일일 수익률을 2배로 추종하는 레버리지 ETF입니다.", pros: "기술주 상승장에서의 극대화된 수익", cons: "높은 변동성, 장기 투자 위험", yield: 0.0, growth: 0.24, risk: '높음', category: '2X' },
    "RXL": { name: "ProShares Ultra Health Care", desc: "미국 헬스케어 지수의 일일 수익률을 2배로 추종합니다.", pros: "헬스케어 섹터 성장에 대한 레버리지 투자", cons: "규제 변화에 민감, 횡보/하락장 위험", yield: 0.0, growth: 0.16, risk: '높음', category: '2X' },
    "DIG": { name: "ProShares Ultra Oil & Gas", desc: "미국 석유 및 가스 지수의 일일 수익률을 2배로 추종합니다.", pros: "유가 상승 시 높은 수익 기대", cons: "에너지 가격 변동성에 크게 노출, 매우 높은 위험", yield: 0.0, growth: 0.15, risk: '높음', category: '2X' },
    "UYG": { name: "ProShares Ultra Financials", desc: "미국 금융 지수의 일일 수익률을 2배로 추종합니다.", pros: "경기 확장 국면에서 수익 극대화", cons: "경기 침체 시 매우 높은 위험", yield: 0.0, growth: 0.12, risk: '높음', category: '2X' },
    "UWM": { name: "ProShares Ultra Russell2000", desc: "러셀 2000(중소형주) 지수의 일일 수익률을 2배로 추종합니다.", pros: "중소형주 상승장에서 높은 수익 기대", cons: "대형주보다 높은 변동성, 장기 투자 위험", yield: 0.0, growth: 0.18, risk: '높음', category: '2X' },
    "BITX": { name: "2x Bitcoin Strategy ETF", desc: "비트코인 선물 지수의 일일 수익률을 2배로 추종하는 ETF입니다.", pros: "비트코인 가격 상승 시 극대화된 수익", cons: "극심한 변동성, 가상자산 관련 규제 리스크", yield: 0.0, growth: 0.30, risk: '높음', category: '2X' },
    "ETHU": { name: "2x Ether Strategy ETF", desc: "이더리움 선물 지수의 일일 수익률을 2배로 추종하는 ETF입니다.", pros: "이더리움 상승장에서 높은 수익 기대", cons: "BITX와 유사하게 매우 높은 위험성", yield: 0.0, growth: 0.32, risk: '높음', category: '2X' },
    "SOLT": { name: "2x Solana Strategy ETF", desc: "솔라나(SOL)의 일일 수익률을 2배로 추종하는 가상 ETF입니다.", pros: "알트코인 대장주 중 하나인 솔라나 상승 시 초고수익", cons: "가상자산 중에서도 극도로 높은 변동성", yield: 0.0, growth: 0.35, risk: '높음', category: '2X' },
    "XXRP": { name: "2x XRP Strategy ETF", desc: "리플(XRP)의 일일 수익률을 2배로 추종하는 가상 ETF입니다.", pros: "리플 가격 상승 시 높은 수익을 기대할 수 있음", cons: "소송 등 규제 리스크가 큰 자산에 대한 레버리지 투자", yield: 0.0, growth: 0.28, risk: '높음', category: '2X' },
};

export const getEtfData = async (): Promise<{ data: Record<string, Etf>, categories: string[] }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const processedData: Record<string, Etf> = {};
    const categories = new Set<string>();

    for (const ticker in allEtfData) {
        const etfInfo = allEtfData[ticker];
        processedData[ticker] = {
            ...etfInfo,
            ticker,
            color: categoryColorMap[etfInfo.category] || 'gray',
        };
        categories.add(etfInfo.category);
    }
    
    return { data: processedData, categories: Array.from(categories) };
};
