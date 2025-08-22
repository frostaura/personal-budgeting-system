import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { AccountBalance } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface AccountsChartProps {
  accountBalances: AccountBalance[];
}

const AccountsChart: React.FC<AccountsChartProps> = ({ accountBalances }) => {
  const positiveBalances = accountBalances.filter(acc => acc.isPositive && acc.balance > 0);
  const negativeBalances = accountBalances.filter(acc => !acc.isPositive);

  const data = {
    labels: positiveBalances.map(acc => acc.name),
    datasets: [
      {
        label: 'Account Balances',
        data: positiveBalances.map(acc => Math.abs(acc.balance)),
        backgroundColor: [
          '#4CAF50',
          '#2196F3',
          '#FF9800',
          '#9C27B0',
          '#00BCD4',
          '#8BC34A',
          '#FFC107',
          '#E91E63'
        ],
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
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
            return `${context.label}: ${value}`;
          }
        }
      }
    },
  };

  if (positiveBalances.length === 0) {
    return (
      <div className="chart-placeholder">
        <p>No account data available</p>
      </div>
    );
  }

  return (
    <div className="chart-wrapper">
      <Doughnut data={data} options={options} />
      {negativeBalances.length > 0 && (
        <div className="negative-balances">
          <h4>Debts & Liabilities</h4>
          <ul>
            {negativeBalances.map((acc, index) => (
              <li key={index} className="debt-item">
                <span>{acc.name}:</span>
                <span className="debt-amount">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(Math.abs(acc.balance))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AccountsChart;