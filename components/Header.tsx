import React, { useState, useEffect } from 'react';

interface HeaderProps {
    onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        const today = new Date();
        setCurrentDate(`${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 기준`);
    }, []);

    return (
        <header className="text-center mb-10 relative">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                자녀부자플랜
            </h1>
            <p className="text-xl text-blue-300">{currentDate}</p>
            <p className="text-lg text-blue-400 mt-1">자녀에게 건강한 금융투자를 물려주길 바라며-Made by PJB</p>
            <button
                onClick={onSettingsClick}
                className="absolute top-0 right-0 p-2 text-gray-400 hover:text-white transition-colors"
                aria-label="API Key 설정"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
            </button>
        </header>
    );
};

export default Header;