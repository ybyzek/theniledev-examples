import { createServer } from 'https';
import { parse } from 'url';
import { readFileSync } from 'fs';

import next from 'next';

import nextConfig from './next.config.js';

const app = next({ dev: true, conf: nextConfig });
const handle = app.getRequestHandler();

let key;
let cert;
try {
  key = readFileSync('./.certificates/localhost.key');
  cert = readFileSync('./.certificates/localhost.crt');
} catch (err) {
  console.error('[ERROR]: Unable to load certificates. Stopping server.')
  process.exit(0);
}


const httpsOptions = {
  key,
  cert,
};
app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(443, (err) => {
    if (err) throw err;
    console.log('> Server started on https://local.thenile.dev');
  });
});
