/** @type {import('next').NextConfig} */
// keeping things consistent with the examples
const fs = require('fs');

// reads from .env to expose values to the client
const file = fs.readFileSync('./.env', 'utf8');
const lines = file.split("\n");
const runtimeConfig = lines.reduce((accum, line) => {
  if (line.startsWith('#') || !line)  {
    return accum;
  }
  const [name, value] = line.split('=');
  accum[name] = value;
  return accum;
}, {});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  publicRuntimeConfig: runtimeConfig,
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
