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
    '2x-growth': '2X 레버리지 성장',
};


export const fetchEtfDataWithAI = async (
    apiKey: string,
    ticker: string,
    existingCategories: string[]
): Promise<Omit<Etf, 'ticker' | 'color'>> => {
     if (!apiKey) {
        console.error("API Key is missing.");
        throw new Error("API Key가 설정되지 않았습니다.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert financial data analyst. Your task is to provide structured data for a given US stock market ETF ticker.

    **Crucial Instructions:**
    1.  **Data Accuracy:** Provide the most accurate and recent data available. Use your knowledge base to estimate realistic values.
    2.  **Strict JSON Output:** The output must be ONLY the JSON object specified in the schema. Do not include any other text, explanations, or markdown formatting.
    3.  **Field Explanations:**
        *   \`name\`: The full official name of the ETF.
        *   \`desc\`: A brief, one-sentence description of the ETF's investment strategy.
        *   \`pros\`: A concise summary of the key advantages or strengths of this ETF.
        *   \`cons\`: A concise summary of the key disadvantages, risks, or considerations.
        *   \`yield\`: The estimated annual dividend yield as a decimal number (e.g., 0.035 for 3.5%).
        *   \`growth\`: The estimated annual asset growth rate (capital appreciation) as a decimal number (e.g., 0.08 for 8%). This should not include the yield.
        *   \`risk\`: Classify the ETF's volatility and risk profile as one of: '낮음', '중립', '높음'.
        *   \`category\`: Categorize the ETF. Choose the most fitting category from the provided list. If none are a good fit, you may create a new, appropriate category name in Korean.
    4.  **Language**: All text fields (\`name\`, \`desc\`, \`pros\`, \`cons\`, \`category\`) MUST be in Korean.

    **Existing Categories List:**
    ${JSON.stringify(existingCategories)}

    **ETF Ticker to analyze:**
    ${ticker.toUpperCase()}
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
                        name: { type: Type.STRING, description: "ETF의 전체 공식 명칭." },
                        desc: { type: Type.STRING, description: "ETF의 투자 전략에 대한 간략한 한 문장 설명." },
                        pros: { type: Type.STRING, description: "ETF의 주요 장점 또는 강점에 대한 간결한 요약." },
                        cons: { type: Type.STRING, description: "ETF의 주요 단점, 위험 또는 고려 사항에 대한 간결한 요약." },
                        yield: { type: Type.NUMBER, description: "예상 연간 배당 수익률을 소수점 숫자로 (예: 3.5%의 경우 0.035)." },
                        growth: { type: Type.NUMBER, description: "예상 연간 자산 성장률(자본 이득)을 소수점 숫자로 (예: 8%의 경우 0.08)." },
                        risk: { type: Type.STRING, description: "ETF의 변동성 및 위험 프로필을 '낮음', '중립', '높음' 중 하나로 분류." },
                        category: { type: Type.STRING, description: "제공된 목록에서 가장 적합한 카테고리를 선택하거나, 적합한 것이 없으면 새로운 카테고리 이름을 한국어로 생성." },
                    },
                    required: ["name", "desc", "pros", "cons", "yield", "growth", "risk", "category"]
                },
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error fetching ETF data with AI:", error);
         if (error instanceof Error) {
            throw new Error(`AI를 통해 ETF 정보를 가져오는 데 실패했습니다. Ticker가 정확한지, API Key가 유효한지 확인해주세요. (${error.message})`);
        }
        throw new Error("AI ETF 정보 조회 중 알 수 없는 오류가 발생했습니다.");
    }
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
    Based on this profile and theme, create a creative and insightful investment portfolio using ONLY the ETFs from the provided list.

    **Crucial Instructions:**
    1.  **Portfolio Naming and Description:** This is a critical step. The name and description must be insightful and accurately reflect the portfolio's strategy.
        - For high-risk themes like '2X 레버리지 성장' or '가상자산 집중', the name and description MUST acknowledge the high-risk, high-return nature. AVOID using words like '균형' (balanced) or '안정' (stable). Instead, use more appropriate and descriptive phrases like '높은 변동성을 견디는' (withstanding high volatility) or '초고수익 추구형' (ultra-high-return seeking). A user provided an excellent example name: "높은 변동성을 견디는 2X레버리지 성장포트폴리오". Use this as inspiration for your creativity.
        - For other themes, the name should be creative and reflect the portfolio's core strategy (e.g., 'AI 기술주도 성장 포트폴리오').
    2.  **Adhere to Theme & Profile:** Your portfolio MUST strictly reflect both the user's risk profile AND their chosen theme. 
        - For a theme like '100% 성장 집중 (배당 최소화)', prioritize ETFs with the highest 'growth' values and lowest 'yield', as the goal is maximum capital appreciation. The portfolio name and description should reflect this growth focus.
        - For '안정 고배당 집중', prioritize high 'yield' and '낮음' or '중립' risk ETFs.
        - For '가상자산 집중', you must primarily use ETFs from the '가상자산' category.
        - For '2X 레버리지 성장', you must primarily use ETFs from the '2X' category.
        - For 'AI 추천 종합', you have the creative freedom to combine various categories to create a balanced portfolio according to the risk profile.
    3.  **Be Creative & Diverse:** Do not just pick the most obvious ETFs. Create an innovative portfolio. For example, a 'balanced' profile with a 'tech-focused' theme might include some slightly lower-risk tech ETFs or a small allocation to a dividend-paying tech stock ETF if available.
    4.  **Portfolio Composition:** Your generated portfolio MUST consist of between 4 and 8 different ETFs.
    5.  **Strict Adherence to List:** You MUST only use tickers from the provided list. Do not invent or use any other ETFs.
    6.  **Sum of Weights:** The sum of all weights in your portfolio MUST equal 1.
    7.  **JSON Output:** The final output must be ONLY the JSON object specified in the schema. Do not include any other text, explanations, or markdown formatting.

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
        if (['tech-focused', 'crypto-focused', 'max-growth', '2x-growth'].includes(investmentTheme)) displayRisk = '높음';
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