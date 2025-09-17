import React from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Alert,
} from '@mui/material';
import {
  TrendingUpOutlined,
  AccountBalanceOutlined,
  SavingsOutlined,
  PieChartOutlined,
} from '@mui/icons-material';
import { formatCurrency } from '@/utils/currency';

const DashboardPage: React.FC = () => {
  // Mock data for now - will be replaced with real data from Redux store
  const mockData = {
    netWorth: 125000000, // R1,250,000 in cents
    totalAssets: 180000000, // R1,800,000
    totalLiabilities: 55000000, // R550,000
    monthlyIncome: 4500000, // R45,000
    monthlyExpenses: 3200000, // R32,000
    savingsRate: 0.289, // 28.9%
  };

  const StatCard: React.FC<{
    title: string;
    value: string;
    icon: React.ReactNode;
    trend?: number;
    color?: 'primary' | 'success' | 'warning' | 'error';
  }> = ({ title, value, icon, trend, color = 'primary' }) => (
    <Card
      sx={{
        height: '100%',
        borderLeft: 4,
        borderLeftColor: `${color}.main`,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: `${color}.light`,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
        {trend !== undefined && (
          <Typography
            variant="caption"
            sx={{
              color: trend >= 0 ? 'success.main' : 'error.main',
              fontWeight: 500,
            }}
          >
            {trend >= 0 ? '+' : ''}{(trend * 100).toFixed(1)}% from last month
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Financial Dashboard
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Overview of your current financial position and recent trends
      </Typography>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Remember:</strong> All values shown are projections and estimates only. 
          This is not financial advice. Please consult with qualified professionals for important financial decisions.
        </Typography>
      </Alert>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Net Worth"
            value={formatCurrency(mockData.netWorth)}
            icon={<TrendingUpOutlined color="primary" />}
            trend={0.047}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Assets"
            value={formatCurrency(mockData.totalAssets)}
            icon={<AccountBalanceOutlined color="success" />}
            trend={0.023}
            color="success"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Monthly Savings"
            value={formatCurrency(mockData.monthlyIncome - mockData.monthlyExpenses)}
            icon={<SavingsOutlined color="info" />}
            trend={0.089}
            color="warning"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Savings Rate"
            value={`${(mockData.savingsRate * 100).toFixed(1)}%`}
            icon={<PieChartOutlined color="warning" />}
            trend={0.034}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Charts and activity feed will be implemented here with Recharts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Quick action buttons and forms will be implemented here
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;