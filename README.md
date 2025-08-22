# Personal Budgeting System

A modern, comprehensive personal budgeting application built with .NET 8, Entity Framework, React TypeScript, and Redux. Features a glassmorphic design with real-time charts and analytics to help you track and manage your personal finances.

![Dashboard Screenshot](screenshots/dashboard.png)

## Features

### Core Functionality
- 💰 **Net Worth Tracking**: Monitor your total assets and liabilities
- 📊 **Income & Expense Management**: Track all your financial transactions
- 🏦 **Multi-Account Support**: Manage checking, savings, credit cards, and investment accounts
- 💎 **Investment Tracking**: Monitor your investment portfolio performance
- 📈 **Budget Management**: Create and track monthly/yearly budgets
- 🔄 **Recurring Transactions**: Set up automatic recurring payments and income
- 📊 **Financial Analytics**: Detailed insights into spending patterns and trends

### Advanced Features
- 🎯 **Savings Rate Calculation**: Automatically calculate your savings rate
- 📈 **Future Projections**: Project your net worth and account balances
- 💳 **Debt Management**: Track credit cards and loans with payoff projections
- 📊 **Interactive Charts**: Beautiful, responsive charts using Chart.js
- 🎨 **Modern UI**: Glassmorphic design with smooth animations
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices

### Technical Features
- 🚀 **RESTful API**: Comprehensive API with Swagger documentation
- 🔍 **Real-time Data**: No static data - fully integrated with backend
- 💾 **Data Persistence**: SQLite database with Entity Framework Core
- 🎯 **TypeScript**: Fully typed frontend for better development experience
- ⚡ **Redux State Management**: Efficient state management with Redux Toolkit

## Technology Stack

### Backend
- **Framework**: ASP.NET Core 8.0 Web API
- **ORM**: Entity Framework Core
- **Database**: SQLite (easily configurable for PostgreSQL/SQL Server)
- **Documentation**: Swagger/OpenAPI
- **Architecture**: Clean Architecture with repositories and services

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit
- **UI Components**: Custom React components
- **Charts**: Chart.js with react-chartjs-2
- **Styling**: Custom CSS with glassmorphic design
- **Build Tool**: Create React App

## Getting Started

### Prerequisites
- .NET 8.0 SDK
- Node.js 16+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/frostaura/personal-budgeting-system.git
   cd personal-budgeting-system
   ```

2. **Set up the backend**
   ```bash
   cd BudgetingApi
   dotnet restore
   dotnet ef database update
   dotnet run --urls http://0.0.0.0:5000
   ```

3. **Set up the frontend** (in a new terminal)
   ```bash
   cd budgeting-frontend
   npm install
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Swagger Documentation: http://localhost:5000/swagger

## API Endpoints

The API provides comprehensive endpoints for managing your financial data:

### Dashboard
- `GET /api/dashboard/overview` - Get financial overview
- `GET /api/dashboard/account-balances` - Get account balance summary
- `GET /api/dashboard/monthly-trends` - Get monthly financial trends

### Accounts
- `GET /api/accounts` - List all accounts
- `POST /api/accounts` - Create new account
- `GET /api/accounts/{id}` - Get specific account
- `PUT /api/accounts/{id}` - Update account
- `DELETE /api/accounts/{id}` - Delete account

### Transactions
- `GET /api/transactions` - List all transactions
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/{id}` - Get specific transaction
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction

## Database Schema

The application uses a normalized database schema with the following entities:

- **Users**: User account information
- **Accounts**: Financial accounts (checking, savings, credit cards, etc.)
- **Transactions**: All financial transactions
- **Categories**: Transaction categories for organization
- **Budgets**: Budget tracking and management

## Screenshots

### Main Dashboard
The dashboard provides a comprehensive overview of your financial situation with beautiful glassmorphic cards and interactive charts.

![Dashboard](screenshots/dashboard.png)

### API Documentation
Comprehensive Swagger documentation for all API endpoints.

![API Documentation](screenshots/swagger.png)

## Configuration

### Database Configuration
The application uses SQLite by default for simplicity. To use PostgreSQL or SQL Server, update the connection string in `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Your connection string here"
  }
}
```

### CORS Configuration
The backend is configured to allow requests from the React development server. For production, update the CORS policy in `Program.cs`.

## Sample Data

The application automatically seeds sample data on first run, including:
- Demo user account
- Sample income and expense categories
- Various account types (checking, savings, investment, credit card)
- 6 months of sample transactions
- Realistic financial data for demonstration

## Development

### Running in Development Mode

1. **Backend** (with hot reload):
   ```bash
   cd BudgetingApi
   dotnet watch run --urls http://0.0.0.0:5000
   ```

2. **Frontend** (with hot reload):
   ```bash
   cd budgeting-frontend
   npm start
   ```

### Database Migrations

To create a new migration:
```bash
cd BudgetingApi
dotnet ef migrations add MigrationName
dotnet ef database update
```

### Testing

The project includes comprehensive API testing through Swagger UI. Additional unit and integration tests can be added using xUnit for the backend and Jest for the frontend.

## Production Deployment

### Backend Deployment
1. Build the application:
   ```bash
   dotnet publish -c Release -o ./publish
   ```
2. Deploy to your preferred hosting platform (Azure, AWS, etc.)
3. Update connection strings for production database
4. Configure HTTPS and security settings

### Frontend Deployment
1. Build for production:
   ```bash
   npm run build
   ```
2. Deploy the `build` folder to your web server or CDN

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced reporting and analytics
- [ ] Financial goal tracking
- [ ] Investment portfolio analysis
- [ ] Multi-user support
- [ ] Data export/import functionality
- [ ] Receipt scanning with OCR
- [ ] Banking integration (Open Banking)
- [ ] Cryptocurrency tracking
- [ ] Advanced budget forecasting

## Support

If you encounter any issues or have questions, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ using modern web technologies for the personal finance management community.**