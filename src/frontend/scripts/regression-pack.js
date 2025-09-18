#!/usr/bin/env node

/**
 * Comprehensive Regression Pack
 *
 * This script runs all quality checks and tests that must pass before deployment:
 * - Code formatting checks
 * - Linting
 * - Type checking
 * - Unit tests with coverage
 * - Build verification
 * - E2E tests (if browsers are available)
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
  log('', colors.reset);
  log('='.repeat(60), colors.cyan);
  log(`${colors.bright}${message}`, colors.cyan);
  log('='.repeat(60), colors.cyan);
}

function logStep(step, message) {
  log(`${colors.bright}[${step}]${colors.reset} ${message}`, colors.blue);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

async function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options,
    });

    child.on('close', code => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(
          new Error(
            `Command failed with exit code ${code}: ${command} ${args.join(' ')}`
          )
        );
      }
    });

    child.on('error', error => {
      reject(error);
    });
  });
}

async function checkFormatting() {
  logStep('1/6', 'Checking code formatting...');
  try {
    await runCommand('npm', ['run', 'format:check']);
    logSuccess('Code formatting check passed');
    return true;
  } catch (error) {
    logError('Code formatting check failed');
    logWarning('Run "npm run format" to fix formatting issues');
    return false;
  }
}

async function runLinting() {
  logStep('2/6', 'Running ESLint...');
  try {
    await runCommand('npm', ['run', 'lint']);
    logSuccess('Linting passed');
    return true;
  } catch (error) {
    logError('Linting failed');
    logWarning('Run "npm run lint:fix" to fix auto-fixable issues');
    return false;
  }
}

async function runTypeCheck() {
  logStep('3/6', 'Running TypeScript type checking...');
  try {
    await runCommand('npm', ['run', 'type-check']);
    logSuccess('Type checking passed');
    return true;
  } catch (error) {
    logError('Type checking failed');
    return false;
  }
}

async function runUnitTests() {
  logStep('4/6', 'Running unit tests with coverage...');
  try {
    await runCommand('npm', ['run', 'test:coverage', '--', '--run']);
    logSuccess('Unit tests passed');
    return true;
  } catch (error) {
    logError('Unit tests failed');
    return false;
  }
}

async function runBuild() {
  logStep('5/6', 'Running production build...');
  try {
    await runCommand('npm', ['run', 'build']);
    logSuccess('Production build succeeded');
    return true;
  } catch (error) {
    logError('Production build failed');
    return false;
  }
}

async function runE2ETests() {
  logStep('6/6', 'Running E2E tests...');

  // Check if Playwright browsers are installed
  const playwrightBrowsers = path.join(
    process.env.HOME || '',
    '.cache',
    'ms-playwright'
  );
  const browsersAvailable = fs.existsSync(playwrightBrowsers);

  if (!browsersAvailable) {
    logWarning('Playwright browsers not installed, skipping E2E tests');
    logWarning('Run "npx playwright install" to enable E2E testing');
    return true; // Don't fail the regression pack for missing browsers
  }

  try {
    await runCommand('npm', ['run', 'test:e2e']);
    logSuccess('E2E tests passed');
    return true;
  } catch (error) {
    logError('E2E tests failed');
    return false;
  }
}

async function generateCoverageReport() {
  const coverageDir = path.join(process.cwd(), 'coverage');
  if (fs.existsSync(coverageDir)) {
    log('', colors.reset);
    log('📊 Coverage Report Generated:', colors.magenta);
    log(
      `   View detailed report: ${path.join(coverageDir, 'index.html')}`,
      colors.magenta
    );
  }
}

async function main() {
  const startTime = Date.now();

  logHeader('🧪 COMPREHENSIVE REGRESSION PACK');
  log(
    'Running all quality checks and tests before deployment...',
    colors.bright
  );

  const results = [];
  const checks = [
    { name: 'Code Formatting', fn: checkFormatting },
    { name: 'Linting', fn: runLinting },
    { name: 'Type Checking', fn: runTypeCheck },
    { name: 'Unit Tests', fn: runUnitTests },
    { name: 'Production Build', fn: runBuild },
    { name: 'E2E Tests', fn: runE2ETests },
  ];

  for (const check of checks) {
    try {
      const result = await check.fn();
      results.push({ name: check.name, passed: result });
    } catch (error) {
      results.push({ name: check.name, passed: false, error: error.message });
    }
  }

  // Generate summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  logHeader('📋 REGRESSION PACK SUMMARY');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  results.forEach(result => {
    if (result.passed) {
      logSuccess(`${result.name}`);
    } else {
      logError(`${result.name}`);
      if (result.error) {
        log(`   ${result.error}`, colors.red);
      }
    }
  });

  log('', colors.reset);
  log(`⏱️  Total time: ${duration}s`, colors.cyan);
  log(`✅ Passed: ${passed}`, colors.green);
  log(`❌ Failed: ${failed}`, colors.red);

  await generateCoverageReport();

  if (failed > 0) {
    log('', colors.reset);
    logError('🚫 REGRESSION PACK FAILED');
    logError('❌ Deployment blocked - fix the failing checks above');
    process.exit(1);
  } else {
    log('', colors.reset);
    logSuccess('🎉 REGRESSION PACK PASSED');
    logSuccess('✅ All quality checks passed - ready for deployment!');
    process.exit(0);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', error => {
  logError(`Unhandled error: ${error.message}`);
  process.exit(1);
});

// Run the regression pack
main().catch(error => {
  logError(`Regression pack failed: ${error.message}`);
  process.exit(1);
});
