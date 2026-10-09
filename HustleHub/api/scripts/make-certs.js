// Creates a self-signed certificate for running the API over HTTPS on localhost.
// For local development only: browsers will warn until you accept it, and it must never be used in production.
//   npm run certs            writes certs/key.pem and certs/cert.pem (certs/ is gitignored)
//   npm run certs -- --force replaces existing files
const fs = require('fs');
const path = require('path');
const selfsigned = require('selfsigned');

const CERT_DIR = path.join(__dirname, '..', 'certs');
const KEY_FILE = path.join(CERT_DIR, 'key.pem');
const CERT_FILE = path.join(CERT_DIR, 'cert.pem');
const VALID_DAYS = 365;

async function main() {
  if (!process.argv.includes('--force') && (fs.existsSync(KEY_FILE) || fs.existsSync(CERT_FILE))) {
    console.log('certs/key.pem or certs/cert.pem already exists. Run `npm run certs -- --force` to replace them.');
    return;
  }

  const notBeforeDate = new Date();
  const notAfterDate = new Date(notBeforeDate);
  notAfterDate.setDate(notAfterDate.getDate() + VALID_DAYS);

  const pems = await selfsigned.generate([{ name: 'commonName', value: 'localhost' }], {
    keySize: 2048,
    algorithm: 'sha256',
    notBeforeDate,
    notAfterDate,
    // Browsers ignore commonName and only trust names listed here.
    extensions: [
      {
        name: 'subjectAltName',
        altNames: [
          { type: 2, value: 'localhost' },
          { type: 7, ip: '127.0.0.1' },
          { type: 7, ip: '::1' }
        ]
      }
    ]
  });

  fs.mkdirSync(CERT_DIR, { recursive: true });
  fs.writeFileSync(KEY_FILE, pems.private, { mode: 0o600 });
  fs.writeFileSync(CERT_FILE, pems.cert);

  console.log(`Created certs/key.pem and certs/cert.pem (valid for ${VALID_DAYS} days).`);
  console.log('To use them, set these in .env and restart the server:');
  console.log('  USE_HTTPS=true');
  console.log('  SSL_KEY_PATH=./certs/key.pem');
  console.log('  SSL_CERT_PATH=./certs/cert.pem');
}

main().catch((err) => {
  console.error('Could not create the certificate:', err.message);
  process.exit(1);
});
