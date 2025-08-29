import React, { useRef, useEffect } from 'react';
import type { ChartConfiguration, ChartData } from 'chart.js';

// Chart.js is loaded from a CDN, so we declare it as a global
declare const Chart: any;

interface ChartComponentProps {
    data: ChartData;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ data }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<any>(null);

    const chartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: '#ccc' } },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        let label = context.dataset.label || '';
                        if (label) label += ': ';
                        label += `${Math.round(context.raw).toLocaleString('ko-KR')}원`;
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                title: { display: true, text: '경과 년도', color: '#ccc' },
                ticks: { color: '#aaa' },
                grid: { color: '#2d3748' }
            },
            y: {
                title: { display: true, text: '금액 (원)', color: '#ccc' },
                ticks: {
                    color: '#aaa',
                    callback: (value: string | number) => {
                        const numericValue = Number(value);
                        if (numericValue >= 100000000) return `${(numericValue / 100000000).toLocaleString('ko-KR')}억`;
                        if (numericValue >= 10000) return `${(numericValue / 10000).toLocaleString('ko-KR')}만`;
                        return numericValue.toLocaleString('ko-KR');
                    }
                },
                grid: { color: '#2d3748' }
            }
        }
    };

    useEffect(() => {
        if (!canvasRef.current) return;
        
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        // Destroy previous chart instance if it exists
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        chartInstanceRef.current = new Chart(ctx, {
            type: 'line',
            data: data,
            options: chartOptions,
        });

        // Cleanup function to destroy chart on component unmount
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
        };
    }, [data]); // Re-create chart if data changes

    return <canvas ref={canvasRef} />;
};

export default ChartComponent;