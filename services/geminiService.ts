import { GoogleGenAI, Type } from "@google/genai";
import type { Etf, PortfolioScenario, RiskProfile, InvestmentTheme } from '../types';

const riskProfileMap: Record<RiskProfile, string> = {
    'conservative': '안정 추구형',
    'balanced': '균형 성장형',
    'aggressive': '적극 성장형',
};

const investmentThemeMap: Record<InvestmentTheme, string> = {
    'ai-recommended': 'AI가 종합적으로 판단하여 추천',
    'max-growth': '100% 성장 집중 (배당 최소화)',
    'tech-focused': '미래 기술 집중',
    'dividend-focused': '안정 고배당 집중',
    'crypto-focused': '가상자산 집중',
};

export const generateAiPortfolio = async (
    apiKey: string,
    riskProfile: RiskProfile, 
    investmentTheme: InvestmentTheme, 
    availableEtfs: Etf[]
): Promise<PortfolioScenario | null> => {
    if (!apiKey) {
        console.error("API Key is missing.");
        throw new Error("API Key가 설정되지 않았습니다. 우측 상단 설정 아이콘을 클릭하여 API Key를 입력해주세요.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const etfListForPrompt = availableEtfs.map(({ ticker, name, yield: etfYield, growth, risk, category }) => ({
        ticker, name, yield: etfYield, growth, risk, category
    }));

    const riskProfileKorean = riskProfileMap[riskProfile];
    const investmentThemeKorean = investmentThemeMap[investmentTheme];

    const prompt = `Your task is to act as an expert portfolio manager. The user's investment profile is '${riskProfileKorean}' and their chosen investment theme is '${investmentThemeKorean}'.
    Based on this profile and theme, create a creative and balanced investment portfolio using ONLY the ETFs from the provided list.

    **Crucial Instructions:**
    1.  **Adhere to Theme & Profile:** Your portfolio MUST strictly reflect both the user's risk profile AND their chosen theme. 
        - For a theme like '100% 성장 집중 (배당 최소화)', prioritize ETFs with the highest 'growth' values and lowest 'yield', as the goal is maximum capital appreciation. The portfolio name and description should reflect this growth focus.
        - For '안정 고배당 집중', prioritize high 'yield' and '낮음' or '중립' risk ETFs.
        - For '가상자산 집중', you must primarily use ETFs from the '가상자산' category.
        - For 'AI 추천 종합', you have the creative freedom to combine various categories to create a balanced portfolio according to the risk profile.
    2.  **Be Creative & Diverse:** Do not just pick the most obvious ETFs. Create an innovative portfolio. For example, a 'balanced' profile with a 'tech-focused' theme might include some slightly lower-risk tech ETFs or a small allocation to a dividend-paying tech stock ETF if available.
    3.  **Portfolio Composition:** Your generated portfolio MUST consist of between 4 and 8 different ETFs.
    4.  **Strict Adherence to List:** You MUST only use tickers from the provided list. Do not invent or use any other ETFs.
    5.  **Sum of Weights:** The sum of all weights in your portfolio MUST equal 1.
    6.  **JSON Output:** The final output must be ONLY the JSON object specified in the schema. Do not include any other text, explanations, or markdown formatting.

    **Available ETF List:**
    ${JSON.stringify(etfListForPrompt, null, 2)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: "A creative name for the portfolio (e.g., AI 집중 성장 포트폴리오)." },
                        desc: { type: Type.STRING, description: "A brief, compelling description of the portfolio's strategy." },
                        weights: {
                            type: Type.ARRAY,
                            description: "An array of objects, each containing an ETF ticker and its corresponding weight (e.g., [{ \"ticker\": \"VOO\", \"weight\": 0.5 }]). The sum of all weights must equal 1.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    ticker: { 
                                        type: Type.STRING,
                                        description: "The ETF ticker symbol from the provided list."
                                    },
                                    weight: {
                                        type: Type.NUMBER,
                                        description: "The proportion of this ETF in the portfolio (e.g., 0.2 for 20%)."
                                    }
                                },
                                required: ["ticker", "weight"]
                            }
                        }
                    },
                    required: ["name", "desc", "weights"]
                }
            }
        });

        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);
        
        const weightsArray: { ticker: string; weight: number }[] = parsedResponse.weights;
        const weightsObject: { [ticker: string]: number } = {};

        if (Array.isArray(weightsArray)) {
            for (const item of weightsArray) {
                if (item.ticker && typeof item.weight === 'number') {
                    weightsObject[item.ticker] = item.weight;
                }
            }
        }

        for (const ticker in weightsObject) {
            if (!availableEtfs.some(etf => etf.ticker === ticker)) {
                console.warn(`AI suggested an invalid ticker: ${ticker}. Removing it.`);
                delete weightsObject[ticker];
            }
        }
        
        let totalWeight = Object.values(weightsObject).reduce((sum, weight) => sum + weight, 0);
        if (totalWeight > 0 && Math.abs(totalWeight - 1) > 0.01) {
             console.warn(`AI generated portfolio weights do not sum to 1 (sum: ${totalWeight}). Normalizing...`);
             for (const ticker in weightsObject) {
                weightsObject[ticker] /= totalWeight;
            }
        }
        
        let displayRisk: '낮음' | '중립' | '높음' = '중립';
        if (investmentTheme === 'dividend-focused') displayRisk = '낮음';
        if (['tech-focused', 'crypto-focused', 'max-growth'].includes(investmentTheme)) displayRisk = '높음';
        if (investmentTheme === 'ai-recommended') {
             if (riskProfile === 'conservative') displayRisk = '낮음';
             if (riskProfile === 'aggressive') displayRisk = '높음';
        }
        

        return {
            id: `ai-custom-${Date.now()}`,
            name: parsedResponse.name,
            desc: parsedResponse.desc,
            risk: displayRisk,
            weights: weightsObject,
        };

    } catch (error) {
        console.error("Error generating AI portfolio:", error);
        if (error instanceof Error) {
            throw new Error(`AI 포트폴리오 생성에 실패했습니다. API Key가 유효한지 확인해주세요. (${error.message})`);
        }
        throw new Error("AI 포트폴리오 생성 중 알 수 없는 오류가 발생했습니다.");
    }
};