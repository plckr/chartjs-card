import fs from 'fs';

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';
import serve from 'rollup-plugin-serve';

const dev = !!process.env.ROLLUP_WATCH;

const outputFile = 'dist/chartjs-card.js';

export default defineConfig(() => ({
  input: 'src/index.ts',
  output: {
    file: outputFile,
    format: 'es',
    inlineDynamicImports: true,
  },
  plugins,
}));

const plugins = [
  nodeResolve(),
  commonjs(),
  json({ include: 'package.json' }),
  typescript(),
  serveOrTerse(),
];

/**
 * @returns {import('rollup').Plugin}
 */
function serveOrTerse() {
  if (dev) {
    return serve({
      contentBase: ['./dist'],
      host: '0.0.0.0',
      port: 4000,
      allowCrossOrigin: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  return [
    terser({
      format: {
        comments: false,
      },
    }),
    outputBundleSize(),
  ];
}

/**
 * @returns {import('rollup').Plugin}
 */
function outputBundleSize() {
  return {
    name: 'bundle-size',
    closeBundle() {
      const file = outputFile;
      const size = fs.statSync(file).size;
      const kb = (size / 1024).toFixed(2);
      console.info(`\n📦 Bundle size: ${kb} KB`);
    },
  };
}
