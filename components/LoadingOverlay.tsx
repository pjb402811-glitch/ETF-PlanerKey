import React from 'react';

interface LoadingOverlayProps {
    isVisible: boolean;
    message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible, message = '처리 중...' }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex flex-col justify-center items-center z-50">
            <div className="w-10 h-10 border-4 border-t-blue-500 border-gray-600 rounded-full animate-spin"></div>
            <p className="text-white text-lg mt-4">{message}</p>
        </div>
    );
};

export default LoadingOverlay;