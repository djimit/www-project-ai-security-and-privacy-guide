/**
 * Build script for OWASP AI Security Exchange
 * Uses esbuild for fast bundling and optimization
 */

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const isDev = process.argv.includes('--watch');
const isProd = process.env.NODE_ENV === 'production' || process.argv.includes('--prod');
const analyze = process.argv.includes('--analyze');

// Build configuration
const config = {
  entryPoints: [
    'static/js/gamification.js',
    'static/js/threat-modeler.js'
  ],
  bundle: false, // We'll keep modules separate for now, can enable later
  outdir: 'static/js/dist',
  minify: isProd,
  sourcemap: !isProd,
  target: ['es2020', 'chrome90', 'firefox88', 'safari14'],
  format: 'iife', // Immediately Invoked Function Expression for browser
  platform: 'browser',
  logLevel: 'info',
  define: {
    'process.env.NODE_ENV': isProd ? '"production"' : '"development"',
  },
};

// CSS build configuration
const cssConfig = {
  entryPoints: [
    'static/css/gamification.css',
    'static/css/threat-modeler.css'
  ],
  outdir: 'static/css/dist',
  minify: isProd,
  sourcemap: !isProd,
  loader: { '.css': 'css' },
  logLevel: 'info',
};

async function build() {
  try {
    console.log('🚀 Starting build...');
    console.log(`📦 Mode: ${isProd ? 'Production' : 'Development'}`);

    // Clean dist directories
    if (fs.existsSync('static/js/dist')) {
      fs.rmSync('static/js/dist', { recursive: true });
    }
    if (fs.existsSync('static/css/dist')) {
      fs.rmSync('static/css/dist', { recursive: true });
    }

    fs.mkdirSync('static/js/dist', { recursive: true });
    fs.mkdirSync('static/css/dist', { recursive: true });

    // Build JavaScript
    console.log('📦 Building JavaScript...');
    const jsResult = await esbuild.build(config);

    // Build CSS
    console.log('🎨 Building CSS...');
    const cssResult = await esbuild.build(cssConfig);

    // Additional minification for production
    if (isProd) {
      console.log('🔧 Additional minification...');
      await minifyAssets();
    }

    // Generate bundle report
    console.log('📊 Analyzing bundle sizes...');
    await analyzeBundles();

    // Generate integrity hashes
    if (isProd) {
      console.log('🔐 Generating integrity hashes...');
      generateIntegrityHashes();
    }

    console.log('✅ Build complete!');

    if (analyze) {
      console.log('\n📊 Bundle Analysis:');
      displayBundleAnalysis();
    }

  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

async function minifyAssets() {
  const terser = require('terser');
  const cssnano = require('cssnano');
  const postcss = require('postcss');

  // Minify JavaScript files
  const jsFiles = fs.readdirSync('static/js/dist').filter(f => f.endsWith('.js'));

  for (const file of jsFiles) {
    const filePath = path.join('static/js/dist', file);
    const code = fs.readFileSync(filePath, 'utf8');

    const minified = await terser.minify(code, {
      compress: {
        dead_code: true,
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: {
        toplevel: true,
      },
      output: {
        comments: false,
      },
    });

    const minFile = file.replace('.js', '.min.js');
    fs.writeFileSync(path.join('static/js/dist', minFile), minified.code);
    console.log(`  ✓ Minified ${file} → ${minFile}`);
  }

  // Minify CSS files
  const cssFiles = fs.readdirSync('static/css/dist').filter(f => f.endsWith('.css'));

  for (const file of cssFiles) {
    const filePath = path.join('static/css/dist', file);
    const css = fs.readFileSync(filePath, 'utf8');

    const result = await postcss([cssnano({ preset: 'default' })]).process(css, {
      from: filePath,
      to: filePath.replace('.css', '.min.css'),
    });

    const minFile = file.replace('.css', '.min.css');
    fs.writeFileSync(path.join('static/css/dist', minFile), result.css);
    console.log(`  ✓ Minified ${file} → ${minFile}`);
  }
}

async function analyzeBundles() {
  const jsDir = 'static/js/dist';
  const cssDir = 'static/css/dist';

  const analysis = {
    javascript: [],
    css: [],
    total: { original: 0, minified: 0, gzipped: 0 }
  };

  // Analyze JavaScript
  if (fs.existsSync(jsDir)) {
    const files = fs.readdirSync(jsDir);

    for (const file of files) {
      const filePath = path.join(jsDir, file);
      const stats = fs.statSync(filePath);
      const size = stats.size;

      // Estimate gzipped size (roughly 30-40% of original)
      const gzippedSize = Math.round(size * 0.35);

      analysis.javascript.push({
        file,
        size,
        sizeKB: (size / 1024).toFixed(2),
        gzippedKB: (gzippedSize / 1024).toFixed(2),
        isMinified: file.includes('.min.')
      });

      if (file.includes('.min.')) {
        analysis.total.minified += size;
        analysis.total.gzipped += gzippedSize;
      } else {
        analysis.total.original += size;
      }
    }
  }

  // Analyze CSS
  if (fs.existsSync(cssDir)) {
    const files = fs.readdirSync(cssDir);

    for (const file of files) {
      const filePath = path.join(cssDir, file);
      const stats = fs.statSync(filePath);
      const size = stats.size;
      const gzippedSize = Math.round(size * 0.30);

      analysis.css.push({
        file,
        size,
        sizeKB: (size / 1024).toFixed(2),
        gzippedKB: (gzippedSize / 1024).toFixed(2),
        isMinified: file.includes('.min.')
      });

      if (file.includes('.min.')) {
        analysis.total.minified += size;
        analysis.total.gzipped += gzippedSize;
      } else {
        analysis.total.original += size;
      }
    }
  }

  // Save analysis
  fs.writeFileSync(
    'build-analysis.json',
    JSON.stringify(analysis, null, 2)
  );

  return analysis;
}

function displayBundleAnalysis() {
  if (!fs.existsSync('build-analysis.json')) {
    console.log('No analysis file found');
    return;
  }

  const analysis = JSON.parse(fs.readFileSync('build-analysis.json', 'utf8'));

  console.log('\n📦 JavaScript Bundles:');
  analysis.javascript.forEach(file => {
    const icon = file.isMinified ? '📦' : '📄';
    console.log(`  ${icon} ${file.file}: ${file.sizeKB} KB (${file.gzippedKB} KB gzipped)`);
  });

  console.log('\n🎨 CSS Bundles:');
  analysis.css.forEach(file => {
    const icon = file.isMinified ? '📦' : '📄';
    console.log(`  ${icon} ${file.file}: ${file.sizeKB} KB (${file.gzippedKB} KB gzipped)`);
  });

  const totalMinifiedKB = (analysis.total.minified / 1024).toFixed(2);
  const totalGzippedKB = (analysis.total.gzipped / 1024).toFixed(2);

  console.log(`\n📊 Total (Minified): ${totalMinifiedKB} KB`);
  console.log(`📊 Total (Gzipped): ${totalGzippedKB} KB`);

  // Check against budgets
  const budget = {
    javascript: 50, // 50 KB per file
    css: 30, // 30 KB per file
    total: 150 // 150 KB total (gzipped)
  };

  console.log('\n💰 Performance Budget:');

  const totalGzipped = analysis.total.gzipped / 1024;
  if (totalGzipped > budget.total) {
    console.log(`  ⚠️  Total exceeds budget: ${totalGzippedKB} KB > ${budget.total} KB`);
  } else {
    const remaining = budget.total - totalGzipped;
    console.log(`  ✅ Total within budget: ${totalGzippedKB} KB / ${budget.total} KB (${remaining.toFixed(2)} KB remaining)`);
  }
}

function generateIntegrityHashes() {
  const crypto = require('crypto');

  const hashes = {};

  // Hash JavaScript files
  const jsFiles = fs.readdirSync('static/js/dist').filter(f => f.endsWith('.min.js'));
  jsFiles.forEach(file => {
    const content = fs.readFileSync(path.join('static/js/dist', file));
    const hash = crypto.createHash('sha384').update(content).digest('base64');
    hashes[file] = `sha384-${hash}`;
  });

  // Hash CSS files
  const cssFiles = fs.readdirSync('static/css/dist').filter(f => f.endsWith('.min.css'));
  cssFiles.forEach(file => {
    const content = fs.readFileSync(path.join('static/css/dist', file));
    const hash = crypto.createHash('sha384').update(content).digest('base64');
    hashes[file] = `sha384-${hash}`;
  });

  fs.writeFileSync(
    'static/integrity-hashes.json',
    JSON.stringify(hashes, null, 2)
  );

  console.log('  ✓ Generated SRI hashes for all assets');
}

// Watch mode
if (isDev) {
  console.log('👀 Watch mode enabled');

  esbuild.context(config).then(ctx => {
    ctx.watch();
    console.log('Watching for JavaScript changes...');
  });

  esbuild.context(cssConfig).then(ctx => {
    ctx.watch();
    console.log('Watching for CSS changes...');
  });
} else {
  build();
}

module.exports = { build, analyzeBundles };
