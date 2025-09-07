import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RateData {
  date: string;
  rate: number;
  timestamp: number;
}

interface ChartDataPoint {
  date: string;
  rate: number;
  time: string;
}

// Mock data for testing - replace with actual CSV parsing in production
const generateMockData = (): RateData[] => {
  const data: RateData[] = [];
  const today = new Date();
  const startDate = new Date(today.toISOString().split('T')[0]);
  const baseRate = 18.5;

  for (let i = 0; i < 30; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    // Add some variation to make it interesting
    const variation = (Math.sin(i / 5) * 0.5) + (Math.random() * 0.2 - 0.1);
    const rate = baseRate + variation;

    data.push({
      date: currentDate.toISOString().split('T')[0],
      rate: rate,
      timestamp: currentDate.getTime()
    });
  }

  return data;
};

interface RateDashboardProps {
  onRateUpdate?: (rate: number) => void
}

const RateDashboard: React.FC<RateDashboardProps> = ({ onRateUpdate }) => {
  const [allData, setAllData] = useState<RateData[]>([]);
  const [displayedData, setDisplayedData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Load mock data (replace with CSV loading in production)
  useEffect(() => {
    // Simulate loading delay
    setTimeout(() => {
      const mockData = generateMockData();
      setAllData(mockData);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Timer effect to append new data points every 10 seconds
  useEffect(() => {
    if (allData.length === 0) return;

    // Initialize with first data point
    if (displayedData.length === 0 && allData.length > 0) {
      const firstPoint = allData[0];
      setDisplayedData([{
        date: firstPoint.date,
        rate: firstPoint.rate,
        time: new Date(firstPoint.timestamp).toLocaleDateString()
      }]);
      setCurrentIndex(1);
      // Notify parent component of the initial rate
      if (onRateUpdate) {
        onRateUpdate(firstPoint.rate);
      }
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = prevIndex >= allData.length ? 1 : prevIndex + 1;

        if (prevIndex >= allData.length) {
          // Reset to show first point only
          const firstPoint = allData[0];
          setDisplayedData([{
            date: firstPoint.date,
            rate: firstPoint.rate,
            time: new Date(firstPoint.timestamp).toLocaleDateString()
          }]);
          // Notify parent component of the reset rate
          if (onRateUpdate) {
            onRateUpdate(firstPoint.rate);
          }
        } else {
          // Add the next data point
          const nextDataPoint = allData[prevIndex];
          const newPoint = {
            date: nextDataPoint.date,
            rate: nextDataPoint.rate,
            time: new Date(nextDataPoint.timestamp).toLocaleDateString()
          };

          setDisplayedData(prev => [...prev, newPoint]);
          // Notify parent component of the new rate
          if (onRateUpdate) {
            onRateUpdate(nextDataPoint.rate);
          }
        }

        return nextIndex;
      });
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [allData, displayedData.length]);

  // Format rate for display
  const formatRate = (rate: number) => {
    return rate.toFixed(6);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 border border-pink-500/30 rounded shadow-lg">
          <p className="font-semibold text-white">{`Date: ${label}`}</p>
          <p className="text-pink-400">{`USD/ZAR: ${formatRate(payload[0].value)}`}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-300">Loading rate data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-pink-400 text-lg">Error: {error}</div>
      </div>
    );
  }

  // Calculate statistics
  const currentRate = displayedData.length > 0 ? displayedData[displayedData.length - 1].rate : 0;

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg p-6 border border-pink-500/20">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-pink-400 mb-2">ZAR/USD Exchange Rate Dashboard</h2>
          <p className="text-gray-300">
            Real-time visualization of exchange rates.
          </p>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-3 rounded border border-pink-500/20">
              <div className="text-xs text-gray-400">Current Rate</div>
              <div className="text-lg font-semibold text-pink-400">{formatRate(currentRate)}</div>
            </div>
          </div>
        </div>

        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={displayedData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 80,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
                tickFormatter={formatRate}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#F472B6"
                strokeWidth={2}
                dot={{ fill: '#F472B6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#F472B6', strokeWidth: 2 }}
                name="ZAR/USD Rate"
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-300">
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
            <span>Live updates every 10 seconds</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateDashboard;
