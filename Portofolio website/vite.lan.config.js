// Dev server over HTTPS on the local network, for testing the phone controllers.
// Phones only share motion sensors with https pages, so plain http can't test Duck Shoot's motion aiming.
// Uses a self-signed certificate in .certs/ (git-ignored). To make one:
//   openssl req -x509 -newkey rsa:2048 -nodes -keyout .certs/key.pem -out .certs/cert.pem -days 825 \
//     -subj "/CN=Costin local dev" -addext "subjectAltName=IP:<your laptop's IP>,DNS:localhost"
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, mergeConfig } from 'vite'
import baseConfig from './vite.config.js'

const dir = path.dirname(fileURLToPath(import.meta.url))

export default mergeConfig(baseConfig, defineConfig({
  server: {
    host: '0.0.0.0',
    https: {
      key: fs.readFileSync(path.join(dir, '.certs/key.pem')),
      cert: fs.readFileSync(path.join(dir, '.certs/cert.pem')),
    },
  },
}))
