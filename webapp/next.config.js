/** @type {import('next').NextConfig} */
// keeping things consistent with the examples
const fs = require('fs');

const envPath = './.env';
let runtimeConfig = {};

// Validate user has taken the step to setup certificates
const certificateDir = './.certificates';
if (!fs.existsSync(certificateDir)) {
  console.log(`Error: directory ${certificateDir} does not exist. Did you forget to setup your local certificates? Refer to the README.md for instructions`);
  process.exit(1);
}

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
        `./form-fields/${value}/logo.svg`,
        './public/images/logo.svg',
        (err) => {
          if (err) {
            console.log(
              `Error: could not copy ./form-fields/${value}/logo.svg to ./public/images/logo.svg: ${err}`
            );
            process.exit(0);
          } else {
            console.log(
              `Success: copied ./form-fields/${value}/logo.svg to ./public/images/logo.svg`
            );
          }
        }
      );
    }

    accum[name] = value;
    return accum;
  }, {});
} catch (err) {
  console.log('err: ', err);
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
