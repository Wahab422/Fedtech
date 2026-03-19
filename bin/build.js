const esbuild = require('esbuild');
const fs = require('fs');

// Configuration
const ENTRY_POINTS = ['src/index.js', 'src/index.css'];
// Vercel serves `dist/` (see `vercel.json`), so build there.
const OUTPUT_DIR = 'dist';
const DEV_MODE = process.argv.includes('--dev');
const ENABLE_LIVE_RELOAD = true;

// esbuild configuration
const buildConfig = {
  entryPoints: ENTRY_POINTS,
  bundle: true,
  minify: !DEV_MODE,
  sourcemap: DEV_MODE,
  target: ['es2020'],
  outdir: OUTPUT_DIR,
  entryNames: '[name]',
  format: 'iife',
  platform: 'browser',
  logLevel: 'info',
  // Performance optimizations
  treeShaking: true,
  splitting: false, // IIFE doesn't support splitting
  metafile: !DEV_MODE, // Generate metadata for analysis
  drop: DEV_MODE ? [] : ['console', 'debugger'], // Remove console.log in production
  legalComments: 'none', // Remove comments in production
};

// Live reload script injected in dev mode
const liveReloadScript = `
(function() {
  const source = new EventSource('http://localhost:35729/esbuild');
  source.addEventListener('change', () => {
    location.reload();
  });
  source.addEventListener('error', (e) => {
    if (e.target.readyState === EventSource.CLOSED) {
      console.log('[Live Reload] Connection closed');
    }
  });
  console.log('[Live Reload] Listening for changes...');
})();
`;

async function build() {
  try {
    // Clean output dir so old chunk files don't linger
    try {
      fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
    } catch (e) {
      // ignore
    }

    if (DEV_MODE) {
      console.log('🚀 Starting development mode...\n');

      // Create context for watch mode
      const ctx = await esbuild.context({
        ...buildConfig,
        banner: ENABLE_LIVE_RELOAD
          ? {
              js: liveReloadScript,
            }
          : undefined,
      });

      // Enable watch mode
      await ctx.watch();

      // Serve files with live reload
      const { host, port } = await ctx.serve({
        servedir: OUTPUT_DIR,
        port: 3000,
        host: 'localhost',
      });

      console.log(`✅ Development server running at http://${host}:${port}`);
      console.log(`📦 Add this to your Webflow project settings:\n`);
      console.log(`<script src="http://${host}:${port}/index.js"></script>`);
      console.log(`<link rel="stylesheet" href="http://${host}:${port}/index.css">`);
      console.log('');
      console.log('👀 Watching for changes...\n');
    } else {
      console.log('🏗️  Building for production...\n');
      await esbuild.build(buildConfig);
      console.log('✅ Production build complete!\n');
      console.log(
        `📦 Upload dist/index.js and dist/index.css to your hosting and add them to Webflow project settings.\n`
      );
    }
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
