import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Dot } from 'recharts';
import { useContracts } from '../contexts/ContractContext';

interface RateData {
  date: string;
  rate: number;
  timestamp: number;
}

interface ChartDataPoint {
  date: string;
  rate: number;
  time: string;
  color?: string; // Added color property
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

// Custom dot component to color each point based on the closest contract
const CustomDot = (props: any) => {
  const { cx, cy, payload, contracts } = props;

  // Find the color for this point based on contracts
  const pointColor = payload.color || '#F472B6'; // Default to green if no color assigned

  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={pointColor}
      stroke={pointColor}
      strokeWidth={2}
    />
  );
};

const RateDashboard: React.FC<RateDashboardProps> = ({ onRateUpdate }) => {
  const [allData, setAllData] = useState<RateData[]>([]);
  const [displayedData, setDisplayedData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { contracts } = useContracts();

  // Function to get the color for a rate based on the closest contract baseline
  const getColorForRate = (rate: number): string => {
    if (contracts.length === 0) {
      return '#0FAE6E'; // Default green if no contracts
    }

    // Find the contract with the closest baseline rate
    let closestContract = contracts[0];
    let minDifference = Math.abs(rate - parseFloat(contracts[0].baselineRate));

    for (const contract of contracts) {
      const difference = Math.abs(rate - parseFloat(contract.baselineRate));
      if (difference < minDifference) {
        minDifference = difference;
        closestContract = contract;
      }
    }

    return closestContract.color;
  };

  // Load mock data (replace with CSV loading in production)
  useEffect(() => {
    // Simulate loading delay
    setTimeout(() => {
      const mockData = generateMockData();
      setAllData(mockData);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Update colors when contracts change
  useEffect(() => {
    setDisplayedData(prevData =>
      prevData.map(point => ({
        ...point,
        color: getColorForRate(point.rate)
      }))
    );
  }, [contracts]);

  // Timer effect to append new data points every 10 seconds
  useEffect(() => {
    if (allData.length === 0) return;

    // Initialize with first data point
    if (displayedData.length === 0 && allData.length > 0) {
      const firstPoint = allData[0];
      const color = getColorForRate(firstPoint.rate);
      setDisplayedData([{
        date: firstPoint.date,
        rate: firstPoint.rate,
        time: new Date(firstPoint.timestamp).toLocaleDateString(),
        color: color
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
          const color = getColorForRate(firstPoint.rate);
          setDisplayedData([{
            date: firstPoint.date,
            rate: firstPoint.rate,
            time: new Date(firstPoint.timestamp).toLocaleDateString(),
            color: color
          }]);
          // Notify parent component of the reset rate
          if (onRateUpdate) {
            onRateUpdate(firstPoint.rate);
          }
        } else {
          // Add the next data point
          const nextDataPoint = allData[prevIndex];
          const color = getColorForRate(nextDataPoint.rate);
          const newPoint = {
            date: nextDataPoint.date,
            rate: nextDataPoint.rate,
            time: new Date(nextDataPoint.timestamp).toLocaleDateString(),
            color: color
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
  }, [allData, displayedData.length, contracts]);

  // Format rate for display
  const formatRate = (rate: number) => {
    return rate.toFixed(6);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const pointData = payload[0];
      const rate = pointData.value;
      const color = pointData.payload.color || '#0FAE6E';

      // Find the closest contract for this rate
      let closestContract = null;
      let minDifference = Infinity;

      for (const contract of contracts) {
        const difference = Math.abs(rate - parseFloat(contract.baselineRate));
        if (difference < minDifference) {
          minDifference = difference;
          closestContract = contract;
        }
      }

      return (
        <div className="bg-gray-800 p-3 border border-green-500/30 rounded shadow-lg">
          <p className="font-semibold text-white">{`Date: ${label}`}</p>
          <p className="text-green-400">{`USD/ZAR: ${formatRate(rate)}`}</p>
          {closestContract && (
            <div className="mt-2 pt-2 border-t border-gray-600">
              <p className="text-xs text-gray-400">Closest Contract:</p>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: closestContract.color }}
                />
                <p className="text-xs text-white">
                  Baseline: {parseFloat(closestContract.baselineRate).toFixed(4)}
                </p>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Difference: {(Math.abs(rate - parseFloat(closestContract.baselineRate))).toFixed(6)}
              </p>
            </div>
          )}
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
        <div className="text-green-400 text-lg">Error: {error}</div>
      </div>
    );
  }

  // Calculate statistics
  const currentRate = displayedData.length > 0 ? displayedData[displayedData.length - 1].rate : 0;
  const currentColor = displayedData.length > 0 ? displayedData[displayedData.length - 1].color : '#F472B6';

  // Create contract legend data
  const contractLegend = contracts.reduce((acc, contract) => {
    const baselineRate = parseFloat(contract.baselineRate);
    if (!acc.find(item => item.baselineRate === baselineRate)) {
      acc.push({
        baselineRate,
        color: contract.color,
        count: contracts.filter(c => parseFloat(c.baselineRate) === baselineRate).length
      });
    }
    return acc;
  }, [] as Array<{ baselineRate: number; color: string; count: number }>);

  // Custom dot renderer
  const renderCustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={payload.color || '#0FAE6E'}
        stroke="#fff"
        strokeWidth={1}
      />
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg p-6 border border-green-500/20">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-green-400 mb-2">ZAR/USD Exchange Rate Dashboard</h2>
          <p className="text-gray-300">
            Real-time visualization of exchange rates with contract-based coloring.
          </p>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-3 rounded border border-green-500/20">
              <div className="text-xs text-gray-400">Current Rate</div>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: currentColor }}
                />
                <div className="text-lg font-semibold text-green-400">{formatRate(currentRate)}</div>
              </div>
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
                stroke="#9CA3AF"
                strokeWidth={2}
                dot={renderCustomDot}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                name="ZAR/USD Rate"
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Contract Legend */}
        {contractLegend.length > 0 && (
          <div className="mt-6 p-4 bg-gray-700 rounded-lg border border-green-500/20">
            <h3 className="text-lg font-semibold text-green-400 mb-3">Active Contract Baseline Rates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {contractLegend.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-gray-600 rounded">
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16">
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      fill={item.color}
                      stroke="white"
                      strokeWidth="2"
                    />
                  </svg>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {item.baselineRate.toFixed(4)} USD/ZAR
                    </div>
                    <div className="text-xs text-gray-400">
                      {item.count} contract{item.count !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-2 bg-gray-600 rounded">
              <p className="text-xs text-gray-300">
                <span className="font-semibold">Note:</span> Each point on the graph is colored according to the contract with the closest baseline rate to that point's value.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-300">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live updates every 10 seconds</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateDashboard;
