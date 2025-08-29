import React from 'react';

interface NavigationProps {
    activeTab: 'simulator' | 'tracker';
    setActiveTab: (tab: 'simulator' | 'tracker') => void;
    isTrackerActive: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, isTrackerActive }) => {
    return (
        <nav className="flex justify-center mb-8">
            <div className="bg-gray-800 p-1 rounded-full flex space-x-1">
                <button
                    onClick={() => setActiveTab('simulator')}
                    className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                        activeTab === 'simulator' ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                >
                    시뮬레이터
                </button>
                <button
                    onClick={() => { if (isTrackerActive) setActiveTab('tracker'); }}
                    disabled={!isTrackerActive}
                    className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                        activeTab === 'tracker' ? 'bg-amber-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    aria-label="포트폴리오 관리 (포트폴리오 선택 후 활성화)"
                >
                    포트폴리오 관리
                </button>
            </div>
        </nav>
    );
};

export default Navigation;