/**
 * Bundle Size Checker
 * Validates that bundle sizes stay within performance budgets
 */

const fs = require('fs');
const path = require('path');

// Performance budgets (in KB)
const BUDGETS = {
  javascript: {
    perFile: 50,    // 50 KB per JavaScript file (gzipped)
    total: 100      // 100 KB total JavaScript (gzipped)
  },
  css: {
    perFile: 30,    // 30 KB per CSS file (gzipped)
    total: 60       // 60 KB total CSS (gzipped)
  },
  data: {
    perFile: 100,   // 100 KB per JSON file (gzipped)
    total: 300      // 300 KB total data files (gzipped)
  },
  total: {
    initial: 200,   // 200 KB for initial page load (gzipped)
    all: 500        // 500 KB for entire app (gzipped)
  }
};

// Estimate gzip compression ratio
const GZIP_RATIO = 0.35; // Typically 30-40% of original size

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

function estimateGzipSize(size) {
  return Math.round(size * GZIP_RATIO);
}

function checkDirectory(dir, fileType, budget) {
  if (!fs.existsSync(dir)) {
    return { files: [], totalSize: 0, totalGzipped: 0, withinBudget: true };
  }

  const files = fs.readdirSync(dir);
  const results = [];
  let totalSize = 0;
  let totalGzipped = 0;
  let violations = [];

  files.forEach(file => {
    if (file.includes('.min.')) {
      const filePath = path.join(dir, file);
      const size = getFileSize(filePath);
      const gzippedSize = estimateGzipSize(size);
      const sizeKB = gzippedSize / 1024;

      totalSize += size;
      totalGzipped += gzippedSize;

      const withinBudget = sizeKB <= budget.perFile;

      results.push({
        file,
        size,
        sizeKB: (size / 1024).toFixed(2),
        gzippedKB: sizeKB.toFixed(2),
        budget: budget.perFile,
        withinBudget
      });

      if (!withinBudget) {
        violations.push({
          file,
          size: sizeKB.toFixed(2),
          budget: budget.perFile,
          overage: (sizeKB - budget.perFile).toFixed(2)
        });
      }
    }
  });

  const totalKB = totalGzipped / 1024;
  const totalWithinBudget = totalKB <= budget.total;

  if (!totalWithinBudget) {
    violations.push({
      file: 'TOTAL',
      size: totalKB.toFixed(2),
      budget: budget.total,
      overage: (totalKB - budget.total).toFixed(2)
    });
  }

  return {
    files: results,
    totalSize,
    totalGzipped,
    totalKB: totalKB.toFixed(2),
    budget: budget.total,
    withinBudget: totalWithinBudget && violations.length === 0,
    violations
  };
}

function displayResults(name, results) {
  console.log(`\n📦 ${name}:`);

  results.files.forEach(file => {
    const icon = file.withinBudget ? '✅' : '❌';
    const status = file.withinBudget ? 'OK' : `EXCEEDS by ${(file.gzippedKB - file.budget).toFixed(2)} KB`;
    console.log(`  ${icon} ${file.file}: ${file.gzippedKB} KB / ${file.budget} KB (${status})`);
  });

  const totalIcon = results.withinBudget ? '✅' : '❌';
  const totalStatus = results.withinBudget ? 'OK' : `EXCEEDS by ${(results.totalKB - results.budget).toFixed(2)} KB`;
  console.log(`  ${totalIcon} Total: ${results.totalKB} KB / ${results.budget} KB (${totalStatus})`);

  if (results.violations.length > 0) {
    console.log(`\n  ⚠️  Budget Violations:`);
    results.violations.forEach(v => {
      console.log(`     - ${v.file}: ${v.size} KB exceeds ${v.budget} KB budget by ${v.overage} KB`);
    });
  }
}

console.log('💰 Checking Performance Budgets...\n');
console.log('Budget Configuration:');
console.log(`  JavaScript: ${BUDGETS.javascript.perFile} KB per file, ${BUDGETS.javascript.total} KB total`);
console.log(`  CSS: ${BUDGETS.css.perFile} KB per file, ${BUDGETS.css.total} KB total`);
console.log(`  Data: ${BUDGETS.data.perFile} KB per file, ${BUDGETS.data.total} KB total`);
console.log(`  Total: ${BUDGETS.total.initial} KB initial load, ${BUDGETS.total.all} KB all assets`);

// Check JavaScript
const jsResults = checkDirectory('static/js/dist', 'JavaScript', BUDGETS.javascript);
displayResults('JavaScript', jsResults);

// Check CSS
const cssResults = checkDirectory('static/css/dist', 'CSS', BUDGETS.css);
displayResults('CSS', cssResults);

// Check Data Files
const dataResults = checkDirectory('data', 'Data Files', BUDGETS.data);
displayResults('Data Files', dataResults);

// Overall Summary
const grandTotal = jsResults.totalGzipped + cssResults.totalGzipped + dataResults.totalGzipped;
const grandTotalKB = grandTotal / 1024;

console.log('\n📊 Overall Summary:');
console.log(`  Total Assets: ${grandTotalKB.toFixed(2)} KB (gzipped)`);
console.log(`  Initial Load Budget: ${BUDGETS.total.initial} KB`);
console.log(`  Total Budget: ${BUDGETS.total.all} KB`);

const initialPageAssets = jsResults.totalGzipped + cssResults.totalGzipped;
const initialPageKB = initialPageAssets / 1024;

console.log(`\n  Initial Page Load: ${initialPageKB.toFixed(2)} KB`);

if (initialPageKB <= BUDGETS.total.initial) {
  console.log(`  ✅ Initial load within budget (${(BUDGETS.total.initial - initialPageKB).toFixed(2)} KB remaining)`);
} else {
  console.log(`  ❌ Initial load EXCEEDS budget by ${(initialPageKB - BUDGETS.total.initial).toFixed(2)} KB`);
}

if (grandTotalKB <= BUDGETS.total.all) {
  console.log(`  ✅ Total assets within budget (${(BUDGETS.total.all - grandTotalKB).toFixed(2)} KB remaining)`);
} else {
  console.log(`  ❌ Total assets EXCEED budget by ${(grandTotalKB - BUDGETS.total.all).toFixed(2)} KB`);
}

// Exit with error if budgets violated
const allWithinBudget = jsResults.withinBudget && cssResults.withinBudget && dataResults.withinBudget &&
                        initialPageKB <= BUDGETS.total.initial && grandTotalKB <= BUDGETS.total.all;

if (!allWithinBudget) {
  console.log('\n❌ Performance budget check FAILED');
  console.log('💡 Tips to reduce bundle size:');
  console.log('   - Enable tree-shaking for unused code');
  console.log('   - Lazy load non-critical features');
  console.log('   - Compress images and assets');
  console.log('   - Split large files into chunks');
  console.log('   - Remove console.log statements');
  console.log('   - Minify JSON data files');
  process.exit(1);
} else {
  console.log('\n✅ All performance budgets met!');
  process.exit(0);
}
