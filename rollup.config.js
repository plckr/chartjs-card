import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import serve from 'rollup-plugin-serve'

const dev = process.env.ROLLUP_WATCH

const serveopts = {
  contentBase: ['./dist'],
  host: '0.0.0.0',
  port: 5000,
  allowCrossOrigin: true,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
}

const plugins = [
  nodeResolve(),
  commonjs(),
  json({
    include: 'package.json',
    preferConst: true,
  }),
  dev && serve(serveopts),
]

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/chartjs-card.js',
    format: 'umd',
    name: 'Chartjs-card',
  },
  plugins: [...plugins],
}
