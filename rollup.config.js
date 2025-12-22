import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { defineConfig } from 'rollup';
import serve from 'rollup-plugin-serve';

const dev = !!process.env.ROLLUP_WATCH;

const serveopts = {
  contentBase: ['./dist'],
  host: '0.0.0.0',
  port: 4000,
  allowCrossOrigin: true,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
};

const plugins = [
  nodeResolve(),
  commonjs(),
  json({
    include: 'package.json',
    preferConst: true,
  }),
  dev && serve(serveopts),
];

export default defineConfig({
  input: 'src/index.js',
  output: {
    file: 'dist/chartjs-card.js',
    format: 'es',
    inlineDynamicImports: true,
  },
  plugins,
});
