import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
    input: './src/browser.js',
    output: {
        file: './dist/tagger.js',
        format: 'umd',
        name: 'TGR'
    },
    plugins: [
        nodeResolve({
            jsnext: true,
            main: true
        }),
        commonjs()
    ]
};
