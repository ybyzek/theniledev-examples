/** @type {import('next').NextConfig} */
// keeping things consistent with the examples
const fs = require('fs');

const envPath = './.env';
let runtimeConfig = {};

try {
  // reads from .env to expose values to the client
  const file = fs.readFileSync(envPath, 'utf8');
  const lines = file.split("\n");
  runtimeConfig = lines.reduce((accum, line) => {
    if (line.startsWith('#') || !line)  {
      return accum;
    }
    const [name, value] = line.split('=');
    accum[name] = value;
    return accum;
  }, {});

} catch(err) {
  console.warn('[WARN] local .env file missing, unable to load runtime configs.')
}

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  publicRuntimeConfig: runtimeConfig,
  // uncomment the following block to use hardcoded values 
  /*
  publicRuntimeConfig: {
    NILE_WORKSPACE: '<Enter workspace>',
    NILE_URL: 'https://prod.thenile.dev',
    NILE_ENTITY_NAME: 'SaaSDB'
  },
  */
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
}

module.exports = nextConfig
