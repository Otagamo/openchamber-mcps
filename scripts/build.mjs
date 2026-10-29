import { build, context } from 'esbuild';

const shared = {
  bundle: true,
  loader: { '.css': 'text' },
  logLevel: 'info',
};

const panel = {
  ...shared,
  entryPoints: ['src/panel/main.ts'],
  outfile: 'panel/main.js',
  format: 'iife',
  platform: 'browser',
  target: 'es2022',
  minify: true,
};

const service = {
  ...shared,
  entryPoints: ['src/service/main.ts'],
  outfile: 'service/main.js',
  format: 'esm',
  platform: 'node',
  target: 'node22',
  packages: 'external',
};

if (process.argv.includes('--watch')) {
  const contexts = await Promise.all([context(panel), context(service)]);
  await Promise.all(contexts.map((item) => item.watch()));
  console.log('watching…');
} else {
  await Promise.all([build(panel), build(service)]);
  console.log('built panel/main.js and service/main.js');
}
