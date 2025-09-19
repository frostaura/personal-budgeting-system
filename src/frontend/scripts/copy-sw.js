#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Copy service worker and PWA assets to dist folder
const publicDir = path.join(__dirname, '../public');
const distDir = path.join(__dirname, '../dist');

const filesToCopy = [
  'sw.js',
  'manifest.json',
  'vite.svg',
  'icon-192.png',
  'icon-512.png'
];

console.log('Copying PWA assets to dist folder...');

filesToCopy.forEach(file => {
  const srcPath = path.join(publicDir, file);
  const destPath = path.join(distDir, file);
  
  try {
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`✓ Copied ${file}`);
    } else {
      console.warn(`⚠ Warning: ${file} not found in public folder`);
    }
  } catch (error) {
    console.error(`✗ Failed to copy ${file}:`, error.message);
  }
});

console.log('PWA assets copy completed!');