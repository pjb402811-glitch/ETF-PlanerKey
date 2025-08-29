import React from 'react';
import type { Etf } from '../types';
import EtfCard from './EtfCard';

interface EtfDetailModalProps {
    etf: Etf;
    onClose: () => void;
}

const EtfDetailModal: React.FC<EtfDetailModalProps> = ({ etf, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 fade-in"
            onClick={onClose} 
        >
            <div 
                className="w-full max-w-lg relative" // Added relative for positioning context
                onClick={e => e.stopPropagation()} 
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors duration-200 z-10"
                    aria-label="Close modal"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <EtfCard etf={etf} />
            </div>
        </div>
    );
};

export default EtfDetailModal;