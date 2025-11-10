/**
 * Compress assets with gzip and brotli
 * Generates pre-compressed files for server-side delivery
 */

const fs = require('fs');
const path = require('path');
const { gzipSync, brotliCompressSync } = require('zlib');

const COMPRESSION_QUALITY = {
  gzip: { level: 9 },
  brotli: {
    params: {
      [require('zlib').constants.BROTLI_PARAM_QUALITY]: 11,
      [require('zlib').constants.BROTLI_PARAM_SIZE_HINT]: 0
    }
  }
};

function compressFile(filePath) {
  const content = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);

  // Gzip compression
  const gzipped = gzipSync(content, COMPRESSION_QUALITY.gzip);
  fs.writeFileSync(`${filePath}.gz`, gzipped);

  // Brotli compression
  const brotli = brotliCompressSync(content, COMPRESSION_QUALITY.brotli);
  fs.writeFileSync(`${filePath}.br`, brotli);

  const originalSize = content.length;
  const gzipSize = gzipped.length;
  const brotliSize = brotli.length;

  const gzipRatio = ((1 - gzipSize / originalSize) * 100).toFixed(1);
  const brotliRatio = ((1 - brotliSize / originalSize) * 100).toFixed(1);

  console.log(`  ✓ ${fileName}:`);
  console.log(`    Original: ${(originalSize / 1024).toFixed(2)} KB`);
  console.log(`    Gzip: ${(gzipSize / 1024).toFixed(2)} KB (${gzipRatio}% reduction)`);
  console.log(`    Brotli: ${(brotliSize / 1024).toFixed(2)} KB (${brotliRatio}% reduction)`);
}

function compressDirectory(dir, extensions = ['.js', '.css', '.json', '.svg']) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory not found: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      compressDirectory(filePath, extensions);
    } else if (stat.isFile()) {
      const ext = path.extname(file);
      if (extensions.includes(ext) && !file.includes('.gz') && !file.includes('.br')) {
        compressFile(filePath);
      }
    }
  });
}

console.log('🗜️  Compressing assets...\n');

// Compress JavaScript
console.log('📦 Compressing JavaScript:');
compressDirectory('static/js/dist', ['.js']);

// Compress CSS
console.log('\n🎨 Compressing CSS:');
compressDirectory('static/css/dist', ['.css']);

// Compress JSON data files
console.log('\n📄 Compressing JSON data:');
compressDirectory('data', ['.json']);

console.log('\n✅ Compression complete!');
console.log('\n💡 Tip: Configure your web server to serve .gz or .br files when available');
console.log('   For Firebase: Add rewrite rules in firebase.json');
console.log('   For Nginx: Enable gzip_static and brotli_static modules');
