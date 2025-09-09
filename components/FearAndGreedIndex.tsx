import React, { useState, useEffect } from 'react';

interface CryptoApiData {
    value: string;
    value_classification: string;
    timestamp: string;
}

const IndexBar: React.FC<{ 
    stockValue: number, 
    cryptoValue: number | null,
}> = ({ stockValue, cryptoValue }) => (
    <div className="w-full h-full flex flex-col justify-center relative py-12">
        {/* Stock Pointer */}
        {stockValue !== null && (
            <div 
                className="absolute top-0 -translate-y-full transition-all duration-500 z-10"
                style={{ left: `${stockValue}%`, top: 'calc(50% - 2.25rem)', transform: `translateX(-50%) translateY(-100%)` }}
            >
                <div className="relative flex flex-col items-center">
                    <div className="bg-blue-500 text-white text-xl font-bold px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap mb-1">
                        {stockValue}
                    </div>
                    <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-blue-500"></div>
                </div>
            </div>
        )}

        {/* The Bar itself */}
        <div className="flex h-12 w-full rounded-full overflow-hidden text-white font-bold text-base md:text-lg shadow-inner">
             <div className="bg-red-600 flex items-center justify-center" style={{ width: '25%' }}><span className="whitespace-nowrap">매우 공포</span></div>
             <div className="bg-orange-400 flex items-center justify-center" style={{ width: '20%' }}><span className="whitespace-nowrap">공포</span></div>
             <div className="bg-yellow-400 flex items-center justify-center" style={{ width: '11%' }}><span className="whitespace-nowrap">중립</span></div>
             <div className="bg-green-400 flex items-center justify-center" style={{ width: '20%' }}><span className="whitespace-nowrap">탐욕</span></div>
             <div className="bg-green-500 flex items-center justify-center" style={{ width: '25%' }}><span className="whitespace-nowrap">매우 탐욕</span></div>
        </div>

        {/* Crypto Pointer */}
        {cryptoValue !== null && (
             <div 
                className="absolute bottom-0 translate-y-full transition-all duration-500 z-10"
                style={{ left: `${cryptoValue}%`, top: 'calc(50% + 3rem)', transform: `translateX(-50%) translateY(0)` }}
            >
                <div className="relative flex flex-col items-center">
                    <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-purple-500"></div>
                    <div className="bg-purple-500 text-white text-xl font-bold px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap mt-1">
                        {cryptoValue}
                    </div>
                </div>
            </div>
        )}

        {/* Scale Numbers */}
        <div className="absolute w-full top-1/2 mt-8">
            <div className="absolute text-xs text-gray-400" style={{ left: '25%', transform: 'translateX(-50%)' }}>25</div>
            <div className="absolute text-xs text-gray-400" style={{ left: '45%', transform: 'translateX(-50%)' }}>45</div>
            <div className="absolute text-xs text-gray-400" style={{ left: '56%', transform: 'translateX(-50%)' }}>56</div>
            <div className="absolute text-xs text-gray-400" style={{ left: '76%', transform: 'translateX(-50%)' }}>76</div>
        </div>
    </div>
);

const ControlPanel: React.FC<{
    stockValue: number;
    onStockChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    cryptoValue: number | null;
    onCryptoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ stockValue, onStockChange, cryptoValue, onCryptoChange }) => (
    <div className="bg-gray-900/50 px-4 py-3 rounded-lg space-y-3 w-full h-full flex flex-col justify-center">
        <h4 className="text-lg font-semibold text-white text-center border-b border-gray-700 pb-2">지수 확인 및 수정</h4>
        
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="font-medium text-blue-400">주식 시장 지수</label>
                <a href="https://edition.cnn.com/markets/fear-and-greed" target="_blank" rel="noopener noreferrer" className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-1 px-2 rounded-md transition-colors inline-flex items-center gap-1">
                    CNN 확인
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </a>
            </div>
            <input
                type="number"
                min="0"
                max="100"
                value={stockValue}
                onChange={onStockChange}
                aria-label="주식 시장 공포와 탐욕 지수 입력"
                className="bg-blue-500 text-white p-2 rounded-lg w-full text-center font-bold text-base focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
        </div>

        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="font-medium text-purple-400">암호화폐 시장 지수</label>
                <a href="https://alternative.me/crypto/fear-and-greed-index/" target="_blank" rel="noopener noreferrer" className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-1 px-2 rounded-md transition-colors inline-flex items-center gap-1">
                     확인
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </a>
            </div>
            <input
                type="number"
                min="0"
                max="100"
                value={cryptoValue ?? ''}
                onChange={onCryptoChange}
                aria-label="암호화폐 시장 공포와 탐욕 지수 입력"
                className="bg-purple-500 text-white p-2 rounded-lg w-full text-center font-bold text-base focus:outline-none focus:ring-2 focus:ring-purple-300 placeholder:text-purple-200"
                placeholder="Loading..."
            />
        </div>
    </div>
);


const FearAndGreedIndex: React.FC = () => {
    const [stockIndexValue, setStockIndexValue] = useState<number>(52);
    const [cryptoIndexValue, setCryptoIndexValue] = useState<number | null>(null);

    const handleStockIndexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value >= 0 && value <= 100) {
            setStockIndexValue(value);
        } else if (e.target.value === '') {
            setStockIndexValue(0);
        }
    };

    const handleCryptoIndexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value >= 0 && value <= 100) {
            setCryptoIndexValue(value);
        } else if (e.target.value === '') {
            setCryptoIndexValue(0);
        }
    };
    
    useEffect(() => {
        const fetchCryptoIndex = async () => {
            try {
                const response = await fetch('https://api.alternative.me/fng/?limit=1');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const result = await response.json();
                if (result && result.data && result.data.length > 0) {
                    const fngData: CryptoApiData = result.data[0];
                    setCryptoIndexValue(parseInt(fngData.value, 10));
                } else {
                    throw new Error("Invalid API response format");
                }
            } catch (e: any) {
                console.error(`암호화폐 지수를 가져오는 데 실패했습니다: ${e.message}`);
                setCryptoIndexValue(null);
            }
        };
        fetchCryptoIndex();
    }, []);

    return (
        <section className="mb-8 bg-gray-800 p-4 md:p-6 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold text-white mb-2 text-center">공포와 탐욕 지수</h3>
            
            <div className="flex flex-col md:flex-row gap-6 items-stretch">
                <div className="flex-grow md:w-3/4">
                    <IndexBar 
                        stockValue={stockIndexValue} 
                        cryptoValue={cryptoIndexValue} 
                    />
                </div>
                <div className="flex-shrink-0 w-full md:w-1/4">
                    <ControlPanel
                        stockValue={stockIndexValue}
                        onStockChange={handleStockIndexChange}
                        cryptoValue={cryptoIndexValue}
                        onCryptoChange={handleCryptoIndexChange}
                    />
                </div>
            </div>
            
            <div className="text-center mt-4 border-t border-gray-700 pt-4">
                <p className="text-sm font-semibold text-gray-300 px-4" style={{ fontSize: '1.1rem' }}>
                    '공포~매우공포'구간 분할매수, '탐욕~매우탐욕'구간은 분할매도 고려 역발상투자
                </p>
            </div>
        </section>
    );
};

export default FearAndGreedIndex;