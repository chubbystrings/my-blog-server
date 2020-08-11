module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
        useBuiltIns: false,
      },

    ],
  ],
  plugins: ['@babel/plugin-syntax-bigint', '@babel/plugin-transform-runtime'],
};
