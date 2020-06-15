import nodeResolve from 'rollup-plugin-node-resolve';

const plugins = [
  nodeResolve({})
];

export default [
  {
    input: 'src/index.js',
    output: {
      file: 'dist/chartjs-card.js',
      format: 'umd',
      name: 'Chartjs-card'
    },
    plugins: [...plugins],
  },
];
