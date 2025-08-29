import React, { useState } from 'react';

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (apiKey: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave }) => {
    const [key, setKey] = useState('');

    if (!isOpen) return null;

    const handleSave = () => {
        if (key.trim()) {
            onSave(key.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 w-full max-w-lg text-left border border-gray-700 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors duration-200"
                    aria-label="Close modal"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h3 className="text-xl font-bold text-white mb-4">Google AI API Key 설정</h3>
                <p className="text-red-400 mb-4">
                    이 앱을 사용하려면 Google AI API Key가 필요합니다.
                    <br />
                    아래에 입력해주세요
                </p>

                <div className="mb-4">
                    <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-300 mb-2">Google AI API Key 입력</label>
                    <div className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                        </svg>
                        <input
                            id="api-key-input"
                            type="password"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            className="w-full bg-gray-700 p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="***************************************"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">API Key는 브라우저에만 저장되며, 외부로 전송되지 않습니다.</p>
                </div>
                
                <div className="bg-gray-900/50 p-4 rounded-lg text-sm">
                    <h4 className="font-semibold text-white mb-2">Google AI API Key 발급방법</h4>
                    <ol className="list-decimal list-inside space-y-1 text-gray-300">
                        <li>
                            <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                Google AI Studio
                            </a> 페이지로 이동하여 로그인합니다.
                        </li>
                        <li>'Get API Key' 버튼을 클릭합니다.</li>
                        <li>생성된 API Key를 복사합니다.</li>
                        <li>복사한 Key를 위 입력창에 붙여넣고 'Key 저장' 버튼을 누릅니다.</li>
                    </ol>
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={handleSave}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
                    >
                        Key 저장
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyModal;