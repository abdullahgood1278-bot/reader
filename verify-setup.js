#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Speed Reader setup...\n');

let allGood = true;

const checks = [
  {
    name: 'Root package.json',
    path: './package.json',
    required: true,
  },
  {
    name: 'Backend package.json',
    path: './backend/package.json',
    required: true,
  },
  {
    name: 'Frontend package.json',
    path: './frontend/package.json',
    required: true,
  },
  {
    name: 'Backend .env file',
    path: './backend/.env',
    required: false,
    warning: 'Copy backend/.env.example to backend/.env and configure it',
  },
  {
    name: 'Frontend .env file',
    path: './frontend/.env',
    required: false,
    warning: 'Optional: Copy frontend/.env.example to frontend/.env',
  },
  {
    name: 'Backend uploads directory',
    path: './backend/uploads',
    required: true,
    isDir: true,
  },
  {
    name: 'Database migration',
    path: './backend/src/migrations/init.sql',
    required: true,
  },
];

checks.forEach(check => {
  const exists = fs.existsSync(check.path);
  
  if (exists) {
    if (check.isDir) {
      const isDir = fs.statSync(check.path).isDirectory();
      if (isDir) {
        console.log(`✅ ${check.name}`);
      } else {
        console.log(`❌ ${check.name} (not a directory)`);
        allGood = false;
      }
    } else {
      console.log(`✅ ${check.name}`);
    }
  } else {
    if (check.required) {
      console.log(`❌ ${check.name} (missing - required)`);
      allGood = false;
    } else {
      console.log(`⚠️  ${check.name} (missing - ${check.warning || 'optional'})`);
    }
  }
});

console.log('\n📦 Checking node_modules...');
const hasRootModules = fs.existsSync('./node_modules');
const hasBackendModules = fs.existsSync('./backend/node_modules');
const hasFrontendModules = fs.existsSync('./frontend/node_modules');

if (!hasRootModules && !hasBackendModules && !hasFrontendModules) {
  console.log('❌ No node_modules found. Run: npm install');
  allGood = false;
} else {
  console.log('✅ Dependencies installed');
}

console.log('\n📋 Next steps:');
console.log('1. Set up PostgreSQL database (see SETUP.md)');
console.log('2. Copy backend/.env.example to backend/.env and configure');
console.log('3. Run: npm run dev');
console.log('4. Visit: http://localhost:3000');

if (allGood) {
  console.log('\n✨ Setup looks good! Ready to start development.\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Some required files are missing. Please check above.\n');
  process.exit(1);
}
