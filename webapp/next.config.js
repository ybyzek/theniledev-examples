/** @type {import('next').NextConfig} */
// keeping things consistent with the examples
const fs = require('fs');

const envPath = './.env';
let runtimeConfig = {};

try {
  // reads from .env to expose values to the client
  const file = fs.readFileSync(envPath, 'utf8');
  const lines = file.split('\n');
  runtimeConfig = lines.reduce((accum, line) => {
    if (line.startsWith('#') || !line) {
      return accum;
    }
    const [name, value] = line.split('=');

    // Copy logo.svg
    if (name === 'NILE_ENTITY_NAME') {
      fs.copyFile(
        `../usecases/${value}/app/logo.svg`,
        './public/images/logo.svg',
        (err) => {
          if (err) {
            console.log(
              `Error: could not copy ../usecases/${value}/app/logo.svg to ./public/images/logo.svg`
            );
            process.exit(0);
          } else {
            console.log(
              `Success: copied ../usecases/${value}/app/logo.svg to ./public/images/logo.svg`
            );
          }
        }
      );
      fs.copyFile(
        `../usecases/${value}/app/FormFields.ts`,
        './components/EntityTable/FormFields.ts',
        (err) => {
          if (err) {
            console.log(
              `Error: could not copy ../usecases/${value}/app/FormFields.ts to ./components/EntityTable/FormFields.ts`
            );
            process.exit(0);
          } else {
            console.log(
              `Success: copied ../usecases/${value}/app/FormFields.ts to ./components/EntityTable/FormFields.ts`
            );
          }
        }
      );
    }

    accum[name] = value;
    return accum;
  }, {});
} catch (err) {
  console.log('err: + ', err);
  console.warn(
    '[ERROR] local .env file missing. This must be configured before the demo can be run. '
  );
  process.exit(0);
}

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
};

module.exports = nextConfig;
