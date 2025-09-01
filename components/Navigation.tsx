import React from 'react';

interface NavigationProps {
    activeTab: 'simulator' | 'tracker';
    setActiveTab: (tab: 'simulator' | 'tracker') => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
    return (
        <nav className="flex justify-center mb-8">
            <div className="bg-gray-800 p-2 rounded-full flex space-x-2">
                <button
                    onClick={() => setActiveTab('simulator')}
                    className={`px-7 py-2.5 rounded-full text-base font-semibold transition-colors duration-200 ${
                        activeTab === 'simulator' ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                >
                    시뮬레이터
                </button>
                <button
                    onClick={() => setActiveTab('tracker')}
                    className={`px-7 py-2.5 rounded-full text-base font-semibold transition-colors duration-200 ${
                        activeTab === 'tracker' ? 'bg-amber-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                    aria-label="포트폴리오 관리"
                >
                    포트폴리오 관리
                </button>
            </div>
        </nav>
    );
};

export default Navigation;