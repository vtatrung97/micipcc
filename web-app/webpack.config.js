const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

const mfConfig = withModuleFederationPlugin({
  name: 'processX',
  exposes: {
    './ProcessXModule': './src/app/pages/pages.module.ts',
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },
});

module.exports = {
  ...mfConfig,
    resolve: {
      ...mfConfig.resolve,
      fallback: {
        url: false
      }
    },
    output: {
      ...mfConfig.output,
      scriptType: 'text/javascript'
    },
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*'
    }
  },
  watchOptions: {
    ignored: [
      '**/.angular/**',
      '**/node_modules/**',
      '**/.git/**'
    ]
  }
};
