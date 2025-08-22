import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { MonthlyTrend } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyTrendsChartProps {
  monthlyTrends: MonthlyTrend[];
}

const MonthlyTrendsChart: React.FC<MonthlyTrendsChartProps> = ({ monthlyTrends }) => {
  const data = {
    labels: monthlyTrends.map(trend => trend.month),
    datasets: [
      {
        label: 'Income',
        data: monthlyTrends.map(trend => trend.income),
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: monthlyTrends.map(trend => trend.expenses),
        borderColor: '#F44336',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Investments',
        data: monthlyTrends.map(trend => trend.investments),
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
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
          color: '#fff',
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(context.raw);
            return `${context.dataset.label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#fff',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y: {
        ticks: {
          color: '#fff',
          callback: function(value: any) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              notation: 'compact',
            }).format(value);
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  if (monthlyTrends.length === 0) {
    return (
      <div className="chart-placeholder">
        <p>No trend data available</p>
      </div>
    );
  }

  return (
    <div className="chart-wrapper">
      <Line data={data} options={options} />
    </div>
  );
};

export default MonthlyTrendsChart;