# Personal Finance Planner - Frontend

A production-grade Personal Finance Planner built with React 18, TypeScript, and Material UI. This application provides deterministic financial projections and planning tools specifically designed for South African users.

## 🚀 Features

### Core Functionality
- **Financial Dashboard**: Overview of net worth, assets, and financial metrics
- **Account Management**: Track multiple account types (checking, savings, investments, etc.)
- **Cash Flow Tracking**: Manage recurring income and expenses with complex recurrence patterns
- **Financial Projections**: Deterministic projection engine with audit trail
- **Scenario Planning**: Compare different financial scenarios and what-if analyses
- **Settings Management**: Configure currency, tax settings, and preferences

### Technical Excellence
- **🎯 TypeScript**: Fully typed with strict mode enabled
- **⚡ Performance**: Route-level code splitting, memoized selectors, virtualized tables
- **♿ Accessibility**: WCAG AA compliant with keyboard navigation and screen reader support
- **🌍 Internationalization**: Defaults to South Africa (en-ZA, ZAR) with configurable formatting
- **🛡️ Resilience**: Global error boundaries, toast notifications, and data persistence
- **✅ Testing**: Comprehensive unit tests with Vitest and E2E tests with Playwright

### Tech Stack
- **Framework**: React 18 + TypeScript (strict), Vite, React Router
- **State Management**: Redux Toolkit + Reselect
- **Forms/Validation**: React Hook Form + Zod
- **UI Library**: Material UI (MUI) + MUI Data Grid + @mui/icons-material
- **Charts**: Recharts (theme-aware)
- **Dates/Recurrence**: date-fns + rrule + date-holidays (ZA)
- **Testing**: Vitest + @testing-library/react + fast-check + Playwright
- **Tooling**: ESLint, Prettier, Husky + lint-staged

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (ErrorBoundary, LoadingScreen, etc.)
│   ├── layout/         # Layout components (MainLayout, Sidebar)
│   └── routing/        # Routing configuration
├── pages/              # Page components (lazy-loaded)
├── store/              # Redux store and slices
│   └── slices/         # Redux toolkit slices
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── services/           # API and business logic
├── hooks/              # Custom React hooks
├── theme/              # Material UI theme configuration
└── test/               # Test utilities and setup
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm 9 or higher

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd src/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run test` - Run unit tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

## 🧪 Testing

### Unit Tests
```bash
npm run test                # Run tests in watch mode
npm run test -- --run       # Run tests once
npm run test:coverage       # Run with coverage report
```

### End-to-End Tests
```bash
npm run test:e2e            # Run E2E tests
```

### Property-Based Testing
The application uses `fast-check` for property-based testing of financial calculations to ensure correctness across a wide range of inputs.

## 🎨 Design System

The application uses Material UI with custom theming that supports:
- **Light/Dark Mode**: System preference detection with manual override
- **High Contrast**: WCAG AA compliance with enhanced contrast options
- **Responsive Design**: Mobile-first approach with breakpoints
- **South African Localization**: Currency formatting, date formats, and holidays

## 💰 Financial Features

### Money Handling
- All monetary values stored as **cents** (integers) to avoid floating-point precision issues
- Configurable currency settings with South African Rand (ZAR) as default
- Proper rounding and formatting according to locale standards

### Projection Engine
- **Deterministic**: Same inputs always produce same outputs
- **Auditable**: Complete audit trail of all calculations
- **Configurable**: Multiple scenarios and what-if analysis
- **Tax-Aware**: South African tax brackets and calculations

### Data Model
- **Accounts**: Assets, liabilities, investments with compound interest
- **Cash Flows**: Recurring transactions with complex recurrence patterns
- **Scenarios**: Spending adjustments, inflation, and salary growth modeling
- **Projections**: Month-by-month forecasts with detailed breakdowns

## ♿ Accessibility

The application is designed to be fully accessible:
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Color Contrast**: WCAG AA compliant color ratios
- **Reduced Motion**: Respects `prefers-reduced-motion` setting
- **Focus Management**: Clear focus indicators and logical tab order

## 🚀 Deployment

### GitHub Pages (Automatic)
The application is configured for automatic deployment to GitHub Pages via GitHub Actions:

1. Push to `main` branch triggers the workflow
2. Tests run automatically
3. Build artifacts are deployed to GitHub Pages
4. Available at: `https://username.github.io/personal-budgeting-system/`

### Manual Deployment
```bash
npm run build                # Build for production
# Deploy the `dist` folder to your hosting provider
```

## 🔧 Configuration

### Environment Variables
The application supports configuration via environment variables:
- `VITE_BASE_URL` - Base URL for deployment (default: `/personal-budgeting-system/`)
- `VITE_API_URL` - API endpoint URL (if using backend)

### Currency Settings
Default settings for South Africa can be customized in the application:
- Currency code (ZAR)
- Currency symbol (R)
- Locale (en-ZA)
- Rounding step (R500)

## 📊 Performance

The application is optimized for performance:
- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Page components loaded on demand
- **Memoization**: Redux selectors and React components memoized
- **Bundle Analysis**: Vite bundle analyzer for optimization
- **Tree Shaking**: Dead code elimination

## 🛡️ Security & Privacy

- **No External APIs**: All data stored locally in browser
- **Data Encryption**: Local storage encryption options
- **Privacy First**: No tracking or analytics by default
- **Disclaimer**: Clear legal disclaimers about financial advice

## 📄 Legal Disclaimer

**Important**: This application is for educational and planning purposes only. All projections and calculations should not be considered as professional financial advice. Always consult with qualified financial professionals before making important financial decisions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the coding standards
4. Run tests (`npm test` and `npm run test:e2e`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📋 Roadmap

- [ ] Advanced chart visualizations with Recharts
- [ ] Import/export functionality
- [ ] Mobile app (React Native)
- [ ] Advanced goal tracking
- [ ] Investment portfolio analysis
- [ ] Banking integration (Open Banking)
- [ ] Multi-currency support
- [ ] Advanced tax calculations
- [ ] Retirement planning tools
- [ ] Insurance planning modules

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

---

**Built with ❤️ for the South African personal finance community**