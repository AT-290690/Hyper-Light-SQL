import { nodeResolve } from '@rollup/plugin-node-resolve';
import { uglify } from 'rollup-plugin-uglify';

export default {
  input: './editor.js',
  output: {
    format: 'esm',
    file: './editor.bundle.js',
    inlineDynamicImports: true
  },
  plugins: [uglify(), nodeResolve()]
};
