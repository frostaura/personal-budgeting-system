# Comprehensive Regression Testing Pack

This document outlines the comprehensive regression testing approach implemented for the Personal Budgeting System frontend application.

## Overview

The regression testing pack ensures code quality and reliability before deployment by running multiple layers of automated checks and tests.

## Testing Layers

### 1. Code Formatting

- **Tool**: Prettier
- **Purpose**: Ensures consistent code style across the codebase
- **Command**: `npm run format:check`
- **Fix**: `npm run format`

### 2. Linting

- **Tool**: ESLint with TypeScript support
- **Purpose**: Identifies potential code issues, maintains coding standards
- **Command**: `npm run lint`
- **Fix**: `npm run lint:fix`

### 3. Type Checking

- **Tool**: TypeScript Compiler
- **Purpose**: Validates type safety and catches type-related errors
- **Command**: `npm run type-check`

### 4. Unit Testing

- **Tool**: Vitest with coverage reporting
- **Purpose**: Tests individual components and functions
- **Command**: `npm run test:coverage -- --run`
- **Coverage Report**: Generated in `./coverage/` directory

### 5. Build Verification

- **Tool**: Vite + TypeScript
- **Purpose**: Ensures the application builds successfully for production
- **Command**: `npm run build`
- **Output**: Production-ready artifacts in `./dist/` directory

### 6. End-to-End Testing

- **Tool**: Playwright
- **Purpose**: Tests complete user workflows across multiple browsers
- **Command**: `npm run test:e2e`
- **Browsers**: Chrome, Firefox, Safari (WebKit)

## Regression Pack Scripts

### `npm run regression-pack`

Full comprehensive testing including E2E tests. Requires Playwright browsers to be installed.

```bash
npm run regression-pack
```

### `npm run regression-pack:prod`

Production-ready testing that excludes E2E tests (for local development where browsers may not be installed).

```bash
npm run regression-pack:prod
```

## CI/CD Integration

The regression pack is integrated into the GitHub Actions workflow:

### Workflow Structure

1. **Test Job**: Runs comprehensive regression pack with E2E tests
2. **Build Job**: Creates production build (only runs if tests pass)
3. **Deploy Job**: Deploys to GitHub Pages (only runs if build succeeds)

### Quality Gates

- ✅ All formatting checks must pass
- ✅ All linting rules must pass
- ✅ TypeScript compilation must succeed
- ✅ All unit tests must pass
- ✅ Production build must complete successfully
- ✅ All E2E tests must pass (in CI environment)

### Failure Handling

- **Deployment is blocked** if any quality check fails
- **Detailed error reporting** with actionable feedback
- **Test artifacts** are preserved for debugging
- **Coverage reports** are generated and stored

## Local Development

### Prerequisites

```bash
# Install dependencies
npm install

# Install Playwright browsers (for E2E tests)
npx playwright install
```

### Running Tests Locally

```bash
# Quick production checks (without E2E)
npm run regression-pack:prod

# Full regression pack (with E2E)
npm run regression-pack

# Individual test types
npm run test              # Unit tests (watch mode)
npm run test:coverage     # Unit tests with coverage
npm run test:e2e          # E2E tests only
npm run lint              # Linting only
npm run type-check        # Type checking only
```

## Coverage Requirements

### Current Coverage

- **Statements**: ~19%
- **Branches**: ~35%
- **Functions**: ~10%
- **Lines**: ~19%

### Coverage Exclusions

- Test files (`src/test/`)
- Configuration files (`**/*.config.*`)
- Type definitions (`**/*.d.ts`)
- Build outputs (`dist/`, `coverage/`)
- Generated reports (`playwright-report/`, `test-results/`)

## Test Structure

### Unit Tests

- Location: `src/test/`
- Framework: Vitest + React Testing Library
- Focus: Component behavior, utility functions, business logic

### E2E Tests

- Location: `tests/e2e/`
- Framework: Playwright
- Focus: User workflows, integration between components

## Troubleshooting

### Common Issues

1. **Formatting Failures**

   ```bash
   npm run format  # Auto-fix formatting issues
   ```

2. **Linting Errors**

   ```bash
   npm run lint:fix  # Auto-fix linting issues
   ```

3. **E2E Test Failures (Browser Not Found)**

   ```bash
   npx playwright install  # Install browsers
   ```

4. **Type Errors**
   - Review TypeScript errors in terminal output
   - Check for missing type definitions or incorrect types

### Debugging Failed Tests

- Check the detailed error output in the regression pack summary
- Review generated test artifacts in `test-results/` and `playwright-report/`
- Use coverage reports to identify untested code paths

## Best Practices

### For Developers

1. **Run regression pack before committing** major changes
2. **Use production pack** for quick local validation
3. **Fix formatting and linting issues** immediately
4. **Maintain test coverage** when adding new features
5. **Update E2E tests** when adding new user workflows

### For Code Reviews

1. **Verify all quality checks pass** in CI
2. **Review coverage reports** for new code
3. **Ensure E2E tests cover** new user-facing features
4. **Check for proper error handling** in tests

## Continuous Improvement

The regression pack is designed to evolve with the project:

- **Add new test types** as needed
- **Increase coverage thresholds** over time
- **Optimize test performance** for faster feedback
- **Integrate additional quality tools** as the project grows

## Links

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
