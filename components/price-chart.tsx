'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PriceChartProps {
  priceHistory: {
    prices: string[];
    timestamps: number[];
    count: number;
  };
  currentPrice: string;
}

export function PriceChart({ priceHistory, currentPrice }: PriceChartProps) {
  // Generate mock data if no real data is available
  const generateMockData = () => {
    const now = Date.now();
    const mockPrices = [];
    const mockTimestamps = [];
    const basePrice = parseFloat(currentPrice) || 2250;
    
    // Generate 24 data points (last 24 hours)
    for (let i = 23; i >= 0; i--) {
      const timestamp = now - (i * 60 * 60 * 1000); // 1 hour intervals
      const variation = (Math.random() - 0.5) * 200; // Random variation of ±$100
      const price = basePrice + variation + (Math.sin(i / 4) * 50); // Add some wave pattern
      
      mockPrices.push(price.toFixed(2));
      mockTimestamps.push(timestamp);
    }
    
    return {
      prices: mockPrices,
      timestamps: mockTimestamps,
      count: mockPrices.length
    };
  };

  // Use real data if available, otherwise use mock data
  const chartData = priceHistory.count > 0 ? priceHistory : generateMockData();
  
  // Format timestamps for labels
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Prepare chart data
  const data = {
    labels: chartData.timestamps.map(formatTime),
    datasets: [
      {
        label: 'ETH/USD Price',
        data: chartData.prices.map((price) => parseFloat(price)),
        borderColor: '#4a90e2',
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#4a90e2',
        pointBorderColor: '#1a2332',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#4a90e2',
        pointHoverBorderColor: '#1a2332',
        pointHoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#1a2332',
          font: {
            family: 'ui-monospace, SFMono-Regular, "SF Mono", monospace',
            size: 14,
            weight: 'bold' as const,
          },
        },
      },
      title: {
        display: true,
        text: 'RWA Price Trend (Last 24 Hours)',
        color: '#1a2332',
        font: {
          family: 'ui-monospace, SFMono-Regular, "SF Mono", monospace',
          size: 18,
          weight: 'bold' as const,
        },
        padding: 20,
      },
      tooltip: {
        backgroundColor: 'rgba(26, 35, 50, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#4a90e2',
        borderWidth: 2,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          family: 'ui-monospace, SFMono-Regular, "SF Mono", monospace',
          size: 14,
          weight: 'bold' as const,
        },
        bodyFont: {
          family: 'ui-monospace, SFMono-Regular, "SF Mono", monospace',
          size: 13,
          weight: 'normal' as const,
        },
        callbacks: {
          label: function(context: any) {
            return `Price: $${context.parsed.y.toFixed(2)}`;
          },
          title: function(context: any) {
            const timestamp = chartData.timestamps[context[0].dataIndex];
            const date = new Date(timestamp);
            return date.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(26, 35, 50, 0.1)',
          lineWidth: 1,
        },
        ticks: {
          color: '#1a2332',
          font: {
            family: 'ui-monospace, SFMono-Regular, "SF Mono", monospace',
            size: 11,
            weight: 'bold' as const,
          },
          maxTicksLimit: 8,
        },
      },
      y: {
        grid: {
          color: 'rgba(26, 35, 50, 0.1)',
          lineWidth: 1,
        },
        ticks: {
          color: '#1a2332',
          font: {
            family: 'ui-monospace, SFMono-Regular, "SF Mono", monospace',
            size: 11,
            weight: 'bold' as const,
          },
          callback: function(value: any) {
            return `$${value.toFixed(0)}`;
          },
        },
        beginAtZero: false,
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
  };

  return (
    <div className="w-full h-[400px] p-4 bg-white border-4 border-[#1a2332] shadow-[12px_12px_0px_0px_#4a90e2] rounded-none">
      <Line data={data} options={options} />
    </div>
  );
}
